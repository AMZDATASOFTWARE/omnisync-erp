import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { notifyAdmins, brl } from '../../shared/notify.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sales = await base44.asServiceRole.entities.Sale.list("-created_date", 500);

    const today = new Date().toISOString().slice(0, 10);
    const day = sales.filter((s) => (s.created_date || "").slice(0, 10) === today && s.status !== "cancelada");

    const total = day.reduce((s, x) => s + (x.total || 0), 0);
    const ticket = day.length ? total / day.length : 0;
    const byPayment = day.reduce((acc, s) => {
      const k = s.payment_method || "outros";
      acc[k] = (acc[k] || 0) + (s.total || 0);
      return acc;
    }, {});
    const pendingFiscal = day.filter((s) => s.fiscal_status === "pendente").length;

    const body = [
      `Resumo do dia ${new Date().toLocaleDateString("pt-BR")}:`,
      ``,
      `Faturamento: ${brl(total)}`,
      `Vendas: ${day.length} · Ticket médio: ${brl(ticket)}`,
      ``,
      `Por forma de pagamento:`,
      ...Object.entries(byPayment).map(([k, v]) => `• ${k}: ${brl(v)}`),
      ``,
      `Documentos fiscais pendentes: ${pendingFiscal}`,
    ].join("\n");

    const notified = await notifyAdmins(base44, `📊 Resumo de vendas — ${brl(total)} hoje`, body);
    return Response.json({ total, sales: day.length, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}