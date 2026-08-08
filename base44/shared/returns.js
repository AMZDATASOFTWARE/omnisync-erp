// Devolução de venda: validação e payload fiscal canônico de entrada (CFOP 1202/2202).
import { resolveTaxRule } from './fiscal.js';

const CFOP_DEVOLUCAO_INTERNA = '1202';
const CFOP_DEVOLUCAO_INTERESTADUAL = '2202';

// Soma o que já foi devolvido por produto em devoluções anteriores da mesma venda.
export function returnedByProduct(previousReturns = []) {
  const map = {};
  previousReturns.forEach((r) => {
    (r.items || []).forEach((i) => {
      map[i.product_id] = (map[i.product_id] || 0) + (Number(i.quantity) || 0);
    });
  });
  return map;
}

export function validateReturn(sale, items, motivo, previousReturns = []) {
  const errors = [];
  if (!sale) return ['Venda não encontrada.'];
  if (sale.status === 'cancelada') errors.push('Venda cancelada não pode ser devolvida.');
  if (!motivo || motivo.trim().length < 5) errors.push('Informe o motivo da devolução (mín. 5 caracteres).');
  if (!items?.length) errors.push('Selecione ao menos um item para devolver.');

  const already = returnedByProduct(previousReturns);
  (items || []).forEach((item) => {
    const sold = (sale.items || []).find((i) => i.product_id === item.product_id);
    if (!sold) {
      errors.push(`Item "${item.name || item.product_id}" não pertence a esta venda.`);
      return;
    }
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) errors.push(`Quantidade inválida para "${sold.name}".`);
    const disponivel = (Number(sold.quantity) || 0) - (already[item.product_id] || 0);
    if (qty > disponivel)
      errors.push(`"${sold.name}": disponível para devolução ${disponivel} (solicitado ${qty}).`);
  });
  return errors;
}

// Normaliza os itens da devolução com preço da venda de origem.
export function buildReturnItems(sale, items) {
  return (items || []).map((item) => {
    const sold = (sale.items || []).find((i) => i.product_id === item.product_id) || {};
    const quantity = Number(item.quantity) || 0;
    return {
      product_id: item.product_id,
      name: sold.name || item.name || '',
      quantity,
      price: Number(sold.price) || 0,
    };
  });
}

export function returnTotal(items) {
  return Number((items || []).reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));
}

export function buildReturnPayload(sale, items, products, config = {}, taxRules = [], modelo = '55') {
  const uf = config.uf || 'CE';
  const destUf = (sale.customer_uf || uf).toUpperCase();
  const cfop = destUf === uf.toUpperCase() ? CFOP_DEVOLUCAO_INTERNA : CFOP_DEVOLUCAO_INTERESTADUAL;

  const itens = items.map((item, idx) => {
    const product = products.find((p) => p.id === item.product_id) || {};
    const ncm = String(product.ncm || '').replace(/\D/g, '') || '00000000';
    const rule = resolveTaxRule(ncm, uf, taxRules);
    const total = Number((item.price * item.quantity).toFixed(2));
    return {
      numero: idx + 1,
      codigo: product.sku || item.product_id,
      descricao: item.name || product.name,
      ncm,
      cest: rule?.cest || product.cest || '',
      cfop,
      origem: '0',
      unidade: product.unit || 'un',
      quantidade: item.quantity,
      valor_unitario: item.price,
      valor_total: total,
      tributos: config.regime === 'regime_normal'
        ? { cst: rule?.cst_icms || '00', aliquota_icms: (Number(rule?.aliquota_icms) || 0) / 100 }
        : { csosn: rule?.csosn || '102', valor_icms: 0 },
    };
  });

  const total = Number(itens.reduce((s, i) => s + i.valor_total, 0).toFixed(2));

  return {
    modelo,
    finalidade: 'devolucao',
    natureza_operacao: 'Devolução de venda',
    regime_tributario: config.regime || 'simples_nacional',
    emitente: {
      cnpj: config.cnpj || '',
      razao_social: config.razao_social || '',
      inscricao_estadual: config.inscricao_estadual || '',
      uf,
    },
    destinatario: {
      nome: sale.customer_name || '',
      cpf_cnpj: (sale.customer_cpf_cnpj || '').replace(/\D/g, ''),
    },
    documento_referenciado: { chave: sale.fiscal_key || '', numero: sale.fiscal_number || '' },
    itens,
    pagamentos: [],
    totais: { valor_produtos: total, valor_total: total },
    referencia_interna: sale.id,
  };
}