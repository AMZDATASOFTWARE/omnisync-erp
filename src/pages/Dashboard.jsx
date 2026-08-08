import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { brl } from "@/lib/format";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import { ShoppingCart, TrendingUp, PackageX, Clock, FileText, Sparkles, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Sale.list("-created_date", 200),
      base44.entities.Product.list("-created_date", 500),
      base44.entities.FinancialEntry.filter({ status: "pendente" }, "due_date", 50),
    ]).then(([s, p, e]) => {
      setSales(s); setProducts(p); setEntries(e); setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-sm" style={{ color: "rgba(242,246,248,.5)" }}>Carregando painel…</div>;

  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.created_date).toDateString() === today && s.status !== "cancelada");
  const revenue = todaySales.reduce((a, s) => a + (s.total || 0), 0);
  const fiscalPendentes = sales.filter((s) => s.status !== "cancelada" && s.fiscal_status !== "emitida").length;
  const lowStock = products.filter((p) => p.active !== false && (p.stock_quantity || 0) <= (p.min_stock || 0));

  return (
    <div className="relative p-6 md:p-8 space-y-6">
      <div className="brand-stars" aria-hidden="true" />
      <div className="relative">
        <span className="brand-badge-section">
          <span className="badge-section-dot" />
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
          Operação conectada
        </span>
        <h1 className="font-heading text-3xl font-bold text-foreground mt-4">Visão Geral</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(242,246,248,.65)" }}>
          Estoque, caixa, financeiro e clientes em um único painel.
        </p>
      </div>

      <div className="relative grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/pdv"><StatCard icon={ShoppingCart} label="Vendas hoje" value={todaySales.length} /></Link>
        <StatCard icon={TrendingUp} label="Faturamento hoje" value={brl(revenue)} />
        <Link to="/produtos"><StatCard icon={PackageX} label="Estoque baixo" value={lowStock.length} /></Link>
        <Link to="/financeiro"><StatCard icon={Clock} label="Contas pendentes" value={entries.length} /></Link>
        <Link to="/fiscal"><StatCard icon={FileText} label="NFC-e pendentes" value={fiscalPendentes} /></Link>
      </div>

      <div className="relative grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 brand-card">
          <h4>Faturamento — últimos 7 dias</h4>
          <div className="mt-4"><SalesChart sales={sales} /></div>
        </div>

        <div className="brand-card-glow">
          <p className="text-xs font-semibold text-primary tracking-wider mb-1.5">SUPERVISOR DE ESTOQUE</p>
          <h3 className="font-heading text-lg font-bold text-foreground">
            {lowStock.length === 0
              ? "Nenhum produto abaixo do estoque mínimo."
              : `${lowStock.length} ${lowStock.length === 1 ? "produto precisa" : "produtos precisam"} de reposição.`}
          </h3>
          {lowStock.length > 0 && (
            <ul className="mt-4 space-y-2">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2" style={{ color: "rgba(242,246,248,.75)" }}>{p.name}</span>
                  <span className="shrink-0 font-heading text-xs" style={{ color: "var(--brand-signal-amber)" }}>
                    {p.stock_quantity ?? 0} {p.unit || "un"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="brand-metrics mt-5">
            <div className="brand-metric"><i className="cyan" /><span className="flex flex-col"><small>VENDAS HOJE</small><b>{todaySales.length}</b></span></div>
            <div className="brand-metric"><i className="amber" /><span className="flex flex-col"><small>REPOSIÇÃO</small><b>{lowStock.length} itens</b></span></div>
            <div className="brand-metric"><i className="mint" /><span className="flex flex-col"><small>FATURAMENTO</small><b>{brl(revenue)}</b></span></div>
          </div>
          <Link to="/produtos" className="brand-btn-secondary mt-5 w-full">
            Abrir estoque <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}