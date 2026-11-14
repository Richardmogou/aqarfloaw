import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { getL } from "@/lib/i18n/server";
import { SITE, telLink, waLink } from "@/lib/site";

export function PublicFooter() {
  const L = getL();

  const propertyLinks = [
    { href: "/listings?purpose=sale", label: L("Properties for sale", "Biens à vendre") },
    { href: "/listings?purpose=rent", label: L("Properties for rent", "Biens à louer") },
    { href: "/listings?city=Islamabad", label: "Islamabad" },
    { href: "/listings?city=Lahore", label: "Lahore" },
    { href: "/listings?city=Karachi", label: "Karachi" },
  ];

  const typeLinks = [
    { href: "/listings?type=villa", label: L("Luxury Villas", "Villas de luxe") },
    { href: "/listings?type=apartment", label: L("Modern Apartments", "Appartements modernes") },
    { href: "/listings?type=duplex", label: L("Duplexes & Penthouses", "Duplex & Penthouses") },
    { href: "/listings?type=commercial", label: L("Commercial Spaces", "Locaux commerciaux") },
    { href: "/agents", label: L("Our Agents", "Nos agents") },
  ];

  const companyLinks = [
    { href: "/about", label: L("About us", "À propos") },
    { href: "/services", label: L("Services", "Services") },
    { href: "/contact", label: L("Contact", "Contact") },
    { href: "/login", label: L("Agency Portal", "Espace Agence") },
  ];

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo href="/" />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {L(
                "Find, rent and sell property across Pakistan with verified partner agencies.",
                "Trouvez, louez et vendez des biens partout au Pakistan avec des agences partenaires certifiées."
              )}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={telLink()} className="transition hover:text-foreground">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={`mailto:${SITE.email}`} className="transition hover:text-foreground">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <a
                  href={waLink("Hello AqarFlow, I have a property inquiry.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {L("Properties", "Immobilier")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {propertyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {L("Property Types", "Types de biens")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {typeLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {L("Company", "Entreprise")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} AqarFlow · Nchifor Richard. {L("All rights reserved.", "Tous droits réservés.")}</p>
          <p className="max-w-xl md:text-right">
            {L(
              "Listings are provided by partner agencies. AqarFlow facilitates real estate operations across Pakistan.",
              "Les annonces sont publiées par les agences partenaires. AqarFlow facilite les opérations immobilières au Pakistan."
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}