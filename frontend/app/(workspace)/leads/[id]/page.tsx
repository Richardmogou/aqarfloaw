import { FileText, Mail, MapPin, Phone, PhoneIncoming } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { LeadActions } from "@/features/leads/lead-actions";
import { agoLabel, fmtPkr } from "@/lib/format";
import { getL, getLocale, getT } from "@/lib/i18n/server";
import { EN, LEAD_STAGE, agentName, getLead, getProperty } from "@/lib/mock-data";

export default async function LeadPage({ params }: { params: { id: string } }) {
  const lead = getLead(Number(params.id));
  if (!lead) notFound();
  const t = await getT();
  const L = getL();
  const locale = getLocale();

  const p = getProperty(lead.propertyId)!;
  const stage = LEAD_STAGE[lead.stage];
  const agent = agentName(lead.agentId);
  const ago = agoLabel(lead.ago, locale);
  const email = `${lead.name.toLowerCase().replace(/ /g, ".")}@example.com`;
  const phone = `+92 300 123 45${String(lead.id).padStart(2, "0")}`;

  const wanted: [string, string][] = [
    [L("Type", "Type"), t(`type.${p.type}`)],
    [L("Budget", "Budget"), `${fmtPkr(lead.budget[0])} – ${fmtPkr(lead.budget[1]).replace("PKR ", "")}`],
    [L("Bedrooms", "Chambres"), String(p.beds)],
    [L("Location", "Localisation"), `${p.locality}, ${p.city}`],
    [L("Use", "Usage"), p.purpose === "sale" ? L("Purchase", "Achat") : L("Rental", "Location")],
  ];
  const history = [
    { icon: PhoneIncoming, title: L("Incoming call", "Appel entrant"), body: L("Discussion about budget and preferred areas.", "Discussion sur le budget et les quartiers préférés."), by: agent ?? "—" },
    { icon: FileText, title: L("Information request", "Demande d'information"), body: L("The lead submitted a request via the website.", "Le prospect a soumis une demande via le site."), by: L("System", "Système") },
  ];

  return (
    <>
      <PageHeader title={L("Lead details", "Fiche du prospect")} back={{ href: "/leads", label: L("Back to leads", "Retour aux leads") }}>
        <Badge tone={stage.tone}>{L(EN.leadStage[lead.stage], stage.label)}</Badge>
        <span className="self-center text-sm text-muted-foreground">{L("Received", "Reçu")} {ago}</span>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr_1fr]">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={lead.name} className="h-16 w-16 text-xl" />
            <div>
              <h2 className="text-xl font-semibold">{lead.name}</h2>
              <p className="text-sm text-muted-foreground">{L("Individual client", "Client particulier")}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" aria-hidden /> {phone}</li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" aria-hidden /> {email}</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" aria-hidden /> {lead.city}</li>
          </ul>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">{L("Responsible agent", "Agent responsable")}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              {agent ? (
                <span className="flex items-center gap-2 font-medium"><Avatar name={agent} />{agent}</span>
              ) : (
                <span className="text-muted-foreground">{L("Unassigned", "Non assigné")}</span>
              )}
              <button type="button" className={`${btn.outline} px-3 py-1.5`}>{agent ? L("Change", "Changer") : L("Assign", "Attribuer")}</button>
            </div>
          </div>
        </Card>

        <Card title={L("Information request", "Demande d'information")}>
          <p className="rounded-lg bg-muted p-4 text-sm">
            {L(
              `Hello, I am interested in "${p.title}". Could you contact me with more information and arrange a visit?`,
              `Bonjour, je suis intéressé par « ${p.title} ». Pouvez-vous me contacter pour plus d'informations et organiser une visite ?`,
            )}
          </p>
          <h3 className="mb-3 mt-6 font-semibold">{L("Property wanted", "Bien recherché")}</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {wanted.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
        </Card>

        <LeadActions initialStage={lead.stage} leadId={lead.id} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2.3fr_1fr]">
        <Card title={L("Activity history", "Historique des actions")}>
          <ol className="space-y-5">
            {history.map((h) => (
              <li key={h.title} className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><h.icon className="h-5 w-5" aria-hidden /></span>
                <div className="min-w-0 flex-1"><p className="font-medium">{h.title}</p><p className="text-sm text-muted-foreground">{h.body}</p></div>
                <div className="shrink-0 text-right text-xs text-muted-foreground"><p>{ago}</p><p>{L("by", "par")} {h.by}</p></div>
              </li>
            ))}
          </ol>
        </Card>

        <Card title={L("Shared properties", "Biens partagés")}>
          <div className="flex gap-3">
            <Thumb src={p.image} alt="" className="h-24 w-28 rounded-lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.city}</p>
              <p className="mt-1 text-sm font-semibold">{fmtPkr(p.price)}</p>
              <Badge tone="success" className="mt-2">{L("Shared", "Partagé")}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}