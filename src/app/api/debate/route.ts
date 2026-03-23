// POST /api/debate — save a debate result to the database

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { query } from '@/lib/db';
import { DecodedToken } from '@/lib/jwt';

export const POST = withAuth(async (req: NextRequest, user: DecodedToken) => {
  try {
    const body = await req.json();
    const { conversationId, debateTopic, consensus, disagreements, recommendation, confidenceScore } =
      body as {
        conversationId?: number;
        debateTopic: string;
        consensus: string;
        disagreements?: Record<string, string[]>;
        recommendation?: string;
        confidenceScore?: number;
      };

    if (!debateTopic || !consensus) {
      return NextResponse.json({ error: 'debateTopic and consensus are required' }, { status: 400 });
    }

    // If no conversationId provided, create a placeholder conversation
    let convId = conversationId;
    if (!convId) {
      const conv = await query(
        'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING id',
        [user.userId, `Debate: ${debateTopic.slice(0, 60)}`]
      );
      convId = conv.rows[0].id;
    }

    const result = await query(
      `INSERT INTO debate_results
       (conversation_id, debate_topic, consensus, disagreements, recommendation, confidence_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        convId,
        debateTopic,
        consensus,
        JSON.stringify(disagreements || {}),
        recommendation || consensus,
        confidenceScore ?? 0.5,
      ]
    );

    return NextResponse.json({ debateId: result.rows[0].id, conversationId: convId }, { status: 201 });
  } catch (error) {
    console.error('[debate POST]', error);
    return NextResponse.json({ error: 'Failed to save debate result' }, { status: 500 });
  }
});
