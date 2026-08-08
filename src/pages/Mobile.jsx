import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, ArrowLeft, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { brl } from "@/lib/format";
import { useDebounce } from "@/hooks/use-debounce";
import ProductResult from "@/components/mobile/ProductResult";
import BarcodeScanner from "@/components/mobile/BarcodeScanner";

export default function Mobile() {
  const [products, setProducts] = useState([]);
  const [map, setMap] = useState(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);
  const query = useDebounce(q, 200).toLowerCase().trim();

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

  const results = query
    ? products.filter((p) => [p.name, p.sku, p.barcode, p.brand, p.category].some((f) => (f || "").toLowerCase().includes(query))).slice(0, 20)
    : [];

  const onScanned = (code) => {
    setScanning(false);
    const found = products.find((p) => p.barcode === code || p.sku === code);
    if (found) setSelected(found);
    else { setQ(code); inputRef.current?.focus(); }
  };

  if (scanning) return <BarcodeScanner onDetected={onScanned} onClose={() => setScanning(false)} />;
  if (selected) return <ProductResult product={selected} map={map} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen bg-[#0e1420] p-4 pb-10">
      <div className="max-w-md mx-auto space-y-4 pt-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm py-2">
          <ArrowLeft className="w-4 h-4" /> Voltar ao sistema
        </Link>

        <div className="text-center">
          <h1 className="text-white text-xl font-semibold">Consulta Rápida</h1>
          <p className="text-slate-400 text-sm mt-1">Preço, estoque e onde o produto está na loja.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input ref={inputRef} autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              inputMode="search" aria-label="Buscar produto"
              placeholder="Nome, código ou marca…"
              className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white text-slate-900 text-base outline-none focus:ring-2 focus:ring-emerald-400" />
            {q && (
              <button onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-slate-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button onClick={() => setScanning(true)} aria-label="Ler código de barras"
            className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center">
            <ScanLine className="w-6 h-6" />
          </button>
        </div>

        {loading && <p className="text-slate-500 text-sm text-center py-6">Carregando produtos…</p>}

        {!loading && query && results.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">Nenhum produto encontrado para "{q}".</p>
        )}

        <div className="space-y-2">
          {results.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="w-full text-left bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-2xl p-4 min-h-[64px] flex items-center justify-between gap-3 transition-colors">
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{p.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{p.sku || p.barcode || p.brand || p.category || ""}</p>
              </div>
              <p className="text-emerald-400 font-semibold text-lg shrink-0">{brl(p.price)}</p>
            </button>
          ))}
        </div>

        {!query && !loading && (
          <p className="text-slate-600 text-xs text-center pt-8">
            Digite ou escaneie o código — resultado em um toque.
          </p>
        )}
      </div>
    </div>
  );
}