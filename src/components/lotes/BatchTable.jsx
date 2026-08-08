import React from "react";
import { Trash2, Ban } from "lucide-react";
import { expiryStatus, daysUntil, EXPIRY_STYLE, sortFEFO } from "@/lib/batch";

const money = (v) => (v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

export default function BatchTable({ batches, onDelete, onToggleBlock }) {
  if (!batches.length)
    return <p className="text-sm text-slate-400 p-6 text-center">Nenhum lote registrado ainda.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
            <th className="py-2 px-3">Produto</th>
            <th className="py-2 px-3">Lote</th>
            <th className="py-2 px-3">Validade</th>
            <th className="py-2 px-3 text-right">Saldo</th>
            <th className="py-2 px-3 text-right">Custo</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3" />
          </tr>
        </thead>
        <tbody>
          {sortFEFO(batches).map((b) => {
            const st = b.status === "bloqueado" ? null : expiryStatus(b.expiry_date);
            const style = st ? EXPIRY_STYLE[st] : { label: "Bloqueado", cls: "bg-slate-800 text-white" };
            const d = daysUntil(b.expiry_date);
            return (
              <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="py-2.5 px-3">
                  <p className="font-medium text-slate-900">{b.product_name}</p>
                  <p className="text-xs text-slate-400">{b.sku}</p>
                </td>
                <td className="py-2.5 px-3 text-slate-600">{b.lot_code || "—"}</td>
                <td className="py-2.5 px-3 text-slate-600">
                  {b.expiry_date ? new Date(b.expiry_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                  {d !== null && <span className="block text-xs text-slate-400">{d < 0 ? `${-d}d vencido` : `${d}d restantes`}</span>}
                </td>
                <td className="py-2.5 px-3 text-right font-medium">{b.quantity}</td>
                <td className="py-2.5 px-3 text-right text-slate-600">{money(b.cost)}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${style.cls}`}>{style.label}</span>
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <button onClick={() => onToggleBlock(b)} className="text-slate-400 hover:text-slate-800 p-1" title="Bloquear/liberar">
                    <Ban className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(b)} className="text-slate-400 hover:text-red-600 p-1" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}