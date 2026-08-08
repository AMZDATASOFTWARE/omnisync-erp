import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || body.barcode || body.gtin || '').trim();
    if (!query) return Response.json({ error: 'Informe o código de barras (GTIN/EAN) ou o nome do produto.' }, { status: 400 });

    const prompt = `Você é um assistente fiscal brasileiro. Pesquise na internet dados reais do produto identificado por: "${query}".
Consulte prioritariamente a base pública do Cosmos Bluesoft (https://cosmos.bluesoft.com.br/produtos/${encodeURIComponent(query)}) e, para a classificação fiscal, fontes oficiais brasileiras (tabela NCM/TIPI da Receita Federal, Convênio ICMS 142/2018 para CEST).
Retorne apenas dados que você realmente encontrou nas fontes. Se não encontrar o produto, retorne found=false e não invente nada.
Nunca invente NCM: só preencha se confirmado pela fonte. NCM tem 8 dígitos, CEST tem 7 dígitos (apenas números).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          found: { type: 'boolean' },
          name: { type: 'string' },
          brand: { type: 'string' },
          category: { type: 'string' },
          unit: { type: 'string' },
          gtin: { type: 'string' },
          ncm: { type: 'string' },
          ncm_description: { type: 'string' },
          cest: { type: 'string' },
          confidence: { type: 'string', enum: ['alta', 'media', 'baixa'] },
          sources: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' },
        },
        required: ['found'],
      },
    });

    const digits = (v, len) => {
      const d = String(v || '').replace(/\D/g, '');
      return d.length === len ? d : '';
    };

    return Response.json({
      ...result,
      ncm: digits(result?.ncm, 8),
      cest: digits(result?.cest, 7),
      query,
      disclaimer: 'Dados obtidos por pesquisa web (Cosmos Bluesoft e fontes oficiais). Confira antes de salvar.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}