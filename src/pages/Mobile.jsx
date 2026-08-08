import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { brl } from "@/lib/format";
import ProductResult from "@/components/mobile/ProductResult";

export default function Mobile() {
  const [products, setProducts] = useState([]);
  const [map, setMap] = useState(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list("name", 500),
      base44.entities.StoreMap.list("", 1),
    ]).then(([p, m]) => {
      setProducts(p.filter((x) => x.active !== false));
      setMap(m[0] || null);
      setLoading(false);
    });
  }, []);

  const query = q.toLowerCase().trim();
  const results = query
    ? products.filter((p) => [p.name, p.sku, p.barcode, p.brand, p.category].some((f) => (f || "").toLowerCase().includes(query))).slice(0, 20)
    : [];

  if (selected) return <ProductResult product={selected} map={map} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen bg-[#0e1420] p-4 pb-10">
      <div className="max-w-md mx-auto space-y-4 pt-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar ao sistema
        </Link>

        <div className="text-center">
          <h1 className="text-white text-xl font-semibold">Consulta Rápida</h1>
          <p className="text-slate-400 text-sm mt-1">Busque um produto: preço, estoque e onde ele está na loja.</p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Nome, código ou marca…"
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white text-slate-900 text-base outline-none focus:ring-2 focus:ring-emerald-400" />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {loading && <p className="text-slate-500 text-sm text-center py-6">Carregando produtos…</p>}

        {!loading && query && results.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">Nenhum produto encontrado para "{q}".</p>
        )}

        <div className="space-y-2">
          {results.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="w-full text-left bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors">
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{p.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{p.brand || p.category || p.sku || ""}</p>
              </div>
              <p className="text-emerald-400 font-semibold text-lg shrink-0">{brl(p.price)}</p>
            </button>
          ))}
        </div>

        {!query && !loading && (
          <p className="text-slate-600 text-xs text-center pt-8">
            Toque 1: buscar · Toque 2: escolher produto · Pronto — preço, estoque e localização na tela.
          </p>
        )}
      </div>
    </div>
  );
}