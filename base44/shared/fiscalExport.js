// Exportação fiscal (SDD 4i): livro fiscal em CSV e XML por documento emitido.

const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Livro de saídas: uma linha por documento fiscal (emitido ou cancelado).
export function buildFiscalBookCsv(sales) {
  const header = [
    "data", "numero", "chave", "situacao", "cliente", "cfop_predominante",
    "valor_total", "forma_pagamento", "itens",
  ];
  const rows = sales.map((s) => [
    (s.fiscal_emitted_at || s.updated_date || s.created_date || "").slice(0, 10),
    s.fiscal_number || "",
    s.fiscal_key || "",
    s.fiscal_status === "cancelada" ? "cancelada" : "emitida",
    s.customer_name || "CONSUMIDOR",
    "5102",
    Number(s.total || 0).toFixed(2),
    s.payment_method || "",
    (s.items || []).length,
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\n");
}

// XML simplificado no formato canônico do payload fiscal (layout de arquivamento interno).
export function buildDocumentXml(sale, payload) {
  const itens = (payload?.itens || []).map(
    (i) => `    <item numero="${i.numero}">
      <codigo>${esc(i.codigo)}</codigo>
      <descricao>${esc(i.descricao)}</descricao>
      <ncm>${esc(i.ncm)}</ncm>
      <cfop>${esc(i.cfop)}</cfop>
      <unidade>${esc(i.unidade)}</unidade>
      <quantidade>${i.quantidade}</quantidade>
      <valorUnitario>${Number(i.valor_unitario).toFixed(2)}</valorUnitario>
      <valorTotal>${Number(i.valor_total).toFixed(2)}</valorTotal>
    </item>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<documentoFiscal modelo="65" situacao="${esc(sale.fiscal_status)}">
  <chave>${esc(sale.fiscal_key)}</chave>
  <numero>${esc(sale.fiscal_number)}</numero>
  <emitente>
    <cnpj>${esc(payload?.emitente?.cnpj)}</cnpj>
    <razaoSocial>${esc(payload?.emitente?.razao_social)}</razaoSocial>
    <uf>${esc(payload?.emitente?.uf)}</uf>
  </emitente>
  <destinatario>${esc(sale.customer_name || "CONSUMIDOR")}</destinatario>
  <itens>
${itens}
  </itens>
  <total>${Number(sale.total || 0).toFixed(2)}</total>
  <pagamento>${esc(sale.payment_method)}</pagamento>
  <referenciaInterna>${esc(sale.id)}</referenciaInterna>
</documentoFiscal>`;
}

export function summarize(sales) {
  const emitidas = sales.filter((s) => s.fiscal_status === "emitida");
  const canceladas = sales.filter((s) => s.fiscal_status === "cancelada");
  return {
    documentos: sales.length,
    emitidas: emitidas.length,
    canceladas: canceladas.length,
    valor_total: Number(emitidas.reduce((a, s) => a + (s.total || 0), 0).toFixed(2)),
  };
}