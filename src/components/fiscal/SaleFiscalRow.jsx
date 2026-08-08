import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileCheck2, AlertTriangle, Ban, FileSignature } from "lucide-react";
import { format } from "date-fns";

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function SaleFiscalRow({ sale, emitting, onEmit, onCancel, onCorrect }) {
  const emitida = sale.fiscal_status === "emitida";
  const cancelada = sale.fiscal_status === "cancelada";
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4 text-sm">{format(new Date(sale.created_date), "dd/MM HH:mm")}</td>
      <td className="py-3 px-4 text-sm">{sale.customer_name || "Consumidor"}</td>
      <td className="py-3 px-4 text-sm">{(sale.items || []).length} item(ns)</td>
      <td className="py-3 px-4 text-sm font-medium">{brl(sale.total)}</td>
      <td className="py-3 px-4">
        {cancelada ? (
          <div className="space-y-0.5">
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Cancelada</Badge>
            <p className="text-[10px] text-muted-foreground">{sale.fiscal_cancel_reason}</p>
          </div>
        ) : emitida ? (
          <div className="space-y-0.5">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">NFC-e {sale.fiscal_number}</Badge>
            <p className="text-[10px] text-muted-foreground font-mono">{sale.fiscal_key}</p>
          </div>
        ) : sale.fiscal_error ? (
          <span className="inline-flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="w-3.5 h-3.5" /> {sale.fiscal_error}
          </span>
        ) : (
          <Badge variant="secondary">Pendente</Badge>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {!emitida && !cancelada && (
          <Button size="sm" variant="outline" disabled={emitting} onClick={() => onEmit(sale)}>
            {emitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />}
            Emitir
          </Button>
        )}
        {emitida && (
          <Button size="sm" variant="ghost" onClick={() => onCorrect(sale)}>
            <FileSignature className="w-3.5 h-3.5" /> CC-e
          </Button>
        )}
        {emitida && (
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onCancel(sale)}>
            <Ban className="w-3.5 h-3.5" /> Cancelar
          </Button>
        )}
      </td>
    </tr>
  );
}