import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildFiscalPayload, validatePayload, getDriver } from '../../shared/fiscal.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const saleId = body.sale_id;
    if (!saleId) return Response.json({ success: false, message: 'sale_id é obrigatório.' }, { status: 400 });

    const sale = await base44.entities.Sale.get(saleId).catch(() => null);
    if (!sale) return Response.json({ success: false, message: 'Venda não encontrada.' }, { status: 404 });
    if (sale.status === 'cancelada') {
      return Response.json({ success: false, message: 'Venda cancelada não pode ser emitida.' });
    }
    if (sale.fiscal_status === 'emitida') {
      return Response.json({ success: false, message: 'Documento já emitido para esta venda.' });
    }

    const products = await base44.entities.Product.list('name', 500);
    const configs = await base44.entities.FiscalConfig.list('-created_date', 1);
    const config = configs[0] || {};
    const taxRules = await base44.entities.TaxRule.list('ncm', 500).catch(() => []);
    const payload = buildFiscalPayload(sale, products, config, taxRules);

    const errors = validatePayload(payload);
    if (errors.length) {
      await base44.entities.Sale.update(saleId, { fiscal_status: 'pendente', fiscal_error: errors.join(' ') });
      return Response.json({ success: false, message: errors.join(' '), payload });
    }

    const driver = getDriver(config.driver || 'sandbox');
    const result = await driver.emit(payload);

    if (!result.success) {
      await base44.entities.Sale.update(saleId, { fiscal_status: 'pendente', fiscal_error: result.message });
      return Response.json({ success: false, message: result.message });
    }

    await base44.entities.Sale.update(saleId, {
      fiscal_status: 'emitida',
      fiscal_number: result.numero,
      fiscal_key: result.chave,
      fiscal_error: '',
    });

    return Response.json({ success: true, driver: driver.name, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}