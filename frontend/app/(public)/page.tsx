import { ArrowRight, Building2, DoorOpen, Home, Layers, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HeroSearch } from "@/components/public/hero-search";
import { PropertyCard } from "@/components/public/property-card";
import { btn } from "@/components/ui/styles";
import { getL, getT } from "@/lib/i18n/server";
import type { PublicPropertyPage } from "@/lib/public-properties";
import { serverApi } from "@/lib/server-api";
import { cn } from "@/lib/utils";

const CITIES = ["Islamabad", "Lahore", "Karachi"];
const TYPES = [
  { key: "villa", icon: Home }, { key: "apartment", icon: Building2 },
  { key: "duplex", icon: Layers }, { key: "house", icon: DoorOpen },
];

export default async function HomePage() {
  const L = getL();
  const t = await getT();
  const [latest, ...cityPages] = await Promise.all([
    serverApi<PublicPropertyPage>("/public/properties?page_size=3"),
    ...CITIES.map((city) => serverApi<PublicPropertyPage>(`/public/properties?page_size=1&city=${encodeURIComponent(city)}`)),
  ]);
  const why = [
    { icon: ShieldCheck, title: L("Reviewed listings", "Annonces relues"), text: L("Every listing is reviewed by the agency before it goes live.", "Chaque annonce est relue par l'agence avant sa publication.") },
    { icon: PhoneCall, title: L("Talk to agents directly", "Parlez directement aux agents"), text: L("Call or message on WhatsApp in one tap, no middleman.", "Appelez ou écrivez sur WhatsApp en un geste, sans intermédiaire.") },
    { icon: MapPin, title: L("Local expertise", "Expertise locale"), text: L("Agents who know the neighbourhoods of Islamabad, Lahore and Karachi.", "Des agents qui connaissent les quartiers d'Islamabad, Lahore et Karachi.") },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.45),transparent_55%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:48px_48px]" />
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

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        <section aria-labelledby="cities">
          <h2 id="cities" className="text-2xl font-bold">{L("Explore by city", "Explorer par ville")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {CITIES.map((c, i) => {
              const n = cityPages[i].total;
              return (
                <Link key={c} href={`/listings?city=${c}`} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-sidebar to-primary p-6 text-primary-foreground transition-transform hover:-translate-y-0.5">
                  <MapPin className="h-6 w-6 opacity-80" aria-hidden />
                  <p className="mt-6 text-xl font-bold">{c}</p>
                  <p className="text-sm opacity-80">{n} {n === 1 ? L("property", "bien") : L("properties", "biens")}</p>
                  <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="types">
          <h2 id="types" className="text-2xl font-bold">{L("Browse by property type", "Parcourir par type de bien")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {TYPES.map(({ key, icon: Icon }) => (
              <Link key={key} href={`/listings?type=${key}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 font-medium transition-colors hover:border-primary hover:bg-muted">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                {t(`type.${key}`)}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="featured">
          <div className="flex items-end justify-between gap-4">
            <h2 id="featured" className="text-2xl font-bold">{L("Latest properties", "Biens récents")}</h2>
            <Link href="/listings" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">{L("View all", "Voir tout")} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          {latest.items.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{latest.items.map((p) => <PropertyCard key={p.slug} p={p} />)}</div>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">{L("No property is published yet. Check back soon.", "Aucun bien n'est encore publié. Revenez bientôt.")}</p>
          )}
        </section>

        <section aria-labelledby="why">
          <h2 id="why" className="text-2xl font-bold">{L("Why AqarFlow", "Pourquoi AqarFlow")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {why.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold">{L("Are you an agent or an agency?", "Vous êtes agent ou agence ?")}</h2>
            <p className="mt-1 opacity-90">{L("Manage listings, leads and visits in one workspace.", "Gérez annonces, prospects et visites dans un seul espace.")}</p>
          </div>
          <Link href="/login" className={cn(btn.outline, "shrink-0 border-transparent text-foreground")}>{L("Open the agency portal", "Ouvrir l'espace agence")}</Link>
        </section>
      </div>
    </>
  );
}