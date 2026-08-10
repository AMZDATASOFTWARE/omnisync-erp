export const DEFAULT_PRODUCT_FILTERS = {
  search: "", category: "", brand: "", zone: "",
  stock: "todos", fiscal: "todos", batch: "todos", status: "ativos", sort: "recentes",
};

const minOf = (p) => p.stock_min ?? p.min_stock ?? 0;
const qtyOf = (p) => p.stock_quantity ?? 0;

function matchStock(p, mode) {
  const qty = qtyOf(p), min = minOf(p);
  if (mode === "ruptura") return qty <= 0;
  if (mode === "baixo") return qty > 0 && qty <= min;
  if (mode === "ok") return qty > min;
  if (mode === "excesso") return p.stock_max != null && qty > p.stock_max;
  return true;
}

export function filterProducts(products, f) {
  const q = (f.search || "").toLowerCase();
  const list = products.filter((p) => {
    if (q && ![p.name, p.sku, p.barcode, p.category, p.brand, p.ncm].some((v) => (v || "").toLowerCase().includes(q))) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.brand && p.brand !== f.brand) return false;
    const zid = p.zone_id || p.map_zone_id;
    if (f.zone === "__none" && zid) return false;
    if (f.zone && f.zone !== "__none" && zid !== f.zone) return false;
    if (!matchStock(p, f.stock)) return false;
    if (f.fiscal === "sem_ncm" && p.ncm) return false;
    if (f.fiscal === "com_ncm" && !p.ncm) return false;
    if (f.batch === "sim" && !p.track_batch) return false;
    if (f.batch === "nao" && p.track_batch) return false;
    if (f.status === "ativos" && p.active === false) return false;
    if (f.status === "inativos" && p.active !== false) return false;
    return true;
  });

  const sorters = {
    nome: (a, b) => (a.name || "").localeCompare(b.name || ""),
    estoque_asc: (a, b) => qtyOf(a) - qtyOf(b),
    estoque_desc: (a, b) => qtyOf(b) - qtyOf(a),
    preco_asc: (a, b) => (a.price || 0) - (b.price || 0),
    preco_desc: (a, b) => (b.price || 0) - (a.price || 0),
    valor_desc: (a, b) => qtyOf(b) * (b.price || 0) - qtyOf(a) * (a.price || 0),
  };
  return sorters[f.sort] ? [...list].sort(sorters[f.sort]) : list;
}