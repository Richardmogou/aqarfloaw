import { Bath, Bed, CalendarClock, Home, ImageOff, MapPin, Maximize, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ContactButtons } from "@/components/public/contact-buttons";
import { InquiryForm } from "@/components/public/inquiry-form";
import { ListingsUnavailable } from "@/components/public/listings-unavailable";
import { PropertyCard } from "@/components/public/property-card";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Gallery } from "@/features/properties/gallery";
import { fmtPkr, fmtPkrFull } from "@/lib/format";
import { getL, getT } from "@/lib/i18n/server";
import { EN, PROPERTY_STATUS } from "@/lib/mock-data";
import { listedDays, placeLabel, publicArea, type PublicProperty, type PublicPropertyPage } from "@/lib/public-properties";
import { publicApi } from "@/lib/server-api";
import { telLink } from "@/lib/site";

const getListing = cache((slug: string) => publicApi<PublicProperty>(`/public/properties/${encodeURIComponent(slug)}`));

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getListing(params.slug);
  if (!result.ok) return { title: result.status === 404 ? "Property not found" : "Property" };
  const p = result.data;
  const place = placeLabel(p);
  return {
    title: `${p.title}, ${place}`,
    description: `${p.property_type} ${p.purpose === "sale" ? "for sale" : "for rent"} in ${place}. ${fmtPkr(Number(p.price))}.`,
  };
}

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const result = await getListing(params.slug);
  if (!result.ok && result.status === 404) notFound();
  if (!result.ok) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ListingsUnavailable retryHref={`/listings/${encodeURIComponent(params.slug)}`} />
      </div>
    );
  }
  const p = result.data;
  const L = getL();
  const t = await getT();
  const similarResult = await publicApi<PublicPropertyPage>(
    `/public/properties?page_size=4&city=${encodeURIComponent(p.city)}&property_type=${encodeURIComponent(p.property_type)}`);
  const similar = similarResult.ok ? similarResult.data.items.filter((x) => x.slug !== p.slug).slice(0, 3) : [];

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

      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {L("Verified Property Listing", "Annonce certifiée conforme")}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {L("Ref:", "Réf :")} {p.reference_code}
            </span>
            {p.status !== "available" && status && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {L(EN.propertyStatus[p.status], status.label)}
              </span>
            )}
          </div>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {p.title}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden />
            <span>{place}</span>
          </p>
        </div>

        <div className="flex flex-col sm:items-end justify-center rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sale ? L("Asking price", "Prix de vente") : L("Rental rate", "Loyer mensuel")}
          </p>
          <p className="text-3xl font-black tracking-tight text-foreground sm:text-4xl" title={fmtPkrFull(price)}>
            {fmtPkr(price)}
            {!sale && <span className="text-base font-normal text-muted-foreground"> {L("/ month", "/ mois")}</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{fmtPkrFull(price)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          {p.media.length > 0 ? (
            <Gallery images={p.media.map((m) => m.url)} alt={p.title} />
          ) : (
            <div className="grid h-72 place-items-center rounded-2xl bg-muted/60 text-sm text-muted-foreground sm:h-96 border border-border">
              <span className="flex flex-col items-center gap-2">
                <ImageOff className="h-8 w-8 opacity-40" aria-hidden />
                {L("No photos yet", "Pas encore de photos")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {specs.map(([Icon, k, v]) => (
              <div key={k} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/30">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <dt className="mt-2 text-xs font-medium text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-bold text-foreground">{v}</dd>
              </div>
            ))}
          </div>

          <Card title={L("Property Overview & Details", "Présentation & Caractéristiques")}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {p.description || L("Contact the listing agent for more details, floor plans, and viewing schedule for this property.", "Contactez l'agent pour plus de détails, plans et organisation de visite pour ce bien.")}
            </p>
          </Card>

          <Card title={L("Location & Area", "Localisation & Quartier")}>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              <span>{place}, Pakistan</span>
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-border shadow-sm">
              <iframe
                title={L("Property location map", "Carte de localisation du bien")}
                width="100%"
                height="300"
                className="block border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${place}, Pakistan`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
            <p className="mt-2 text-right">
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${place}, Pakistan`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary hover:underline"
              >
                {L("View on OpenStreetMap", "Voir sur OpenStreetMap")} ›
              </a>
            </p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="shadow-sm border-border/80">
            {p.agent && (
              <div className="mb-5 flex items-center gap-3.5 pb-4 border-b border-border/70">
                <Avatar name={p.agent.full_name} className="h-13 w-13 text-base shadow-sm ring-2 ring-primary/20" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-foreground truncate">{p.agent.full_name}</p>
                    <span title={L("Certified agent", "Agent certifié")}>
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{L("Certified Real Estate Agent", "Agent immobilier certifié")}</p>
                  {p.agent.phone && (
                    <a href={telLink(p.agent.phone || undefined)} className="mt-0.5 inline-block text-xs font-medium text-primary hover:underline">
                      {p.agent.phone}
                    </a>
                  )}
                </div>
              </div>
            )}
            <ContactButtons message={message} callLabel={L("Call Agent", "Appeler l'agent")} waLabel="WhatsApp" phone={p.agent?.phone} />
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>{L("or send an online inquiry", "ou envoyer un message")}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <InquiryForm propertySlug={p.slug} propertyTitle={p.title} />
          </Card>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">{L("Buyer protection note:", "Information acquéreur :")}</span>{" "}
            {L(
              "AqarFlow connects buyers directly with certified agencies. Always perform due diligence and verify ownership documents before financial commitment.",
              "AqarFlow vous met directement en relation avec des agences certifiées. Vérifiez toujours les titres de propriété avant tout engagement financier."
            )}
          </div>
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
