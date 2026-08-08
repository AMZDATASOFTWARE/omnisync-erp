import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/format";
import { ScanBarcode } from "lucide-react";

export default function ProductSearch({ products, onSelect }) {
  const [q, setQ] = useState("");

  const query = q.toLowerCase().trim();
  const results = query
    ? products.filter((p) => [p.name, p.sku, p.barcode, p.brand].some((f) => (f || "").toLowerCase().includes(query))).slice(0, 12)
    : products.slice(0, 12);

  const handleKey = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      onSelect(results[0]);
      setQ("");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
      <div className="relative">
        <ScanBarcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={handleKey}
          placeholder="Escaneie o código de barras ou busque por nome (Enter adiciona)"
          className="pl-9 h-11 text-base" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {results.map((p) => (
          <button key={p.id} onClick={() => { onSelect(p); setQ(""); }}
            className="text-left p-3 rounded-lg border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
            <p className="text-sm font-medium text-slate-800 line-clamp-2">{p.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">Estoque: {p.stock_quantity ?? 0} {p.unit || "un"}</p>
            <p className="text-sm font-semibold text-emerald-600 mt-1">{brl(p.price)}</p>
          </button>
        ))}
        {results.length === 0 && <p className="text-sm text-slate-400 col-span-full py-4 text-center">Nenhum produto encontrado.</p>}
      </div>
    </div>
  );
}