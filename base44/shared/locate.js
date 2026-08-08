// Regras compartilhadas de localização e formatação de produto (SDD Parte 2/3)

export function brl(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

export function stockStatus(p) {
  const qty = p.stock_quantity || 0;
  if (qty <= 0) return "out";
  if (qty <= (p.min_stock || 0)) return "low";
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
export function humanReadable(zone, shelfLabel) {
  if (!zone) return "Localização não cadastrada";
  const parts = [zone.label];
  if (shelfLabel) {
    const num = parseInt(String(shelfLabel).replace(/\D/g, ""), 10);
    parts.push(LEVEL_HINTS[num] || shelfLabel);
  }
  return parts.join(", ");
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
    has_location: !!p.map_zone_id,
    specs: { ncm: p.ncm || "", cest: p.cest || "", lot: p.lot || "", expiry_date: p.expiry_date || "" },
  };
}