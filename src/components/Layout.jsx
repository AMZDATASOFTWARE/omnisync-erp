import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Map, Users, Wallet, Smartphone, Sparkles } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pdv", label: "PDV — Caixa", icon: ShoppingCart },
  { to: "/produtos", label: "Estoque", icon: Package },
  { to: "/mapa", label: "Mapa da Loja", icon: Map },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/mobile", label: "Consulta Rápida", icon: Smartphone },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f6f7f9] md:flex">
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-[#0e1420] text-slate-300 min-h-screen sticky top-0 h-screen">
        <div className="px-6 py-6">
          <p className="text-white font-semibold tracking-tight text-lg">ModuFlex<span className="text-emerald-400">.</span></p>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">ERP & Frente de Caixa</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-emerald-500/15 text-emerald-300 font-medium" : "hover:bg-white/5 hover:text-white"
                }`}>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-6 py-4 text-[11px] text-slate-600">v1.0 · Multi-segmento</p>
      </aside>

      <div className="md:hidden sticky top-0 z-40 bg-[#0e1420] text-slate-300">
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-white font-semibold">ModuFlex<span className="text-emerald-400">.</span></p>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                  isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5"
                }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}