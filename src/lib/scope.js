// Escopo multi-loja: registros carregam store_id da unidade ativa.
// Registros sem store_id (legado ou cadastro global) são visíveis em todas as unidades.
import { activeStoreId } from "@/hooks/use-store";

export function withStore(data) {
  const id = activeStoreId();
  return id ? { ...data, store_id: id } : data;
}

export function ofStore(list) {
  const id = activeStoreId();
  if (!id) return list;
  return list.filter((r) => !r.store_id || r.store_id === id);
}