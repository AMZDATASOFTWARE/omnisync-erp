import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileCheck2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function SaleFiscalRow({ sale, emitting, onEmit }) {
  const emitida = sale.fiscal_status === "emitida";
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4 text-sm">{format(new Date(sale.created_date), "dd/MM HH:mm")}</td>
      <td className="py-3 px-4 text-sm">{sale.customer_name || "Consumidor"}</td>
      <td className="py-3 px-4 text-sm">{(sale.items || []).length} item(ns)</td>
      <td className="py-3 px-4 text-sm font-medium">{brl(sale.total)}</td>
      <td className="py-3 px-4">
        {emitida ? (
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
        {!emitida && (
          <Button size="sm" variant="outline" disabled={emitting} onClick={() => onEmit(sale)}>
            {emitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />}
            Emitir
          </Button>
        )}
      </td>
    </tr>
  );
}