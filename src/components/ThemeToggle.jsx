import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      className={`h-10 w-10 shrink-0 rounded-full border border-border bg-card text-foreground/70 hover:text-primary flex items-center justify-center transition-colors ${className}`}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}