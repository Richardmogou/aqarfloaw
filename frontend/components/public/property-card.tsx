"use client";
import { Bath, Bed, Heart, MapPin, Maximize } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/lib/i18n/provider";
import { formatPrice, type Property } from "@/lib/mock-properties";
import { cn } from "@/lib/utils";

export function PropertyCard({ p }: { p: Property }) {
  const t = useT();
  const [fav, setFav] = useState(false);
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative h-48 overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground">
          {p.purpose === "sale" ? t("card.sale") : t("card.rent")}
        </span>
        {p.status === "reserved" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">{t("card.reserved")}</span>
        )}
        <button
          aria-pressed={fav}
          aria-label={fav ? t("card.favRemove") : t("card.favAdd")}
          onClick={() => setFav(!fav)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn("h-4 w-4", fav && "fill-primary text-primary")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xl font-bold">{formatPrice(p)}{p.purpose === "rent" && <span className="text-sm font-normal text-muted-foreground"> {t("card.perMonth")}</span>}</p>
        <h3 className="truncate font-medium">{p.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" /> {p.locality}, {p.city}
        </p>
        <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" /> {p.beds}</span>
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" /> {p.baths}</span>
          <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" /> {p.areaSqm} m²</span>
        </div>
        <Link
          href={`/annonces/${p.slug}`}
          className="mt-auto rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("card.details")}
        </Link>
      </div>
    </article>
  );
}