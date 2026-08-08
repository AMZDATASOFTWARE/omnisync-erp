// Camadas analíticas do mapa (SDD 3.5): giro, ruptura e valorização por zona.
// Derivadas de Sale + Product, sem persistência adicional.

const zoneOf = (p) => p.zone_id || p.map_zone_id || "";

export const HEAT_MODES = [
  { id: "off", label: "Sem camada" },
  { id: "giro", label: "Giro (vendas)" },
  { id: "ruptura", label: "Ruptura" },
  { id: "valor", label: "Valorização" },
];

export function computeHeat(mode, zones, products, sales) {
  if (mode === "off") return null;

  const byZone = {};
  zones.forEach((z) => (byZone[z.id] = 0));

  if (mode === "giro") {
    const zoneByProduct = {};
    products.forEach((p) => (zoneByProduct[p.id] = zoneOf(p)));
    sales.forEach((s) =>
      (s.items || []).forEach((it) => {
        const z = zoneByProduct[it.product_id];
        if (z in byZone) byZone[z] += it.quantity || 0;
      })
    );
  } else {
    products.forEach((p) => {
      const z = zoneOf(p);
      if (!(z in byZone)) return;
      if (mode === "ruptura") {
        const min = p.stock_min ?? p.min_stock ?? 0;
        if ((p.stock_quantity || 0) <= min) byZone[z] += 1;
      } else {
        byZone[z] += (p.stock_quantity || 0) * (p.cost_price || p.price || 0);
      }
    });
  }

  const max = Math.max(...Object.values(byZone), 0);
  const format = (v) =>
    mode === "valor"
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
      : mode === "ruptura"
      ? `${v} item(ns)`
      : `${v} un vendidas`;

  const result = {};
  zones.forEach((z) => {
    const v = byZone[z.id] || 0;
    result[z.id] = { value: v, intensity: max > 0 ? v / max : 0, text: format(v) };
  });
  return { mode, max, zones: result };
}

export const HEAT_COLOR = { giro: "#1FD5F9", ruptura: "#EF4343", valor: "#FBBE23" };