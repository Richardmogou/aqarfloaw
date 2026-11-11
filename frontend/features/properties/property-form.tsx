"use client";
import {
  Bath, BedDouble, Building2, DoorOpen, Home, ImagePlus, Layers, Loader2, MapPin, Maximize, Star, X, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cloneElement, useEffect, useState, type FormEvent } from "react";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { ApiError, api } from "@/lib/api";
import { fmtPkr } from "@/lib/format";
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
const TYPES: [string, LucideIcon][] = [["villa", Home], ["apartment", Building2], ["duplex", Layers], ["house", DoorOpen]];
const AREA_UNITS: [string, string][] = [["sqm", "m²"], ["marla", "marla"], ["kanal", "kanal"]];
const MAX_PHOTOS = 20, MAX_MB = 5, OK = ["image/jpeg", "image/png", "image/webp"];
const DESCRIPTION_MAX = 5000;
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

function readValues(form: HTMLFormElement): PropertyValues {
  const f = new FormData(form);
  const get = (k: string) => String(f.get(k) ?? "");
  return {
    title: get("title"), reference: get("reference"), purpose: get("purpose"), type: get("type"), price: get("price"),
    areaValue: get("areaValue"), areaUnit: get("areaUnit"), beds: get("beds"), baths: get("baths"), city: get("city"),
    locality: get("locality"), address: get("address"), description: get("description"), status: get("status"),
    agentId: get("agentId"), published: f.get("published") === "on",
  };
}

