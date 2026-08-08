import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CancelDialog({ open, onOpenChange, title, onConfirm }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = reason.trim().length >= 15;

  const confirm = async () => {
    setBusy(true);
    await onConfirm(reason.trim());
    setBusy(false);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Informe a justificativa do cancelamento (mínimo 15 caracteres, exigência da legislação).
        </p>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Ex.: Venda cancelada a pedido do cliente" />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button variant="destructive" disabled={!valid || busy} onClick={confirm}>
            {busy ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}