import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/middleware';

async function purchaseAgentHandler(req: Request, user: { userId: number }) {
  try {
    const body = await req.json();
    const { templateId, customName } = body;

    // Get agent template
    const templateResult = await query(
      'SELECT * FROM agent_templates WHERE id = $1',
      [templateId]
    );

    if (templateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const template = templateResult.rows[0];

    // Check user credits
    const creditsResult = await query(
      'SELECT available_credits FROM user_credits WHERE user_id = $1',
      [user.userId]
    );

    const availableCredits = creditsResult.rows[0]?.available_credits || 0;

    if (availableCredits < template.price_credits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Begin pseudo-transaction setup:
    // 1. Deduct credits
    await query(
      `UPDATE user_credits 
       SET available_credits = available_credits - $1,
           spent_credits = spent_credits + $1
       WHERE user_id = $2`,
      [template.price_credits, user.userId]
    );

    // 2. Add purchased agent
    const purchaseResult = await query(
      `INSERT INTO purchased_agents 
       (user_id, template_id, custom_name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [user.userId, templateId, customName || template.name]
    );

    // 3. Log transaction
    await query(
      `INSERT INTO credit_transactions 
       (user_id, transaction_type, amount, description)
       VALUES ($1, $2, $3, $4)`,
      [
        user.userId,
        'purchase',
        template.price_credits,
        `Purchased agent: ${template.name}`,
      ]
    );

    return NextResponse.json({ purchasedAgentId: purchaseResult.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/marketplace/purchase]', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

export const POST = withAuth(purchaseAgentHandler);
