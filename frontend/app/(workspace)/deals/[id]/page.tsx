import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Thumb } from "@/components/ui/thumb";
import { DealStage } from "@/features/deals/deal-stage";
import { fmtDate, fmtPkr } from "@/lib/format";
import { getL, getLocale } from "@/lib/i18n/server";
import { DEAL_STAGE, agentName, getDeal, getLead, getProperty } from "@/lib/mock-data";

export default function DealPage({ params }: { params: { id: string } }) {
  const deal = getDeal(Number(params.id));
  if (!deal) notFound();
  const L = getL();
  const locale = getLocale();
  const p = getProperty(deal.propertyId)!;
  const lead = getLead(deal.leadId)!;
  const agent = agentName(deal.agentId)!;
  const label = (s: string) => L(DEAL_STAGE[s].en, DEAL_STAGE[s].fr);
  const none = L("Not set", "Non défini");

  const rows: [string, React.ReactNode][] = [
    [L("Buyer", "Acheteur"), <Link key="b" href={`/leads/${lead.id}`} className="text-primary hover:underline">{lead.name}</Link>],
    [L("Listed price", "Prix affiché"), fmtPkr(p.price)],
    [L("Offer", "Offre"), deal.offer ? fmtPkr(deal.offer) : none],
    [L("Agreed amount", "Montant convenu"), deal.agreed ? fmtPkr(deal.agreed) : none],
    [L("Expected close", "Clôture prévue"), deal.closeDate ? fmtDate(deal.closeDate, locale) : none],
    [L("Agent", "Agent"), <span key="a" className="flex items-center gap-2"><Avatar name={agent} className="h-6 w-6 text-[10px]" />{agent}</span>],
  ];

  return (
    <>
      <PageHeader title={`${L("Deal", "Deal")} #${deal.id}`} back={{ href: "/deals", label: L("Back to deals", "Retour aux deals") }}>
        <Badge tone={DEAL_STAGE[deal.stage].tone}>{label(deal.stage)}</Badge>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card title={L("Summary", "Résumé")}>
            {/* Sample deal data: its property is not a real record yet, so there is no detail page to link to. */}
            <div className="mb-4 flex items-center gap-3">
              <Thumb src={p.image} alt="" className="h-16 w-24 rounded-lg" />
              <span><span className="block font-medium">{p.title}</span><span className="text-sm text-muted-foreground">{p.locality}, {p.city}</span></span>
            </div>
            <dl className="divide-y divide-border text-sm">
              {rows.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
          </Card>
          <Card title={L("Stage history", "Historique des étapes")}>
            <ol className="space-y-4">
              {[...deal.history].reverse().map((h) => (
                <li key={h.stage} className="flex items-center justify-between gap-3 text-sm">
                  <Badge tone={DEAL_STAGE[h.stage].tone}>{label(h.stage)}</Badge>
                  <span className="text-muted-foreground">{fmtDate(h.at, locale)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <DealStage initial={deal.stage} />
      </div>
    </>
  );
}