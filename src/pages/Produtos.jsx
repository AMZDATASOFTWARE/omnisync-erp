import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search } from "lucide-react";
import ProductTable from "@/components/products/ProductTable";
import ProductForm from "@/components/products/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { withStore, ofStore } from "@/lib/scope";

export default function Produtos() {
  const [products, setProducts] = useState([]);
  const [map, setMap] = useState(null);
  const [search, setSearch] = useState("");
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

  const q = search.toLowerCase();
  const filtered = products.filter((p) =>
    [p.name, p.sku, p.barcode, p.category, p.brand].some((f) => (f || "").toLowerCase().includes(q))
  );

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

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, código, marca, categoria…" className="brand-input pl-9" />
      </div>

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