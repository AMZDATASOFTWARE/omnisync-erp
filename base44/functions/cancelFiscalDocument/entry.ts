import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getDriver, validateCancel } from '../../shared/fiscal.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sale_id, justificativa } = await req.json().catch(() => ({}));
    if (!sale_id) return Response.json({ success: false, message: 'sale_id é obrigatório.' }, { status: 400 });

    const sale = await base44.entities.Sale.get(sale_id).catch(() => null);
    if (!sale) return Response.json({ success: false, message: 'Venda não encontrada.' }, { status: 404 });

    const errors = validateCancel(sale, justificativa);
    if (errors.length) return Response.json({ success: false, message: errors.join(' ') });

    const configs = await base44.entities.FiscalConfig.list('-created_date', 1);
    const driver = getDriver(configs[0]?.driver || 'sandbox');
    const result = await driver.cancel(sale.fiscal_key, justificativa.trim());

    if (!result.success) {
      await base44.entities.Sale.update(sale.id, { fiscal_error: result.message || 'Falha no cancelamento.' });
      return Response.json({ success: false, message: result.message });
    }

    await base44.entities.Sale.update(sale.id, {
      fiscal_status: 'cancelada',
      fiscal_cancel_reason: justificativa.trim(),
      fiscal_canceled_at: new Date().toISOString(),
      fiscal_error: '',
    });

    return Response.json({ success: true, message: result.message, protocolo: result.protocolo });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}