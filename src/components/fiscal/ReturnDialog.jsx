import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function ReturnDialog({ sale, open, onOpenChange, onConfirm }) {
  const [qty, setQty] = useState({});
  const [motivo, setMotivo] = useState("");
  const [refund, setRefund] = useState("dinheiro");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sale) {
      setQty(Object.fromEntries((sale.items || []).map((i) => [i.product_id, i.quantity])));
      setMotivo("");
    }
  }, [sale]);

  if (!sale) return null;

  const items = (sale.items || [])
    .map((i) => ({ ...i, quantity: Number(qty[i.product_id]) || 0 }))
    .filter((i) => i.quantity > 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const valid = items.length > 0 && motivo.trim().length >= 5;

  const submit = async () => {
    setLoading(true);
    await onConfirm({
      items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      motivo, refund_method: refund,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Devolução de venda</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {(sale.items || []).map((i) => (
              <div key={i.product_id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{i.name}</p>
                  <p className="text-xs text-muted-foreground">vendidos: {i.quantity} · {brl(i.price)}</p>
                </div>
                <Input type="number" min="0" max={i.quantity} className="w-20"
                  value={qty[i.product_id] ?? 0}
                  onChange={(e) => setQty({ ...qty, [i.product_id]: e.target.value })} />
              </div>
            ))}
          </div>
          <div>
            <Label>Motivo da devolução</Label>
            <Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: produto com defeito relatado pelo cliente" />
          </div>
          <div>
            <Label>Forma de estorno</Label>
            <Select value={refund} onValueChange={setRefund}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="credito">Crédito</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="credito_loja">Crédito na loja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm">Total a devolver: <strong>{brl(total)}</strong> · estoque retornado e nota de devolução emitida.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button disabled={!valid || loading} onClick={submit}>
            {loading ? "Registrando..." : "Confirmar devolução"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}