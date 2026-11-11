"use client";
import { Bath, Bed, Eye, Home, Maximize, Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, SearchField } from "@/components/ui/filter-select";
import { btn, td, th } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { fmtPkrFull } from "@/lib/format";
import { useL, useT } from "@/lib/i18n/provider";
import { EN, PROPERTY_STATUS, TYPE_LABEL } from "@/lib/mock-data";
import {
  coverUrl, formatArea, memberName, propertyQuery,
  type AgencyMember, type PropertyFilters, type PropertyPage,
} from "@/lib/properties";
import { cn } from "@/lib/utils";

const CITIES = ["Islamabad", "Lahore", "Karachi"];
const SEARCH_DEBOUNCE_MS = 300;

export function PropertiesTable({ page, members, filters, canEdit }: {
  page: PropertyPage; members: AgencyMember[]; filters: PropertyFilters; canEdit: boolean;
}) {
  const L = useL();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q ?? "");

  function navigate(changes: PropertyFilters) {
    const next = { ...filters, page: undefined, ...changes };
    const query = propertyQuery(next);
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }
  const setFilter = (key: keyof PropertyFilters) => (value: string) => navigate({ [key]: value });

  useEffect(() => {
    if (search === (filters.q ?? "")) return;
    const timer = setTimeout(() => navigate({ q: search }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const statusOptions = Object.keys(PROPERTY_STATUS).map((value) => ({ value, label: L(EN.propertyStatus[value], PROPERTY_STATUS[value].label) }));
  const typeOptions = Object.keys(TYPE_LABEL).map((value) => ({ value, label: t(`type.${value}`) }));
  const pageCount = Math.max(1, Math.ceil(page.total / page.page_size));
  const firstRow = page.total === 0 ? 0 : (page.page - 1) * page.page_size + 1;
  const lastRow = (page.page - 1) * page.page_size + page.items.length;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchField placeholder={L("Search a property", "Rechercher un bien")} value={search} onChange={setSearch} />
        <FilterSelect label={L("Property type", "Type de bien")} value={filters.property_type ?? ""} onChange={setFilter("property_type")} options={typeOptions} />
        <FilterSelect label={L("City", "Ville")} value={filters.city ?? ""} onChange={setFilter("city")} options={CITIES.map((city) => ({ value: city, label: city }))} />
        <FilterSelect label={L("All statuses", "Tous les statuts")} value={filters.status ?? ""} onChange={setFilter("status")} options={statusOptions} />
        <FilterSelect label={L("Agent", "Agent")} value={filters.assigned_agent_id ?? ""} onChange={setFilter("assigned_agent_id")}
          options={members.map((member) => ({ value: member.id, label: member.full_name }))} />
      </div>

      <div className={cn("overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm transition-opacity", pending && "opacity-60")} aria-busy={pending}>
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className={th}>{L("Property", "Bien")}</th><th className={th}>{L("Type", "Type")}</th><th className={th}>{L("City / Area", "Ville / Zone")}</th>
              <th className={th}>{L("Price", "Prix")}</th><th className={th}>{L("Status", "Statut")}</th><th className={th}>{L("Agent", "Agent")}</th>
              <th className={cn(th, "text-right")}>{L("Actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((property) => {
              const status = PROPERTY_STATUS[property.status];
              const agent = memberName(members, property.assigned_agent_id);
              const cover = coverUrl(property);
              return (
                <tr key={property.id} className="border-t border-border transition-colors hover:bg-muted/40">
                  <td className={td}>
                    <Link href={`/properties/${property.id}`} className="group flex items-center gap-4">
                      {cover ? <Thumb src={cover} alt="" className="h-16 w-24 rounded-xl" />
                        : <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-muted"><Home className="h-6 w-6 text-muted-foreground" aria-hidden /></span>}
                      <span>
                        <span className="block font-semibold text-foreground group-hover:text-primary">{property.title}</span>
                        <span className="block text-xs text-muted-foreground">{property.reference_code}</span>
                        <span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms ?? "—"}</span>
                          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms ?? "—"}</span>
                          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{formatArea(property)}</span>
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className={td}>{t(`type.${property.property_type}`)}</td>
                  <td className={td}>{property.city}<span className="block text-xs text-muted-foreground">{property.locality}</span></td>
                  <td className={`${td} whitespace-nowrap font-bold`}>
                    {fmtPkrFull(Number(property.price))}{property.purpose === "rent" && <span className="text-xs font-normal text-muted-foreground"> {t("card.perMonth")}</span>}
                  </td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={status?.tone ?? "neutral"}>{L(EN.propertyStatus[property.status] ?? property.status, status?.label ?? property.status)}</Badge>
                      <Badge tone={property.is_published ? "info" : "neutral"}>{property.is_published ? L("Published", "Publié") : L("Not published", "Non publié")}</Badge>
                    </div>
                  </td>
                  <td className={td}>
                    {agent ? <span className="flex items-center gap-2"><Avatar name={agent} />{agent}</span>
                      : <span className="text-muted-foreground">{L("Unassigned", "Non assigné")}</span>}
                  </td>
                  <td className={cn(td, "text-right")}>
                    <span className="inline-flex gap-1">
                      <Link href={`/properties/${property.id}`} aria-label={L(`Open ${property.title}`, `Ouvrir ${property.title}`)} title={L("Open", "Ouvrir")}
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" aria-hidden /></Link>
                      {canEdit && (
                        <Link href={`/properties/${property.id}/edit`} aria-label={L(`Edit ${property.title}`, `Modifier ${property.title}`)} title={L("Edit", "Modifier")}
                          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" aria-hidden /></Link>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
            {page.items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{L("No property matches these filters.", "Aucun bien ne correspond à ces filtres.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{L(`Showing ${firstRow}–${lastRow} of ${page.total} properties`, `Affichage de ${firstRow} à ${lastRow} sur ${page.total} biens`)}</p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button type="button" className={cn(btn.outline, "disabled:opacity-50")} disabled={page.page <= 1 || pending}
              onClick={() => navigate({ page: String(page.page - 1) })}>{L("Previous", "Précédent")}</button>
            <span>{page.page} / {pageCount}</span>
            <button type="button" className={cn(btn.outline, "disabled:opacity-50")} disabled={page.page >= pageCount || pending}
              onClick={() => navigate({ page: String(page.page + 1) })}>{L("Next", "Suivant")}</button>
          </div>
        )}
      </div>
    </>
  );
}
