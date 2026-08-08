import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const empty = { name: "", code: "", cnpj: "", address: "", phone: "", is_default: false, active: true };

export default function StoreForm({ store, onSave, onCancel }) {
  const [form, setForm] = useState({ ...empty, ...(store || {}) });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="bg-card border border-border rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{store ? "Editar unidade" : "Nova unidade"}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input required placeholder="Nome da loja" value={form.name} onChange={set("name")} />
        <Input placeholder="Código (ex: MTZ)" value={form.code} onChange={set("code")} />
        <Input placeholder="CNPJ" value={form.cnpj} onChange={set("cnpj")} />
        <Input placeholder="Telefone" value={form.phone} onChange={set("phone")} />
        <Input className="sm:col-span-2" placeholder="Endereço" value={form.address} onChange={set("address")} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={!!form.is_default}
          onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
        Definir como unidade padrão
      </label>
      <div className="flex gap-2 pt-1">
        <Button type="submit">Salvar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}