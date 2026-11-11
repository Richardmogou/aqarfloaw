"use client";
import { Bath, Bed, Heart, Home, MapPin, Maximize, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { fmtPkr, fmtPkrFull } from "@/lib/format";
import { useL, useT } from "@/lib/i18n/provider";
import { EN, PROPERTY_STATUS } from "@/lib/mock-data";
import { listedDays, placeLabel, publicArea, publicCover, type PublicProperty } from "@/lib/public-properties";
import { telLink, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PropertyCard({ p, layout = "grid" }: { p: PublicProperty; layout?: "grid" | "list" }) {
  const L = useL();
  const t = useT();
  const [fav, setFav] = useState(false);
  const list = layout === "list";
  const type = t(`type.${p.property_type}`);
  const sale = p.purpose === "sale";
  const price = Number(p.price);
  const place = placeLabel(p);
  const cover = publicCover(p);
  const days = listedDays(p);

  const added =
    days === 0 ? L("Added today", "Ajouté aujourd'hui")
    : days === 1 ? L("Added yesterday", "Ajouté hier")
    : L(`Added ${days} days ago`, `Ajouté il y a ${days} jours`);
  const blurb = p.bedrooms
    ? L(`${p.bedrooms}-bedroom ${type.toLowerCase()} ${sale ? "for sale" : "for rent"} in ${place}.`,
      `${type} de ${p.bedrooms} chambres ${sale ? "à vendre" : "à louer"} à ${place}.`)
    : L(`${type} ${sale ? "for sale" : "for rent"} in ${place}.`, `${type} ${sale ? "à vendre" : "à louer"} à ${place}.`);
  const message = `Hello, I am interested in "${p.title}" (${p.reference_code}) listed on AqarFlow.`;
  const small = "relative z-10 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <article className={cn("group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg", list ? "flex flex-col md:flex-row" : "flex flex-col")}>
      <div className={cn("relative shrink-0 overflow-hidden bg-muted", list ? "h-56 md:h-auto md:w-80" : "h-52")}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="grid h-full w-full place-items-center"><Home className="h-10 w-10 text-muted-foreground" aria-hidden /></span>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold uppercase text-primary-foreground">{sale ? L("For sale", "À vendre") : L("For rent", "À louer")}</span>
        </div>
        {p.status !== "available" && PROPERTY_STATUS[p.status] && (
          <span className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {L(EN.propertyStatus[p.status], PROPERTY_STATUS[p.status].label)}
          </span>
        )}
        <button
          type="button"
          aria-pressed={fav}
          aria-label={fav ? L("Remove from favourites", "Retirer des favoris") : L("Add to favourites", "Ajouter aux favoris")}
          onClick={() => setFav(!fav)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn("h-4 w-4", fav && "fill-primary text-primary")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-2xl font-bold" title={fmtPkrFull(price)}>
          {fmtPkr(price)}{!sale && <span className="text-sm font-normal text-muted-foreground"> {L("/ month", "/ mois")}</span>}
        </p>

        <h3 className="font-semibold leading-snug">
          <Link href={`/listings/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{p.title}</Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" aria-hidden /> {place}</p>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-3 text-sm">
          <li className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-muted-foreground" aria-hidden /><span className="sr-only">{L("Bedrooms", "Chambres")}</span>{p.bedrooms ?? "—"}</li>
          <li className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-muted-foreground" aria-hidden /><span className="sr-only">{L("Bathrooms", "Salles de bain")}</span>{p.bathrooms ?? "—"}</li>
          <li className="flex items-center gap-1.5"><Maximize className="h-4 w-4 text-muted-foreground" aria-hidden /><span className="sr-only">{L("Area", "Surface")}</span>{publicArea(p)}</li>
        </ul>

        {list && <p className="text-sm text-muted-foreground">{blurb}</p>}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-muted-foreground">{added}</span>
          <div className="flex gap-2">
            <a href={telLink()} className={small}><Phone className="h-4 w-4" aria-hidden /> {L("Call", "Appeler")}</a>
            <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className={cn(small, "border-success/50")}>
              <MessageCircle className="h-4 w-4 text-success" aria-hidden /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
