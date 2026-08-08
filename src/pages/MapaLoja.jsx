import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MapCanvas from "@/components/map/MapCanvas";
import ZonePanel from "@/components/map/ZonePanel";
import ZoneInventory from "@/components/map/ZoneInventory";
import ProductLinker from "@/components/map/ProductLinker";
import ShelfPanel from "@/components/map/ShelfPanel";
import HeatControls from "@/components/map/HeatControls";
import { computeHeat } from "@/lib/heat";

export default function MapaLoja() {
  const [map, setMap] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [highlight, setHighlight] = useState(null); // { zoneId, pin, name, shelfId }
  const [selectedShelfId, setSelectedShelfId] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [sales, setSales] = useState([]);
  const [heatMode, setHeatMode] = useState("off");

  useEffect(() => {
    Promise.all([
      base44.entities.StoreMap.list("", 1),
      base44.entities.Product.list("name", 500),
      base44.entities.ProductPlacement.list("", 500),
      base44.entities.Sale.list("-created_date", 300),
    ]).then(async ([maps, prods, places, sls]) => {
      setSales(sls);
      setPlacements(places);
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
      name: updated.name, cols: updated.cols, rows: updated.rows, zones: updated.zones, shelves: updated.shelves || [],
    });
    setSaving(false);
  };

  const moveShelf = (shelfId, x, y) => {
    persist({ ...map, shelves: (map.shelves || []).map((s) => (s.id === shelfId ? { ...s, x, y } : s)) });
  };

  const linkProduct = async (product, zone, shelf, level) => {
    const isFirst = !placements.some((pl) => pl.product_id === product.id);
    const created = await base44.entities.ProductPlacement.create({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku || "",
      zone_id: zone.id,
      zone_label: zone.label,
      shelf_id: shelf?.id || "",
      shelf_label: shelf?.label || "",
      level: level || null,
      is_primary: isFirst,
    });
    setPlacements((ps) => [...ps, created]);

    if (isFirst) {
      const patch = {
        zone_id: zone.id,
        map_zone_id: zone.id,
        shelf_identifier: shelf ? shelf.label : zone.label,
        pos_z: level || 0,
      };
      setProducts((ps) => ps.map((p) => (p.id === product.id ? { ...p, ...patch } : p)));
      await base44.entities.Product.update(product.id, patch);
    }
  };

  // Remove uma posição; se era a principal, promove a próxima (ou limpa o produto)
  const unlinkProduct = async (placement) => {
    const rest = placements.filter((pl) => pl.id !== placement.id);
    setPlacements(rest);
    await base44.entities.ProductPlacement.delete(placement.id);

    if (!placement.is_primary) return;
    const next = rest.find((pl) => pl.product_id === placement.product_id);
    if (next) {
      await base44.entities.ProductPlacement.update(next.id, { is_primary: true });
      setPlacements((ps) => ps.map((pl) => (pl.id === next.id ? { ...pl, is_primary: true } : pl)));
    }
    const patch = next
      ? { zone_id: next.zone_id, map_zone_id: next.zone_id, shelf_identifier: next.shelf_label || "", pos_z: next.level || 0 }
      : { zone_id: "", map_zone_id: "", shelf_identifier: "", pos_z: 0 };
    setProducts((ps) => ps.map((p) => (p.id === placement.product_id ? { ...p, ...patch } : p)));
    await base44.entities.Product.update(placement.product_id, patch);
  };

  // Aceita tanto um produto quanto uma posição (ProductPlacement)
  const highlightProduct = (item) => {
    const isPlacement = !!item.product_id;
    const zoneId = isPlacement ? item.zone_id : item.zone_id || item.map_zone_id;
    const name = isPlacement ? item.product_name : item.name;
    const shelfLabel = isPlacement ? item.shelf_label : item.shelf_identifier;
    const zone = (map.zones || []).find((z) => z.id === zoneId);
    const cell = zone?.cells?.[0];
    const shelf = (map.shelves || []).find(
      (s) => (isPlacement && item.shelf_id ? s.id === item.shelf_id : s.zone_id === zoneId && s.label === shelfLabel)
    );
    setSelectedZoneId(zoneId || null);
    setHighlight({
      zoneId, name, shelfId: shelf?.id,
      pin: shelf ? { x: shelf.x, y: shelf.y } : cell ? { x: cell.x, y: cell.y } : null,
    });
  };

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando mapa da loja…</div>;

  const zones = map.zones || [];
  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const heat = computeHeat(heatMode, zones, products, sales);

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
              highlightZoneId={highlight?.zoneId} pin={highlight?.pin} onZoneClick={setSelectedZoneId}
              selectedShelfId={selectedShelfId} onMoveShelf={moveShelf} highlightShelfId={highlight?.shelfId}
              heat={heat} />
          </div>
          {selectedZone && <ZoneInventory zone={selectedZone} products={products} />}
        </div>
        <div className="space-y-5">
          <HeatControls mode={heatMode} onChange={setHeatMode} heat={heat} zones={zones} />
          <ZonePanel map={map} products={products} selectedZoneId={selectedZoneId}
            onSelect={setSelectedZoneId} onChange={persist} />
          <ShelfPanel map={map} zone={selectedZone} onChange={persist}
            selectedShelfId={selectedShelfId} onSelectShelf={setSelectedShelfId} />
          <ProductLinker products={products} zone={selectedZone}
            shelves={(map.shelves || []).filter((s) => s.zone_id === selectedZone?.id)}
            placements={placements}
            onLink={linkProduct} onUnlink={unlinkProduct} onHighlight={highlightProduct} />
        </div>
      </div>
    </div>
  );
}