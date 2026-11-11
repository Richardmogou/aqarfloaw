import {
  Bath, Bed, Building2, CircleDot, Globe, Hash, Home, ImageOff, Inbox, MapPin, Maximize, Navigation, Pencil, Rocket, UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { DeleteButton } from "@/features/properties/delete-button";
import { Gallery } from "@/features/properties/gallery";
import { PublishButton } from "@/features/properties/publish-button";
import { requireUser } from "@/lib/auth";
import { fmtPkrFull } from "@/lib/format";
import { getL, getT } from "@/lib/i18n/server";
import { EN, PROPERTY_STATUS } from "@/lib/mock-data";
import { UNPUBLISHABLE_STATUSES, formatArea, isUuid, memberName, type AgencyMember, type ApiProperty } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function PropertyPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound();
  const [user, p, members] = await Promise.all([
    requireUser(),
    serverApi<ApiProperty>(`/properties/${params.id}`),
    serverApi<AgencyMember[]>("/users"),
  ]);
  const t = await getT();
  const L = getL();
  const isAdmin = user.role === "admin";
  const needsStatusChange = UNPUBLISHABLE_STATUSES.includes(p.status);

  const status = PROPERTY_STATUS[p.status];
  const statusLabel = L(EN.propertyStatus[p.status] ?? p.status, status?.label ?? p.status);
  const agent = memberName(members, p.assigned_agent_id);
  const typeLabel = t(`type.${p.property_type}`);
  const area = formatArea(p);
  const place = [p.locality, p.city].filter(Boolean).join(", ");

  const stats: [LucideIcon, string | number, string][] = [
    [Home, typeLabel, L("Type", "Type")],
    [Bed, p.bedrooms ?? "—", L("Bedrooms", "Chambres")],
    [Bath, p.bathrooms ?? "—", L("Bathrooms", "Salles de bain")],
    [Maximize, area, L("Area", "Surface")],
  ];
  const rows: [LucideIcon, string, React.ReactNode][] = [
    [Hash, L("Reference", "Référence"), p.reference_code],
    [MapPin, L("City / Area", "Ville / Zone"), place],
    [Navigation, L("Address", "Adresse"), p.address || "—"],
    [Building2, L("Property type", "Type de bien"), typeLabel],
    [CircleDot, L("Status", "Statut"), <Badge key="s" tone={status?.tone ?? "neutral"}>{statusLabel}</Badge>],
    [Globe, L("Publication", "Publication"), <Badge key="p" tone={p.is_published ? "info" : "neutral"}>{p.is_published ? L("Published", "Publié") : L("Not published", "Non publié")}</Badge>],
    [UserRound, L("Agent", "Agent"), agent
      ? <span key="a" className="flex items-center gap-2"><Avatar name={agent} className="h-6 w-6 text-[10px]" />{agent}</span>
      : L("Unassigned", "Non assigné")],
  ];

  return (
    <>
      <PageHeader title={L("Property details", "Détails du bien")} back={{ href: "/properties", label: L("Back to properties", "Retour aux biens") }}>
        {isAdmin && (
          <>
            <Link href={`/properties/${p.id}/edit`} className={btn.outline}><Pencil className="h-4 w-4" aria-hidden /> {L("Edit", "Modifier")}</Link>
            <PublishButton propertyId={p.id} published={p.is_published} status={p.status} />
            <DeleteButton propertyId={p.id} title={p.title} />
          </>
        )}
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr_0.85fr]">
        <div className="space-y-5">
          {p.media.length > 0 ? <Gallery images={p.media.map((media) => media.url)} alt={p.title} /> : (
            <div className="grid h-72 place-items-center rounded-2xl border-2 border-dashed border-border bg-card text-sm text-muted-foreground sm:h-96">
              <span className="flex flex-col items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-muted"><ImageOff className="h-7 w-7" aria-hidden /></span>
                <span className="font-medium">{L("No photos yet", "Pas encore de photos")}</span>
                {isAdmin && <Link href={`/properties/${p.id}/edit`} className="text-sm font-semibold text-primary hover:underline">{L("Add photos", "Ajouter des photos")}</Link>}
              </span>
            </div>
          )}
          <Card title={L("Description", "Description")}>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{p.description || L("No description yet.", "Pas encore de description.")}</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{p.title}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden /> {place}</p>
            </div>
            <Badge tone={status?.tone ?? "neutral"}>{statusLabel}</Badge>
          </div>
          <p className="mt-5 text-3xl font-bold tracking-tight">
            {fmtPkrFull(Number(p.price))}{p.purpose === "rent" && <span className="text-base font-normal text-muted-foreground"> {t("card.perMonth")}</span>}
          </p>
          <dl className="mt-6 grid grid-cols-4 gap-2 border-y border-border py-5 text-center text-sm">
            {stats.map(([Icon, value, label]) => (
              <div key={label}>
                <Icon className="mx-auto h-5 w-5 text-primary" aria-hidden />
                <dd className="mt-1.5 font-semibold">{value}</dd>
                <dt className="text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
          <h3 className="mb-2 mt-6 font-semibold">{L("Key information", "Informations principales")}</h3>
          <dl className="divide-y divide-border rounded-xl bg-muted/40 px-4 text-sm">
            {rows.map(([Icon, label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 py-3">
                <dt className="flex items-center gap-2.5 text-muted-foreground"><Icon className="h-4 w-4" aria-hidden />{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-5">
          <Card title={L("Inquiries received", "Demandes reçues")} href="/leads" linkLabel={L("View all", "Voir toutes")}>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-muted"><Inbox className="h-6 w-6 text-muted-foreground" aria-hidden /></span>
              <p className="text-sm text-muted-foreground">{L("No inquiry for this property yet.", "Aucune demande pour ce bien pour le moment.")}</p>
            </div>
          </Card>
          {isAdmin && !p.is_published && (
            <section className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary"><Rocket className="h-6 w-6" aria-hidden /></span>
              <h2 className="mt-4 text-lg font-semibold">{L("Ready to publish?", "Bien prêt à être publié ?")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {needsStatusChange
                  ? L(`This property is “${statusLabel}”. Set its status to Available (or another active status) to publish it.`, `Ce bien est « ${statusLabel} ». Passez son statut à Disponible (ou un autre statut actif) pour pouvoir le publier.`)
                  : L("Check the details, then publish the listing to show it on your public website.", "Vérifiez les informations, puis publiez l'annonce pour la rendre visible sur votre site public.")}
              </p>
              <div className="mt-5">
                {needsStatusChange
                  ? <Link href={`/properties/${p.id}/edit`} className={`${btn.primary} w-full`}><Pencil className="h-4 w-4" aria-hidden /> {L("Change the status", "Changer le statut")}</Link>
                  : <PublishButton propertyId={p.id} published={p.is_published} status={p.status} fullWidth />}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
