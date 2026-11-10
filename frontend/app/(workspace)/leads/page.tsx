import { Mail, MapPin, Phone, PhoneIncoming, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { LeadActions } from "@/features/leads/lead-actions";
import { fmtPkr } from "@/lib/format";
import { LEAD_STAGE, TYPE_LABEL, agentName, getLead, getProperty } from "@/lib/mock-data";

export default function LeadPage({ params }: { params: { id: string } }) {
  const lead = getLead(Number(params.id));
  if (!lead) notFound();
  const p = getProperty(lead.propertyId)!;
  const stage = LEAD_STAGE[lead.stage];
  const agent = agentName(lead.agentId);
  const email = `${lead.name.toLowerCase().replace(/ /g, ".")}@example.com`;
  const phone = `+92 300 123 45${String(lead.id).padStart(2, "0")}`;

  const wanted: [string, string][] = [
    ["Type", TYPE_LABEL[p.type]],
    ["Budget", `${fmtPkr(lead.budget[0])} – ${fmtPkr(lead.budget[1]).replace("PKR ", "")}`],
    ["Chambres", String(p.beds)],
    ["Localisation", `${p.locality}, ${p.city}`],
    ["Usage", p.purpose === "sale" ? "Achat" : "Location"],
  ];
  const history = [
    { icon: PhoneIncoming, title: "Appel entrant", body: "Discussion sur le budget et les quartiers préférés.", by: agent ?? "—" },
    { icon: FileText, title: "Demande d'information", body: "Le prospect a soumis une demande via le site.", by: "Système" },
  ];

  return (
    <>
      <PageHeader title="Fiche du prospect" back={{ href: "/leads", label: "Retour aux leads" }}>
        <Badge tone={stage.tone}>{stage.label}</Badge>
        <span className="self-center text-sm text-muted-foreground">Reçu {lead.ago.toLowerCase()}</span>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr_1fr]">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={lead.name} className="h-16 w-16 text-xl" />
            <div><h2 className="text-xl font-semibold">{lead.name}</h2><p className="text-sm text-muted-foreground">Client particulier</p></div>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" aria-hidden /> {phone}</li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" aria-hidden /> {email}</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" aria-hidden /> {lead.city}</li>
          </ul>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Agent responsable</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              {agent ? <span className="flex items-center gap-2 font-medium"><Avatar name={agent} />{agent}</span> : <span className="text-muted-foreground">Non assigné</span>}
              <button type="button" className={`${btn.outline} px-3 py-1.5`}>{agent ? "Changer" : "Attribuer"}</button>
            </div>
          </div>
        </Card>

        <Card title="Demande d'information">
          <p className="rounded-lg bg-muted p-4 text-sm">{`Bonjour, je suis intéressé par « ${p.title} ». Pouvez-vous me contacter pour plus d'informations et organiser une visite ?`}</p>
          <h3 className="mb-3 mt-6 font-semibold">Bien recherché</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {wanted.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
        </Card>

        <LeadActions initialStage={lead.stage} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2.3fr_1fr]">
        <Card title="Historique des actions">
          <ol className="space-y-5">
            {history.map((h) => (
              <li key={h.title} className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><h.icon className="h-5 w-5" aria-hidden /></span>
                <div className="min-w-0 flex-1"><p className="font-medium">{h.title}</p><p className="text-sm text-muted-foreground">{h.body}</p></div>
                <div className="shrink-0 text-right text-xs text-muted-foreground"><p>{lead.ago}</p><p>par {h.by}</p></div>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Biens partagés" href={`/properties/${p.id}`} linkLabel="Voir le bien">
          <div className="flex gap-3">
            <Thumb src={p.image} alt="" className="h-24 w-28 rounded-lg" />
            <div className="min-w-0"><p className="truncate font-medium">{p.title}</p><p className="text-sm text-muted-foreground">{p.city}</p><p className="mt-1 text-sm font-semibold">{fmtPkr(p.price)}</p><Badge tone="success" className="mt-2">Partagé</Badge></div>
          </div>
        </Card>
      </div>
    </>
  );
}