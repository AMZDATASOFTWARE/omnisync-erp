// Regras de validade para a UI (espelham base44/shared/batch.js)

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export function expiryStatus(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return "ok";
  if (d < 0) return "vencido";
  if (d <= 7) return "critico";
  if (d <= 30) return "proximo";
  return "ok";
}

export const EXPIRY_STYLE = {
  ok: { label: "Ok", cls: "bg-slate-100 text-slate-600" },
  proximo: { label: "Vence em breve", cls: "bg-amber-100 text-amber-700" },
  critico: { label: "Crítico", cls: "bg-orange-100 text-orange-700" },
  vencido: { label: "Vencido", cls: "bg-red-100 text-red-700" },
};

export function sortFEFO(batches) {
  return [...batches].sort((a, b) => {
    if (!a.expiry_date) return 1;
    if (!b.expiry_date) return -1;
    return a.expiry_date.localeCompare(b.expiry_date);
  });
}