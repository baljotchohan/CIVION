import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/middleware';

async function getUserCreditsHandler(req: Request, user: { userId: number }) {
  try {
    const result = await query(
      'SELECT available_credits, total_credits, earned_credits, spent_credits FROM user_credits WHERE user_id = $1',
      [user.userId]
    );

    // If user has no credits row yet, return default free amount
    if (result.rows.length === 0) {
      // Create default wallet
      await query(
        `INSERT INTO user_credits (user_id, total_credits, available_credits) 
         VALUES ($1, 1000, 1000) ON CONFLICT(user_id) DO NOTHING`,
        [user.userId]
      );
      
      return NextResponse.json({ 
        availableCredits: 1000,
        totalCredits: 1000,
        earnedCredits: 0,
        spentCredits: 0
      });
    }

    const wallet = result.rows[0];
    return NextResponse.json({
      availableCredits: parseFloat(wallet.available_credits),
      totalCredits: parseFloat(wallet.total_credits),
      earnedCredits: parseFloat(wallet.earned_credits),
      spentCredits: parseFloat(wallet.spent_credits),
    });
  } catch (error) {
    console.error('[GET /api/user/credits]', error);
    return NextResponse.json({ error: 'Failed to fetch user credits' }, { status: 500 });
  }
}

export const GET = withAuth(getUserCreditsHandler);
