import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash2 } from "lucide-react";

export default function StoreList({ stores, storeId, onSelect, onEdit, onDelete }) {
  if (!stores.length) return <p className="text-sm text-muted-foreground py-6">Nenhuma unidade cadastrada.</p>;

  return (
    <div className="divide-y divide-border">
      {stores.map((s) => (
        <div key={s.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground flex items-center gap-2">
              {s.name}
              {s.code && <span className="text-xs text-muted-foreground">({s.code})</span>}
              {s.is_default && <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">padrão</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{[s.cnpj, s.address, s.phone].filter(Boolean).join(" · ") || "—"}</p>
          </div>
          {storeId === s.id ? (
            <span className="text-xs text-primary inline-flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> ativa</span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onSelect(s.id)}>Ativar</Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => onEdit(s)} aria-label="Editar"><Pencil className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(s)} aria-label="Excluir"><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ))}
    </div>
  );
}