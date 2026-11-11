"use client";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { ApiError, api } from "@/lib/api";
import { useL, useT } from "@/lib/i18n/provider";
import { EN, PROPERTY_STATUS } from "@/lib/mock-data";
import { UNPUBLISHABLE_STATUSES, type AgencyMember, type ApiProperty, type PropertyMedia } from "@/lib/properties";
import { cn } from "@/lib/utils";

interface PropertyValues {
  title: string; reference: string; purpose: string; type: string; price: string; areaValue: string; areaUnit: string;
  beds: string; baths: string; city: string; locality: string; address: string; description: string;
  status: string; agentId: string; published: boolean;
}
const EMPTY: PropertyValues = {
  title: "", reference: "", purpose: "sale", type: "villa", price: "", areaValue: "", areaUnit: "sqm", beds: "", baths: "",
  city: "", locality: "", address: "", description: "", status: "draft", agentId: "", published: false,
};
const TYPES = ["villa", "apartment", "duplex", "house"];
const MAX_PHOTOS = 20, MAX_MB = 5, OK = ["image/jpeg", "image/png", "image/webp"];
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const API_FIELD: Record<string, string> = {
  title: "title", reference_code: "reference", purpose: "purpose", property_type: "type", price: "price",
  area_value: "areaValue", area_unit: "areaUnit", bedrooms: "beds", bathrooms: "baths", city: "city",
  locality: "locality", address: "address", description: "description", status: "status",
};

type Cover = { kind: "existing"; id: string } | { kind: "new"; index: number } | null;
const coverKey = (cover: Cover) => (cover === null ? "" : cover.kind === "existing" ? `existing:${cover.id}` : `new:${cover.index}`);

const toValues = (p: ApiProperty): PropertyValues => ({
  title: p.title, reference: p.reference_code, purpose: p.purpose, type: p.property_type, price: String(Number(p.price)),
  areaValue: p.area_value === null ? "" : String(Number(p.area_value)), areaUnit: p.area_unit,
  beds: p.bedrooms === null ? "" : String(p.bedrooms), baths: p.bathrooms === null ? "" : String(p.bathrooms),
  city: p.city, locality: p.locality ?? "", address: p.address ?? "", description: p.description ?? "",
  status: p.status, agentId: p.assigned_agent_id ?? "", published: p.is_published,
});

