import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAuth } from '@/lib/middleware';

// Define expected interface to replace SQL schema
interface ChatMessage {
  user_id: string; // Firebase IDs are strings
  conversation_id: string;
  role: 'user' | 'agent';
  agent_name?: string;
  content: string;
  thinking_process?: any; // JSONB in SQL
  created_at: Date;
}

async function getChatHistoryHandler(req: Request, user: { userId: string }) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    const chatsRef = db.collection('chats');
    let queryRef = chatsRef.where('user_id', '==', user.userId);

    if (conversationId) {
      queryRef = queryRef.where('conversation_id', '==', conversationId);
    }

    const snapshot = await queryRef.orderBy('created_at', 'asc').get();
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[GET /api/chat]', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

async function saveChatMessageHandler(req: Request, user: { userId: string }) {
  try {
    const body = await req.json();
    const { conversationId, role, content, agentName, thinkingProcess } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chatsRef = db.collection('chats');
    const newDoc = {
      user_id: user.userId,
      conversation_id: conversationId,
      role,
      content,
      agent_name: agentName || null,
      thinking_process: thinkingProcess ? JSON.stringify(thinkingProcess) : null,
      created_at: new Date()
    };

    const docRef = await chatsRef.add(newDoc);

    return NextResponse.json(
      { message: { id: docRef.id, ...newDoc } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/chat]', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export const GET = withAuth(getChatHistoryHandler);
export const POST = withAuth(saveChatMessageHandler);
