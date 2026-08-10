import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { topItems, groups, bottomItems } from "@/components/nav/nav-config";

function Item({ to, label, icon: Icon, collapsed, nested }) {
  return (
    <NavLink key={to} to={to} end={to === "/"} title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md text-sm transition-colors ${
          collapsed ? "justify-center px-2 py-2.5" : `px-3 py-2 ${nested ? "pl-9" : ""}`
        } ${isActive
          ? "bg-primary/10 text-primary font-heading font-bold"
          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"}`}>
      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function SidebarNav({ collapsed }) {
  const { pathname } = useLocation();
  const activeGroup = groups.find((g) => g.items.some((i) => i.to === pathname))?.id;
  const [open, setOpen] = useState(() => (activeGroup ? [activeGroup] : []));

  const toggle = (id) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <nav className="flex-1 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
      {topItems.map((i) => <Item key={i.to} {...i} collapsed={collapsed} />)}

      {groups.map((g) => {
        const isOpen = collapsed ? false : open.includes(g.id);
        const hasActive = g.items.some((i) => i.to === pathname);
        if (collapsed) return g.items.map((i) => <Item key={i.to} {...i} collapsed />);
        return (
          <div key={g.id}>
            <button onClick={() => toggle(g.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                hasActive ? "text-foreground font-heading font-bold" : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              }`}>
              <g.icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span className="flex-1 text-left truncate">{g.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="mt-0.5 space-y-0.5">
                {g.items.map((i) => <Item key={i.to} {...i} nested />)}
              </div>
            )}
          </div>
        );
      })}

      <div className="pt-2 mt-2 border-t border-border space-y-1">
        {bottomItems.map((i) => <Item key={i.to} {...i} collapsed={collapsed} />)}
      </div>
    </nav>
  );
}