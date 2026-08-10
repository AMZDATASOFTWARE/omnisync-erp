import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import SidebarNav from "@/components/SidebarNav";
import { navItems } from "@/components/nav-groups";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background md:flex">
      <SidebarNav />

      <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <BrandMark size={22} />
          <p className="font-heading font-bold text-foreground flex-1">OmniSync ERP</p>
          <NotificationBell />
          <ThemeToggle />
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
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