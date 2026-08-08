import { useEffect, useState } from "react";

const KEY = "omnisync.theme";

// Tema claro é o padrão; o escuro é opcional e fica salvo no dispositivo.
export function applyStoredTheme() {
  const saved = localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", saved === "dark");
  return saved;
}

export function useTheme() {
  const [theme, setTheme] = useState(() => applyStoredTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}