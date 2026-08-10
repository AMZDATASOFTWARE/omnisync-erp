import {
  LayoutDashboard, ShoppingCart, Box, MapPin, Users, Banknote, Smartphone, Sparkles,
  FileText, Truck, Clock, ClipboardCheck, BarChart3, Store, Percent, FileSignature, UserCircle,
  Boxes, Landmark, Settings2,
} from "lucide-react";

// Itens fixos no topo (fora de grupos)
export const topItems = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/pdv", label: "PDV — Caixa", icon: ShoppingCart },
];

export const groups = [
  {
    id: "estoque",
    label: "Estoque & Loja",
    icon: Boxes,
    items: [
      { to: "/produtos", label: "Estoque", icon: Box },
      { to: "/lotes", label: "Lotes & Validade", icon: Clock },
      { to: "/mapa", label: "Mapa da Loja", icon: MapPin },
      { to: "/inventario", label: "Inventário", icon: ClipboardCheck },
      { to: "/compras", label: "Compras", icon: Truck },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro & Clientes",
    icon: Landmark,
    items: [
      { to: "/financeiro", label: "Financeiro", icon: Banknote },
      { to: "/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    id: "fiscal",
    label: "Fiscal",
    icon: FileText,
    items: [
      { to: "/fiscal", label: "Fiscal", icon: FileText },
      { to: "/tributacao", label: "Tributação NCM", icon: Percent },
      { to: "/nfse", label: "NFS-e Nacional", icon: FileSignature },
    ],
  },
  {
    id: "gestao",
    label: "Gestão",
    icon: Settings2,
    items: [
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/lojas", label: "Unidades", icon: Store },
      { to: "/perfil", label: "Meu Perfil", icon: UserCircle },
    ],
  },
];

// Itens fixos no rodapé da navegação
export const bottomItems = [
  { to: "/mobile", label: "Consulta Rápida", icon: Smartphone },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles },
];

export const allItems = [...topItems, ...groups.flatMap((g) => g.items), ...bottomItems];