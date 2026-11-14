import { Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Thumb } from "@/components/ui/thumb";
import { DealStage } from "@/features/deals/deal-stage";
import { requireUser } from "@/lib/auth";
import type { ApiDealDetail } from "@/lib/deals";
import { fmtDate, fmtPkrFull } from "@/lib/format";
import { getL, getLocale } from "@/lib/i18n/server";
import { leadPropertyCover } from "@/lib/leads";
import { DEAL_STAGE } from "@/lib/mock-data";
import { isUuid } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function DealPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound();
  await requireUser();
  const deal = await serverApi<ApiDealDetail>(`/deals/${params.id}`);
  const L = getL();
  const locale = getLocale();
  const p = deal.property;
  const cover = leadPropertyCover(p);
  const agent = deal.agent_name ?? L("Agent", "Agent");
  const label = (s: string) => L(DEAL_STAGE[s]?.en ?? s, DEAL_STAGE[s]?.fr ?? s);
  const tone = (s: string) => DEAL_STAGE[s]?.tone ?? ("neutral" as const);
  const none = L("Not set", "Non défini");

  const rows: [string, React.ReactNode][] = [
    [
      L("Buyer", "Acheteur"),
      <Link key="b" href={`/leads/${deal.lead_id}`} className="font-semibold text-primary hover:underline">
        {deal.buyer_contact.name}
      </Link>,
    ],
    [L("Listed price", "Prix affiché"), fmtPkrFull(Number(p.price))],
    [L("Offer", "Offre"), deal.offer_amount ? fmtPkrFull(Number(deal.offer_amount)) : none],
    [L("Agreed amount", "Montant convenu"), deal.agreed_amount ? fmtPkrFull(Number(deal.agreed_amount)) : none],
    [L("Expected close", "Clôture prévue"), deal.expected_close_date ? fmtDate(deal.expected_close_date, locale) : none],
    [
      L("Agent", "Agent"),
      <span key="a" className="flex items-center gap-2">
        <Avatar name={agent} className="h-6 w-6 text-[10px]" />
        {agent}
      </span>,
    ],
  ];

  return (
    <>
      <PageHeader
        title={`${L("Deal", "Deal")} · ${p.reference_code}`}
        back={{ href: "/deals", label: L("Back to deals", "Retour aux deals") }}
      >
        <Badge tone={tone(deal.stage)}>{label(deal.stage)}</Badge>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card title={L("Summary", "Résumé")}>
            <Link href={`/properties/${p.id}`} className="group mb-4 flex items-center gap-3">
              {cover ? (
                <Thumb src={cover} alt="" className="h-16 w-24 rounded-lg" />
              ) : (
                <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-muted">
                  <Home className="h-5 w-5 text-muted-foreground" aria-hidden />
                </span>
              )}
              <span>
                <span className="block font-semibold group-hover:text-primary">{p.title}</span>
                <span className="text-sm text-muted-foreground">
                  {[p.locality, p.city].filter(Boolean).join(", ")}
                </span>
              </span>
            </Link>
            <dl className="divide-y divide-border text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {deal.notes && (
              <div className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                {deal.notes}
              </div>
            )}
          </Card>

          <Card title={L("Stage history", "Historique des étapes")}>
            <ol className="space-y-3">
              {[...deal.events].reverse().map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge tone={tone(event.new_stage)}>{label(event.new_stage)}</Badge>
                    {event.user_name && (
                      <span className="text-xs text-muted-foreground">
                        {L("by", "par")} {event.user_name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{fmtDate(event.created_at, locale)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <DealStage
          dealId={deal.id}
          initialStage={deal.stage}
          initialOffer={deal.offer_amount}
          initialAgreed={deal.agreed_amount}
        />
      </div>
    </>
  );
}
