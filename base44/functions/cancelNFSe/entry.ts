import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { nfseBaseUrl } from '../../shared/nfse.js';

// Cancelamento de NFS-e no Padrão Nacional (evento de cancelamento sobre a chave de acesso).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invoice_id, motivo } = await req.json().catch(() => ({}));
    if (!invoice_id) return Response.json({ success: false, message: 'invoice_id é obrigatório.' }, { status: 400 });

    const invoice = await base44.entities.ServiceInvoice.get(invoice_id).catch(() => null);
    if (!invoice) return Response.json({ success: false, message: 'NFS-e não encontrada.' }, { status: 404 });
    if (invoice.status === 'cancelada') return Response.json({ success: false, message: 'NFS-e já cancelada.' });

    if (invoice.status !== 'emitida' || !invoice.chave_acesso) {
      await base44.entities.ServiceInvoice.update(invoice.id, { status: 'cancelada', error: motivo || '' });
      return Response.json({ success: true, message: 'Rascunho descartado — não havia nota autorizada.' });
    }

    const ambiente = invoice.ambiente || 'producao_restrita';
    const resp = await fetch(`${nfseBaseUrl(ambiente)}/nfse/${invoice.chave_acesso}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoEvento: 'CANCELAMENTO', motivo: motivo || 'Cancelamento a pedido do prestador' }),
    });
    const raw = await resp.text();
    let data = {};
    try { data = JSON.parse(raw); } catch (_e) { data = { resposta: raw.slice(0, 500) }; }

    if (!resp.ok) {
      const msg = data?.mensagem || `Erro ${resp.status} ao cancelar. O cancelamento exige certificado ICP-Brasil (mTLS).`;
      await base44.entities.ServiceInvoice.update(invoice.id, { error: msg });
      return Response.json({ success: false, status: resp.status, message: msg, response: data });
    }

    await base44.entities.ServiceInvoice.update(invoice.id, { status: 'cancelada', error: '' });
    return Response.json({ success: true, message: 'NFS-e cancelada no Padrão Nacional.', ...data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}