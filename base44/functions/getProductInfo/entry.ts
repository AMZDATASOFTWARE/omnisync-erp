import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { matchProducts, productSummary, humanReadable } from '../../shared/locate.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = body.query || '';
    const limit = Math.min(body.limit || 3, 10);

    if (!query.trim()) {
      return Response.json({ matches: 0, products: [], disambiguation_needed: false });
    }

    const products = await base44.entities.Product.list('name', 500);
    const ranked = matchProducts(products, query);
    const top = ranked.slice(0, limit);

    // Antecipa a localização (SDD 1.5): evita um segundo round-trip no caso mais comum
    const maps = await base44.entities.StoreMap.list('', 1);
    const zones = maps[0]?.zones || [];

    const result = top.map(({ p }) => {
      const summary = productSummary(p);
      const zone = zones.find((z) => z.id === p.map_zone_id);
      return {
        ...summary,
        location_hint: zone ? humanReadable(zone, p.shelf_label) : null,
      };
    });

    const disambiguation_needed =
      top.length > 1 && top[0].score === top[1].score;

    return Response.json({
      matches: ranked.length,
      products: result,
      disambiguation_needed,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}