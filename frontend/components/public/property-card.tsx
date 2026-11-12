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
    : L(`Added ${days} days ago`, `Ajouté il y a ${days} j`);

  const blurb = p.bedrooms
    ? L(`${p.bedrooms}-bedroom ${type.toLowerCase()} ${sale ? "for sale" : "for rent"} in ${place}.`,
      `${type} de ${p.bedrooms} chambres ${sale ? "à vendre" : "à louer"} à ${place}.`)
    : L(`${type} ${sale ? "for sale" : "for rent"} in ${place}.`, `${type} ${sale ? "à vendre" : "à louer"} à ${place}.`);

  const message = `Hello, I am interested in "${p.title}" (${p.reference_code}) listed on AqarFlow.`;
  const btnCall = "relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const btnWa = "relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <article className={cn(
      "group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5",
      list ? "flex flex-col md:flex-row" : "flex flex-col"
    )}>
      <div className={cn("relative shrink-0 overflow-hidden bg-muted", list ? "h-60 md:h-auto md:w-80 lg:w-96" : "aspect-[16/10] w-full")}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-muted/60 text-muted-foreground">
            <Home className="h-10 w-10 opacity-40" aria-hidden />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className={cn(
            "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm",
            sale ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"
          )}>
            {sale ? L("For sale", "À vendre") : L("For rent", "À louer")}
          </span>
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {type}
          </span>
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
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur-md shadow-sm transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn("h-4 w-4 transition-colors", fav ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-foreground")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-2xl font-black tracking-tight text-foreground" title={fmtPkrFull(price)}>
              {fmtPkr(price)}
              {!sale && <span className="text-sm font-normal text-muted-foreground"> {L("/ mo", "/ mois")}</span>}
            </p>
            <span className="text-xs text-muted-foreground">{p.reference_code}</span>
          </div>

          <h3 className="mt-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            <Link
              href={`/listings/${p.slug}`}
              className="after:absolute after:inset-0 after:content-[''] line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {p.title}
            </Link>
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span className="line-clamp-1">{place}</span>
          </p>

          {list && (
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {p.description || blurb}
            </p>
          )}
        </div>

        <div className="mt-4">
          <ul className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2 text-xs">
            <li className="flex items-center gap-1.5 font-medium text-foreground">
              <Bed className="h-4 w-4 text-primary" aria-hidden />
              <span>{p.bedrooms ?? "—"} <span className="text-muted-foreground font-normal">{L("Beds", "Ch.")}</span></span>
            </li>
            <li className="h-3 w-px bg-border" aria-hidden />
            <li className="flex items-center gap-1.5 font-medium text-foreground">
              <Bath className="h-4 w-4 text-primary" aria-hidden />
              <span>{p.bathrooms ?? "—"} <span className="text-muted-foreground font-normal">{L("Baths", "SdB")}</span></span>
            </li>
            <li className="h-3 w-px bg-border" aria-hidden />
            <li className="flex items-center gap-1.5 font-medium text-foreground">
              <Maximize className="h-4 w-4 text-primary" aria-hidden />
              <span>{publicArea(p)}</span>
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
            <span className="text-[11px] text-muted-foreground">{added}</span>
            <div className="flex gap-2">
              <a href={telLink(p.agent?.phone || undefined)} className={btnCall}>
                <Phone className="h-3.5 w-3.5" aria-hidden />
                <span>{L("Call", "Appeler")}</span>
              </a>
              <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className={btnWa}>
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
