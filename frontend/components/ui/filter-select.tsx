import { Search } from "lucide-react";
import { field } from "./styles";

export function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={field}>
      <option value="">{label}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function SearchField({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative block min-w-[200px] flex-1">
      <span className="sr-only">{placeholder}</span>
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${field} w-full pl-9`} />
    </label>
  );
}