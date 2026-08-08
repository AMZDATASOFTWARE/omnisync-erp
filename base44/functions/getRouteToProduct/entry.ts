import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { productZoneId } from '../../shared/locate.js';
import { routeToCell } from '../../shared/route.js';

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
    const placements = await base44.entities.ProductPlacement.filter({ product_id: product.id });
    const placement = placements.find((pl) => pl.is_primary) || placements[0];
    const zoneId = placement?.zone_id || productZoneId(product);
    const zone = map?.zones?.find((z) => z.id === zoneId);

    if (!zone) {
      return Response.json({
        sku, found: false, reason: 'not_mapped',
        voice_answer: `Ainda não sei o caminho: ${product.name} não tem localização no mapa da loja.`,
      });
    }

    const shelf = map?.shelves?.find((s) => s.id === placement?.shelf_id);
    const target = shelf ? { x: shelf.x, y: shelf.y } : zone.cells?.[0];
    if (!target) {
      return Response.json({ sku, found: false, reason: 'zone_without_cells', zone_label: zone.label });
    }

    const route = routeToCell(map, target);
    if (!route.ok) {
      return Response.json({
        sku, found: false, reason: route.reason, zone_label: zone.label,
        voice_answer: route.reason === 'no_entrance'
          ? 'Não há uma zona do tipo "entrada" cadastrada no mapa, então não consigo traçar a rota.'
          : `Não encontrei um caminho livre até ${zone.label} na planta da loja.`,
      });
    }

    return Response.json({
      sku: product.sku || product.id,
      found: true,
      product_name: product.name,
      zone_id: zone.id,
      zone_label: zone.label,
      shelf_label: placement?.shelf_label || '',
      level: placement?.level ?? null,
      distance_steps: route.distance,
      steps: route.steps,
      path: route.path,
      map_url: `/mapa?zone=${encodeURIComponent(zone.id)}&product=${encodeURIComponent(product.id)}`,
      voice_answer: `Da entrada até ${product.name}: ${route.steps.join('. ')}. Chegou em ${zone.label}.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}