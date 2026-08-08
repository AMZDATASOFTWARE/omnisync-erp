import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MapCanvas from "@/components/map/MapCanvas";
import ZonePanel from "@/components/map/ZonePanel";
import ZoneInventory from "@/components/map/ZoneInventory";

export default function MapaLoja() {
  const [map, setMap] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.StoreMap.list("", 1),
      base44.entities.Product.list("name", 500),
    ]).then(async ([maps, prods]) => {
      let m = maps[0];
      if (!m) m = await base44.entities.StoreMap.create({ name: "Loja Principal", cols: 20, rows: 12, zones: [] });
      setMap(m);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  const persist = async (updated) => {
    setMap(updated);
    setSaving(true);
    await base44.entities.StoreMap.update(updated.id, {
      name: updated.name, cols: updated.cols, rows: updated.rows, zones: updated.zones,
    });
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando mapa da loja…</div>;

  const zones = map.zones || [];
  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Mapa da Loja</h1>
          <p className="text-sm text-slate-500 mt-1">
            Desenhe a planta baixa: crie zonas e pinte as células clicando e arrastando no grid.
            {saving && <span className="text-emerald-600 ml-2">Salvando…</span>}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 overflow-x-auto">
            <MapCanvas map={map} selectedZoneId={selectedZoneId} onChange={persist} />
          </div>
          {selectedZone && <ZoneInventory zone={selectedZone} products={products} />}
        </div>
        <ZonePanel map={map} products={products} selectedZoneId={selectedZoneId}
          onSelect={setSelectedZoneId} onChange={persist} />
      </div>
    </div>
  );
}