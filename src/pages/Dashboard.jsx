import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { brl } from "@/lib/format";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import { ShoppingCart, TrendingUp, PackageX, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando painel…</div>;

  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.created_date).toDateString() === today && s.status !== "cancelada");
  const revenue = todaySales.reduce((a, s) => a + (s.total || 0), 0);
  const lowStock = products.filter((p) => p.active !== false && (p.stock_quantity || 0) <= (p.min_stock || 0));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Visão Geral</h1>
        <p className="text-sm text-slate-500 mt-1">Tudo conectado: estoque, caixa, financeiro e clientes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Vendas hoje" value={todaySales.length} tone="emerald" />
        <StatCard icon={TrendingUp} label="Faturamento hoje" value={brl(revenue)} tone="blue" />
        <StatCard icon={PackageX} label="Estoque baixo" value={lowStock.length} tone="amber" />
        <StatCard icon={CalendarClock} label="Contas pendentes" value={entries.length} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Faturamento — últimos 7 dias</h2>
          <SalesChart sales={sales} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Alertas de reposição</h2>
            <Link to="/produtos" className="text-xs text-emerald-600 hover:underline">Ver estoque</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum produto abaixo do mínimo.</p>
          ) : (
            <ul className="space-y-2.5">
              {lowStock.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate pr-2">{p.name}</span>
                  <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">
                    {p.stock_quantity ?? 0} {p.unit || "un"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}