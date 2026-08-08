import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Navigation, Loader2 } from "lucide-react";

export default function RouteHint({ product, onRoute }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const go = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("getRouteToProduct", { sku: product.sku || product.id });
    setResult(res.data);
    onRoute?.(res.data?.found ? res.data.path : null);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 space-y-3">
      <button onClick={go} disabled={loading}
        className="w-full h-12 rounded-xl bg-sky-600 active:bg-sky-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
        Como chegar
      </button>

      {result && !result.found && (
        <p className="text-sm text-slate-500">{result.voice_answer || "Não consegui traçar a rota até este produto."}</p>
      )}

      {result?.found && (
        <ol className="space-y-2">
          {result.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="w-6 h-6 shrink-0 rounded-full bg-sky-50 text-sky-600 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
              {s}
            </li>
          ))}
          <li className="flex gap-3 text-sm font-medium text-emerald-600">
            <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-50 text-xs flex items-center justify-center">🏁</span>
            Chegou em {result.zone_label}{result.shelf_label ? ` — ${result.shelf_label}` : ""}
          </li>
        </ol>
      )}
    </div>
  );
}