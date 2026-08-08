import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { withStore } from "@/lib/scope";

export default function OpenSessionCard({ onOpened }) {
  const [amount, setAmount] = useState("");
  const [operator, setOperator] = useState("");
  const [saving, setSaving] = useState(false);

  const open = async () => {
    setSaving(true);
    await base44.entities.CashSession.create(withStore({
      status: "aberto", opening_amount: Number(amount) || 0,
      opened_at: new Date().toISOString(), operator,
    }));
    onOpened();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 w-full max-w-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Caixa fechado</h2>
          <p className="text-sm text-slate-500 mt-1">Abra o caixa para iniciar as vendas.</p>
        </div>
        <Input placeholder="Nome do operador" value={operator} onChange={(e) => setOperator(e.target.value)} />
        <Input type="number" step="0.01" min="0" placeholder="Fundo de troco (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button onClick={open} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
          {saving ? "Abrindo…" : "Abrir caixa"}
        </Button>
      </div>
    </div>
  );
}