export function PropertyForm({ property, members }: { property?: ApiProperty; members: AgencyMember[] }) {
  const L = useL();
  const t = useT();
  const router = useRouter();
  const d = property ? toValues(property) : EMPTY;
  const originalCoverId = property?.media.find((media) => media.is_cover)?.id ?? null;
  const [live, setLive] = useState<PropertyValues>(d);
  const [savedId, setSavedId] = useState<string | null>(property?.id ?? null);
  const [existing, setExisting] = useState<PropertyMedia[]>(property?.media ?? []);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cover, setCover] = useState<Cover>(originalCoverId ? { kind: "existing", id: originalCoverId } : null);
  const [dragging, setDragging] = useState(false);
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
  const coverSrc = effectiveCover?.kind === "existing"
    ? existing.find((media) => media.id === effectiveCover.id)?.url
    : effectiveCover?.kind === "new" ? previews[effectiveCover.index] : undefined;
  const photoCount = existing.length + files.length;

  function addFiles(picked: File[]) {
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
    if (Object.keys(errs).length || errors.images) {
      setBanner(L("Some fields need your attention.", "Certains champs sont à corriger."));
      return;
    }

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

  function onFormChange(e: FormEvent<HTMLFormElement>) {
    setLive(readValues(e.currentTarget));
    const name = (e.target as HTMLInputElement).name;
    if (name && errors[name]) setErrors((s) => ({ ...s, [name]: "" }));
    // Publishing errors depend on the status too, so either control can resolve them.
    if (name === "status" && errors.published) setErrors((s) => ({ ...s, published: "" }));
  }

  const required = <span className="text-destructive" aria-hidden> *</span>;
  const price = Number(live.price);
  const unitLabel = AREA_UNITS.find(([value]) => value === live.areaUnit)?.[1] ?? live.areaUnit;
  const place = [live.locality, live.city].filter(Boolean).join(", ");
  const statusLabel = L(EN.propertyStatus[live.status] ?? live.status, PROPERTY_STATUS[live.status]?.label ?? live.status);

  return (
    <form onSubmit={submit} onChange={onFormChange} noValidate>
      {banner && (
        <div className="mb-6">
          <FormBanner tone="error">
            {banner}{" "}
            {savedId && <Link href={`/properties/${savedId}`} className="font-medium underline">{L("Open the property", "Ouvrir le bien")}</Link>}
          </FormBanner>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="divide-y divide-border rounded-2xl border border-border/70 bg-card shadow-sm">
          <Section step={1} title={L("Main information", "Informations principales")} description={L("What buyers and tenants see first.", "Ce que les acheteurs et locataires voient en premier.")}>
            <Field label={L("Listing title", "Titre de l'annonce")} id="title" required error={errors.title} hint={L("E.g. Modern villa with private garden", "Ex. Villa moderne avec jardin privé")}>
              <input name="title" defaultValue={d.title} required maxLength={250} className={inputCls} placeholder={L("Give the property a clear title", "Donnez un titre clair au bien")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={L("Reference code", "Code de référence")} id="reference" required error={errors.reference} hint={L("Unique within your agency.", "Unique dans votre agence.")}>
                <input name="reference" defaultValue={d.reference} placeholder="AF-0007" required maxLength={50} className={cn(inputCls, "font-mono uppercase")} />
              </Field>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{L("Purpose", "Objectif")}{required}</p>
                <div role="radiogroup" aria-label={L("Purpose", "Objectif")} className="grid h-11 grid-cols-2 rounded-xl bg-muted p-1">
                  {[["sale", t("card.sale")], ["rent", t("card.rent")]].map(([value, label]) => (
                    <label key={value} className="relative">
                      <input type="radio" name="purpose" value={value} defaultChecked={d.purpose === value} className="peer sr-only" />
                      <span className="flex h-full cursor-pointer items-center justify-center rounded-lg text-sm font-semibold text-muted-foreground transition peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{L("Property type", "Type de bien")}{required}</p>
              <div role="radiogroup" aria-label={L("Property type", "Type de bien")} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(TYPES.some(([value]) => value === d.type) ? TYPES : [...TYPES, [d.type, Home] as [string, LucideIcon]]).map(([value, Icon]) => (
                  <label key={value} className="relative">
                    <input type="radio" name="type" value={value} defaultChecked={d.type === value} className="peer sr-only" />
                    <span className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-4 text-sm font-medium text-muted-foreground transition hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/[0.06] peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                      <Icon className="h-6 w-6" aria-hidden /> {t(`type.${value}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section step={2} title={L("Price and size", "Prix et surface")} description={L("Monthly rent for rentals.", "Loyer mensuel pour une location.")}>
            <Field label={live.purpose === "rent" ? L("Monthly rent", "Loyer mensuel") : L("Sale price", "Prix de vente")} id="price" required error={errors.price}
              hint={price > 0 ? `≈ ${fmtPkr(price)}${live.purpose === "rent" ? ` ${t("card.perMonth")}` : ""}` : undefined}>
              <InputAddon prefix="PKR" suffix={live.purpose === "rent" ? t("card.perMonth") : undefined}>
                <input name="price" type="number" min={0} step="0.01" inputMode="decimal" defaultValue={d.price} placeholder="0" className={addonInput} />
              </InputAddon>
            </Field>
            <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
              <Field label={L("Area", "Surface")} id="areaValue" required error={errors.areaValue}>
                <InputAddon icon={Maximize} suffix={unitLabel}>
                  <input name="areaValue" type="number" min={0} step="any" defaultValue={d.areaValue} placeholder="0" className={addonInput} />
                </InputAddon>
              </Field>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{L("Unit", "Unité")}</p>
                <div role="radiogroup" aria-label={L("Area unit", "Unité de surface")} className="flex h-11 rounded-xl bg-muted p-1">
                  {AREA_UNITS.map(([value, label]) => (
                    <label key={value} className="relative">
                      <input type="radio" name="areaUnit" value={value} defaultChecked={d.areaUnit === value} className="peer sr-only" />
                      <span className="flex h-full cursor-pointer items-center rounded-lg px-4 text-sm font-semibold text-muted-foreground transition peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={L("Bedrooms", "Chambres")} id="beds" error={errors.beds}>
                <InputAddon icon={BedDouble}><input name="beds" type="number" min={0} max={100} defaultValue={d.beds} placeholder="0" className={addonInput} /></InputAddon>
              </Field>
              <Field label={L("Bathrooms", "Salles de bain")} id="baths" error={errors.baths}>
                <InputAddon icon={Bath}><input name="baths" type="number" min={0} max={100} defaultValue={d.baths} placeholder="0" className={addonInput} /></InputAddon>
              </Field>
            </div>
          </Section>

          <Section step={3} title={L("Location", "Localisation")} description={L("The exact address stays private: only the area and city are shown publicly.", "L'adresse exacte reste privée : seuls le quartier et la ville sont affichés publiquement.")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("home.city")} id="city" required error={errors.city}>
                <InputAddon icon={MapPin}><input name="city" list="cities" defaultValue={d.city} maxLength={100} placeholder="Islamabad" className={addonInput} /></InputAddon>
              </Field>
              <datalist id="cities"><option value="Islamabad" /><option value="Lahore" /><option value="Karachi" /></datalist>
              <Field label={L("Area / locality", "Quartier / zone")} id="locality" error={errors.locality}>
                <input name="locality" defaultValue={d.locality} maxLength={100} placeholder="DHA Phase 6" className={inputCls} />
              </Field>
            </div>
            <Field label={L("Full address", "Adresse complète")} id="address" error={errors.address} hint={L("Optional, for your team only.", "Facultatif, visible par votre équipe uniquement.")}>
              <input name="address" defaultValue={d.address} maxLength={300} className={inputCls} />
            </Field>
          </Section>

          <Section step={4} title={L("Description", "Description")} description={L("Highlight what makes the property unique.", "Mettez en avant ce qui rend le bien unique.")}>
            <Field label={L("Description", "Description")} id="description" error={errors.description}
              hint={`${live.description.length} / ${DESCRIPTION_MAX}`}>
              <textarea name="description" rows={6} defaultValue={d.description} maxLength={DESCRIPTION_MAX} className={textareaCls}
                placeholder={L("Bright living spaces, quality finishes, quiet neighbourhood…", "Espaces lumineux, finitions soignées, quartier calme…")} />
            </Field>
          </Section>

          <Section step={5} title={L("Photos", "Photos")} description={L(`Up to ${MAX_PHOTOS} photos. The cover photo is shown first on the website.`, `Jusqu'à ${MAX_PHOTOS} photos. La photo de couverture s'affiche en premier sur le site.`)}>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
              className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
                dragging ? "border-primary bg-primary/[0.06]" : "border-border hover:border-primary/50 hover:bg-muted/40",
                photoCount >= MAX_PHOTOS && "pointer-events-none opacity-50")}
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><ImagePlus className="h-6 w-6" aria-hidden /></span>
              <span className="font-semibold">{L("Drag your photos here or click to browse", "Glissez vos photos ici ou cliquez pour parcourir")}</span>
              <span className="text-sm text-muted-foreground">JPG, PNG, WebP · {MAX_MB} Mo max · {photoCount} / {MAX_PHOTOS}</span>
              <input type="file" multiple accept={OK.join(",")} disabled={photoCount >= MAX_PHOTOS} className="sr-only"
                onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
            </label>
            {errors.images && <p role="alert" className="text-sm text-destructive">{errors.images}</p>}
            {photoCount > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground">{L("Removed photos are deleted when you save.", "Les photos retirées sont supprimées à l'enregistrement.")}</p>
            )}
          </Section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{L("Listing preview", "Aperçu de l'annonce")}</p>
            <div className="p-5">
              <div className="relative h-44 overflow-hidden rounded-xl bg-muted">
                {coverSrc ? <Thumb src={coverSrc} alt="" className="h-full w-full" />
                  : <span className="grid h-full place-items-center text-muted-foreground"><ImagePlus className="h-8 w-8" aria-hidden /></span>}
                <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-bold uppercase text-primary-foreground">
                  {live.purpose === "rent" ? L("For rent", "À louer") : L("For sale", "À vendre")}
                </span>
              </div>
              <p className="mt-4 text-xl font-bold tracking-tight">
                {price > 0 ? `PKR ${new Intl.NumberFormat("en-US").format(price)}` : "PKR —"}
                {live.purpose === "rent" && <span className="text-sm font-normal text-muted-foreground"> {t("card.perMonth")}</span>}
              </p>
              <p className="mt-1 truncate font-semibold">{live.title || L("Listing title", "Titre de l'annonce")}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{place || L("City", "Ville")}</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" aria-hidden />{live.beds || "—"}</li>
                <li className="flex items-center gap-1.5"><Bath className="h-4 w-4" aria-hidden />{live.baths || "—"}</li>
                <li className="flex items-center gap-1.5"><Maximize className="h-4 w-4" aria-hidden />{live.areaValue ? `${live.areaValue} ${unitLabel}` : "—"}</li>
              </ul>
            </div>

            <div className="space-y-5 border-t border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{L("Publishing", "Publication")}</p>
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
                <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border p-4">
                  <span>
                    <span className="block text-sm font-semibold">{L("Publish on the website", "Publier sur le site")}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {UNPUBLISHABLE_STATUSES.includes(live.status)
                        ? L(`Not possible while the status is “${statusLabel}”.`, `Impossible tant que le statut est « ${statusLabel} ».`)
                        : L("Visible to visitors as soon as you save.", "Visible par les visiteurs dès l'enregistrement.")}
                    </span>
                  </span>
                  <span className="relative mt-0.5 shrink-0">
                    <input name="published" type="checkbox" role="switch" defaultChecked={d.published} className="peer sr-only" />
                    <span className="block h-6 w-11 rounded-full bg-muted-foreground/30 transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </span>
                </label>
                {errors.published && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.published}</p>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-card/90 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> {L("Required fields", "Champs obligatoires")}</p>
          <div className="flex gap-3">
            <Link href={property ? `/properties/${property.id}` : "/properties"} className={btn.outline}>{L("Cancel", "Annuler")}</Link>
            <button type="submit" disabled={pending} className={cn(btn.primary, "min-w-[10rem] disabled:opacity-60")}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {property ? L("Save changes", "Enregistrer les modifications") : L("Create property", "Créer le bien")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

const addonInput = "h-full w-full min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground";

/** Field passes id and aria-* props to its direct child; forward them to the real input so the label stays linked. */
function InputAddon({ prefix, suffix, icon: Icon, children, ...inputProps }: {
  prefix?: string; suffix?: string; icon?: LucideIcon; children: React.ReactElement;
  id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string;
}) {
  return (
    <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      {prefix && <span className="flex h-full items-center border-r border-border bg-muted/60 px-3 text-sm font-semibold text-muted-foreground">{prefix}</span>}
      {Icon && <Icon className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
      {cloneElement(children, inputProps)}
      {suffix && <span className="whitespace-nowrap pr-3 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function Section({ step, title, description, children }: { step: number; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:p-8">
      <div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{step}</span>
        <h2 className="mt-3 text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function PhotoTile({ src, cover, onCover, onRemove }: { src: string; cover: boolean; onCover: () => void; onRemove: () => void }) {
  const L = useL();
  return (
    <li className={cn("group relative overflow-hidden rounded-xl ring-2", cover ? "ring-primary" : "ring-transparent")}>
      <Thumb src={src} alt="" className="aspect-[4/3] w-full" />
      {cover && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          <Star className="h-3 w-3 fill-current" aria-hidden /> {L("Cover", "Couverture")}
        </span>
      )}
      <button type="button" onClick={onRemove} aria-label={L("Remove photo", "Retirer la photo")}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80">
        <X className="h-4 w-4" aria-hidden />
      </button>
      {!cover && (
        <button type="button" onClick={onCover}
          className="absolute inset-x-2 bottom-2 rounded-lg bg-white/90 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100">
          {L("Set as cover", "Définir en couverture")}
        </button>
      )}
    </li>
  );
}
