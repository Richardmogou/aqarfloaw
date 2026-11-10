"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, SearchField } from "@/components/ui/filter-select";
import { field, td, th } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { AGENTS, LEADS, LEAD_STAGE, SOURCE_LABEL, agentName, getProperty } from "@/lib/mock-data";

const opts = (o: Record<string, { label: string } | string>) =>
  Object.entries(o).map(([value, v]) => ({ value, label: typeof v === "string" ? v : v.label }));

export function LeadsTable() {
  const [f, setF] = useState({ q: "", stage: "", source: "", agent: "" });
  const [assigned, setAssigned] = useState<Record<number, string>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const agentOf = (id: number, base: string | null) => assigned[id] ?? base;

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return LEADS.filter((l) => {
      const a = assigned[l.id] ?? l.agentId;
      return (!q || l.name.toLowerCase().includes(q)) && (!f.stage || l.stage === f.stage) &&
        (!f.source || l.source === f.source) &&
        (!f.agent || (f.agent === "none" ? !a : a === f.agent));
    });
  }, [f, assigned]);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchField placeholder="Rechercher un prospect…" value={f.q} onChange={set("q")} />
        <FilterSelect label="Toutes les étapes" value={f.stage} onChange={set("stage")} options={opts(LEAD_STAGE)} />
        <FilterSelect label="Toutes les origines" value={f.source} onChange={set("source")} options={opts(SOURCE_LABEL)} />
        <FilterSelect label="Tous les agents" value={f.agent} onChange={set("agent")}
          options={[{ value: "none", label: "À attribuer" }, ...AGENTS.map((a) => ({ value: a.id, label: a.name }))]} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr><th className={th}>Nom</th><th className={th}>Bien intéressé</th><th className={th}>Étape</th><th className={th}>Origine</th><th className={th}>Date de demande</th><th className={th}>Agent assigné</th><th className={th}><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const p = getProperty(l.propertyId)!;
              const a = agentOf(l.id, l.agentId);
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className={td}><Link href={`/leads/${l.id}`} className="flex items-center gap-2 font-medium hover:underline"><Avatar name={l.name} />{l.name}</Link></td>
                  <td className={td}>
                    <span className="flex items-center gap-3">
                      <Thumb src={p.image} alt="" className="h-10 w-12 rounded-md" />
                      <span><span className="block">{p.title}</span><span className="text-xs text-muted-foreground">{p.city}</span></span>
                    </span>
                  </td>
                  <td className={td}><Badge tone={LEAD_STAGE[l.stage].tone}>{LEAD_STAGE[l.stage].label}</Badge></td>
                  <td className={td}>{SOURCE_LABEL[l.source]}</td>
                  <td className={`${td} whitespace-nowrap text-muted-foreground`}>{l.ago}</td>
                  <td className={td}>
                    {a ? (
                      <span className="flex items-center gap-2"><Avatar name={agentName(a)!} />{agentName(a)}</span>
                    ) : (
                      <select aria-label={`Attribuer ${l.name} à un agent`} defaultValue="" onChange={(e) => setAssigned((s) => ({ ...s, [l.id]: e.target.value }))} className={`${field} h-8 text-xs`}>
                        <option value="" disabled>Attribuer…</option>
                        {AGENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                    )}
                  </td>
                  <td className={td}><Link href={`/leads/${l.id}`} className="text-primary hover:underline">Ouvrir</Link></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Aucun prospect ne correspond à ces filtres.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{rows.length} prospect{rows.length > 1 ? "s" : ""} affiché{rows.length > 1 ? "s" : ""} sur {LEADS.length}</p>
    </>
  );
}