import { Bath, Bed, Home, MapPin, Maximize, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Gallery } from "@/features/properties/gallery";
import { fmtPkr } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { PROPERTIES } from "@/lib/mock-properties";
import { PROPERTY_STATUS, TYPE_LABEL, WORKSPACE_PROPERTIES } from "@/lib/mock-data";

export default async function PublicPropertyPage({ params }: { params: { slug: string } }) {
  const t = await getT();
  const p = PROPERTIES.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const status = PROPERTY_STATUS[p.status];
  const images = [p.image, ...WORKSPACE_PROPERTIES.filter((x) => x.id !== p.id).map((x) => x.image).slice(0, 4)];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        {t("public.backToListings")}
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Gallery images={images} alt={p.title} />
          <Card title={t("public.description")}>
            <p className="text-sm text-muted-foreground">
              {t("public.descBody", { locality: p.locality, city: p.city })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Private garden", "Terrace", "Parking", "24/7 security", "Residential area"].map((a) => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">{p.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {p.locality}, {p.city}
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
                [Home, TYPE_LABEL[p.type], t("public.type")],
                [Bed, p.beds, t("public.beds")],
                [Bath, p.baths, t("public.baths")],
                [Maximize, `${p.areaSqm} m²`, t("public.area")],
              ] as [typeof Home, string | number, string][]).map(([Icon, v, l]) => (
                <div key={l}>
                  <Icon className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
                  <dd className="mt-1 font-semibold">{v}</dd>
                  <dt className="text-xs text-muted-foreground">{l}</dt>
                </div>
              ))}
            </dl>

            <a
              href="tel:+92300000000"
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Phone className="h-4 w-4" /> {t("public.contactAgent")}
            </a>
          </Card>

          <Card title={t("public.info")}>
            <dl className="divide-y divide-border text-sm">
              {([
                [t("public.city"), `${p.locality}, ${p.city}`],
                [t("public.propType"), TYPE_LABEL[p.type]],
                [t("public.status"), <Badge key="s" tone={status.tone}>{status.label}</Badge>],
                [t("public.area"), `${p.areaSqm} m²`],
              ] as [string, React.ReactNode][]).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
