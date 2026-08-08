// Resolução de dados fiscais oficiais do produto (NCM/CEST) por pesquisa web assistida.
// Fontes: Cosmos Bluesoft + tabela NCM/TIPI da Receita Federal + Convênio ICMS 142/2018 (CEST).

export const digitsOfLength = (v, len) => {
  const d = String(v || "").replace(/\D/g, "");
  return d.length === len ? d : "";
};

export const LOOKUP_SCHEMA = {
  type: "object",
  properties: {
    found: { type: "boolean" },
    name: { type: "string" },
    brand: { type: "string" },
    category: { type: "string" },
    unit: { type: "string" },
    gtin: { type: "string" },
    ncm: { type: "string" },
    ncm_description: { type: "string" },
    cest: { type: "string" },
    confidence: { type: "string", enum: ["alta", "media", "baixa"] },
    sources: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
  required: ["found"],
};

export function lookupPrompt(query) {
  return `Você é um assistente fiscal brasileiro. Pesquise na internet dados reais do produto identificado por: "${query}".
Consulte prioritariamente a base pública do Cosmos Bluesoft (https://cosmos.bluesoft.com.br/produtos/${encodeURIComponent(query)}) e, para a classificação fiscal, fontes oficiais brasileiras (tabela NCM/TIPI da Receita Federal, Convênio ICMS 142/2018 para CEST).
Retorne apenas dados que você realmente encontrou nas fontes. Se não encontrar o produto, retorne found=false e não invente nada.
Nunca invente NCM: só preencha se confirmado pela fonte. NCM tem 8 dígitos, CEST tem 7 dígitos (apenas números).`;
}

export async function lookupFiscalData(base44, query) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: lookupPrompt(query),
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: LOOKUP_SCHEMA,
  });
  return {
    ...result,
    ncm: digitsOfLength(result?.ncm, 8),
    cest: digitsOfLength(result?.cest, 7),
    query,
  };
}

// NCM pode estar gravado com pontuação (1006.30.21) — o que vale é ter 8 dígitos.
export const normalizeNcm = (ncm) => String(ncm || "").replace(/\D/g, "");
export const hasValidNcm = (product) => normalizeNcm(product?.ncm).length === 8;