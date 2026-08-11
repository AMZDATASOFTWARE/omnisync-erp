import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Fecha uma sessão de caixa com conciliação financeira:
// calcula o saldo esperado (fundo + vendas em dinheiro + reforços - sangrias),
// compara com o valor contado e lança a divergência (quebra/sobra) no Financeiro.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_id, closing_amount } = await req.json();
    if (!session_id || closing_amount === undefined || closing_amount === null) {
      return Response.json({ error: 'session_id e closing_amount são obrigatórios' }, { status: 400 });
    }

    const session = await base44.entities.CashSession.get(session_id);
    if (!session) return Response.json({ error: 'Sessão de caixa não encontrada' }, { status: 404 });
    if (session.status !== 'aberto') {
      return Response.json({ error: 'Esta sessão de caixa já está fechada' }, { status: 400 });
    }

    const [sales, movements] = await Promise.all([
      base44.entities.Sale.filter({ cash_session_id: session_id }, '-created_date', 500),
      base44.entities.CashMovement.filter({ session_id: session_id }, '-created_date', 500),
    ]);

    const validSales = sales.filter((s) => s.status !== 'cancelada');
    const round = (n) => Math.round(n * 100) / 100;
    const totalSales = round(validSales.reduce((a, s) => a + (s.total || 0), 0));
    const cashSales = round(validSales.filter((s) => s.payment_method === 'dinheiro').reduce((a, s) => a + (s.total || 0), 0));
    const reforcos = round(movements.filter((m) => m.type === 'reforco').reduce((a, m) => a + (m.amount || 0), 0));
    const sangrias = round(movements.filter((m) => m.type === 'sangria').reduce((a, m) => a + (m.amount || 0), 0));

    const openingAmount = session.opening_amount || 0;
    const expectedAmount = round(openingAmount + cashSales + reforcos - sangrias);
    const countedAmount = round(Number(closing_amount) || 0);
    const difference = round(countedAmount - expectedAmount);

    // Divergência (quebra ou sobra) vira lançamento financeiro automático, já pago
    let divergenceEntryId = '';
    if (Math.abs(difference) >= 0.01) {
      const entry = await base44.entities.FinancialEntry.create({
        store_id: session.store_id || '',
        type: difference > 0 ? 'receber' : 'pagar',
        description: `${difference > 0 ? 'Sobra' : 'Quebra'} de caixa — fechamento sessão #${session_id.slice(-6)}`,
        amount: Math.abs(difference),
        status: 'pago',
        category: 'Caixa',
        related_party: session.operator || 'PDV',
        due_date: new Date().toISOString().split('T')[0],
      });
      divergenceEntryId = entry.id;
    }

    await base44.entities.CashSession.update(session_id, {
      status: 'fechado',
      closing_amount: countedAmount,
      closed_at: new Date().toISOString(),
      expected_amount: expectedAmount,
      difference: difference,
      divergence_entry_id: divergenceEntryId,
    });

    return Response.json({
      success: true,
      opening_amount: openingAmount,
      total_sales: totalSales,
      cash_sales: cashSales,
      reforcos: reforcos,
      sangrias: sangrias,
      expected_amount: expectedAmount,
      counted_amount: countedAmount,
      difference: difference,
      divergence_entry_id: divergenceEntryId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}