import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Canal de e-mail do assistente: entrega respostas, relatórios e alertas
// aos usuários registrados do app (SendEmail só aceita usuários cadastrados).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body, all_admins } = await req.json();

    if (!subject || !body) {
      return Response.json({ success: false, message: 'Informe assunto e conteúdo do e-mail.' }, { status: 400 });
    }

    let recipients = [];
    if (all_admins) {
      const users = await base44.asServiceRole.entities.User.list();
      recipients = users.filter((u) => u.role === 'admin' && u.email).map((u) => u.email);
    } else if (to) {
      recipients = Array.isArray(to) ? to : [to];
    } else {
      recipients = [user.email];
    }

    if (!recipients.length) {
      return Response.json({ success: false, message: 'Nenhum destinatário registrado encontrado.' }, { status: 400 });
    }

    const sent = [];
    const failed = [];
    for (const email of recipients) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          body,
          from_name: 'OmniSync ERP',
        });
        sent.push(email);
      } catch (err) {
        failed.push({ email, error: err.message });
      }
    }

    return Response.json({
      success: sent.length > 0,
      sent,
      failed,
      message: `E-mail enviado para ${sent.length} destinatário(s)` + (failed.length ? `; ${failed.length} falha(s).` : '.'),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}