export function PropertyForm({ property, members }: { property?: ApiProperty; members: AgencyMember[] }) {
  const L = useL();
  const t = useT();
  const router = useRouter();
  const d = property ? toValues(property) : EMPTY;
  const originalCoverId = property?.media.find((media) => media.is_cover)?.id ?? null;
  const [savedId, setSavedId] = useState<string | null>(property?.id ?? null);
  const [existing, setExisting] = useState<PropertyMedia[]>(property?.media ?? []);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cover, setCover] = useState<Cover>(originalCoverId ? { kind: "existing", id: originalCoverId } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Mirrors the API: without an explicit choice, the first remaining photo becomes the cover.
  const effectiveCover: Cover = cover
    ?? (existing.length ? { kind: "existing", id: existing[0].id } : files.length ? { kind: "new", index: 0 } : null);
  const isCover = (candidate: NonNullable<Cover>) => coverKey(candidate) === coverKey(effectiveCover);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const bad = picked.some((f) => !OK.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    setErrors((s) => ({ ...s, images: bad ? L(`Only JPG, PNG or WebP images, ${MAX_MB} MB maximum each.`, `Uniquement des images JPG, PNG ou WebP, ${MAX_MB} Mo maximum chacune.`) : "" }));
    if (!bad) setFiles((cur) => [...cur, ...picked].slice(0, Math.max(0, MAX_PHOTOS - existing.length)));
  }

  function removeFile(i: number) {
    setFiles((cur) => cur.filter((_, k) => k !== i));
    setCover((c) => (c?.kind !== "new" ? c : i === c.index ? null : i < c.index ? { kind: "new", index: c.index - 1 } : c));
  }

  function removeExisting(id: string) {
    setExisting((cur) => cur.filter((media) => media.id !== id));
    setRemoved((cur) => [...cur, id]);
    setCover((c) => (c?.kind === "existing" && c.id === id ? null : c));
  }

  function validate(get: (k: string) => string, published: boolean) {
    const errs: Record<string, string> = {};
    if (get("title").length < 3) errs.title = L("Enter a title (3 characters minimum).", "Saisissez un titre (3 caractères minimum).");
    if (!REFERENCE_PATTERN.test(get("reference")) || get("reference").length > 50)
      errs.reference = L("Use letters, digits, - or _ (50 characters maximum).", "Utilisez des lettres, chiffres, - ou _ (50 caractères maximum).");
    if (!(Number(get("price")) > 0)) errs.price = L("Enter a price greater than 0.", "Saisissez un prix supérieur à 0.");
    if (!(Number(get("areaValue")) > 0)) errs.areaValue = L("Enter the area.", "Saisissez la surface.");
    for (const key of ["beds", "baths"]) {
      if (get(key) && !/^\d{1,3}$/.test(get(key))) errs[key] = L("Enter a whole number.", "Saisissez un nombre entier.");
    }
    if (!get("city")) errs.city = L("Select or type a city.", "Choisissez ou saisissez une ville.");
    if (published && UNPUBLISHABLE_STATUSES.includes(get("status")))
      errs.published = L("A draft or inactive property cannot be published.", "Un bien en brouillon ou inactif ne peut pas être publié.");
    return errs;
  }

  function showSaveError(caught: unknown) {
    if (!(caught instanceof ApiError)) {
      setBanner(L("The server could not be reached. Check your connection and try again.", "Le serveur est injoignable. Vérifiez votre connexion et réessayez."));
    } else if (caught.status === 409) {
      setErrors((s) => ({ ...s, reference: L("This reference code is already used in your agency.", "Ce code de référence est déjà utilisé dans votre agence.") }));
    } else if (caught.status === 422 && Array.isArray(caught.detail)) {
      const fieldErrors = Object.fromEntries((caught.detail as { loc: string[] }[])
        .map((issue) => API_FIELD[issue.loc[issue.loc.length - 1]])
        .filter(Boolean)
        .map((name) => [name, L("Check this value.", "Vérifiez cette valeur.")]));
      setErrors((s) => ({ ...s, ...fieldErrors }));
      setBanner(L("Some values were rejected. Check the highlighted fields.", "Certaines valeurs ont été refusées. Vérifiez les champs signalés."));
    } else if (caught.status === 422) {
      setBanner(L(`The property was rejected: ${caught.detail}`, `Le bien a été refusé : ${caught.detail}`));
    } else if (caught.status === 403) {
      setBanner(L("Only an administrator can manage properties.", "Seul un administrateur peut gérer les biens."));
    } else {
      setBanner(L("The property could not be saved. Try again.", "Le bien n'a pas pu être enregistré. Réessayez."));
    }
  }

  function photoErrorMessage(caught: unknown) {
    if (caught instanceof ApiError && caught.status === 413) return L(`Each photo must be ${MAX_MB} MB or less.`, `Chaque photo doit faire ${MAX_MB} Mo maximum.`);
    if (caught instanceof ApiError && caught.status === 422) return L(`Only real JPG, PNG or WebP images are accepted (${MAX_PHOTOS} per property).`, `Seules de vraies images JPG, PNG ou WebP sont acceptées (${MAX_PHOTOS} par bien).`);
    return L("Try again.", "Réessayez.");
  }

  async function syncPhotos(propertyId: string) {
    for (const mediaId of removed) {
      await api(`/properties/${propertyId}/media/${mediaId}`, { method: "DELETE" });
      setRemoved((cur) => cur.filter((id) => id !== mediaId));
    }
    let uploaded: PropertyMedia[] = [];
    if (files.length) {
      const body = new FormData();
      files.forEach((file) => body.append("files", file));
      uploaded = await api<PropertyMedia[]>(`/properties/${propertyId}/media`, { method: "POST", body });
      setFiles([]);
      setExisting((cur) => [...cur, ...uploaded]);
    }
    const coverId = effectiveCover?.kind === "new" ? uploaded[effectiveCover.index]?.id : effectiveCover?.id;
    if (coverId && coverId !== originalCoverId) {
      await api(`/properties/${propertyId}/media/${coverId}`, { method: "PATCH", body: JSON.stringify({ is_cover: true }) });
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const published = f.get("published") === "on";
    const errs = validate(get, published);
    setErrors((s) => ({ images: s.images ?? "", ...errs }));
    setBanner("");
    if (Object.keys(errs).length || errors.images) return;

    const payload = {
      title: get("title"), reference_code: get("reference"), purpose: get("purpose"), property_type: get("type"),
      price: get("price"), area_value: get("areaValue"), area_unit: get("areaUnit"),
      bedrooms: get("beds") ? Number(get("beds")) : null, bathrooms: get("baths") ? Number(get("baths")) : null,
      city: get("city"), locality: get("locality") || null, address: get("address") || null,
      description: get("description") || null, status: get("status"), assigned_agent_id: get("agentId") || null,
      is_published: published,
    };

    setPending(true);
    let propertyId = savedId;
    try {
      const saved = propertyId
        ? await api<ApiProperty>(`/properties/${propertyId}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await api<ApiProperty>("/properties", { method: "POST", body: JSON.stringify(payload) });
      propertyId = saved.id;
      setSavedId(saved.id);
    } catch (caught) {
      showSaveError(caught);
      setPending(false);
      return;
    }

    try {
      await syncPhotos(propertyId);
    } catch (caught) {
      setBanner(L(`The property was saved, but the photos could not be updated. ${photoErrorMessage(caught)}`,
        `Le bien est enregistré, mais les photos n'ont pas pu être mises à jour. ${photoErrorMessage(caught)}`));
      setPending(false);
      return;
    }
    router.push(`/properties/${propertyId}`);
    router.refresh();
  }

  const photoCount = existing.length + files.length;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && (
        <FormBanner tone="error">
          {banner}{" "}
          {savedId && <Link href={`/properties/${savedId}`} className="underline">{L("Open the property", "Ouvrir le bien")}</Link>}
        </FormBanner>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card title={L("Basic information", "Informations générales")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={L("Title", "Titre")} id="title" error={errors.title} className="sm:col-span-2">
                <input name="title" defaultValue={d.title} required maxLength={250} className={inputCls} />
              </Field>
              <Field label={L("Reference code", "Code de référence")} id="reference" error={errors.reference} hint={L("Must be unique within your agency.", "Doit être unique dans votre agence.")}>
                <input name="reference" defaultValue={d.reference} placeholder="AF-0007" required maxLength={50} className={inputCls} />
              </Field>
              <Field label={L("Purpose", "Objectif")} id="purpose" error={errors.purpose}>
                <select name="purpose" defaultValue={d.purpose} className={inputCls}>
                  <option value="sale">{t("card.sale")}</option>
                  <option value="rent">{t("card.rent")}</option>
                </select>
              </Field>
              <Field label={t("home.type")} id="type" error={errors.type}>
                <select name="type" defaultValue={d.type} className={inputCls}>
                  {(TYPES.includes(d.type) ? TYPES : [...TYPES, d.type]).map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <Card title={L("Price and size", "Prix et surface")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={L("Price (PKR, per month for rentals)", "Prix (PKR, par mois pour une location)")} id="price" error={errors.price}>
                <input name="price" type="number" min={0} step="0.01" inputMode="decimal" defaultValue={d.price} className={inputCls} />
              </Field>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Field label={L("Area", "Surface")} id="areaValue" error={errors.areaValue}>
                  <input name="areaValue" type="number" min={0} step="any" defaultValue={d.areaValue} className={inputCls} />
                </Field>
                <Field label={L("Unit", "Unité")} id="areaUnit">
                  <select name="areaUnit" defaultValue={d.areaUnit} className={inputCls}>
                    <option value="sqm">m²</option><option value="marla">marla</option><option value="kanal">kanal</option>
                  </select>
                </Field>
              </div>
              <Field label={L("Bedrooms", "Chambres")} id="beds" error={errors.beds}><input name="beds" type="number" min={0} max={100} defaultValue={d.beds} className={inputCls} /></Field>
              <Field label={L("Bathrooms", "Salles de bain")} id="baths" error={errors.baths}><input name="baths" type="number" min={0} max={100} defaultValue={d.baths} className={inputCls} /></Field>
            </div>
          </Card>

          <Card title={L("Location and description", "Localisation et description")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("home.city")} id="city" error={errors.city}>
                <input name="city" list="cities" defaultValue={d.city} maxLength={100} className={inputCls} />
              </Field>
              <datalist id="cities"><option value="Islamabad" /><option value="Lahore" /><option value="Karachi" /></datalist>
              <Field label={L("Area / locality", "Quartier / zone")} id="locality" error={errors.locality}><input name="locality" defaultValue={d.locality} maxLength={100} className={inputCls} /></Field>
              <Field label={L("Address", "Adresse")} id="address" error={errors.address} className="sm:col-span-2"><input name="address" defaultValue={d.address} maxLength={300} className={inputCls} /></Field>
              <Field label={L("Description", "Description")} id="description" error={errors.description} className="sm:col-span-2">
                <textarea name="description" rows={5} defaultValue={d.description} maxLength={5000} className={textareaCls} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={L("Status and publishing", "Statut et publication")}>
            <div className="space-y-4">
              <Field label={L("Status", "Statut")} id="status" error={errors.status}>
                <select name="status" defaultValue={d.status} className={inputCls}>
                  {Object.keys(PROPERTY_STATUS).map((k) => <option key={k} value={k}>{L(EN.propertyStatus[k], PROPERTY_STATUS[k].label)}</option>)}
                </select>
              </Field>
              <Field label={L("Assigned agent", "Agent assigné")} id="agentId">
                <select name="agentId" defaultValue={d.agentId} className={inputCls}>
                  <option value="">{L("Unassigned", "Non assigné")}</option>
                  {members.map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
                </select>
              </Field>
              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input name="published" type="checkbox" defaultChecked={d.published} className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
                  <span>{L("Publish on the public website", "Publier sur le site public")}</span>
                </label>
                {errors.published && <p role="alert" className="mt-1 text-xs text-destructive">{errors.published}</p>}
              </div>
            </div>
          </Card>

          <Card title={L("Photos", "Photos")}>
            <Field label={L(`Add photos (${photoCount} / ${MAX_PHOTOS})`, `Ajouter des photos (${photoCount} / ${MAX_PHOTOS})`)} id="images" error={errors.images}>
              <input type="file" multiple accept={OK.join(",")} onChange={onFiles} disabled={photoCount >= MAX_PHOTOS}
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground disabled:opacity-60" />
            </Field>
            {photoCount > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {existing.map((media) => (
                  <PhotoTile key={media.id} src={media.url} cover={isCover({ kind: "existing", id: media.id })}
                    onCover={() => setCover({ kind: "existing", id: media.id })} onRemove={() => removeExisting(media.id)} />
                ))}
                {previews.map((src, i) => (
                  <PhotoTile key={src} src={src} cover={isCover({ kind: "new", index: i })}
                    onCover={() => setCover({ kind: "new", index: i })} onRemove={() => removeFile(i)} />
                ))}
              </ul>
            )}
            {removed.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">{L("Removed photos are deleted when you save.", "Les photos retirées sont supprimées à l'enregistrement.")}</p>
            )}
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={cn(btn.primary, "disabled:opacity-60")}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {property ? L("Save changes", "Enregistrer") : L("Create property", "Créer le bien")}
        </button>
        <Link href={property ? `/properties/${property.id}` : "/properties"} className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}

function PhotoTile({ src, cover, onCover, onRemove }: { src: string; cover: boolean; onCover: () => void; onRemove: () => void }) {
  const L = useL();
  return (
    <li className="space-y-1.5">
      <div className="relative">
        <Thumb src={src} alt="" className={cn("h-24 w-full rounded-lg border-2", cover ? "border-primary" : "border-transparent")} />
        <button type="button" onClick={onRemove} aria-label={L("Remove photo", "Retirer la photo")}
          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/80 backdrop-blur"><X className="h-3.5 w-3.5" /></button>
      </div>
      <label className="flex items-center gap-1.5 text-xs">
        <input type="radio" name="cover" checked={cover} onChange={onCover} /> {L("Cover photo", "Photo de couverture")}
      </label>
    </li>
  );
}
