import React from "react";
import { Search, X } from "lucide-react";

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

export default function ProductFilters({ filters, onChange, categories, brands, zones, count, total }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const active =
    filters.search || filters.category || filters.brand || filters.zone ||
    filters.stock !== "todos" || filters.status !== "ativos" || filters.fiscal !== "todos" || filters.batch !== "todos";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={filters.search} onChange={(e) => set({ search: e.target.value })}
            placeholder="Buscar por nome, código, marca, categoria…" className="brand-input pl-9" />
        </div>

        <select className="brand-input w-auto" value={filters.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="brand-input w-auto" value={filters.brand} onChange={(e) => set({ brand: e.target.value })}>
          <option value="">Todas as marcas</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <select className="brand-input w-auto" value={filters.stock} onChange={(e) => set({ stock: e.target.value })}>
          {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select className="brand-input w-auto" value={filters.zone} onChange={(e) => set({ zone: e.target.value })}>
          <option value="">Todas as zonas</option>
          <option value="__none">Sem localização</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
        </select>

        <select className="brand-input w-auto" value={filters.fiscal} onChange={(e) => set({ fiscal: e.target.value })}>
          <option value="todos">Fiscal: todos</option>
          <option value="sem_ncm">Sem NCM</option>
          <option value="com_ncm">Com NCM</option>
        </select>

        <select className="brand-input w-auto" value={filters.batch} onChange={(e) => set({ batch: e.target.value })}>
          <option value="todos">Lote: todos</option>
          <option value="sim">Rastreia lote</option>
          <option value="nao">Sem rastreio</option>
        </select>

        <select className="brand-input w-auto" value={filters.status} onChange={(e) => set({ status: e.target.value })}>
          <option value="ativos">Somente ativos</option>
          <option value="inativos">Somente inativos</option>
          <option value="todos">Ativos e inativos</option>
        </select>

        <select className="brand-input w-auto" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {active && (
          <button onClick={() => onChange({ search: "", category: "", brand: "", zone: "", stock: "todos", fiscal: "todos", batch: "todos", status: "ativos", sort: filters.sort })}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2">
            <X className="w-3.5 h-3.5" /> Limpar filtros
          </button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">{count} de {total} produtos</span>
      </div>
    </div>
  );
}