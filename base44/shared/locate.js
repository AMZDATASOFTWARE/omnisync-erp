// Regras compartilhadas de localização e formatação de produto (SDD Parte 2/3)

export function brl(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

export function stockStatus(p) {
  const qty = p.stock_quantity || 0;
  if (qty <= 0) return "out";
  if (qty <= (p.stock_min ?? p.min_stock ?? 0)) return "low";
  return "in_stock";
}

export function matchProducts(products, query) {
  const q = (query || "").toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return products
    .filter((p) => p.active !== false)
    .map((p) => {
      const hay = [p.name, p.sku, p.barcode, p.brand, p.category].filter(Boolean).join(" ").toLowerCase();
      const hits = terms.filter((t) => hay.includes(t)).length;
      const exact = (p.barcode === q || (p.sku || "").toLowerCase() === q) ? 10 : 0;
      return { p, score: hits + exact };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

const LEVEL_HINTS = {
  1: "prateleira de baixo",
  2: "2ª prateleira (altura dos olhos)",
  3: "3ª prateleira",
  4: "prateleira de cima",
};

// Gera o texto humano único usado pelo app, pelo agente e pelo WhatsApp
export function humanReadable(zone, shelfLabel, level) {
  if (!zone) return "Localização não cadastrada";
  const parts = [zone.label];
  if (shelfLabel) parts.push(shelfLabel);
  const num = level != null && level !== "" ? Number(level) : parseInt(String(shelfLabel || "").replace(/\D/g, ""), 10);
  if (!Number.isNaN(num) && LEVEL_HINTS[num]) parts.push(LEVEL_HINTS[num]);
  return parts.join(", ");
}

export function productZoneId(p) {
  return p.zone_id || p.map_zone_id || "";
}

export function productShelf(p) {
  return p.shelf_identifier || p.shelf_label || "";
}

// Formata uma posição (ProductPlacement) usando as zonas do mapa
export function placementInfo(placement, map) {
  const zone = map?.zones?.find((z) => z.id === placement.zone_id);
  const shelfLabel =
    placement.shelf_label ||
    map?.shelves?.find((s) => s.id === placement.shelf_id)?.label ||
    "";
  return {
    id: placement.id,
    zone_id: placement.zone_id,
    zone_label: zone?.label || placement.zone_label || "",
    zone_type: zone?.type || "",
    shelf_id: placement.shelf_id || "",
    shelf_label: shelfLabel,
    level: placement.level ?? null,
    quantity: placement.quantity ?? null,
    is_primary: !!placement.is_primary,
    human_readable: humanReadable(zone || { label: placement.zone_label }, shelfLabel, placement.level),
  };
}

// Ordena posições: principal primeiro
export function sortPlacements(placements) {
  return [...placements].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
}

export function productSummary(p) {
  return {
    id: p.id,
    sku: p.sku || "",
    name: p.name,
    brand: p.brand || "",
    category: p.category || "",
    price: p.price,
    price_formatted: brl(p.price),
    stock_quantity: p.stock_quantity || 0,
    unit: p.unit || "un",
    stock_status: stockStatus(p),
    has_location: !!productZoneId(p),
    specs: { ncm: p.ncm || "", cest: p.cest || "", cfop: p.cfop_default || "", lot: p.lot || "", expiry_date: p.expiry_date || "" },
  };
}