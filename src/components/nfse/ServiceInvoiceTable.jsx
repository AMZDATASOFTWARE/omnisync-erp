import React from "react";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";

const badge = {
  rascunho: "bg-slate-100 text-slate-600",
  emitida: "bg-emerald-100 text-emerald-700",
  erro: "bg-red-100 text-red-700",
  cancelada: "bg-amber-100 text-amber-700",
};

export default function ServiceInvoiceTable({ invoices, emittingId, onEmit, onDelete }) {
  if (!invoices.length) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Nenhuma NFS-e registrada ainda.</p>;
  }
  return (
    <div className="bg-card rounded-xl border border-border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-3 px-4 font-medium">Serviço</th>
            <th className="py-3 px-4 font-medium">Tomador</th>
            <th className="py-3 px-4 font-medium">Valor</th>
            <th className="py-3 px-4 font-medium">Situação</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoices.map((n) => (
            <tr key={n.id} className="border-t border-border align-top">
              <td className="py-3 px-4 text-sm">
                <p className="font-medium">{n.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {n.codigo_tributacao_nacional} · ISS {n.aliquota_iss || 0}%
                  {n.chave_acesso && <> · chave {n.chave_acesso}</>}
                </p>
                {n.error && <p className="text-xs text-red-600 mt-1">{n.error}</p>}
              </td>
              <td className="py-3 px-4 text-sm">{n.tomador_nome || "—"}</td>
              <td className="py-3 px-4 text-sm">{brl(n.valor_servico)}</td>
              <td className="py-3 px-4">
                <span className={`text-xs px-2 py-1 rounded-full ${badge[n.status] || badge.rascunho}`}>
                  {n.status}{n.numero ? ` · nº ${n.numero}` : ""}
                </span>
              </td>
              <td className="py-3 px-4 text-right whitespace-nowrap">
                {n.status !== "emitida" && (
                  <Button size="sm" disabled={emittingId === n.id} onClick={() => onEmit(n)}>
                    {emittingId === n.id ? "Emitindo..." : "Emitir"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDelete(n)}>Excluir</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}