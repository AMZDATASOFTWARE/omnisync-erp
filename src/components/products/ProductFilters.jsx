import React, { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

const STOCK_OPTIONS = [
  { value: "todos", label: "Todo estoque" },
  { value: "ruptura", label: "Sem estoque" },
  { value: "baixo", label: "Estoque baixo" },
  { value: "ok", label: "Estoque normal" },
  { value: "excesso", label: "Acima do máximo" },
];

const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "nome", label: "Nome (A-Z)" },
  { value: "estoque_asc", label: "Menor estoque" },
  { value: "estoque_desc", label: "Maior estoque" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
  { value: "valor_desc", label: "Maior valor em estoque" },
];

const selectCls = "brand-input h-8 text-xs py-0 pr-7";
const selectStyle = { width: "auto", minWidth: 0 };

export default function ProductFilters({ filters, onChange, categories, brands, zones, count, total }) {
  const [more, setMore] = useState(false);
  const set = (patch) => onChange({ ...filters, ...patch });
  const active =
    filters.search || filters.category || filters.brand || filters.zone ||
    filters.stock !== "todos" || filters.status !== "ativos" || filters.fiscal !== "todos" || filters.batch !== "todos";

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <div className="relative w-56">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={filters.search} onChange={(e) => set({ search: e.target.value })}
          placeholder="Buscar produto…" className="brand-input h-8 text-xs pl-8" />
      </div>

      <select className={selectCls} style={selectStyle} value={filters.category} onChange={(e) => set({ category: e.target.value })}>
        <option value="">Categoria</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className={selectCls} style={selectStyle} value={filters.stock} onChange={(e) => set({ stock: e.target.value })}>
        {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select className={selectCls} style={selectStyle} value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {more && (
        <>
          <select className={selectCls} style={selectStyle} value={filters.brand} onChange={(e) => set({ brand: e.target.value })}>
            <option value="">Marca</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select className={selectCls} style={selectStyle} value={filters.zone} onChange={(e) => set({ zone: e.target.value })}>
            <option value="">Zona</option>
            <option value="__none">Sem localização</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>

          <select className={selectCls} style={selectStyle} value={filters.fiscal} onChange={(e) => set({ fiscal: e.target.value })}>
            <option value="todos">Fiscal: todos</option>
            <option value="sem_ncm">Sem NCM</option>
            <option value="com_ncm">Com NCM</option>
          </select>

          <select className={selectCls} style={selectStyle} value={filters.batch} onChange={(e) => set({ batch: e.target.value })}>
            <option value="todos">Lote: todos</option>
            <option value="sim">Rastreia lote</option>
            <option value="nao">Sem rastreio</option>
          </select>

          <select className={selectCls} style={selectStyle} value={filters.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
            <option value="todos">Todos</option>
          </select>
        </>
      )}

      <button onClick={() => setMore((v) => !v)}
        className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-border text-muted-foreground hover:text-foreground">
        <SlidersHorizontal className="w-3.5 h-3.5" /> {more ? "Menos" : "Mais filtros"}
      </button>

      {active && (
        <button onClick={() => onChange({ search: "", category: "", brand: "", zone: "", stock: "todos", fiscal: "todos", batch: "todos", status: "ativos", sort: filters.sort })}
          className="inline-flex items-center gap-1 h-8 px-2 text-primary hover:underline">
          <X className="w-3.5 h-3.5" /> Limpar
        </button>
      )}

      <span className="text-muted-foreground ml-auto">{count}/{total}</span>
    </div>
  );
}