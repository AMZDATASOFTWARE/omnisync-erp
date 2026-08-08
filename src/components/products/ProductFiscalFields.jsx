import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ORIGINS = [
  { v: "0", l: "0 — Nacional" },
  { v: "1", l: "1 — Importação direta" },
  { v: "2", l: "2 — Mercado interno importado" },
  { v: "3", l: "3 — Nacional > 40% importado" },
  { v: "4", l: "4 — Produção conforme processos" },
  { v: "5", l: "5 — Nacional < 40% importado" },
  { v: "6", l: "6 — Importação direta sem similar" },
  { v: "7", l: "7 — Mercado interno sem similar" },
  { v: "8", l: "8 — Nacional > 70% importado" },
];

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-500">{label}</Label>
    {children}
  </div>
);

export default function ProductFiscalFields({ f, set, setF }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="NCM"><Input value={f.ncm} onChange={set("ncm")} placeholder="8205.40.00" /></Field>
      <Field label="CEST"><Input value={f.cest} onChange={set("cest")} /></Field>
      <Field label="CFOP padrão"><Input value={f.cfop_default} onChange={set("cfop_default")} placeholder="5102" /></Field>
      <Field label="Origem da mercadoria">
        <Select value={String(f.tax_origin ?? "0")} onValueChange={(v) => setF({ ...f, tax_origin: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ORIGINS.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
    </div>
  );
}