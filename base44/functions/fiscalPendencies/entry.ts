import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { lookupFiscalData, hasValidNcm } from '../../shared/ncm.js';

// Lista (e opcionalmente corrige) os cadastros que bloqueiam a emissão fiscal:
// produtos ativos sem NCM válido de 8 dígitos.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const products = await base44.entities.Product.list('name', 500);
    let pending = products.filter((p) => p.active !== false && !hasValidNcm(p));
    if (body.store_id) pending = pending.filter((p) => !p.store_id || p.store_id === body.store_id);
    if (body.product_id) pending = pending.filter((p) => p.id === body.product_id);

    if (!body.auto_fix) {
      return Response.json({
        success: true,
        pending_count: pending.length,
        message: pending.length
          ? `${pending.length} produto(s) sem NCM válido bloqueiam a emissão fiscal.`
          : 'Nenhuma pendência de cadastro fiscal.',
        pending: pending.map((p) => ({ id: p.id, name: p.name, sku: p.sku, barcode: p.barcode, ncm: p.ncm || '' })),
      });
    }

    const limit = Math.min(Number(body.limit) || 10, 20);
    const results = [];
    for (const p of pending.slice(0, limit)) {
      const data = await lookupFiscalData(base44, p.barcode || p.name);
      if (data.found && data.ncm) {
        if (!body.dry_run) {
          await base44.entities.Product.update(p.id, { ncm: data.ncm, cest: data.cest || p.cest || '' });
        }
        results.push({ id: p.id, name: p.name, ncm: data.ncm, cest: data.cest, sources: data.sources || [], updated: !body.dry_run });
      } else {
        results.push({ id: p.id, name: p.name, updated: false, message: 'NCM não encontrado nas fontes oficiais.' });
      }
    }

    const updated = results.filter((r) => r.updated).length;
    return Response.json({
      success: true,
      pending_count: pending.length,
      processed: results.length,
      updated,
      dry_run: !!body.dry_run,
      message: `${updated} de ${results.length} produto(s) com NCM preenchido a partir de fontes oficiais.`,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}