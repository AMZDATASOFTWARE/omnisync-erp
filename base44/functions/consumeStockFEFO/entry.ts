import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { allocateFEFO, expiryStatus } from '../../shared/batch.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const quantity = Number(body.quantity || 0);
    const key = (body.sku || body.product_id || '').trim();
    const dryRun = body.dry_run === true;
    if (!key || quantity <= 0) return Response.json({ ok: false, reason: 'sku_and_quantity_required' });

    const products = await base44.entities.Product.list('name', 500);
    const product = products.find(
      (p) => p.id === key || (p.sku || '').toLowerCase() === key.toLowerCase() || p.barcode === key
    );
    if (!product) return Response.json({ ok: false, reason: 'product_not_found' });

    const batches = await base44.entities.StockBatch.filter({ product_id: product.id });
    const { allocations, shortage } = allocateFEFO(batches, quantity);

    if (dryRun) {
      return Response.json({ ok: shortage === 0, dry_run: true, product_name: product.name, allocations, shortage });
    }

    for (const a of allocations) {
      await base44.entities.StockBatch.update(a.batch_id, {
        quantity: a.remaining_in_batch,
        status: a.remaining_in_batch <= 0 ? 'esgotado' : 'ativo',
      });
    }

    const consumed = quantity - shortage;
    if (consumed > 0) {
      await base44.entities.Product.update(product.id, {
        stock_quantity: Math.max((product.stock_quantity || 0) - consumed, 0),
      });
    }

    return Response.json({
      ok: shortage === 0,
      product_id: product.id,
      product_name: product.name,
      consumed,
      shortage,
      allocations: allocations.map((a) => ({ ...a, expiry_status: expiryStatus(a.expiry_date) })),
      message:
        shortage > 0
          ? `Baixados ${consumed} de ${quantity} — faltam ${shortage} em lotes disponíveis.`
          : `Baixados ${consumed} seguindo FEFO (lote mais próximo do vencimento primeiro).`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}