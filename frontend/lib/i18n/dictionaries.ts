export const LOCALES = ["en", "fr"] as const; // l'anglais est en premier
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const COOKIE = "locale";

const en = {
  nav: { dashboard: "Dashboard", properties: "Properties", leads: "Leads", visits: "Visits", deals: "Deals", team: "Team", agents: "Agents", services: "Services", about: "About", contact: "Contact", agencySpace: "Agency portal" },
  common: { theme: "Theme", light: "Light", dark: "Dark", system: "System", language: "Language", search: "Search", openMenu: "Open menu", closeMenu: "Close menu", account: "Account menu", notifications: "Notifications (unread)", mainNav: "Main navigation", mobileNav: "Mobile menu" },
  topbar: { searchPlaceholder: "Search a property, a lead, a visit…" },
  home: { titleStart: "Find your next property in Pakistan and ", titleAccent: "beyond", titleEnd: ".", subtitle: "Buy, rent or invest: browse properties verified by our agencies.", city: "City", anyCity: "All cities", type: "Property type", anyType: "All types", purpose: "Buy / Rent", anyPurpose: "All", budget: "Max budget (PKR)", budgetPlaceholder: "e.g. 200000000", search: "Search", featured: "Featured properties", countOne: "{n} property", countOther: "{n} properties", empty: "No property matches your search.", reset: "Reset filters" },
  card: { sale: "For sale", rent: "For rent", reserved: "Reserved", favAdd: "Add to favourites", favRemove: "Remove from favourites", details: "View details & contact", perMonth: "/ month" },
  type: { villa: "Villa", apartment: "Apartment", duplex: "Duplex", house: "House" },
  footer: { rights: "© {year} AqarFlow. All rights reserved." },
  placeholder: { title: "Under construction", day: "Planned for day {n}.", agents: "Meet the agency's agents.", services: "Buying, selling, renting and property management.", about: "About the agency.", contact: "Write to us or book an appointment." },
  auth: { welcome: "Welcome back", headline: "Everything your agency needs, in one workspace.", point1: "Publish and manage your property listings.", point2: "Capture inquiries and follow every lead.", point3: "Schedule visits and track your deals.", showPassword: "Show password", hidePassword: "Hide password", email: "Email", password: "Password", signIn: "Sign in", signingIn: "Signing in…", invalid: "Invalid email or password.", tooMany: "Too many attempts. Please wait a moment.", unavailable: "Service unavailable. Please try again.", subtitle: "Sign in to your agency workspace.", backHome: "← Back to home" },
};

export type Dict = typeof en;

const fr: Dict = {
  nav: { dashboard: "Tableau de bord", properties: "Biens", leads: "Leads", visits: "Visites", deals: "Deals", team: "Équipe", agents: "Agents", services: "Services", about: "À propos", contact: "Contact", agencySpace: "Espace agence" },
  common: { theme: "Thème", light: "Clair", dark: "Sombre", system: "Système", language: "Langue", search: "Rechercher", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu", account: "Menu du compte", notifications: "Notifications (non lues)", mainNav: "Navigation principale", mobileNav: "Menu mobile" },
  topbar: { searchPlaceholder: "Rechercher un bien, un lead, une visite…" },
  home: { titleStart: "Trouvez votre prochain bien au Pakistan et ", titleAccent: "au-delà", titleEnd: ".", subtitle: "Achat, location, investissement : parcourez les biens validés par nos agences.", city: "Ville", anyCity: "Toutes les villes", type: "Type de bien", anyType: "Tous les types", purpose: "Achat / Location", anyPurpose: "Tous", budget: "Budget max (PKR)", budgetPlaceholder: "Ex : 200000000", search: "Rechercher", featured: "Biens à la Une", countOne: "{n} bien", countOther: "{n} biens", empty: "Aucun bien ne correspond à votre recherche.", reset: "Réinitialiser les filtres" },
  card: { sale: "À vendre", rent: "À louer", reserved: "Réservé", favAdd: "Ajouter aux favoris", favRemove: "Retirer des favoris", details: "Voir détails & Contacter", perMonth: "/ mois" },
  type: { villa: "Villa", apartment: "Appartement", duplex: "Duplex", house: "Maison" },
  footer: { rights: "© {year} AqarFlow. Tous droits réservés." },
  placeholder: { title: "Écran en cours de construction", day: "Prévu au jour {n}.", agents: "Rencontrez les agents de l'agence.", services: "Achat, vente, location et gestion de biens.", about: "Présentation de l'agence.", contact: "Écrivez-nous ou prenez rendez-vous." },
  auth: { welcome: "Bon retour", headline: "Tout ce dont votre agence a besoin, dans un seul espace.", point1: "Publiez et gérez vos annonces.", point2: "Capturez les demandes et suivez chaque prospect.", point3: "Planifiez les visites et suivez vos deals.", showPassword: "Afficher le mot de passe", hidePassword: "Masquer le mot de passe", email: "Email", password: "Mot de passe", signIn: "Se connecter", signingIn: "Connexion…", invalid: "Email ou mot de passe incorrect.", tooMany: "Trop de tentatives. Veuillez patienter.", unavailable: "Service indisponible. Veuillez réessayer.", subtitle: "Connectez-vous à votre espace agence.", backHome: "← Retour à l'accueil" },
};

export const dictionaries: Record<Locale, Dict> = { en, fr };
export type Vars = Record<string, string | number>;

export function translate(dict: Dict, key: string, vars?: Vars): string {
  const raw = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], dict);
  const s = typeof raw === "string" ? raw : key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s;
}