import { Bath, Bed, CalendarClock, Home, ImageOff, MapPin, Maximize, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { ContactButtons } from "@/components/public/contact-buttons";
import { InquiryForm } from "@/components/public/inquiry-form";
import { PropertyCard } from "@/components/public/property-card";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Gallery } from "@/features/properties/gallery";
import { fmtPkr, fmtPkrFull } from "@/lib/format";
import { getL, getT } from "@/lib/i18n/server";
import { EN, PROPERTY_STATUS } from "@/lib/mock-data";
import { listedDays, placeLabel, publicArea, type PublicProperty, type PublicPropertyPage } from "@/lib/public-properties";
import { serverApi } from "@/lib/server-api";

const getListing = cache((slug: string) => serverApi<PublicProperty>(`/public/properties/${encodeURIComponent(slug)}`));

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getListing(params.slug);
  const place = placeLabel(p);
  return {
    title: `${p.title}, ${place}`,
    description: `${p.property_type} ${p.purpose === "sale" ? "for sale" : "for rent"} in ${place}. ${fmtPkr(Number(p.price))}.`,
  };
}

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const p = await getListing(params.slug);
  const L = getL();
  const t = await getT();
  const similarPage = await serverApi<PublicPropertyPage>(
    `/public/properties?page_size=4&city=${encodeURIComponent(p.city)}&property_type=${encodeURIComponent(p.property_type)}`);
  const similar = similarPage.items.filter((x) => x.slug !== p.slug).slice(0, 3);

  const sale = p.purpose === "sale";
  const price = Number(p.price);
  const place = placeLabel(p);
  const days = listedDays(p);
  const added = days === 0 ? L("Today", "Aujourd'hui") : days === 1 ? L("Yesterday", "Hier") : L(`${days} days ago`, `Il y a ${days} jours`);
  const message = `Hello, I am interested in "${p.title}" (${p.reference_code}) listed on AqarFlow.`;
  const status = PROPERTY_STATUS[p.status];

  const specs: [LucideIcon, string, string][] = [
    [Home, L("Type", "Type"), t(`type.${p.property_type}`)],
    [Bed, L("Bedrooms", "Chambres"), p.bedrooms === null ? "—" : String(p.bedrooms)],
    [Bath, L("Bathrooms", "Salles de bain"), p.bathrooms === null ? "—" : String(p.bathrooms)],
    [Maximize, L("Area", "Surface"), publicArea(p)],
    [CalendarClock, L("Added", "Ajouté"), added],
  ];
  const jsonLd = {
    "@context": "https://schema.org", "@type": "RealEstateListing", name: p.title,
    offers: { "@type": "Offer", price, priceCurrency: p.currency },
    address: { "@type": "PostalAddress", addressLocality: p.city, streetAddress: p.locality ?? undefined, addressCountry: "PK" },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">{L("Home", "Accueil")}</Link></li><li aria-hidden>›</li>
          <li><Link href={`/listings?purpose=${p.purpose}`} className="hover:text-foreground">{sale ? L("For sale", "À vendre") : L("For rent", "À louer")}</Link></li><li aria-hidden>›</li>
          <li><Link href={`/listings?city=${encodeURIComponent(p.city)}`} className="hover:text-foreground">{p.city}</Link></li><li aria-hidden>›</li>
          <li aria-current="page" className="font-medium text-foreground">{p.title}</li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{p.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden /> {place}</p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{L("Ref", "Réf")}: {p.reference_code}</span>
            {p.status !== "available" && status && <span className="font-medium text-foreground">{L(EN.propertyStatus[p.status], status.label)}</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold" title={fmtPkrFull(price)}>{fmtPkr(price)}{!sale && <span className="text-base font-normal text-muted-foreground"> {L("/ month", "/ mois")}</span>}</p>
          <p className="text-xs text-muted-foreground">{fmtPkrFull(price)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          {p.media.length > 0 ? <Gallery images={p.media.map((m) => m.url)} alt={p.title} /> : (
            <div className="grid h-72 place-items-center rounded-xl bg-muted text-sm text-muted-foreground sm:h-96">
              <span className="flex flex-col items-center gap-2"><ImageOff className="h-8 w-8" aria-hidden />{L("No photos yet", "Pas encore de photos")}</span>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5">
            {specs.map(([Icon, k, v]) => (
              <div key={k} className="bg-card p-4">
                <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                <dt className="mt-2 text-xs text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <Card title={L("Description", "Description")}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {p.description || L("Contact the agent for more details about this property.", "Contactez l'agent pour plus de détails sur ce bien.")}
            </p>
          </Card>

          <Card title={L("Location", "Localisation")}>
            <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" aria-hidden /> {place}, Pakistan</p>
            <p className="mt-2 text-xs text-muted-foreground">{L("Map coming soon.", "Carte bientôt disponible.")}</p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            {p.agent && (
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={p.agent.full_name} className="h-12 w-12 text-base" />
                <div><p className="font-semibold">{p.agent.full_name}</p><p className="text-xs text-muted-foreground">{L("Listing agent", "Agent de l'annonce")}</p></div>
              </div>
            )}
            <ContactButtons message={message} callLabel={L("Call", "Appeler")} waLabel="WhatsApp" />
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{L("or send a message", "ou envoyez un message")}<span className="h-px flex-1 bg-border" /></div>
            <InquiryForm propertySlug={p.slug} propertyTitle={p.title} />
          </Card>
          <p className="px-1 text-xs text-muted-foreground">{L("AqarFlow does not guarantee ownership or legal status. Always verify documents with a qualified professional.", "AqarFlow ne garantit ni la propriété ni le statut juridique. Vérifiez toujours les documents auprès d'un professionnel qualifié.")}</p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-16">
          <h2 id="similar" className="text-2xl font-bold">{L("Similar properties", "Biens similaires")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((x) => <PropertyCard key={x.slug} p={x} />)}</div>
        </section>
      )}
    </div>
  );
}
