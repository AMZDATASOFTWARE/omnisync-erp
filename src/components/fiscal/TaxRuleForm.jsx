import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const empty = { ncm: "", uf: "", description: "", cfop: "5102", csosn: "102", cst_icms: "00", aliquota_icms: 0, aliquota_pis: 0, aliquota_cofins: 0, cest: "", substituicao_tributaria: false, source: "manual" };

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default function TaxRuleForm({ rule, onSave, onCancel }) {
  const [form, setForm] = useState({ ...empty, ...(rule || {}) });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      ncm: (form.ncm || "").replace(/\D/g, ""),
      uf: (form.uf || "").toUpperCase(),
      aliquota_icms: Number(form.aliquota_icms) || 0,
      aliquota_pis: Number(form.aliquota_pis) || 0,
      aliquota_cofins: Number(form.aliquota_cofins) || 0,
      active: form.active !== false,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="NCM (8 dígitos)"><Input required value={form.ncm} onChange={(e) => set("ncm", e.target.value)} placeholder="09011110" /></Field>
        <Field label="UF (vazio = todas)"><Input value={form.uf} onChange={(e) => set("uf", e.target.value)} placeholder="CE" maxLength={2} /></Field>
      </div>
      <Field label="Descrição"><Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Café torrado — venda interna" /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="CFOP"><Input value={form.cfop} onChange={(e) => set("cfop", e.target.value)} /></Field>
        <Field label="CSOSN (Simples)"><Input value={form.csosn} onChange={(e) => set("csosn", e.target.value)} /></Field>
        <Field label="CST (Normal)"><Input value={form.cst_icms} onChange={(e) => set("cst_icms", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="ICMS %"><Input type="number" step="0.01" value={form.aliquota_icms} onChange={(e) => set("aliquota_icms", e.target.value)} /></Field>
        <Field label="PIS %"><Input type="number" step="0.01" value={form.aliquota_pis} onChange={(e) => set("aliquota_pis", e.target.value)} /></Field>
        <Field label="COFINS %"><Input type="number" step="0.01" value={form.aliquota_cofins} onChange={(e) => set("aliquota_cofins", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3 items-end">
        <Field label="CEST"><Input value={form.cest} onChange={(e) => set("cest", e.target.value)} /></Field>
        <label className="flex items-center gap-2 text-sm text-foreground pb-2">
          <input type="checkbox" checked={!!form.substituicao_tributaria} onChange={(e) => set("substituicao_tributaria", e.target.checked)} />
          Substituição tributária
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit">Salvar regra</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  );
}