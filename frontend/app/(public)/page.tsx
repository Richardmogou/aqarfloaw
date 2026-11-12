import { ArrowRight, Building2, DoorOpen, Home, Layers, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HeroSearch } from "@/components/public/hero-search";
import { ListingsUnavailable } from "@/components/public/listings-unavailable";
import { PropertyCard } from "@/components/public/property-card";
import { btn } from "@/components/ui/styles";
import { getL, getT } from "@/lib/i18n/server";
import type { PublicPropertyPage } from "@/lib/public-properties";
import { publicApi } from "@/lib/server-api";
import { cn } from "@/lib/utils";

const CITIES = [
  {
    name: "Islamabad",
    taglineEn: "Capital Territory & Margalla Views",
    taglineFr: "Capitale & vues sur Margalla",
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Lahore",
    taglineEn: "Cultural Heart & Prime Sectors",
    taglineFr: "Cœur culturel & secteurs résidentiels",
    image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd1?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Karachi",
    taglineEn: "Coastal Metropolis & Business Center",
    taglineFr: "Métropole côtière & centre des affaires",
    image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80",
  },
];

const TYPES = [
  { key: "villa", icon: Home, descEn: "Standalone luxury residences", descFr: "Propriétés d'exception & jardins" },
  { key: "apartment", icon: Building2, descEn: "Modern flats & penthouses", descFr: "Appartements neufs & résidences" },
  { key: "duplex", icon: Layers, descEn: "Multi-level urban living", descFr: "Logements sur deux niveaux" },
  { key: "house", icon: DoorOpen, descEn: "Family homes in prime sectors", descFr: "Maisons familiales tout confort" },
];

export default async function HomePage() {
  const L = getL();
  const t = await getT();
  const [latest, ...cityPages] = await Promise.all([
    publicApi<PublicPropertyPage>("/public/properties?page_size=6"),
    ...CITIES.map((c) => publicApi<PublicPropertyPage>(`/public/properties?page_size=1&city=${encodeURIComponent(c.name)}`)),
  ]);
  const why = [
    { icon: ShieldCheck, title: L("Reviewed listings", "Annonces relues"), text: L("Every listing is reviewed by the agency before it goes live.", "Chaque annonce est relue par l'agence avant sa publication.") },
    { icon: PhoneCall, title: L("Talk to agents directly", "Parlez directement aux agents"), text: L("Call or message on WhatsApp in one tap, no middleman.", "Appelez ou écrivez sur WhatsApp en un geste, sans intermédiaire.") },
    { icon: MapPin, title: L("Local expertise", "Expertise locale"), text: L("Agents who know the neighbourhoods of Islamabad, Lahore and Karachi.", "Des agents qui connaissent les quartiers d'Islamabad, Lahore et Karachi.") },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <div aria-hidden className="absolute inset-0 -z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt=""
            className="h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/85 to-sidebar/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.35),transparent_60%)]" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {L("Find your next property in Pakistan", "Trouvez votre prochain bien au Pakistan")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-sidebar-foreground/80">
            {L("Buy, rent or invest with agencies you can reach directly.", "Achetez, louez ou investissez avec des agences joignables directement.")}
          </p>
          <HeroSearch />
        </div>
      </section>

      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { value: "100%", label: L("Verified agency listings", "Annonces vérifiées par agence") },
            { value: "0", label: L("Hidden commissions", "Commission cachée") },
            { value: "3", label: L("Metropolitan areas", "Villes majeures couvertes") },
            { value: "Direct", label: L("Call & WhatsApp access", "Contact direct Appel & WhatsApp") },
          ].map((item) => (
            <div key={item.label} className="text-center sm:text-left">
              <p className="text-2xl font-extrabold text-primary">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* Explore by city */}
        <section aria-labelledby="cities">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{L("Top Locations", "Destinations phares")}</p>
              <h2 id="cities" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{L("Explore by city", "Explorer par ville")}</h2>
            </div>
            <Link href="/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {L("All locations", "Toutes les villes")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((c, i) => {
              const result = cityPages[i];
              const total = result.ok ? result.data.total : 0;
              const countText = total > 0
                ? `${total} ${total === 1 ? L("property", "bien") : L("properties", "biens")}`
                : L("Explore listings", "Découvrir les biens");
              return (
                <Link
                  key={c.name}
                  href={`/listings?city=${encodeURIComponent(c.name)}`}
                  className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md">
                      <MapPin className="h-3 w-3" aria-hidden /> {c.name}
                    </span>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{c.name}</p>
                    <p className="mt-0.5 text-xs text-white/80">{L(c.taglineEn, c.taglineFr)}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3 text-xs font-semibold text-white/95">
                      <span>{countText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Browse by property type */}
        <section aria-labelledby="types">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{L("Categories", "Catégories")}</p>
            <h2 id="types" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{L("Browse by property type", "Parcourir par type de bien")}</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map(({ key, icon: Icon, descEn, descFr }) => (
              <Link
                key={key}
                href={`/listings?type=${key}`}
                className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-foreground transition-colors group-hover:text-primary">{t(`type.${key}`)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{L(descEn, descFr)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest properties */}
        <section aria-labelledby="featured">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{L("Fresh On Market", "Récemment ajoutés")}</p>
              <h2 id="featured" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{L("Latest properties", "Biens récents")}</h2>
            </div>
            <Link href="/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {L("View all properties", "Voir toutes les annonces")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {!latest.ok ? (
            <div className="mt-6"><ListingsUnavailable retryHref="/" /></div>
          ) : latest.data.items.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.data.items.map((p) => <PropertyCard key={p.slug} p={p} />)}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {L("No property is published yet. Check back soon.", "Aucun bien n'est encore publié. Revenez bientôt.")}
            </p>
          )}
        </section>

        {/* Why AqarFlow */}
        <section aria-labelledby="why">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{L("Our Commitment", "Notre engagement")}</p>
            <h2 id="why" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{L("Why choose AqarFlow", "Pourquoi choisir AqarFlow")}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {L("A transparent, reliable platform designed for high-value property decisions.", "Une plateforme transparente et fiable conçue pour vos décisions immobilières.")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {why.map(({ icon: Icon, title, text }, idx) => (
              <div key={title} className="relative rounded-2xl border border-border/80 bg-card p-7 shadow-sm transition-shadow hover:shadow-md">
                <span className="absolute right-6 top-6 text-2xl font-black text-muted-foreground/15">0{idx + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Agency CTA banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sidebar via-sidebar to-sidebar-active p-8 text-sidebar-foreground shadow-xl sm:p-12">
          <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
                {L("For Professionals", "Pour les professionnels")}
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                {L("Are you a real estate agent or agency?", "Vous êtes agent ou agence immobilière ?")}
              </h2>
              <p className="mt-2 text-sm text-sidebar-foreground/80 leading-relaxed">
                {L("Manage your properties, qualify incoming leads and track scheduled visits in one unified workspace.", "Centralisez la gestion de vos biens, qualifiez vos prospects et suivez vos visites dans un seul espace dédié.")}
              </p>
            </div>
            <Link href="/login" className={cn(btn.primary, "shrink-0 px-6 py-3 font-semibold shadow-lg hover:shadow-primary/30")}>
              {L("Open the agency portal", "Accéder à l'espace agence")}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}