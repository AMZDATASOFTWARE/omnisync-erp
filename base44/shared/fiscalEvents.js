// Eventos fiscais sobre documentos já emitidos ou sobre a numeração (SDD 1.3).
// Regras da legislação: CC-e em até 720h da autorização, texto de 15 a 1000 caracteres,
// sem alterar valores, destinatário ou data; inutilização exige justificativa e faixa válida.

export const CORRECTION_WINDOW_HOURS = 720;
export const CORRECTION_MIN = 15;
export const CORRECTION_MAX = 1000;

const FORBIDDEN = [
  { re: /\bvalor(es)?\b|\btotal\b|\bpre[çc]o\b/i, msg: "A carta de correção não pode alterar valores." },
  { re: /\bquantidade\b/i, msg: "A carta de correção não pode alterar quantidades." },
  { re: /\bdestinat[áa]rio\b|\bcnpj\b|\bcpf\b/i, msg: "A carta de correção não pode alterar o destinatário." },
];

export function validateCorrection(sale, correcao) {
  const errors = [];
  const texto = (correcao || "").trim();
  if (sale?.fiscal_status !== "emitida") errors.push("Só documentos autorizados aceitam carta de correção.");
  if (texto.length < CORRECTION_MIN) errors.push(`A correção deve ter no mínimo ${CORRECTION_MIN} caracteres.`);
  if (texto.length > CORRECTION_MAX) errors.push(`A correção deve ter no máximo ${CORRECTION_MAX} caracteres.`);
  FORBIDDEN.forEach((f) => { if (f.re.test(texto)) errors.push(f.msg); });
  const emitidoEm = new Date(sale?.updated_date || sale?.created_date || Date.now()).getTime();
  if ((Date.now() - emitidoEm) / 3600000 > CORRECTION_WINDOW_HOURS)
    errors.push(`Prazo da carta de correção esgotado (${CORRECTION_WINDOW_HOURS}h após a autorização).`);
  return errors;
}

export function validateVoid({ serie, numero_inicial, numero_final, justificativa }) {
  const errors = [];
  const ini = Number(numero_inicial), fim = Number(numero_final);
  if (!serie) errors.push("Informe a série da numeração.");
  if (!ini || !fim || ini < 1 || fim < 1) errors.push("Informe a faixa de numeração a inutilizar.");
  if (ini && fim && fim < ini) errors.push("O número final deve ser maior ou igual ao inicial.");
  if (!justificativa || justificativa.trim().length < 15)
    errors.push("A justificativa deve ter no mínimo 15 caracteres.");
  return errors;
}

// Driver sandbox de eventos — mesmo contrato dos emissores reais.
export const eventDriver = {
  async correct(chave, correcao, sequencia) {
    return { success: true, protocolo: "SANDBOX-CCE-" + Date.now(), chave, correcao, sequencia,
      message: `Carta de correção nº ${sequencia} registrada no ambiente de homologação (sandbox).` };
  },
  async voidRange({ serie, numero_inicial, numero_final }) {
    return { success: true, protocolo: "SANDBOX-INUT-" + Date.now(),
      message: `Numeração ${numero_inicial}–${numero_final} da série ${serie} inutilizada no ambiente de homologação (sandbox).` };
  },
};