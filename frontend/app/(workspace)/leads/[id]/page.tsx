import {
  ArrowRightLeft, Bed, Briefcase, CircleDollarSign, Home, Mail, MapPin, Phone, PhoneIncoming, UserCheck, UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Thumb } from "@/components/ui/thumb";
import { LeadActions, LeadAgentSelect } from "@/features/leads/lead-actions";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtPkrFull, fmtRelative } from "@/lib/format";
import { getL, getLocale, getT } from "@/lib/i18n/server";
import { leadPropertyCover, type ApiLeadDetail } from "@/lib/leads";
import { EN, LEAD_STAGE } from "@/lib/mock-data";
import { isUuid, type AgencyMember } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

const CONTACT_TYPE_LABEL: Record<string, [string, string]> = {
  buyer: ["Individual client", "Client particulier"],
  tenant: ["Tenant client", "Client locataire"],
  seller: ["Property seller", "Client vendeur"],
  landlord: ["Landlord", "Propriétaire bailleur"],
};

export default async function LeadPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound();
  const [user, lead, members] = await Promise.all([
    requireUser(),
    serverApi<ApiLeadDetail>(`/leads/${params.id}`),
    serverApi<AgencyMember[]>("/users"),
  ]);
  const t = await getT();
  const L = getL();
  const locale = getLocale();
  const isAdmin = user.role === "admin";

  const prop = lead.property;
  const cover = leadPropertyCover(prop);
  const stageMeta = LEAD_STAGE[lead.stage] ?? { label: lead.stage, tone: "neutral" as const };
  const stageLabel = L(EN.leadStage[lead.stage] ?? lead.stage, stageMeta.label);
  const [ctEn, ctFr] = CONTACT_TYPE_LABEL[lead.contact.contact_type] ?? ["Individual client", "Client particulier"];

  const budgetMin = lead.budget_min ? fmtPkrFull(Number(lead.budget_min)) : null;
  const budgetMax = lead.budget_max ? fmtPkrFull(Number(lead.budget_max)) : null;
  const budgetText = budgetMin && budgetMax
    ? `${budgetMin} - ${budgetMax.replace("PKR ", "")}`
    : budgetMin ? budgetMin : budgetMax ? budgetMax : (prop ? fmtPkrFull(Number(prop.price)) : "—");

  const cityText = prop?.city || lead.preferred_location?.split(",")[0]?.trim() || "Islamabad";
  const localityText = lead.preferred_location || prop?.locality || "";

  function activityMeta(type: string, body: string | null): { icon: LucideIcon; tone: string; title: string; detail: string } {
    if (type === "call") {
      return {
        icon: PhoneIncoming,
        tone: "bg-emerald-500/15 text-emerald-600",
        title: L("Incoming call", "Appel entrant"),
        detail: body ?? L("Discussion about budget and preferred areas.", "Discussion sur le budget et les quartiers préférés."),
      };
    }
    if (type === "stage_change") {
      return {
        icon: ArrowRightLeft,
        tone: "bg-amber-500/15 text-amber-600",
        title: L("Stage updated", "Statut mis à jour"),
        detail: body ?? "",
      };
    }
    if (type === "assignment") {
      return {
        icon: UserCheck,
        tone: "bg-violet-500/15 text-violet-600",
        title: L("Agent assigned", "Agent attribué"),
        detail: body ?? "",
      };
    }
    return {
      icon: Mail,
      tone: "bg-blue-500/15 text-blue-600",
      title: L("Note added", "Note interne"),
      detail: body ?? "",
    };
  }

  return (
    <>
      <PageHeader title={L("Lead details", "Fiche du prospect")} back={{ href: "/leads", label: L("Back to leads", "Retour aux leads") }}>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3.5 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <UserRound className="h-4 w-4" aria-hidden />
          {stageLabel}
        </span>
        <div className="ml-2 text-right text-xs text-muted-foreground">
          <p className="font-medium text-foreground/80">{L("Created on", "Créé le")} {fmtDate(lead.created_at, locale)}</p>
          <p>{fmtRelative(lead.created_at, locale)}</p>
        </div>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr_1fr]">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={lead.contact.name} className="h-16 w-16 text-xl" />
            <div>
              <h2 className="text-xl font-semibold">{lead.contact.name}</h2>
              <p className="text-sm text-muted-foreground">{L(ctEn, ctFr)}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {lead.contact.phone && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                <a href={`tel:${lead.contact.phone_normalized ?? lead.contact.phone}`} className="font-medium hover:underline">
                  {lead.contact.phone}
                </a>
              </li>
            )}
            {lead.contact.email && (
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                <a href={`mailto:${lead.contact.email}`} className="hover:underline">{lead.contact.email}</a>
              </li>
            )}
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden /> {cityText}
            </li>
          </ul>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">{L("Responsible agent", "Agent responsable")}</p>
            <LeadAgentSelect
              leadId={lead.id}
              assignedAgentId={lead.assigned_agent_id}
              members={members}
              isAdmin={isAdmin}
            />
          </div>
        </Card>

        <Card title={L("Information request", "Demande d'information")}>
          <p className="whitespace-pre-line rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
            {lead.message || (prop
              ? L(`Hello, I am interested in "${prop.title}". Could you contact me with more information and arrange a visit?`,
                  `Bonjour, je suis intéressé par « ${prop.title} ». Pouvez-vous me contacter pour plus d'informations et organiser une visite ?`)
              : L("No message attached to this lead.", "Aucun message joint à ce prospect."))}
          </p>
          <h3 className="mb-3 mt-6 font-semibold">{L("Property wanted", "Bien recherché")}</h3>
          <div className="mb-4 flex items-center gap-2.5 text-sm font-medium">
            <Home className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span>{prop ? t(`type.${prop.property_type}`) : L("Property", "Bien immobilier")}</span>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{L("Budget", "Budget")}</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{budgetText}</span>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{L("Bedrooms", "Chambres")}</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                <Bed className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{prop?.bedrooms != null ? String(prop.bedrooms) : "—"}</span>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{L("Preferred location", "Localisation préférée")}</dt>
              <dd className="mt-1 flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span>
                  <span className="block font-medium">{cityText}</span>
                  {localityText && <span className="block text-xs text-muted-foreground">{localityText}</span>}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{L("Use", "Usage")}</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-medium">
                <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{prop?.purpose === "rent" ? L("Rental", "Location") : L("Primary residence", "Résidence principale")}</span>
              </dd>
            </div>
          </dl>
        </Card>

        <LeadActions initialStage={lead.stage} initialFollowUp={lead.next_follow_up_at} leadId={lead.id} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2.3fr_1fr]">
        <Card title={L("Activity history", "Historique des actions")}>
          <ol className="relative space-y-6 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-border">
            {lead.activities.map((act) => {
              const meta = activityMeta(act.activity_type, act.body);
              return (
                <li key={act.id} className="relative flex items-start gap-4">
                  <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${meta.tone}`}>
                    <meta.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{meta.title}</p>
                    {meta.detail && <p className="whitespace-pre-line text-sm text-muted-foreground">{meta.detail}</p>}
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <p>{fmtRelative(act.occurred_at, locale)}</p>
                    <p>{L("by", "par")} {act.user_name ?? L("System", "Système")}</p>
                  </div>
                </li>
              );
            })}
            <li className="relative flex items-start gap-4">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-600">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{L("Information request", "Demande d'information")}</p>
                <p className="text-sm text-muted-foreground">
                  {L("The lead submitted a request via the website.", "Le prospect a soumis une demande via le site.")}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <p>{fmtRelative(lead.created_at, locale)}</p>
                <p>{L("by", "par")} {L("System", "Système")}</p>
              </div>
            </li>
          </ol>
        </Card>

        <Card title={L("Shared properties", "Biens partagés")} href="/properties" linkLabel={L("View all", "Voir tous")}>
          {prop ? (
            <Link href={`/properties/${prop.id}`} className="group flex gap-3.5">
              {cover ? (
                <Thumb src={cover} alt="" className="h-24 w-28 rounded-xl" />
              ) : (
                <span className="grid h-24 w-28 shrink-0 place-items-center rounded-xl bg-muted">
                  <Home className="h-6 w-6 text-muted-foreground" aria-hidden />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold group-hover:text-primary">{prop.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {prop.city}
                </p>
                <p className="mt-1.5 text-sm font-bold">{fmtPkrFull(Number(prop.price))}</p>
                <Badge tone="success" className="mt-2">{L("Shared", "Partagé")}</Badge>
              </div>
            </Link>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {L("No specific property linked to this lead.", "Aucun bien spécifique lié à ce prospect.")}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
