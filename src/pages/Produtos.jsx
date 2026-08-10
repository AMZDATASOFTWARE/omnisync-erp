import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import ProductTable from "@/components/products/ProductTable";
import ProductFilters from "@/components/products/ProductFilters";
import { DEFAULT_PRODUCT_FILTERS, filterProducts } from "@/lib/product-filters";
import ProductForm from "@/components/products/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { withStore, ofStore } from "@/lib/scope";

export default function Produtos() {
  const [products, setProducts] = useState([]);
  const [map, setMap] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_PRODUCT_FILTERS);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [p, maps] = await Promise.all([
      base44.entities.Product.list("-updated_date", 500),
      base44.entities.StoreMap.list("", 20),
    ]);
    setProducts(ofStore(p));
    setMap(ofStore(maps)[0] || null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    if (editing?.id) await base44.entities.Product.update(editing.id, data);
    else await base44.entities.Product.create(withStore(data));
    setOpen(false); setEditing(null);
    load();
  };

  const remove = async (p) => {
    await base44.entities.Product.delete(p.id);
    load();
  };

  const filtered = filterProducts(products, filters);
  const uniq = (key) => [...new Set(products.map((p) => p[key]).filter(Boolean))].sort();

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Estoque</h1>
          <p className="text-sm mt-2" style={{ color: "rgba(242,246,248,.65)" }}>{products.length} produtos cadastrados</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="brand-btn-primary-card">
          <Plus className="w-4 h-4" strokeWidth={2} /> Cadastrar produto
        </button>
      </div>

      <ProductFilters filters={filters} onChange={setFilters}
        categories={uniq("category")} brands={uniq("brand")} zones={map?.zones || []}
        count={filtered.length} total={products.length} />

      {loading ? (
        <p className="text-sm text-slate-400">Carregando produtos…</p>
      ) : (
        <ProductTable products={filtered} map={map} onEdit={(p) => { setEditing(p); setOpen(true); }} onDelete={remove} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <ProductForm product={editing} map={map} onSave={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}