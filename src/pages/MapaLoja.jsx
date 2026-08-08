import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MapCanvas from "@/components/map/MapCanvas";
import ZonePanel from "@/components/map/ZonePanel";
import ZoneInventory from "@/components/map/ZoneInventory";
import ProductLinker from "@/components/map/ProductLinker";

export default function MapaLoja() {
  const [map, setMap] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [highlight, setHighlight] = useState(null); // { zoneId, pin, name }

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

      const params = new URLSearchParams(window.location.search);
      const zoneParam = params.get("zone");
      const productParam = params.get("product");
      const prod = productParam && prods.find((p) => p.id === productParam);
      if (prod) {
        const zid = prod.zone_id || prod.map_zone_id;
        const cell = m.zones?.find((z) => z.id === zid)?.cells?.[0];
        setSelectedZoneId(zid || zoneParam || null);
        setHighlight({ zoneId: zid, name: prod.name, pin: cell ? { x: cell.x, y: cell.y } : null });
      } else if (zoneParam) {
        setSelectedZoneId(zoneParam);
      }
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

  const linkProduct = async (product, zone) => {
    const patch = { zone_id: zone.id, map_zone_id: zone.id, shelf_identifier: product.shelf_identifier || zone.label };
    setProducts((ps) => ps.map((p) => (p.id === product.id ? { ...p, ...patch } : p)));
    await base44.entities.Product.update(product.id, patch);
  };

  const unlinkProduct = async (product) => {
    const patch = { zone_id: "", map_zone_id: "" };
    setProducts((ps) => ps.map((p) => (p.id === product.id ? { ...p, ...patch } : p)));
    await base44.entities.Product.update(product.id, patch);
  };

  const highlightProduct = (product) => {
    const zoneId = product.zone_id || product.map_zone_id;
    const zone = (map.zones || []).find((z) => z.id === zoneId);
    const cell = zone?.cells?.[0];
    setSelectedZoneId(zoneId || null);
    setHighlight({ zoneId, name: product.name, pin: cell ? { x: cell.x, y: cell.y } : null });
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
            Planta vetorial: crie zonas, desenhe no grid, use zoom/mover e aloque produtos às gôndolas.
            {saving && <span className="text-emerald-600 ml-2">Salvando…</span>}
          </p>
        </div>
        {highlight?.name && (
          <div className="text-xs bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2">
            Destacando: <strong>{highlight.name}</strong>
            {!highlight.pin && " — zona sem células desenhadas"}
            <button className="ml-2 underline" onClick={() => setHighlight(null)}>limpar</button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4">
            <MapCanvas map={map} selectedZoneId={selectedZoneId} onChange={persist}
              highlightZoneId={highlight?.zoneId} pin={highlight?.pin} onZoneClick={setSelectedZoneId} />
          </div>
          {selectedZone && <ZoneInventory zone={selectedZone} products={products} />}
        </div>
        <div className="space-y-5">
          <ZonePanel map={map} products={products} selectedZoneId={selectedZoneId}
            onSelect={setSelectedZoneId} onChange={persist} />
          <ProductLinker products={products} zone={selectedZone}
            onLink={linkProduct} onUnlink={unlinkProduct} onHighlight={highlightProduct} />
        </div>
      </div>
    </div>
  );
}