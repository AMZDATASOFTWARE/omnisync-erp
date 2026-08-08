import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { humanReadable, brl, productZoneId, productShelf } from '../../shared/locate.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sku = (body.sku || '').trim();
    if (!sku) return Response.json({ found: false, reason: 'sku_required' });

    const products = await base44.entities.Product.list('name', 500);
    const product = products.find(
      (p) => (p.sku || '').toLowerCase() === sku.toLowerCase() || p.id === sku || p.barcode === sku
    );
    if (!product) return Response.json({ sku, found: false, reason: 'product_not_found' });

    const maps = await base44.entities.StoreMap.list('', 1);
    const map = maps[0];
    const zone = map?.zones?.find((z) => z.id === productZoneId(product));

    if (!zone) {
      return Response.json({
        sku, found: false, reason: 'not_mapped',
        voice_answer: `O produto ${product.name} ainda não tem localização cadastrada no mapa da loja.`,
      });
    }

    const readable = humanReadable(zone, productShelf(product), product.pos_z);
    return Response.json({
      sku: product.sku || product.id,
      found: true,
      product_name: product.name,
      primary: {
        zone_id: zone.id,
        zone_label: zone.label,
        zone_type: zone.type,
        shelf_label: productShelf(product),
        level: product.pos_z ?? null,
        human_readable: readable,
      },
      map_url: `/mapa?zone=${encodeURIComponent(zone.id)}&product=${encodeURIComponent(product.id)}`,
      map_deep_link: `/mobile?sku=${encodeURIComponent(product.sku || product.id)}`,
      voice_answer: `${product.name} está em ${readable}. Preço ${brl(product.price)}, ${product.stock_quantity || 0} ${product.unit || 'un'} em estoque.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}