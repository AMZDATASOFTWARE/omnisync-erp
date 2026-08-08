// Cálculos gerenciais derivados de Sale + Product + FinancialEntry (sem persistência).

export function inPeriod(record, days) {
  const limit = Date.now() - days * 86400000;
  return new Date(record.created_date).getTime() >= limit;
}

// Curva ABC por faturamento: A = 80% acumulado, B = até 95%, C = restante.
export function abcCurve(sales, products) {
  const byProduct = new Map();
  sales.forEach((s) => {
    (s.items || []).forEach((it) => {
      const key = it.product_id || it.name;
      const prev = byProduct.get(key) || { id: it.product_id, name: it.name, qty: 0, revenue: 0, cost: 0 };
      const prod = products.find((p) => p.id === it.product_id);
      prev.qty += it.quantity || 0;
      prev.revenue += (it.price || 0) * (it.quantity || 0);
      prev.cost += (prod?.cost_price || 0) * (it.quantity || 0);
      byProduct.set(key, prev);
    });
  });

  const rows = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);
  const total = rows.reduce((s, r) => s + r.revenue, 0) || 1;
  let acc = 0;
  return rows.map((r) => {
    acc += r.revenue;
    const share = acc / total;
    return { ...r, margin: r.revenue - r.cost, share: r.revenue / total, accumulated: share, klass: share <= 0.8 ? "A" : share <= 0.95 ? "B" : "C" };
  });
}

// Giro por zona do mapa: unidades e faturamento gerados pelos SKUs alocados na zona.
export function turnoverByZone(sales, products, zones) {
  const zoneOf = new Map(products.map((p) => [p.id, p.zone_id || p.map_zone_id]));
  const totals = new Map();
  sales.forEach((s) =>
    (s.items || []).forEach((it) => {
      const zid = zoneOf.get(it.product_id);
      if (!zid) return;
      const prev = totals.get(zid) || { qty: 0, revenue: 0 };
      prev.qty += it.quantity || 0;
      prev.revenue += (it.price || 0) * (it.quantity || 0);
      totals.set(zid, prev);
    })
  );

  return zones
    .map((z) => {
      const t = totals.get(z.id) || { qty: 0, revenue: 0 };
      const stockValue = products
        .filter((p) => (p.zone_id || p.map_zone_id) === z.id)
        .reduce((s, p) => s + (p.stock_quantity || 0) * (p.cost_price || 0), 0);
      return { ...t, id: z.id, label: z.label, stockValue, turns: stockValue ? t.revenue / stockValue : 0 };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

// DRE gerencial simplificado do período.
export function dre(sales, products, entries) {
  const revenue = sales.reduce((s, x) => s + (x.total || 0), 0);
  const cogs = sales.reduce(
    (s, x) =>
      s +
      (x.items || []).reduce((si, it) => {
        const prod = products.find((p) => p.id === it.product_id);
        return si + (prod?.cost_price || 0) * (it.quantity || 0);
      }, 0),
    0
  );
  const expenses = entries
    .filter((e) => e.type === "pagar" && e.status === "pago")
    .reduce((s, e) => s + (e.amount || 0), 0);

  const gross = revenue - cogs;
  return {
    revenue, cogs, gross, expenses,
    grossMargin: revenue ? gross / revenue : 0,
    net: gross - expenses,
    netMargin: revenue ? (gross - expenses) / revenue : 0,
  };
}