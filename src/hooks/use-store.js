import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const KEY = "omnisync.active_store";

export function activeStoreId() {
  return localStorage.getItem(KEY) || "";
}

// Carrega as unidades e mantém a loja ativa em localStorage.
export function useStores() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(activeStoreId());
  const [loading, setLoading] = useState(true);

  const reload = () =>
    base44.entities.Store.list("name", 100).then((list) => {
      setStores(list);
      setLoading(false);
      setStoreId((current) => {
        const valid = list.some((s) => s.id === current);
        const next = valid ? current : (list.find((s) => s.is_default) || list[0])?.id || "";
        if (next !== current) localStorage.setItem(KEY, next);
        return next;
      });
      return list;
    });

  useEffect(() => { reload(); }, []);

  const selectStore = (id) => {
    localStorage.setItem(KEY, id);
    setStoreId(id);
    window.location.reload(); // recarrega os dados no escopo da nova unidade
  };

  return { stores, storeId, store: stores.find((s) => s.id === storeId) || null, loading, selectStore, reload };
}