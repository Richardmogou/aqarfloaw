"use client";
import { Bath, Bed, Maximize } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, SearchField } from "@/components/ui/filter-select";
import { td, th } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { fmtPkr } from "@/lib/format";
import { AGENTS, PROPERTY_STATUS, TYPE_LABEL, WORKSPACE_PROPERTIES, agentName } from "@/lib/mock-data";

const opts = (o: Record<string, { label: string }> | Record<string, string>) =>
  Object.entries(o).map(([value, v]) => ({ value, label: typeof v === "string" ? v : v.label }));
const CITIES = ["Islamabad", "Lahore", "Karachi"].map((c) => ({ value: c, label: c }));

export function PropertiesTable() {
  const [f, setF] = useState({ q: "", type: "", city: "", status: "", agent: "" });
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return WORKSPACE_PROPERTIES.filter((p) =>
      (!q || `${p.title} ${p.locality} ${p.city}`.toLowerCase().includes(q)) &&
      (!f.type || p.type === f.type) && (!f.city || p.city === f.city) &&
      (!f.status || p.status === f.status) && (!f.agent || p.agentId === f.agent));
  }, [f]);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchField placeholder="Rechercher un bien" value={f.q} onChange={set("q")} />
        <FilterSelect label="Type de bien" value={f.type} onChange={set("type")} options={opts(TYPE_LABEL)} />
        <FilterSelect label="Ville / Zone" value={f.city} onChange={set("city")} options={CITIES} />
        <FilterSelect label="Tous les statuts" value={f.status} onChange={set("status")} options={opts(PROPERTY_STATUS)} />
        <FilterSelect label="Agent" value={f.agent} onChange={set("agent")} options={AGENTS.map((a) => ({ value: a.id, label: a.name }))} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr><th className={th}>Bien</th><th className={th}>Type</th><th className={th}>Ville / Zone</th><th className={th}>Prix</th><th className={th}>Statut</th><th className={th}>Agent</th><th className={th}><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className={td}>
                  <Link href={`/properties/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                    <Thumb src={p.image} alt="" className="h-14 w-20 rounded-lg" />
                    <span>
                      <span className="block font-medium">{p.title}</span>
                      <span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{p.beds}</span>
                        <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.baths}</span>
                        <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{p.areaSqm} m²</span>
                      </span>
                    </span>
                  </Link>
                </td>
                <td className={td}>{TYPE_LABEL[p.type]}</td>
                <td className={td}>{p.city}<span className="block text-xs text-muted-foreground">{p.locality}</span></td>
                <td className={`${td} whitespace-nowrap font-semibold`}>{fmtPkr(p.price)}{p.purpose === "rent" && <span className="text-xs font-normal text-muted-foreground"> /mois</span>}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={PROPERTY_STATUS[p.status].tone}>{PROPERTY_STATUS[p.status].label}</Badge>
                    <Badge tone={p.published ? "info" : "neutral"}>{p.published ? "Publié" : "Non publié"}</Badge>
                  </div>
                </td>
                <td className={td}><span className="flex items-center gap-2"><Avatar name={agentName(p.agentId)!} />{agentName(p.agentId)}</span></td>
                <td className={td}><Link href={`/properties/${p.id}`} className="text-primary hover:underline">Ouvrir</Link></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Aucun bien ne correspond à ces filtres.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Affichage de {rows.length} sur {WORKSPACE_PROPERTIES.length} biens</p>
    </>
  );
}