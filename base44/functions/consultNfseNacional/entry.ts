import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { nfseBaseUrl } from '../../shared/nfse.js';

// Consulta na API do Padrão Nacional:
// - { chave } → situação da NFS-e
// - { municipio_ibge, codigo_servico, competencia } → alíquota e parâmetros municipais
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ambiente = body.ambiente || 'producao_restrita';
    const base = nfseBaseUrl(ambiente);

    let url;
    if (body.chave) {
      url = `${base}/nfse/${body.chave}`;
    } else if (body.municipio_ibge && body.codigo_servico) {
      const comp = body.competencia || new Date().toISOString().slice(0, 10);
      url = `${base}/parametros_municipais/${body.municipio_ibge}/${body.codigo_servico}/aliquota?competencia=${comp}`;
    } else {
      return Response.json({ success: false, message: 'Informe chave ou município + código de serviço.' }, { status: 400 });
    }

    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    const raw = await resp.text();
    let data = {};
    try { data = JSON.parse(raw); } catch (_e) { data = { resposta: raw.slice(0, 500) }; }

    return Response.json({ success: resp.ok, status: resp.status, ambiente, url, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}