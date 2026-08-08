import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { nfseBaseUrl, buildDpsXml, gzipBase64, validateNfse } from '../../shared/nfse.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (!body.invoice_id) {
      return Response.json({ success: false, message: 'invoice_id é obrigatório.' }, { status: 400 });
    }

    const invoice = await base44.entities.ServiceInvoice.get(body.invoice_id).catch(() => null);
    if (!invoice) return Response.json({ success: false, message: 'NFS-e não encontrada.' }, { status: 404 });
    if (invoice.status === 'emitida') {
      return Response.json({ success: false, message: 'Esta NFS-e já foi emitida.' });
    }

    const configs = await base44.entities.FiscalConfig.list('-created_date', 1);
    const config = configs[0] || {};

    const errors = validateNfse(invoice, config);
    if (errors.length) {
      await base44.entities.ServiceInvoice.update(invoice.id, { status: 'erro', error: errors.join(' ') });
      return Response.json({ success: false, message: errors.join(' ') });
    }

    const numero = Date.now().toString().slice(-9);
    const xml = buildDpsXml(invoice, config, numero);
    const dpsXmlGZipB64 = await gzipBase64(xml);
    const ambiente = invoice.ambiente || config.nfse_ambiente || 'producao_restrita';

    if (body.dry_run) {
      return Response.json({ success: true, dry_run: true, ambiente, xml, dpsXmlGZipB64 });
    }

    const resp = await fetch(`${nfseBaseUrl(ambiente)}/nfse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dpsXmlGZipB64 }),
    });
    const raw = await resp.text();
    let data = {};
    try { data = JSON.parse(raw); } catch (_e) { data = { resposta: raw.slice(0, 500) }; }

    if (!resp.ok) {
      const msg =
        data?.mensagem ||
        (Array.isArray(data?.erros) ? data.erros.map((e) => e.descricao || e.mensagem).join(' ') : '') ||
        `Erro ${resp.status} na API do Padrão Nacional. A emissão exige certificado digital ICP-Brasil (mTLS), não suportado por este ambiente.`;
      await base44.entities.ServiceInvoice.update(invoice.id, { status: 'erro', error: msg });
      return Response.json({ success: false, status: resp.status, message: msg, response: data });
    }

    await base44.entities.ServiceInvoice.update(invoice.id, {
      status: 'emitida',
      numero: String(data.nNFSe || numero),
      chave_acesso: data.chaveAcesso || '',
      dps_id: data.idDps || '',
      ambiente,
      error: '',
      valor_iss: Number(((invoice.valor_servico * (invoice.aliquota_iss || 0)) / 100).toFixed(2)),
    });

    return Response.json({ success: true, message: 'NFS-e autorizada pelo Padrão Nacional.', ...data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}