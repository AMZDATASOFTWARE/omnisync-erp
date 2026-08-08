import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// NF-e (modelo 55) exige destinatário identificado com CPF (11) ou CNPJ (14).
export default function NfeDialog({ sale, open, onOpenChange, onConfirm }) {
  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sale) { setNome(sale.customer_name || ""); setDoc(sale.customer_cpf_cnpj || ""); }
  }, [sale]);

  const digits = doc.replace(/\D/g, "");
  const valid = nome.trim().length > 2 && (digits.length === 11 || digits.length === 14);

  const submit = async () => {
    setLoading(true);
    await onConfirm({ nome: nome.trim(), cpf_cnpj: digits });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Emitir NF-e (modelo 55)</DialogTitle>
          <DialogDescription>Informe o destinatário da nota.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome / Razão social</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>CPF ou CNPJ</Label>
            <Input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Somente números" />
            {!!digits && !valid && (
              <p className="text-xs text-destructive">CPF deve ter 11 dígitos e CNPJ, 14.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!valid || loading} onClick={submit}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Emitir NF-e
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}