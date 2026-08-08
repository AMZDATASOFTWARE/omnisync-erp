import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { lookupFiscalData } from '../../shared/ncm.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || body.barcode || body.gtin || '').trim();
    if (!query) {
      return Response.json({ error: 'Informe o código de barras (GTIN/EAN) ou o nome do produto.' }, { status: 400 });
    }

    const result = await lookupFiscalData(base44, query);

    return Response.json({
      ...result,
      disclaimer: 'Dados obtidos por pesquisa web (Cosmos Bluesoft e fontes oficiais). Confira antes de salvar.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}