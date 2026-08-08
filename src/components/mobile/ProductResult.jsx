import React from "react";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import { brl } from "@/lib/format";
import MapCanvas from "@/components/map/MapCanvas";

export default function ProductResult({ product, map, onBack }) {
  const zone = map?.zones?.find((z) => z.id === product.map_zone_id);

  return (
    <div className="min-h-screen bg-[#0e1420] p-4 pb-10">
      <div className="max-w-md mx-auto space-y-4 pt-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 text-sm py-2 active:text-white">
          <ArrowLeft className="w-4 h-4" /> Voltar à busca
        </button>

        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-slate-900 text-lg font-semibold leading-snug">{product.name}</h2>
            <p className="text-slate-400 text-xs mt-1">
              {[product.brand, product.category, product.sku].filter(Boolean).join(" · ")}
            </p>
          </div>

          <p className="text-4xl font-bold text-emerald-600 tracking-tight">{brl(product.price)}</p>

          <div className="flex gap-3">
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] text-slate-400 flex items-center gap-1"><Package className="w-3 h-3" /> Estoque</p>
              <p className="text-slate-900 font-semibold mt-0.5">{product.stock_quantity ?? 0} {product.unit || "un"}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</p>
              <p className="text-slate-900 font-semibold mt-0.5 text-sm">
                {zone ? `${zone.label}${product.shelf_label ? ` · ${product.shelf_label}` : ""}` : "Não mapeado"}
              </p>
            </div>
          </div>
        </div>

        {zone && map && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              O produto está na área destacada — <span className="font-medium text-slate-700">{zone.label}</span>
            </p>
            <MapCanvas map={map} readOnly highlightZoneId={zone.id} />
          </div>
        )}
      </div>
    </div>
  );
}