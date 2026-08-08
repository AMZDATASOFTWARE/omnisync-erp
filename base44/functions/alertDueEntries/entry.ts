import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { notifyAdmins, brl } from '../../shared/notify.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const entries = await base44.asServiceRole.entities.FinancialEntry.filter({ status: "pendente" }, "due_date", 500);

    const today = new Date().toISOString().slice(0, 10);
    const limit = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const overdue = entries.filter((e) => e.due_date && e.due_date < today);
    const soon = entries.filter((e) => e.due_date && e.due_date >= today && e.due_date <= limit);

    if (overdue.length) {
      await base44.asServiceRole.entities.FinancialEntry.bulkUpdate(
        overdue.map((e) => ({ id: e.id, status: "vencido" }))
      );
    }

    if (!overdue.length && !soon.length) return Response.json({ overdue: 0, soon: 0, notified: [] });

    const fmt = (e) => `• ${e.due_date} — ${e.description} (${e.type}) ${brl(e.amount)}${e.related_party ? ` · ${e.related_party}` : ""}`;
    const body = [
      overdue.length ? `Vencidas (${overdue.length}):\n${overdue.map(fmt).join("\n")}` : "",
      soon.length ? `\nVencendo em até 7 dias (${soon.length}):\n${soon.map(fmt).join("\n")}` : "",
      `\nAbra /financeiro para dar baixa.`,
    ].join("\n");

    const notified = await notifyAdmins(base44, `💰 ${overdue.length} vencida(s) · ${soon.length} a vencer`, body);
    return Response.json({ overdue: overdue.length, soon: soon.length, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}