import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function TaxRuleTable({ rules, onEdit, onDelete }) {
  if (!rules.length) {
    return <p className="text-sm text-muted-foreground p-6">Nenhuma regra cadastrada — a emissão usa o padrão do regime.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-border">
          <tr>
            <th className="text-left py-2 px-3">NCM</th>
            <th className="text-left py-2 px-3">UF</th>
            <th className="text-left py-2 px-3">Descrição</th>
            <th className="text-left py-2 px-3">CFOP</th>
            <th className="text-left py-2 px-3">CSOSN / CST</th>
            <th className="text-right py-2 px-3">ICMS</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-b border-border/60">
              <td className="py-2 px-3 font-mono">{r.ncm}</td>
              <td className="py-2 px-3">{r.uf || "todas"}</td>
              <td className="py-2 px-3 text-muted-foreground">{r.description || "—"}{r.substituicao_tributaria ? " · ST" : ""}</td>
              <td className="py-2 px-3">{r.cfop || "—"}</td>
              <td className="py-2 px-3">{r.csosn || "—"} / {r.cst_icms || "—"}</td>
              <td className="py-2 px-3 text-right">{Number(r.aliquota_icms || 0).toFixed(2)}%</td>
              <td className="py-2 px-3 text-right whitespace-nowrap">
                <Button size="icon" variant="ghost" onClick={() => onEdit(r)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(r)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}