import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildFiscalPayload } from '../../shared/fiscal.js';
import { buildFiscalBookCsv, buildDocumentXml, summarize } from '../../shared/fiscalExport.js';

// Exporta o livro fiscal de saídas (CSV) e o XML de arquivamento de cada documento.
// Parâmetros: { from?: 'YYYY-MM-DD', to?: 'YYYY-MM-DD', store_id?, include_xml?: boolean }
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const from = body.from || '';
    const to = body.to || '';

    const [sales, products, configs, taxRules] = await Promise.all([
      base44.entities.Sale.list('-created_date', 500),
      base44.entities.Product.list('', 500),
      base44.entities.FiscalConfig.list('-created_date', 1),
      base44.entities.TaxRule.list('', 500),
    ]);
    const config = configs[0] || {};

    const inPeriod = (s) => {
      const d = (s.updated_date || s.created_date || '').slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    };

    const docs = sales.filter(
      (s) =>
        ['emitida', 'cancelada'].includes(s.fiscal_status) &&
        (!body.store_id || s.store_id === body.store_id) &&
        inPeriod(s)
    );

    const csv = buildFiscalBookCsv(docs);
    const resumo = summarize(docs);

    const xmls = body.include_xml
      ? docs.map((s) => ({
          sale_id: s.id,
          numero: s.fiscal_number,
          chave: s.fiscal_key,
          xml: buildDocumentXml(s, buildFiscalPayload(s, products, config, taxRules)),
        }))
      : [];

    return Response.json({
      success: true,
      periodo: { from: from || null, to: to || null },
      resumo,
      csv,
      xmls,
      message: `${resumo.documentos} documento(s) no período — ${resumo.emitidas} emitida(s), ${resumo.canceladas} cancelada(s).`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}