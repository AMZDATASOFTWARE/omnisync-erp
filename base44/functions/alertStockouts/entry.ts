import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { notifyAdmins } from '../../shared/notify.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const products = await base44.asServiceRole.entities.Product.list("name", 1000);

    const critical = products.filter((p) => {
      if (p.active === false) return false;
      const min = p.stock_min ?? p.min_stock ?? 0;
      return min > 0 && (p.stock_quantity || 0) <= min;
    });

    if (!critical.length) return Response.json({ count: 0, notified: [] });

    const lines = critical
      .slice(0, 50)
      .map((p) => `• ${p.name}${p.sku ? ` (${p.sku})` : ""} — saldo ${p.stock_quantity || 0} / mínimo ${p.stock_min ?? p.min_stock}`)
      .join("\n");

    const body = `Produtos em ruptura ou abaixo do estoque mínimo (${critical.length}):\n\n${lines}\n\nAbra /produtos para repor.`;
    const notified = await notifyAdmins(base44, `⚠️ ${critical.length} produto(s) precisando de reposição`, body);

    return Response.json({ count: critical.length, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}