// Integração com a API do Padrão Nacional da NFS-e (Sefin Nacional / gov.br).
// Docs: https://www.gov.br/nfse/ · Ambientes: produção restrita (homologação) e produção.

export const NFSE_ENDPOINTS = {
  producao_restrita: "https://sefin.producaorestrita.nfse.gov.br/SefinNacional",
  producao: "https://sefin.nfse.gov.br/sefinnacional",
};

export function nfseBaseUrl(ambiente) {
  return NFSE_ENDPOINTS[ambiente] || NFSE_ENDPOINTS.producao_restrita;
}

const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

// Identificador da DPS: "DPS" + cLocEmi(7) + tpInsc(1) + inscricao(14) + serie(5) + nDPS(15)
export function buildDpsId({ municipio_ibge, cnpj, serie = "00001", numero }) {
  const doc = onlyDigits(cnpj);
  const tpInsc = doc.length === 14 ? "2" : "1";
  return (
    "DPS" +
    onlyDigits(municipio_ibge).padStart(7, "0") +
    tpInsc +
    doc.padStart(14, "0") +
    String(serie).padStart(5, "0") +
    String(numero).padStart(15, "0")
  );
}

export function validateNfse(invoice, config) {
  const errors = [];
  if (!config.cnpj) errors.push("CNPJ do emitente não configurado.");
  if (!config.municipio_ibge) errors.push("Código IBGE do município não configurado.");
  if (!config.inscricao_municipal) errors.push("Inscrição municipal não configurada.");
  if (!invoice.descricao) errors.push("Descrição do serviço é obrigatória.");
  if (!(invoice.valor_servico > 0)) errors.push("Valor do serviço deve ser maior que zero.");
  if (!invoice.codigo_tributacao_nacional) errors.push("Código de tributação nacional do serviço é obrigatório.");
  return errors;
}

// XML da DPS (Declaração de Prestação de Serviços) — leiaute nacional v1.00.
export function buildDpsXml(invoice, config, numero) {
  const municipio = onlyDigits(invoice.municipio_ibge || config.municipio_ibge);
  const id = buildDpsId({ municipio_ibge: municipio, cnpj: config.cnpj, numero });
  const competencia = invoice.competencia || new Date().toISOString().slice(0, 10);
  const valor = Number(invoice.valor_servico).toFixed(2);
  const aliquota = Number(invoice.aliquota_iss || 0).toFixed(2);
  const tomadorDoc = onlyDigits(invoice.tomador_cpf_cnpj);
  const tomadorTag =
    tomadorDoc.length === 14 ? `<CNPJ>${tomadorDoc}</CNPJ>` : tomadorDoc ? `<CPF>${tomadorDoc}</CPF>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infDPS Id="${id}">
    <tpAmb>${invoice.ambiente === "producao" ? "1" : "2"}</tpAmb>
    <dhEmi>${new Date().toISOString()}</dhEmi>
    <verAplic>OmniSyncERP-1.0</verAplic>
    <serie>00001</serie>
    <nDPS>${numero}</nDPS>
    <dCompet>${competencia}</dCompet>
    <tpEmit>1</tpEmit>
    <cLocEmi>${municipio}</cLocEmi>
    <prest>
      <CNPJ>${onlyDigits(config.cnpj)}</CNPJ>
      <IM>${esc(config.inscricao_municipal)}</IM>
      <regTrib>
        <opSimpNac>${config.regime === "simples_nacional" ? "2" : "1"}</opSimpNac>
        <regEspTrib>0</regEspTrib>
      </regTrib>
    </prest>
    ${tomadorTag ? `<toma>${tomadorTag}<xNome>${esc(invoice.tomador_nome)}</xNome>${invoice.tomador_email ? `<email>${esc(invoice.tomador_email)}</email>` : ""}</toma>` : ""}
    <serv>
      <locPrest><cLocPrestacao>${municipio}</cLocPrestacao></locPrest>
      <cServ>
        <cTribNac>${onlyDigits(invoice.codigo_tributacao_nacional)}</cTribNac>
        <xDescServ>${esc(invoice.descricao)}</xDescServ>
      </cServ>
    </serv>
    <valores>
      <vServPrest><vServ>${valor}</vServ></vServPrest>
      <trib>
        <tribMun>
          <tribISSQN>1</tribISSQN>
          <pAliq>${aliquota}</pAliq>
          <tpRetISSQN>${invoice.iss_retido ? "2" : "1"}</tpRetISSQN>
        </tribMun>
        <totTrib><indTotTrib>0</indTotTrib></totTrib>
      </trib>
    </valores>
  </infDPS>
</DPS>`;
}

// A API nacional recebe o XML da DPS compactado em GZip e codificado em Base64.
export async function gzipBase64(text) {
  const stream = new Blob([new TextEncoder().encode(text)]).stream().pipeThrough(new CompressionStream("gzip"));
  const buf = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  buf.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}