import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import BatchForm from "@/components/lotes/BatchForm";
import BatchTable from "@/components/lotes/BatchTable";
import ExpiryAlerts from "@/components/lotes/ExpiryAlerts";
import { withStore, ofStore } from "@/lib/scope";

export default function Lotes() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.StockBatch.list("expiry_date", 500),
      base44.entities.Product.list("name", 500),
    ]).then(([bs, ps]) => {
      setBatches(ofStore(bs));
      setProducts(ofStore(ps));
      setLoading(false);
    });
  }, []);

  const create = async (data) => {
    const created = await base44.entities.StockBatch.create(withStore(data));
    setBatches((b) => [...b, created]);
    const product = products.find((p) => p.id === data.product_id);
    if (product) {
      const qty = (product.stock_quantity || 0) + data.quantity;
      setProducts((ps) => ps.map((p) => (p.id === product.id ? { ...p, stock_quantity: qty } : p)));
      await base44.entities.Product.update(product.id, { stock_quantity: qty, track_batch: true });
    }
  };

  const remove = async (b) => {
    setBatches((bs) => bs.filter((x) => x.id !== b.id));
    await base44.entities.StockBatch.delete(b.id);
  };

  const toggleBlock = async (b) => {
    const status = b.status === "bloqueado" ? "ativo" : "bloqueado";
    setBatches((bs) => bs.map((x) => (x.id === b.id ? { ...x, status } : x)));
    await base44.entities.StockBatch.update(b.id, { status });
  };

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando lotes…</div>;

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Lotes & Validade</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(242,246,248,.65)" }}>
          Controlar por lote com consumo FEFO — o lote mais próximo do vencimento sai primeiro.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <ExpiryAlerts batches={batches} />
          <div className="brand-card !p-0 overflow-hidden">
            <BatchTable batches={batches} onDelete={remove} onToggleBlock={toggleBlock} />
          </div>
        </div>
        <BatchForm products={products} onCreate={create} />
      </div>
    </div>
  );
}