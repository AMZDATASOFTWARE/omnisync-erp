import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import StoreSwitcher from "@/components/StoreSwitcher";
import SidebarNav from "@/components/nav/SidebarNav";
import { allItems } from "@/components/nav/nav-config";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar_collapsed") === "1");

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("sidebar_collapsed", c ? "0" : "1");
      return !c;
    });
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className={`hidden md:flex md:flex-col shrink-0 bg-card border-r border-border min-h-screen sticky top-0 h-screen transition-all duration-200 ${collapsed ? "w-16" : "w-64"}`}>
        <div className={`py-6 flex items-center gap-3 ${collapsed ? "px-3 justify-center" : "px-5"}`}>
          <BrandMark size={collapsed ? 24 : 28} />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-foreground text-lg">OmniSync ERP</p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">ERP & Frente de Caixa</p>
              </div>
              <NotificationBell />
              <ThemeToggle />
            </>
          )}
        </div>

        {collapsed && (
          <div className="flex flex-col items-center gap-1 pb-2">
            <NotificationBell />
            <ThemeToggle />
          </div>
        )}

        <button onClick={toggle} title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`mx-2 mb-2 flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-primary/5 hover:text-foreground transition-colors ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Recolher menu</>}
        </button>

        {!collapsed && <StoreSwitcher />}

        <SidebarNav collapsed={collapsed} />

        {!collapsed && <p className="px-6 py-4 text-[11px] text-muted-foreground">v1.0 · Multissetor</p>}
      </aside>

      <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <BrandMark size={22} />
          <p className="font-heading font-bold text-foreground flex-1">OmniSync ERP</p>
          <NotificationBell />
          <ThemeToggle />
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {allItems.map(({ to, label, icon: Icon }) => (
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