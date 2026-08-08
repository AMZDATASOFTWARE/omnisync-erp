import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { validateVoid, eventDriver } from '../../shared/fiscalEvents.js';

// Inutilização de faixa de numeração fiscal (quebra de sequência).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const errors = validateVoid(body);
    if (errors.length) return Response.json({ success: false, message: errors.join(' ') }, { status: 400 });

    const result = await eventDriver.voidRange(body);

    const event = await base44.entities.FiscalEvent.create({
      store_id: body.store_id || '',
      tipo: 'inutilizacao',
      serie: String(body.serie),
      numero_inicial: Number(body.numero_inicial),
      numero_final: Number(body.numero_final),
      justificativa: body.justificativa.trim(),
      protocolo: result.protocolo,
      status: 'registrado',
      operador: user.full_name || user.email,
    });

    return Response.json({ success: true, protocolo: result.protocolo, event_id: event.id, message: result.message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}