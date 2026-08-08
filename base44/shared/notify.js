// Envio de alertas operacionais para os administradores do ERP.
export async function notifyAdmins(base44, subject, body) {
  const users = await base44.asServiceRole.entities.User.list();
  const admins = users.filter((u) => u.role === "admin" && u.email);
  for (const admin of admins) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: admin.email,
      subject,
      body,
      from_name: "OmniSync ERP",
    });
  }
  return admins.map((a) => a.email);
}

export function brl(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}