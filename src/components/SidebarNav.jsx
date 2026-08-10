import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navGroups } from "@/components/nav-groups";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import StoreSwitcher from "@/components/StoreSwitcher";

export default function SidebarNav() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const activeGroup = navGroups.find((g) => g.items.some((i) => i.to === pathname))?.id;
  const [openGroups, setOpenGroups] = useState(() => navGroups.map((g) => g.id));

  const toggleGroup = (id) =>
    setOpenGroups((gs) => (gs.includes(id) ? gs.filter((g) => g !== id) : [...gs, id]));

  return (
    <aside
      className={`hidden md:flex md:flex-col shrink-0 bg-card border-r border-border min-h-screen sticky top-0 h-screen transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}>
      <div className={`py-5 flex items-center gap-2 ${collapsed ? "px-3 justify-center" : "px-4"}`}>
        <BrandMark size={26} />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-foreground text-base truncate">OmniSync ERP</p>
            </div>
            <NotificationBell />
            <ThemeToggle />
          </>
        )}
      </div>

      {!collapsed && <StoreSwitcher />}

      <nav className="flex-1 px-2 overflow-y-auto space-y-2 pb-3">
        {navGroups.map((group) => {
          const open = collapsed || openGroups.includes(group.id);
          return (
            <div key={group.id}>
              {!collapsed && (
                <button onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <span className={activeGroup === group.id ? "text-primary" : ""}>{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
              )}
              {open && (
                <div className="space-y-0.5">
                  {group.items.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} end={to === "/"} title={label}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md text-sm transition-colors ${
                          collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
                        } ${
                          isActive
                            ? "bg-primary/10 text-primary font-heading font-bold"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                        }`}>
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button onClick={() => setCollapsed((v) => !v)}
        className={`flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground ${
          collapsed ? "justify-center px-0" : ""
        }`}>
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Recolher menu</>}
      </button>
    </aside>
  );
}