import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { validateCorrection, eventDriver } from '../../shared/fiscalEvents.js';

// Carta de Correção Eletrônica (CC-e) sobre uma NFC-e/NF-e já autorizada.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sale_id, correcao } = await req.json();
    if (!sale_id) return Response.json({ error: 'Informe sale_id.' }, { status: 400 });

    const sale = await base44.entities.Sale.get(sale_id);
    if (!sale) return Response.json({ error: 'Venda não encontrada.' }, { status: 404 });

    const errors = validateCorrection(sale, correcao);
    if (errors.length) return Response.json({ success: false, message: errors.join(' ') }, { status: 400 });

    const previous = await base44.entities.FiscalEvent.filter({ sale_id, tipo: 'carta_correcao' });
    const sequencia = previous.length + 1;

    const result = await eventDriver.correct(sale.fiscal_key, correcao.trim(), sequencia);

    const event = await base44.entities.FiscalEvent.create({
      store_id: sale.store_id || '',
      tipo: 'carta_correcao',
      sale_id,
      chave: sale.fiscal_key || '',
      numero: sale.fiscal_number || '',
      sequencia,
      correcao: correcao.trim(),
      protocolo: result.protocolo,
      status: 'registrado',
      operador: user.full_name || user.email,
    });

    return Response.json({ success: true, sequencia, protocolo: result.protocolo, event_id: event.id, message: result.message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}