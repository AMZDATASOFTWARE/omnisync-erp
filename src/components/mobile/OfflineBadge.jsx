import React from "react";
import { WifiOff, CloudDownload } from "lucide-react";

export default function OfflineBadge({ fromCache, updatedAt }) {
  if (!updatedAt) return null;
  const when = new Date(updatedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return (
    <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
      {fromCache ? <WifiOff className="w-3.5 h-3.5" /> : <CloudDownload className="w-3.5 h-3.5" />}
      {fromCache ? `Modo offline · dados de ${when}` : `Atualizado em ${when}`}
    </p>
  );
}