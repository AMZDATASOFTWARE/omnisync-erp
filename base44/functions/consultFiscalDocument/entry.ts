import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CANCEL_WINDOW_MINUTES } from '../../shared/fiscal.js';

// Consulta a situação de um documento fiscal de saída (NFC-e 65 / NF-e 55)
// por venda, chave de acesso ou número, com os eventos e devoluções ligados a ele.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sale_id, chave, numero } = body;

    let sale = null;
    if (sale_id) sale = await base44.entities.Sale.get(sale_id).catch(() => null);
    else if (chave) sale = (await base44.entities.Sale.filter({ fiscal_key: String(chave).replace(/\D/g, '') }, '-created_date', 1))[0];
    else if (numero) sale = (await base44.entities.Sale.filter({ fiscal_number: String(numero) }, '-created_date', 1))[0];
    else return Response.json({ success: false, message: 'Informe sale_id, chave ou numero.' }, { status: 400 });

    if (!sale) return Response.json({ success: false, found: false, message: 'Documento não encontrado.' });

    const [events, returns] = await Promise.all([
      base44.entities.FiscalEvent.filter({ sale_id: sale.id }, '-created_date', 20).catch(() => []),
      base44.entities.SaleReturn.filter({ sale_id: sale.id }, '-created_date', 20).catch(() => []),
    ]);

    const emitidoEm = sale.fiscal_status === 'emitida' ? new Date(sale.updated_date || sale.created_date) : null;
    const minutos = emitidoEm ? (Date.now() - emitidoEm.getTime()) / 60000 : null;

    return Response.json({
      success: true,
      found: true,
      documento: {
        sale_id: sale.id,
        modelo: sale.fiscal_modelo || '65',
        modelo_descricao: (sale.fiscal_modelo || '65') === '55' ? 'NF-e' : 'NFC-e',
        situacao: sale.fiscal_status,
        numero: sale.fiscal_number || null,
        chave: sale.fiscal_key || null,
        erro: sale.fiscal_error || null,
        cancelamento: sale.fiscal_status === 'cancelada'
          ? { justificativa: sale.fiscal_cancel_reason || null, em: sale.fiscal_canceled_at || null }
          : null,
        emitido_em: emitidoEm ? emitidoEm.toISOString() : null,
        pode_cancelar: minutos !== null && minutos <= CANCEL_WINDOW_MINUTES,
        destinatario: sale.customer_name || sale.customer_cpf_cnpj
          ? { nome: sale.customer_name || '', cpf_cnpj: sale.customer_cpf_cnpj || '' }
          : null,
        valor_total: sale.total,
        itens: (sale.items || []).length,
        store_id: sale.store_id || '',
      },
      eventos: events.map((e) => ({
        tipo: e.tipo, sequencia: e.sequencia, correcao: e.correcao || null,
        justificativa: e.justificativa || null, protocolo: e.protocolo || null, status: e.status,
      })),
      devolucoes: returns.map((r) => ({
        id: r.id, tipo: r.tipo, total: r.total, motivo: r.motivo,
        fiscal_status: r.fiscal_status, fiscal_number: r.fiscal_number || null,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}