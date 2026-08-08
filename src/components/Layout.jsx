import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Box, MapPin, Users, Banknote, Smartphone, Sparkles, FileText, Truck, Clock, ClipboardCheck, BarChart3, Store } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import StoreSwitcher from "@/components/StoreSwitcher";

const nav = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/pdv", label: "PDV — Caixa", icon: ShoppingCart },
  { to: "/produtos", label: "Estoque", icon: Box },
  { to: "/lotes", label: "Lotes & Validade", icon: Clock },
  { to: "/mapa", label: "Mapa da Loja", icon: MapPin },
  { to: "/inventario", label: "Inventário", icon: ClipboardCheck },
  { to: "/compras", label: "Compras", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Banknote },
  { to: "/fiscal", label: "Fiscal", icon: FileText },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/lojas", label: "Unidades", icon: Store },
  { to: "/mobile", label: "Consulta Rápida", icon: Smartphone },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-card border-r border-border min-h-screen sticky top-0 h-screen">
        <div className="px-6 py-6 flex items-center gap-3">
          <BrandMark size={28} />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-foreground text-lg">OmniSync ERP</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">ERP & Frente de Caixa</p>
          </div>
          <ThemeToggle />
        </div>
        <StoreSwitcher />
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-heading font-bold"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}>
              <Icon className="w-4 h-4" strokeWidth={2} /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-6 py-4 text-[11px] text-muted-foreground">v1.0 · Multissetor</p>
      </aside>

      <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <BrandMark size={22} />
          <p className="font-heading font-bold text-foreground flex-1">OmniSync ERP</p>
          <ThemeToggle />
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary font-heading font-bold"
                    : "bg-muted text-muted-foreground"
                }`}>
              <Icon className="w-3.5 h-3.5" strokeWidth={2} /> {label}
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