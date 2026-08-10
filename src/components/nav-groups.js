import { LayoutDashboard, ShoppingCart, Box, MapPin, Users, Banknote, Smartphone, Sparkles, FileText, Truck, Clock, ClipboardCheck, BarChart3, Store, Percent, FileSignature, UserCircle } from "lucide-react";

export const navGroups = [
  {
    id: "operacao",
    label: "Operação",
    items: [
      { to: "/", label: "Visão Geral", icon: LayoutDashboard },
      { to: "/pdv", label: "PDV — Caixa", icon: ShoppingCart },
      { to: "/mobile", label: "Consulta Rápida", icon: Smartphone },
    ],
  },
  {
    id: "estoque",
    label: "Estoque & Loja",
    items: [
      { to: "/produtos", label: "Estoque", icon: Box },
      { to: "/lotes", label: "Lotes & Validade", icon: Clock },
      { to: "/inventario", label: "Inventário", icon: ClipboardCheck },
      { to: "/mapa", label: "Mapa da Loja", icon: MapPin },
      { to: "/compras", label: "Compras", icon: Truck },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro & Fiscal",
    items: [
      { to: "/financeiro", label: "Financeiro", icon: Banknote },
      { to: "/fiscal", label: "Fiscal", icon: FileText },
      { to: "/tributacao", label: "Tributação NCM", icon: Percent },
      { to: "/nfse", label: "NFS-e Nacional", icon: FileSignature },
    ],
  },
  {
    id: "gestao",
    label: "Gestão",
    items: [
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/lojas", label: "Unidades", icon: Store },
      { to: "/assistente", label: "Assistente IA", icon: Sparkles },
      { to: "/perfil", label: "Meu Perfil", icon: UserCircle },
    ],
  },
];

export const navItems = navGroups.flatMap((g) => g.items);