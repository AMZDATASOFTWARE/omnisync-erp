// Regras de lote/validade compartilhadas (FEFO).

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

// ok | proximo (<=30d) | critico (<=7d) | vencido
export function expiryStatus(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return "ok";
  if (d < 0) return "vencido";
  if (d <= 7) return "critico";
  if (d <= 30) return "proximo";
  return "ok";
}

// FEFO: primeiro a vencer, primeiro a sair. Lotes sem validade vão por último.
export function sortFEFO(batches) {
  return [...batches].sort((a, b) => {
    if (!a.expiry_date) return 1;
    if (!b.expiry_date) return -1;
    return a.expiry_date.localeCompare(b.expiry_date);
  });
}

// Calcula a alocação de uma baixa entre os lotes disponíveis.
export function allocateFEFO(batches, quantity) {
  const usable = sortFEFO(
    batches.filter((b) => (b.quantity || 0) > 0 && b.status !== "bloqueado" && b.status !== "vencido")
  );
  const allocations = [];
  let remaining = quantity;
  for (const b of usable) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    remaining -= take;
    allocations.push({
      batch_id: b.id,
      lot_code: b.lot_code || "",
      expiry_date: b.expiry_date || null,
      taken: take,
      remaining_in_batch: b.quantity - take,
    });
  }
  return { allocations, shortage: remaining };
}