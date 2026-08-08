import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildFiscalPayload, validatePayload, getDriver } from '../../shared/fiscal.js';

// Reprocessa a fila de contingência: vendas concluídas com NFC-e pendente ou em erro.
// Idempotente — vendas já emitidas ou canceladas são ignoradas.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit) || 50, 100);

    const [sales, products, configs, taxRules] = await Promise.all([
      base44.entities.Sale.filter({ status: 'concluida', fiscal_status: 'pendente' }, '-created_date', limit),
      base44.entities.Product.list('', 500),
      base44.entities.FiscalConfig.list('-created_date', 1),
      base44.entities.TaxRule.list('', 500),
    ]);

    const queue = body.store_id ? sales.filter((s) => s.store_id === body.store_id) : sales;
    const config = configs[0] || {};
    const driver = getDriver(config.driver || 'sandbox');

    const results = [];
    for (const sale of queue) {
      const payload = buildFiscalPayload(sale, products, config, taxRules);
      const errors = validatePayload(payload);
      if (errors.length) {
        await base44.entities.Sale.update(sale.id, { fiscal_error: errors.join(' ') });
        results.push({ sale_id: sale.id, success: false, message: errors.join(' ') });
        continue;
      }
      const result = await driver.emit(payload);
      if (result.success) {
        await base44.entities.Sale.update(sale.id, {
          fiscal_status: 'emitida',
          fiscal_number: result.numero,
          fiscal_key: result.chave,
          fiscal_error: '',
        });
      } else {
        await base44.entities.Sale.update(sale.id, { fiscal_error: result.message || 'Falha na emissão.' });
      }
      results.push({ sale_id: sale.id, success: result.success, message: result.message });
    }

    const emitidas = results.filter((r) => r.success).length;
    return Response.json({
      success: true,
      processed: results.length,
      emitidas,
      falhas: results.length - emitidas,
      message: `${emitidas} de ${results.length} documento(s) emitido(s).`,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}