// GET /api/chat — fetch conversation history
// POST /api/chat — save a conversation with agent responses

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { query } from '@/lib/db';
import { DecodedToken } from '@/lib/jwt';

export const GET = withAuth(async (_req: NextRequest, user: DecodedToken) => {
  try {
    const conversations = await query(
      `SELECT id, title, summary, created_at, updated_at, is_archived
       FROM conversations
       WHERE user_id = $1 AND is_archived = false
       ORDER BY created_at DESC
       LIMIT 50`,
      [user.userId]
    );
    return NextResponse.json({ conversations: conversations.rows });
  } catch (error) {
    console.error('[chat GET]', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, user: DecodedToken) => {
  try {
    const body = await req.json();
    const { message, agentResponses } = body as {
      message: string;
      agentResponses?: {
        name: string;
        type: string;
        response: string;
        thinking?: string;
        confidence?: number;
        reasoningSteps?: string[];
      }[];
    };

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Create conversation record
    const title = message.slice(0, 80) + (message.length > 80 ? '…' : '');
    const convResult = await query(
      'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING id',
      [user.userId, title]
    );
    const conversationId = convResult.rows[0].id;

    // Save each agent response if provided
    if (agentResponses && agentResponses.length > 0) {
      for (const r of agentResponses) {
        await query(
          `INSERT INTO agent_responses
           (conversation_id, agent_name, agent_type, response_text, thinking, confidence, reasoning_steps)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            conversationId,
            r.name,
            r.type,
            r.response,
            r.thinking || null,
            r.confidence || null,
            JSON.stringify(r.reasoningSteps || []),
          ]
        );
      }
    }

    return NextResponse.json({ conversationId }, { status: 201 });
  } catch (error) {
    console.error('[chat POST]', error);
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
});
