import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SupplierForm({ onSave, onCancel }) {
  const [f, setF] = useState({ name: "", cnpj: "", phone: "", email: "", category: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (f.name.trim()) onSave(f); }}>
      <div><Label>Nome / Razão social</Label><Input value={f.name} onChange={set("name")} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>CNPJ</Label><Input value={f.cnpj} onChange={set("cnpj")} /></div>
        <div><Label>Telefone</Label><Input value={f.phone} onChange={set("phone")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>E-mail</Label><Input value={f.email} onChange={set("email")} /></div>
        <div><Label>Categoria</Label><Input value={f.category} onChange={set("category")} /></div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
      </div>
    </form>
  );
}