import React from "react";
import { Link } from "react-router-dom";
import { Store as StoreIcon } from "lucide-react";
import { useStores } from "@/hooks/use-store";

export default function StoreSwitcher() {
  const { stores, storeId, selectStore, loading } = useStores();

  if (loading) return null;
  if (!stores.length)
    return (
      <Link to="/lojas" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2">
        <StoreIcon className="w-3.5 h-3.5" /> Cadastrar unidade
      </Link>
    );

  return (
    <div className="px-3 pb-2">
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
        <StoreIcon className="w-3.5 h-3.5" /> Unidade
      </label>
      <select value={storeId} onChange={(e) => selectStore(e.target.value)}
        className="w-full h-9 rounded-md bg-muted border border-border text-sm text-foreground px-2 outline-none focus:ring-2 focus:ring-primary">
        {stores.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}