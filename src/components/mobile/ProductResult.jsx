import React, { useState } from "react";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import { brl } from "@/lib/format";
import MapCanvas from "@/components/map/MapCanvas";
import RouteHint from "@/components/mobile/RouteHint";

export default function ProductResult({ product, map, onBack }) {
  const [route, setRoute] = useState(null);
  const zoneId = product.zone_id || product.map_zone_id;
  const zone = map?.zones?.find((z) => z.id === zoneId);
  const shelf = product.shelf_identifier || product.shelf_label;
  const cell = zone?.cells?.[0];

  const location = [
    zone ? `Setor ${zone.label}` : null,
    shelf || null,
    product.pos_z != null && product.pos_z !== "" ? `Prateleira ${product.pos_z}` : null,
  ].filter(Boolean).join(" - ");

  return (
    <div className="min-h-screen bg-[#0e1420] p-4 pb-10">
      <div className="max-w-md mx-auto space-y-4 pt-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 text-sm min-h-[44px] active:text-white">
          <ArrowLeft className="w-5 h-5" /> Voltar à busca
        </button>

        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-slate-900 text-xl font-semibold leading-snug">{product.name}</h2>
            <p className="text-slate-400 text-xs mt-1 font-mono">{product.sku || product.barcode || "sem código"}</p>
          </div>

          <p className="text-4xl font-bold text-emerald-600 tracking-tight">{brl(product.price)}</p>

          <div className="flex gap-3">
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] text-slate-400 flex items-center gap-1"><Package className="w-3 h-3" /> Estoque</p>
              <p className="text-slate-900 font-semibold mt-0.5">{product.stock_quantity ?? 0} {product.unit || "un"}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</p>
              <p className="text-slate-900 font-semibold mt-0.5 text-sm leading-snug">{location || "Não mapeado"}</p>
            </div>
          </div>
        </div>

        {zone && <RouteHint product={product} onRoute={setRoute} />}

        {zone && map && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Área destacada na planta — <span className="font-medium text-slate-700">{zone.label}</span>
            </p>
            <MapCanvas map={map} readOnly minimal highlightZoneId={zone.id} route={route}
              pin={cell ? { x: cell.x, y: cell.y } : null} />
          </div>
        )}
      </div>
    </div>
  );
}