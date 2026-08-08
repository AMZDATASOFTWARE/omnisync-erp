import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const empty = {
  tomador_nome: "", tomador_cpf_cnpj: "", tomador_email: "", descricao: "",
  codigo_tributacao_nacional: "", valor_servico: "", aliquota_iss: "", municipio_ibge: "",
};

export default function ServiceInvoiceForm({ config, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      ...form,
      valor_servico: Number(form.valor_servico) || 0,
      aliquota_iss: Number(form.aliquota_iss || config?.nfse_aliquota_iss || 0),
      municipio_ibge: form.municipio_ibge || config?.municipio_ibge || "",
      codigo_tributacao_nacional: form.codigo_tributacao_nacional || config?.nfse_codigo_servico_padrao || "",
      ambiente: config?.nfse_ambiente || "producao_restrita",
      competencia: new Date().toISOString().slice(0, 10),
      status: "rascunho",
    });
    setForm(empty);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="bg-card rounded-xl border border-border p-5 grid gap-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <p className="font-medium text-sm">Nova NFS-e de serviço</p>
        <p className="text-xs text-muted-foreground">Enviada à API do Padrão Nacional (gov.br) ao emitir.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Tomador</Label>
        <Input value={form.tomador_nome} onChange={(e) => set("tomador_nome", e.target.value)} placeholder="Nome do cliente" />
      </div>
      <div className="space-y-1.5">
        <Label>CPF/CNPJ do tomador</Label>
        <Input value={form.tomador_cpf_cnpj} onChange={(e) => set("tomador_cpf_cnpj", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>E-mail</Label>
        <Input value={form.tomador_email} onChange={(e) => set("tomador_email", e.target.value)} />
      </div>
      <div className="space-y-1.5 md:col-span-3">
        <Label>Descrição do serviço *</Label>
        <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} required rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label>Código de tributação nacional *</Label>
        <Input value={form.codigo_tributacao_nacional} onChange={(e) => set("codigo_tributacao_nacional", e.target.value)}
          placeholder={config?.nfse_codigo_servico_padrao || "ex: 010101"} />
      </div>
      <div className="space-y-1.5">
        <Label>Valor do serviço (R$) *</Label>
        <Input type="number" step="0.01" required value={form.valor_servico} onChange={(e) => set("valor_servico", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Alíquota ISS (%)</Label>
        <Input type="number" step="0.01" value={form.aliquota_iss} onChange={(e) => set("aliquota_iss", e.target.value)}
          placeholder={String(config?.nfse_aliquota_iss ?? 0)} />
      </div>
      <div className="md:col-span-3">
        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar NFS-e"}</Button>
      </div>
    </form>
  );
}