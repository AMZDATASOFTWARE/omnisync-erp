import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function VoidNumbersDialog({ open, onOpenChange, onConfirm }) {
  const [form, setForm] = useState({ serie: "1", numero_inicial: "", numero_final: "", justificativa: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const ini = Number(form.numero_inicial), fim = Number(form.numero_final);
  const valid = form.serie && ini > 0 && fim >= ini && form.justificativa.trim().length >= 15;

  const confirm = async () => {
    setBusy(true);
    await onConfirm({ ...form, numero_inicial: ini, numero_final: fim, justificativa: form.justificativa.trim() });
    setBusy(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Inutilizar numeração</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Use para comunicar ao fisco uma quebra de sequência — números que não foram e não serão utilizados.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Série</Label><Input value={form.serie} onChange={(e) => set("serie", e.target.value)} /></div>
          <div><Label>Nº inicial</Label><Input type="number" value={form.numero_inicial} onChange={(e) => set("numero_inicial", e.target.value)} /></div>
          <div><Label>Nº final</Label><Input type="number" value={form.numero_final} onChange={(e) => set("numero_final", e.target.value)} /></div>
        </div>
        <div>
          <Label>Justificativa (mín. 15 caracteres)</Label>
          <Textarea rows={3} value={form.justificativa} onChange={(e) => set("justificativa", e.target.value)}
            placeholder="Ex.: Quebra de sequencia por falha de comunicacao no emissor" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button disabled={!valid || busy} onClick={confirm}>{busy ? "Registrando..." : "Inutilizar"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}