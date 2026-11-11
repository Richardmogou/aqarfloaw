import Link from "next/link";
import { getL } from "@/lib/i18n/server";
import { SITE, telLink } from "@/lib/site";

export function PublicFooter() {
  const L = getL();
  const cols = [
    { title: L("Browse", "Parcourir"), links: [
      ["/listings?purpose=sale", L("Properties for sale", "Biens à vendre")],
      ["/listings?purpose=rent", L("Properties for rent", "Biens à louer")],
      ["/agents", L("Our agents", "Nos agents")],
    ] },
    { title: L("Company", "Entreprise"), links: [
      ["/about", L("About us", "À propos")],
      ["/services", L("Services", "Services")],
      ["/contact", L("Contact", "Contact")],
    ] },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-extrabold">AqarFlow</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {L("Find, rent and sell property across Pakistan with agencies you can reach directly.", "Trouvez, louez et vendez des biens partout au Pakistan avec des agences joignables directement.")}
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-foreground">{label}</Link></li>)}
            </ul>
          </nav>
        ))}
        <div>
          <p className="text-sm font-semibold">{L("Contact", "Contact")}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href={telLink()} className="hover:text-foreground">{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-foreground">{SITE.email}</a></li>
            <li>{SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} AqarFlow. {L("All rights reserved.", "Tous droits réservés.")}</span>
          <span>{L("Listings are provided by agencies. AqarFlow does not guarantee ownership or legal status of any property.", "Les annonces sont fournies par les agences. AqarFlow ne garantit ni la propriété ni le statut juridique d'un bien.")}</span>
        </div>
      </div>
    </footer>
  );
}