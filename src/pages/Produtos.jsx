import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import ProductTable from "@/components/products/ProductTable";
import ProductForm from "@/components/products/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      base44.entities.StoreMap.list("", 1),
    ]);
    setProducts(p);
    setMap(maps[0] || null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    if (editing?.id) await base44.entities.Product.update(editing.id, data);
    else await base44.entities.Product.create(data);
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Estoque</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1.5" /> Novo produto
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, código, marca, categoria…" className="pl-9 bg-white" />
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