import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import ProductSearch from "@/components/pdv/ProductSearch";
import Cart from "@/components/pdv/Cart";
import CashControls from "@/components/pdv/CashControls";
import OpenSessionCard from "@/components/pdv/OpenSessionCard";
import { useToast } from "@/components/ui/use-toast";
import { withStore, ofStore } from "@/lib/scope";

export default function PDV() {
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const [sessions, prods] = await Promise.all([
      base44.entities.CashSession.filter({ status: "aberto" }, "-created_date", 20),
      base44.entities.Product.list("-updated_date", 500),
    ]);
    setSession(ofStore(sessions)[0] || null);
    setProducts(ofStore(prods).filter((p) => p.active !== false));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addToCart = (p) => {
    setCart((c) => {
      const existing = c.find((i) => i.product_id === p.id);
      if (existing) return c.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { product_id: p.id, name: p.name, price: p.price, quantity: 1 }];
    });
  };

  const finishSale = async ({ payment_method, customer }) => {
    const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);
    const sale = await base44.entities.Sale.create(withStore({
      items: cart, total, payment_method,
      customer_id: customer?.id || "", customer_name: customer?.name || "",
      cash_session_id: session.id, status: "concluida", fiscal_status: "pendente",
    }));
    // Estoque + financeiro + CRM conectados
    await Promise.all([
      ...cart.map((i) => {
        const p = products.find((x) => x.id === i.product_id);
        return p ? base44.entities.Product.update(p.id, { stock_quantity: (p.stock_quantity || 0) - i.quantity }) : null;
      }).filter(Boolean),
      base44.entities.FinancialEntry.create(withStore({
        type: "receber", description: `Venda PDV #${sale.id.slice(-6)}`, amount: total,
        status: payment_method === "dinheiro" || payment_method === "pix" ? "pago" : "pendente",
        category: "Receita de Vendas", related_party: customer?.name || "Consumidor final", sale_id: sale.id,
        due_date: new Date().toISOString().split("T")[0],
      })),
      customer?.id
        ? base44.entities.Customer.update(customer.id, { total_spent: (customer.total_spent || 0) + total })
        : null,
    ].filter(Boolean));
    // Fiscal conectado: emite a NFC-e automaticamente após a venda
    const res = await base44.functions.invoke("emitFiscalDocument", { sale_id: sale.id });
    const fiscal = res.data || {};
    toast({
      title: fiscal.success ? `NFC-e ${fiscal.numero} emitida` : "Venda registrada — NFC-e pendente",
      description: fiscal.success ? "Documento disponível na aba Fiscal." : fiscal.message,
      variant: fiscal.success ? undefined : "destructive",
    });
    setCart([]);
    load();
  };

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando PDV…</div>;

  if (!session) return <OpenSessionCard onOpened={load} />;

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <CashControls session={session} onChange={load} />
          <ProductSearch products={products} onSelect={addToCart} />
        </div>
        <div className="lg:col-span-2">
          <Cart cart={cart} setCart={setCart} onFinish={finishSale} />
        </div>
      </div>
    </div>
  );
}