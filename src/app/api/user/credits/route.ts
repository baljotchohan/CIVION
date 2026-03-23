import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAuth } from '@/lib/middleware';

async function getUserCreditsHandler(req: Request, user: { userId: string }) {
  try {
    const creditsRef = db.collection('user_credits').doc(user.userId);
    const snapshot = await creditsRef.get();

    // If user has no credits row yet, return default free amount
    if (!snapshot.exists) {
      // Create default wallet
      await creditsRef.set({
        user_id: user.userId,
        total_credits: 1000,
        available_credits: 1000,
        earned_credits: 0,
        spent_credits: 0,
        updated_at: new Date()
      });
      
      return NextResponse.json({ 
        availableCredits: 1000,
        totalCredits: 1000,
        earnedCredits: 0,
        spentCredits: 0
      });
    }

    const wallet = snapshot.data()!;
    return NextResponse.json({
      availableCredits: parseFloat(wallet.available_credits),
      totalCredits: parseFloat(wallet.total_credits),
      earnedCredits: parseFloat(wallet.earned_credits || 0),
      spentCredits: parseFloat(wallet.spent_credits),
    });
  } catch (error) {
    console.error('[GET /api/user/credits]', error);
    return NextResponse.json({ error: 'Failed to fetch user credits' }, { status: 500 });
  }
}

export const GET = withAuth(getUserCreditsHandler);
