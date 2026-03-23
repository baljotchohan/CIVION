import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAuth } from '@/lib/middleware';

async function saveDebateResultHandler(req: Request, user: { userId: string }) {
  try {
    const body = await req.json();
    const { topic, consensus, disagreements, agentResponses, overallConfidence } = body;

    if (!topic || !consensus || !agentResponses) {
      return NextResponse.json({ error: 'Missing required debate tracking fields' }, { status: 400 });
    }

    const debatesRef = db.collection('debates');
    const newDoc = {
      user_id: user.userId,
      topic,
      consensus: JSON.stringify(consensus),
      disagreements: JSON.stringify(disagreements || []),
      agent_responses: JSON.stringify(agentResponses),
      overall_confidence: overallConfidence || 0,
      created_at: new Date()
    };

    const docRef = await debatesRef.add(newDoc);

    return NextResponse.json(
      { debate: { id: docRef.id, ...newDoc } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/debate]', error);
    return NextResponse.json({ error: 'Failed to save debate result' }, { status: 500 });
  }
}

export const POST = withAuth(saveDebateResultHandler);
