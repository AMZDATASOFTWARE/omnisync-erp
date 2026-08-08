import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StoreForm from "@/components/lojas/StoreForm";
import StoreList from "@/components/lojas/StoreList";
import { useStores } from "@/hooks/use-store";

export default function Lojas() {
  const { stores, storeId, loading, selectStore, reload } = useStores();
  const [editing, setEditing] = useState(null); // objeto ou "new"

  const save = async (form) => {
    const payload = {
      name: form.name, code: form.code, cnpj: form.cnpj,
      address: form.address, phone: form.phone,
      is_default: !!form.is_default, active: form.active !== false,
    };
    if (payload.is_default) {
      await Promise.all(
        stores.filter((s) => s.is_default && s.id !== form.id).map((s) => base44.entities.Store.update(s.id, { is_default: false }))
      );
    }
    const saved = form.id ? await base44.entities.Store.update(form.id, payload) : await base44.entities.Store.create(payload);
    const list = await reload();
    if (!form.id && (list.length === 1 || payload.is_default)) selectStore(saved.id);
    setEditing(null);
  };

  const remove = async (store) => {
    if (!window.confirm(`Excluir a unidade "${store.name}"?`)) return;
    await base44.entities.Store.delete(store.id);
    await reload();
  };

  return (
    <div className="p-6 md:p-8 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Unidades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre as lojas da rede e escolha a unidade ativa — ela identifica as operações do sistema.
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing("new")}><Plus className="w-4 h-4" /> Nova unidade</Button>
        )}
      </div>

      {editing && (
        <StoreForm store={editing === "new" ? null : editing} onSave={save} onCancel={() => setEditing(null)} />
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Carregando unidades…</p>
        ) : (
          <StoreList stores={stores} storeId={storeId} onSelect={selectStore} onEdit={setEditing} onDelete={remove} />
        )}
      </div>
    </div>
  );
}