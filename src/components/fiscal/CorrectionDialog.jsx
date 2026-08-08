import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CorrectionDialog({ open, onOpenChange, onConfirm }) {
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = texto.trim().length >= 15 && texto.trim().length <= 1000;

  const confirm = async () => {
    setBusy(true);
    await onConfirm(texto.trim());
    setBusy(false);
    setTexto("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Carta de Correção (CC-e)</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Descreva a correção (15 a 1000 caracteres). A CC-e não pode alterar valores, quantidades,
          destinatário nem a data da operação — nesses casos, cancele o documento.
        </p>
        <Textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex.: Corrigir o endereço de entrega informado na nota" />
        <p className="text-xs text-muted-foreground">{texto.trim().length}/1000</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button disabled={!valid || busy} onClick={confirm}>
            {busy ? "Registrando..." : "Registrar correção"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}