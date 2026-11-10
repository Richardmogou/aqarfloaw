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
  auth: { welcome: "Welcome back", headline: "Everything your agency needs, in one workspace.", point1: "Publish and manage your property listings.", point2: "Capture inquiries and follow every lead.", point3: "Schedule visits and track your deals.", showPassword: "Show password", hidePassword: "Hide password", email: "Email", password: "Password", signIn: "Sign in", signingIn: "Signing in…", signOut: "Sign out", invalid: "Invalid email or password.", tooMany: "Too many attempts. Please wait a moment.", unavailable: "Service unavailable. Please try again.", subtitle: "Sign in to your agency workspace.", backHome: "← Back to home" },
  workspace: {
    dashboard: { title: "Dashboard", description: "A quick look at your activity today.", newLead: "New contact request", leadAssigned: "Lead assigned to agent", leadSub1: "Apartment in Lahore", leadSub2: "Request for a plot", ago1: "12 min ago", ago2: "3 h ago", newLeads: "New inquiries", noAgent: "{n} unassigned", openDeals: "Open deals", dealHint: "Deals module: day 6", cta: "Turn searches into new homes", ctaBtn: "Add a property" },
    properties: { title: "Properties", description: "Manage your listings and track their performance.", add: "Add a property", addTitle: "Add a property", addDesc: "Property creation form.", detailTitle: "Property details", back: "Back to properties", edit: "Edit", publish: "Publish listing", unpublish: "Unpublish", sectionDescription: "Description", descBody: "Property located in {locality}, {city}. Bright spaces, quality finishes and a calm environment, ideal for a family seeking comfort and tranquillity.", amenities: "Amenities", infoTitle: "Key information", city: "City / Area", type: "Property type", status: "Status", publication: "Publication", area: "Area", agent: "Agent", requests: "Inquiries received", noRequests: "No inquiries for this property.", published: "Published", unpublished: "Unpublished" },
    leads: { title: "Leads", description: "Track your prospects and manage your pipeline.", detailTitle: "Lead profile", back: "Back to leads", individual: "Individual client", responsible: "Responsible agent", assign: "Assign", change: "Change", inquiry: "Inquiry", wanted: "Wanted property", wantedType: "Type", wantedBudget: "Budget", wantedBeds: "Bedrooms", wantedLocation: "Location", wantedPurpose: "Purpose", buy: "Purchase", rent: "Rental", history: "Action history", incomingCall: "Incoming call", callBody: "Discussion about budget and preferred areas.", inquiryBody: "Prospect submitted a request via the website.", system: "System", sharedProps: "Shared properties", shared: "Shared", inquiryMsg: "Hello, I am interested in \u00ab {title} \u00bb. Could you contact me for more information and arrange a visit?", searchPlaceholder: "Search a prospect…", allStages: "All stages", allSources: "All sources", allAgents: "All agents", unassigned: "Unassigned", assignTo: "Assign…", colName: "Name", colProperty: "Interested property", colStage: "Stage", colSource: "Source", colDate: "Request date", colAgent: "Assigned agent", open: "Open", empty: "No prospect matches these filters.", count: "{n} prospect displayed out of {total}", countPlural: "{n} prospects displayed out of {total}" },
    visits: { title: "Visits", description: "Schedule and track your property visits.", add: "Add a visit", tabAll: "All", tabUpcoming: "Upcoming", tabDone: "Completed", tabCancelled: "Cancelled", statUpcoming: "Upcoming", statUpcomingHint: "Next visits", statDone: "Completed", statDoneHint: "Visits done", statCancelled: "Cancelled", statCancelledHint: "Cancelled or no-show", statTotal: "Total", statTotalHint: "All visits", conflict: "{n} visits overlap for the same agent. Adjust the schedule or change the agent.", colDateTime: "Date & time", colProperty: "Property", colLead: "Prospect", colAgent: "Agent", colStatus: "Status", logResult: "Log result", viewResult: "View result", empty: "No visit in this category.", buy: "Purchase", rent: "Rental", conflictLabel: "Schedule conflict" },
    deals: { title: "Deals", description: "Track transactions from inquiry through closing." },
    team: { title: "Team", description: "View your agency agents." },
  },
  public: {
    backToListings: "← Back to listings",
    contactAgent: "Contact the agent",
    info: "Information",
    description: "Description",
    descBody: "Property located in {locality}, {city}. Bright spaces, quality finishes and a calm environment, ideal for a family seeking comfort and tranquillity.",
    amenities: "Amenities",
    type: "Type", beds: "Bedrooms", baths: "Bathrooms", area: "Area",
    city: "City / Area", propType: "Property type", status: "Status",
  },
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
  auth: { welcome: "Bon retour", headline: "Tout ce dont votre agence a besoin, dans un seul espace.", point1: "Publiez et gérez vos annonces.", point2: "Capturez les demandes et suivez chaque prospect.", point3: "Planifiez les visites et suivez vos deals.", showPassword: "Afficher le mot de passe", hidePassword: "Masquer le mot de passe", email: "Email", password: "Mot de passe", signIn: "Se connecter", signingIn: "Connexion…", signOut: "Se déconnecter", invalid: "Email ou mot de passe incorrect.", tooMany: "Trop de tentatives. Veuillez patienter.", unavailable: "Service indisponible. Veuillez réessayer.", subtitle: "Connectez-vous à votre espace agence.", backHome: "← Retour à l'accueil" },
  workspace: {
    dashboard: { title: "Tableau de bord", description: "Un coup d'œil sur votre activité aujourd'hui.", newLead: "Nouvelle demande de contact", leadAssigned: "Lead attribué à un agent", leadSub1: "Appartement à Lahore", leadSub2: "Demande pour un terrain", ago1: "Il y a 12 min", ago2: "Il y a 3 h", newLeads: "Nouvelles demandes", noAgent: "{n} sans agent", openDeals: "Deals ouverts", dealHint: "Module Deals : jour 6", cta: "Transformons des recherches en nouveaux foyers", ctaBtn: "Ajouter un bien" },
    properties: { title: "Biens", description: "Gérez vos annonces et suivez leur performance facilement.", add: "Ajouter un bien", addTitle: "Ajouter un bien", addDesc: "Formulaire de création d'un bien.", detailTitle: "Détails du bien", back: "Retour aux biens", edit: "Modifier", publish: "Publier l'annonce", unpublish: "Dépublier", sectionDescription: "Description", descBody: "Bien situé à {locality}, {city}. Espaces lumineux, finitions soignées et environnement calme, idéal pour une famille à la recherche de confort et de tranquillité.", amenities: "Aménités", infoTitle: "Informations principales", city: "Ville / Zone", type: "Type de bien", status: "Statut", publication: "Publication", area: "Surface", agent: "Agent", requests: "Demandes reçues", noRequests: "Aucune demande pour ce bien.", published: "Publié", unpublished: "Non publié" },
    leads: { title: "Leads", description: "Suivez vos prospects et gérez votre pipeline.", detailTitle: "Fiche du prospect", back: "Retour aux leads", individual: "Client particulier", responsible: "Agent responsable", assign: "Attribuer", change: "Changer", inquiry: "Demande d'information", wanted: "Bien recherché", wantedType: "Type", wantedBudget: "Budget", wantedBeds: "Chambres", wantedLocation: "Localisation", wantedPurpose: "Usage", buy: "Achat", rent: "Location", history: "Historique des actions", incomingCall: "Appel entrant", callBody: "Discussion sur le budget et les quartiers préférés.", inquiryBody: "Le prospect a soumis une demande via le site.", system: "Système", sharedProps: "Biens partagés", shared: "Partagé", inquiryMsg: "Bonjour, je suis intéressé par « {title} ». Pouvez-vous me contacter pour plus d'informations et organiser une visite ?", searchPlaceholder: "Rechercher un prospect…", allStages: "Toutes les étapes", allSources: "Toutes les origines", allAgents: "Tous les agents", unassigned: "À attribuer", assignTo: "Attribuer…", colName: "Nom", colProperty: "Bien intéressé", colStage: "Étape", colSource: "Origine", colDate: "Date de demande", colAgent: "Agent assigné", open: "Ouvrir", empty: "Aucun prospect ne correspond à ces filtres.", count: "{n} prospect affiché sur {total}", countPlural: "{n} prospects affichés sur {total}" },
    visits: { title: "Visites", description: "Planifiez et suivez vos visites en toute simplicité.", add: "Ajouter une visite", tabAll: "Toutes", tabUpcoming: "À venir", tabDone: "Terminées", tabCancelled: "Annulées", statUpcoming: "À venir", statUpcomingHint: "Prochaines visites", statDone: "Terminées", statDoneHint: "Visites réalisées", statCancelled: "Annulées", statCancelledHint: "Annulées ou absents", statTotal: "Total", statTotalHint: "Toutes les visites", conflict: "{n} visites se chevauchent pour un même agent. Modifiez l'horaire ou changez d'agent.", colDateTime: "Date et heure", colProperty: "Bien", colLead: "Prospect", colAgent: "Agent", colStatus: "Statut", logResult: "Enregistrer le résultat", viewResult: "Voir le résultat", empty: "Aucune visite dans cette catégorie.", buy: "Achat", rent: "Location", conflictLabel: "Conflit d'horaire" },
    deals: { title: "Deals", description: "Suivez les transactions de la demande à la clôture." },
    team: { title: "Équipe", description: "Consultez les agents de votre agence." },
  },
  public: {
    backToListings: "← Retour aux annonces",
    contactAgent: "Contacter l'agent",
    info: "Informations",
    description: "Description",
    descBody: "Bien situé à {locality}, {city}. Espaces lumineux, finitions soignées et environnement calme, idéal pour une famille à la recherche de confort et de tranquillité.",
    amenities: "Aménités",
    type: "Type", beds: "Chambres", baths: "Bains", area: "Surface",
    city: "Ville / Zone", propType: "Type de bien", status: "Statut",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, fr };
export type Vars = Record<string, string | number>;

export function translate(dict: Dict, key: string, vars?: Vars): string {
  const raw = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], dict);
  const s = typeof raw === "string" ? raw : key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s;
}
