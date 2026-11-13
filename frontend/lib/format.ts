const dateFmt = (locale: string) =>
  new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const fmtDate = (iso: string, locale = "en") =>
  dateFmt(locale).format(new Date(iso.length === 10 ? `${iso}T00:00` : iso));

export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Traduit « Il y a 2 h » (données fictives) en « 2 h ago » quand la langue est l'anglais. */
export function agoLabel(fr: string, locale: string) {
  if (locale === "fr") return fr;
  const m = fr.match(/^Il y a (\d+) (min|h|jours?)$/);
  if (!m) return fr;
  const unit = m[2].startsWith("jour") ? (m[1] === "1" ? "day" : "days") : m[2];
  return `${m[1]} ${unit} ago`;
}

export function fmtRelative(iso: string, locale = "en") {
  const diffMin = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (diffMin < 60) return locale === "fr" ? `Il y a ${diffMin} min` : `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return locale === "fr" ? `Il y a ${diffHours} h` : `${diffHours} h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (locale === "fr") return `Il y a ${diffDays} ${diffDays === 1 ? "jour" : "jours"}`;
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

const trim = (x: number, d = 1) => String(Math.round(x * 10 ** d) / 10 ** d);

/** Prix à la pakistanaise : PKR 18.5 Crore, PKR 85 Lakh, PKR 45,000 */
export function fmtPkr(n: number) {
  if (n >= 1e9) return `PKR ${trim(n / 1e9, 2)} Arab`;
  if (n >= 1e7) return `PKR ${trim(n / 1e7, 2)} Crore`;
  if (n >= 1e5) return `PKR ${trim(n / 1e5, 2)} Lakh`;
  return `PKR ${new Intl.NumberFormat("en-US").format(n)}`;
}
export const fmtPkrFull = (n: number) => `PKR ${new Intl.NumberFormat("en-US").format(n)}`;

/** Surface : Marla / Kanal (1 marla = 272,25 sq ft, 1 kanal = 20 marla) ; sq ft pour les appartements */
export function fmtArea(sqm: number, type?: string) {
  if (type === "apartment") return `${new Intl.NumberFormat("en-US").format(Math.round(sqm * 10.7639))} sq ft`;
  const marla = sqm / 25.2929;
  return marla >= 20 ? `${trim(marla / 20, 2)} Kanal` : `${trim(marla)} Marla`;
}