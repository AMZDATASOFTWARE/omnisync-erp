import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Power } from "lucide-react";

export default function CashControls({ session, onChange }) {
  const [dialog, setDialog] = useState(null); // 'sangria' | 'reforco' | 'fechar'
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    if (dialog === "fechar") {
      await base44.entities.CashSession.update(session.id, {
        status: "fechado", closing_amount: Number(amount) || 0, closed_at: new Date().toISOString(),
      });
    } else {
      await base44.entities.CashMovement.create({
        session_id: session.id, type: dialog, amount: Number(amount) || 0, note,
      });
    }
    setSaving(false); setDialog(null); setAmount(""); setNote("");
    onChange();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[140px]">
        <p className="text-xs text-slate-400">Caixa aberto {session.operator ? `· ${session.operator}` : ""}</p>
        <p className="text-sm font-medium text-slate-700">Fundo: {brl(session.opening_amount)}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => setDialog("sangria")}>
        <ArrowDownCircle className="w-4 h-4 mr-1.5 text-rose-500" /> Sangria
      </Button>
      <Button variant="outline" size="sm" onClick={() => setDialog("reforco")}>
        <ArrowUpCircle className="w-4 h-4 mr-1.5 text-emerald-500" /> Reforço
      </Button>
      <Button variant="outline" size="sm" onClick={() => setDialog("fechar")}>
        <Power className="w-4 h-4 mr-1.5 text-slate-500" /> Fechar caixa
      </Button>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialog === "sangria" ? "Sangria (retirada)" : dialog === "reforco" ? "Reforço de caixa" : "Fechar caixa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="number" step="0.01" min="0" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={dialog === "fechar" ? "Valor contado em caixa (R$)" : "Valor (R$)"} />
            {dialog !== "fechar" && (
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observação (opcional)" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancelar</Button>
            <Button onClick={confirm} disabled={saving || !amount} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? "Confirmando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}