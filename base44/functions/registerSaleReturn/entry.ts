import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getDriver } from '../../shared/fiscal.js';
import { validateReturn, buildReturnItems, returnTotal, buildReturnPayload } from '../../shared/returns.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sale_id, motivo, items, restock = true, refund_method = 'dinheiro', emit_fiscal = true, dry_run = false } = body;
    if (!sale_id) return Response.json({ success: false, message: 'sale_id é obrigatório.' }, { status: 400 });

    const sale = await base44.entities.Sale.get(sale_id).catch(() => null);
    if (!sale) return Response.json({ success: false, message: 'Venda não encontrada.' }, { status: 404 });

    const previous = await base44.entities.SaleReturn.filter({ sale_id }, '-created_date', 100).catch(() => []);
    const requested = items?.length ? items : (sale.items || []).map((i) => ({ product_id: i.product_id, quantity: i.quantity }));

    const errors = validateReturn(sale, requested, motivo, previous);
    if (errors.length) return Response.json({ success: false, message: errors.join(' ') });

    const returnItems = buildReturnItems(sale, requested);
    const total = returnTotal(returnItems);
    const soldQty = (sale.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    const prevQty = previous.reduce((s, r) => s + (r.items || []).reduce((a, i) => a + (Number(i.quantity) || 0), 0), 0);
    const retQty = returnItems.reduce((s, i) => s + i.quantity, 0);
    const tipo = prevQty + retQty >= soldQty ? 'total' : 'parcial';

    if (dry_run) return Response.json({ success: true, dry_run: true, tipo, total, items: returnItems });

    const record = await base44.entities.SaleReturn.create({
      store_id: sale.store_id || '',
      sale_id,
      sale_fiscal_key: sale.fiscal_key || '',
      sale_fiscal_number: sale.fiscal_number || '',
      customer_name: sale.customer_name || '',
      customer_cpf_cnpj: sale.customer_cpf_cnpj || '',
      motivo,
      tipo,
      items: returnItems,
      total,
      restock: !!restock,
      refund_method,
      fiscal_status: emit_fiscal ? 'pendente' : 'nao_aplicavel',
      operador: user.full_name || user.email || '',
    });

    // Retorno de estoque
    if (restock) {
      for (const item of returnItems) {
        const product = await base44.entities.Product.get(item.product_id).catch(() => null);
        if (product) {
          await base44.entities.Product.update(product.id, {
            stock_quantity: (Number(product.stock_quantity) || 0) + item.quantity,
          });
        }
      }
    }

    // Estorno financeiro (saída de caixa)
    const entry = await base44.entities.FinancialEntry.create({
      store_id: sale.store_id || '',
      type: 'pagar',
      description: `Devolução de venda${sale.fiscal_number ? ` (nota ${sale.fiscal_number})` : ''} — ${motivo}`,
      amount: total,
      status: refund_method === 'credito_loja' ? 'pendente' : 'pago',
      category: 'Devolução de venda',
      related_party: sale.customer_name || 'Consumidor',
      sale_id,
    });
    await base44.entities.SaleReturn.update(record.id, { financial_entry_id: entry.id });

    let fiscal = null;
    if (emit_fiscal) {
      const products = await base44.entities.Product.list('name', 500);
      const configs = await base44.entities.FiscalConfig.list('-created_date', 1);
      const config = configs[0] || {};
      const taxRules = await base44.entities.TaxRule.list('ncm', 500).catch(() => []);
      const payload = buildReturnPayload(sale, returnItems, products, config, taxRules, '55');
      const driver = getDriver(config.driver || 'sandbox');
      const result = await driver.emit(payload);
      fiscal = result;
      await base44.entities.SaleReturn.update(record.id, result.success
        ? { fiscal_status: 'emitida', fiscal_number: result.numero, fiscal_key: result.chave, fiscal_error: '' }
        : { fiscal_status: 'erro', fiscal_error: result.message });
    }

    return Response.json({
      success: true,
      return_id: record.id,
      tipo,
      total,
      restocked: !!restock,
      fiscal,
      message: `Devolução ${tipo} de R$ ${total.toFixed(2)} registrada${restock ? ', estoque retornado' : ''}${fiscal?.success ? `, nota de devolução ${fiscal.numero} emitida` : ''}.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}