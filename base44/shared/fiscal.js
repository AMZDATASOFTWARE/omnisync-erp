// Motor fiscal (SDD Parte 3): payload canônico + driver pattern.
// O payload é independente do emissor; cada driver traduz para o formato do provedor.

const CFOP_VENDA_INTERNA = "5102";
const ORIGEM_NACIONAL = "0";

// Regra tributária simplificada por regime. Substituir por tabela por NCM quando houver credenciais reais.
const REGIMES = {
  simples_nacional: { csosn: "102", aliquota_efetiva: 0 },
  regime_normal: { cst: "00", aliquota_efetiva: 0.18 },
};

const PAYMENT_CODES = {
  dinheiro: "01",
  credito: "03",
  debito: "04",
  pix: "17",
};

// Resolve a regra tributária: TaxRule[NCM+UF] → TaxRule[NCM, todas UFs] → null.
export function resolveTaxRule(ncm, uf, taxRules = []) {
  const actives = taxRules.filter((r) => r.active !== false && r.ncm === ncm);
  const byUf = actives.find((r) => (r.uf || "").toUpperCase() === (uf || "").toUpperCase() && r.uf);
  return byUf || actives.find((r) => !r.uf || r.uf === "*") || null;
}

export function buildFiscalPayload(sale, products, config = {}, taxRules = []) {
  const regime = config.regime || "simples_nacional";
  const rules = REGIMES[regime] || REGIMES.simples_nacional;
  const uf = config.uf || "CE";

  const items = (sale.items || []).map((item, idx) => {
    const product = products.find((p) => p.id === item.product_id) || {};
    const total = (item.price || 0) * (item.quantity || 0);
    const ncm = String(product.ncm || "").replace(/\D/g, "") || "00000000";
    const rule = resolveTaxRule(ncm, uf, taxRules);
    const aliquota = rule ? (Number(rule.aliquota_icms) || 0) / 100 : rules.aliquota_efetiva;
    const tributos = regime === "simples_nacional"
      ? { csosn: rule?.csosn || rules.csosn, valor_icms: 0 }
      : {
          cst: rule?.cst_icms || rules.cst,
          aliquota_icms: aliquota,
          valor_icms: Number((total * aliquota).toFixed(2)),
        };
    if (rule) {
      tributos.regra_id = rule.id || null;
      if (rule.aliquota_pis) tributos.valor_pis = Number((total * (rule.aliquota_pis / 100)).toFixed(2));
      if (rule.aliquota_cofins) tributos.valor_cofins = Number((total * (rule.aliquota_cofins / 100)).toFixed(2));
      if (rule.substituicao_tributaria) tributos.substituicao_tributaria = true;
    }
    return {
      numero: idx + 1,
      codigo: product.sku || item.product_id || String(idx + 1),
      descricao: item.name || product.name,
      ncm,
      cest: rule?.cest || product.cest || "",
      cfop: rule?.cfop || CFOP_VENDA_INTERNA,
      origem: ORIGEM_NACIONAL,
      unidade: product.unit || "un",
      quantidade: item.quantity || 0,
      valor_unitario: item.price || 0,
      valor_total: Number(total.toFixed(2)),
      tributos,
    };
  });

  const total = Number(items.reduce((s, i) => s + i.valor_total, 0).toFixed(2));

  return {
    modelo: "65", // NFC-e
    natureza_operacao: "Venda ao consumidor",
    regime_tributario: regime,
    emitente: {
      cnpj: config.cnpj || "",
      razao_social: config.razao_social || "",
      inscricao_estadual: config.inscricao_estadual || "",
      uf: config.uf || "CE",
    },
    destinatario: sale.customer_name ? { nome: sale.customer_name } : null,
    itens: items,
    pagamentos: [{ forma: PAYMENT_CODES[sale.payment_method] || "99", valor: sale.total ?? total }],
    totais: { valor_produtos: total, valor_total: sale.total ?? total },
    referencia_interna: sale.id,
  };
}

export function validatePayload(payload) {
  const errors = [];
  if (!payload.itens.length) errors.push("Venda sem itens.");
  if (payload.totais.valor_total <= 0) errors.push("Valor total inválido.");
  payload.itens.forEach((i) => {
    if (!/^\d{8}$/.test(i.ncm)) errors.push(`Produto "${i.descricao}" está sem NCM válido (8 dígitos).`);
  });
  return errors;
}

// --- Drivers ---------------------------------------------------------------
// Cada driver expõe emit(payload) => { success, numero, chave, protocolo, xml_url, message }

const sandboxDriver = {
  name: "sandbox",
  async emit(payload) {
    const numero = Math.floor(100000 + Math.random() * 899999);
    const chave = String(numero).padStart(6, "0") + Date.now().toString().slice(-38).padStart(38, "0");
    return {
      success: true,
      numero: String(numero),
      chave: chave.slice(0, 44),
      protocolo: "SANDBOX-" + Date.now(),
      message: "Documento emitido no ambiente de homologação (sandbox).",
    };
  },
  async cancel(chave, justificativa) {
    return {
      success: true,
      protocolo: "SANDBOX-CANC-" + Date.now(),
      chave,
      justificativa,
      message: "Cancelamento registrado no ambiente de homologação (sandbox).",
    };
  },
};

// Regra da SEFAZ: NFC-e só pode ser cancelada em até 30 minutos da autorização,
// com justificativa de no mínimo 15 caracteres.
export const CANCEL_WINDOW_MINUTES = 30;

export function validateCancel(sale, justificativa) {
  const errors = [];
  if (sale.fiscal_status !== "emitida") errors.push("Só é possível cancelar documentos já emitidos.");
  if (!justificativa || justificativa.trim().length < 15)
    errors.push("A justificativa deve ter no mínimo 15 caracteres.");
  const emitidoEm = new Date(sale.updated_date || sale.created_date).getTime();
  const minutos = (Date.now() - emitidoEm) / 60000;
  if (minutos > CANCEL_WINDOW_MINUTES)
    errors.push(`Prazo de cancelamento esgotado (${CANCEL_WINDOW_MINUTES} minutos após a emissão).`);
  return errors;
}

export function getDriver(name) {
  // Novos emissores (Focus NFe, NFe.io, TecnoSpeed) entram aqui sem alterar o restante do sistema.
  const drivers = { sandbox: sandboxDriver };
  return drivers[name] || sandboxDriver;
}