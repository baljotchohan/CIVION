import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAuth } from '@/lib/middleware';

async function purchaseAgentHandler(req: Request, user: { userId: string }) {
  try {
    const body = await req.json();
    const { templateId, customName } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Missing templateId' }, { status: 400 });
    }

    const templateRef = db.collection('agent_templates').doc(templateId);
    const userCreditsRef = db.collection('user_credits').doc(user.userId);
    const purchasedAgentsRef = db.collection('purchased_agents');
    const transactionsRef = db.collection('credit_transactions');

    const result = await db.runTransaction(async (t) => {
      // 1. Get agent template
      const templateDoc = await t.get(templateRef);
      if (!templateDoc.exists) {
        throw new Error('Agent template not found');
      }
      
      const templateData = templateDoc.data()!;
      const price = templateData.price_credits || 0;

      // 2. Get user credits
      let userCreditsDoc = await t.get(userCreditsRef);
      let availableCredits = 0;
      let spentCredits = 0;

      if (!userCreditsDoc.exists) {
        // Initial setup 1000 credits if they don't have a wallet
        availableCredits = 1000;
        spentCredits = 0;
      } else {
        const data = userCreditsDoc.data()!;
        availableCredits = data.available_credits || 0;
        spentCredits = data.spent_credits || 0;
      }

      // 3. Check funds
      if (availableCredits < price) {
        throw new Error('Insufficient credits');
      }

      // 4. Set/Update user credits
      t.set(userCreditsRef, {
        user_id: user.userId,
        total_credits: userCreditsDoc.exists ? userCreditsDoc.data()!.total_credits : 1000,
        available_credits: availableCredits - price,
        spent_credits: spentCredits + price,
        updated_at: new Date()
      }, { merge: true });

      // 5. Add to purchased agents
      const newPurchasedAgentRef = purchasedAgentsRef.doc();
      t.set(newPurchasedAgentRef, {
        user_id: user.userId,
        template_id: templateId,
        custom_name: customName || templateData.name,
        activation_status: 'inactive',
        performance_score: 0,
        purchased_at: new Date()
      });

      // 6. Log transaction
      const newTransactionRef = transactionsRef.doc();
      t.set(newTransactionRef, {
        user_id: user.userId,
        transaction_type: 'purchase',
        amount: price,
        description: `Purchased agent: ${templateData.name}`,
        transaction_date: new Date()
      });

      return newPurchasedAgentRef.id;
    });

    return NextResponse.json({ purchasedAgentId: result }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/marketplace/purchase]', error);
    if (error.message === 'Agent template not found' || error.message === 'Insufficient credits') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

export const POST = withAuth(purchaseAgentHandler);
