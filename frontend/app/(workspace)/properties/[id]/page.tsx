import { Bath, Bed, ChevronRight, Home, MapPin, Maximize, Pencil, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { Gallery } from "@/features/properties/gallery";
import { fmtPkr } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { LEADS, LEAD_STAGE, PROPERTY_STATUS, TYPE_LABEL, WORKSPACE_PROPERTIES, agentName, getProperty } from "@/lib/mock-data";

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const t = await getT();
  const p = getProperty(Number(params.id));
  if (!p) notFound();

  const status = PROPERTY_STATUS[p.status];
  const images = [p.image, ...WORKSPACE_PROPERTIES.filter((x) => x.id !== p.id).map((x) => x.image).slice(0, 4)];
  const requests = LEADS.filter((l) => l.propertyId === p.id);
  const agent = agentName(p.agentId)!;

  const rows: [string, React.ReactNode][] = [
    [t("workspace.properties.city"), `${p.locality}, ${p.city}`],
    [t("workspace.properties.type"), TYPE_LABEL[p.type]],
    [t("workspace.properties.status"), <Badge key="s" tone={status.tone}>{status.label}</Badge>],
    [t("workspace.properties.publication"), <Badge key="p" tone={p.published ? "info" : "neutral"}>{p.published ? t("workspace.properties.published") : t("workspace.properties.unpublished")}</Badge>],
    [t("workspace.properties.area"), `${p.areaSqm} m²`],
    [t("workspace.properties.agent"), <span key="a" className="flex items-center gap-2"><Avatar name={agent} className="h-6 w-6 text-[10px]" />{agent}</span>],
  ];

  return (
    <>
      <PageHeader title={t("workspace.properties.detailTitle")} back={{ href: "/properties", label: t("workspace.properties.back") }}>
        <button type="button" className={btn.outline}><Pencil className="h-4 w-4" /> {t("workspace.properties.edit")}</button>
        <button type="button" className={btn.primary}><Send className="h-4 w-4" /> {p.published ? t("workspace.properties.unpublish") : t("workspace.properties.publish")}</button>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_0.9fr]">
        <div className="space-y-4">
          <Gallery images={images} alt={p.title} />
          <Card title={t("workspace.properties.sectionDescription")}>
            <p className="text-sm text-muted-foreground">
              {t("workspace.properties.descBody", { locality: p.locality, city: p.city })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Private garden", "Terrace", "Parking", "24/7 security", "Residential area"].map((a) => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{p.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {p.city}
              </p>
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-4 text-2xl font-bold">
            {fmtPkr(p.price)}
            {p.purpose === "rent" && <span className="text-sm font-normal text-muted-foreground"> /mo</span>}
          </p>
          <dl className="mt-5 grid grid-cols-4 gap-2 border-y border-border py-4 text-center text-sm">
            {([
              [Home, TYPE_LABEL[p.type], t("workspace.properties.type")],
              [Bed, p.beds, t("workspace.leads.wantedBeds")],
              [Bath, p.baths, "Baths"],
              [Maximize, `${p.areaSqm} m²`, t("workspace.properties.area")],
            ] as [typeof Home, string | number, string][]).map(([Icon, v, l]) => (
              <div key={l}>
                <Icon className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
                <dd className="mt-1 font-semibold">{v}</dd>
                <dt className="text-xs text-muted-foreground">{l}</dt>
              </div>
            ))}
          </dl>
          <h3 className="mb-2 mt-5 font-semibold">{t("workspace.properties.infoTitle")}</h3>
          <dl className="divide-y divide-border text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title={t("workspace.properties.requests")} href="/leads">
          {requests.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("workspace.properties.noRequests")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((l) => (
                <li key={l.id}>
                  <Link href={`/leads/${l.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <Avatar name={l.name} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{LEAD_STAGE[l.stage].label} · {l.ago}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
