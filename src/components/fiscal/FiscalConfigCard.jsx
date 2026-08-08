import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FiscalConfigCard({ config, onSave }) {
  const [form, setForm] = useState({ regime: "simples_nacional", uf: "CE", ...config });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border p-5 grid gap-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <p className="font-medium text-sm">Dados do emitente</p>
        <p className="text-xs text-muted-foreground">Usados em todo documento fiscal emitido.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Razão social</Label>
        <Input value={form.razao_social || ""} onChange={(e) => set("razao_social", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>CNPJ</Label>
        <Input value={form.cnpj || ""} onChange={(e) => set("cnpj", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Inscrição estadual</Label>
        <Input value={form.inscricao_estadual || ""} onChange={(e) => set("inscricao_estadual", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>UF</Label>
        <Input maxLength={2} value={form.uf || ""} onChange={(e) => set("uf", e.target.value.toUpperCase())} />
      </div>
      <div className="space-y-1.5">
        <Label>Regime tributário</Label>
        <Select value={form.regime} onValueChange={(v) => set("regime", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
            <SelectItem value="regime_normal">Regime Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-3 pt-2 border-t">
        <p className="font-medium text-sm">NFS-e — Padrão Nacional (gov.br)</p>
        <p className="text-xs text-muted-foreground">Dados exigidos pela API nacional de nota de serviço.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Inscrição municipal</Label>
        <Input value={form.inscricao_municipal || ""} onChange={(e) => set("inscricao_municipal", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Município (código IBGE)</Label>
        <Input maxLength={7} value={form.municipio_ibge || ""} onChange={(e) => set("municipio_ibge", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Ambiente NFS-e</Label>
        <Select value={form.nfse_ambiente || "producao_restrita"} onValueChange={(v) => set("nfse_ambiente", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="producao_restrita">Produção restrita (homologação)</SelectItem>
            <SelectItem value="producao">Produção</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Código de serviço padrão</Label>
        <Input value={form.nfse_codigo_servico_padrao || ""} onChange={(e) => set("nfse_codigo_servico_padrao", e.target.value)} placeholder="ex: 010101" />
      </div>
      <div className="space-y-1.5">
        <Label>Alíquota ISS padrão (%)</Label>
        <Input type="number" step="0.01" value={form.nfse_aliquota_iss ?? ""} onChange={(e) => set("nfse_aliquota_iss", Number(e.target.value))} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar configurações"}</Button>
      </div>
    </form>
  );
}