import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAuth } from '@/lib/middleware';

async function getAgentsHandler(req: Request, user: { userId: string }) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const sortBy = searchParams.get('sortBy') || 'downloads'; // 'price' or 'downloads'

    const templatesRef = db.collection('agent_templates');
    let queryRef: FirebaseFirestore.Query = templatesRef;

    if (type && type !== 'all') {
      queryRef = queryRef.where('type', '==', type);
    }

    if (minRating > 0) {
      queryRef = queryRef.where('rating', '>=', minRating);
    }

    // Sort constraints
    if (sortBy === 'price') {
      queryRef = queryRef.orderBy('price_credits', 'desc');
    } else {
      queryRef = queryRef.orderBy('downloads', 'desc');
    }

    const snapshot = await queryRef.limit(50).get();

    const agents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If the database is completely empty (no templates seeded yet),
    // let's seed the default ones!
    if (agents.length === 0 && (!type || type === 'all')) {
      const defaultAgents = [
        {
          name: 'Deep Stock Researcher',
          type: 'research',
          description: 'Specializes in pulling diverse financial APIs to evaluate market health',
          base_capability: 'Financial Analysis 24/7',
          price_credits: 250,
          is_verified: true,
          rating: 5,
          downloads: 120
        },
        {
          name: 'Social Trends Monitor',
          type: 'monitoring',
          description: 'Constantly sweeps social feeds mapping out viral keywords and trends',
          base_capability: 'Social Media Scraping',
          price_credits: 150,
          is_verified: true,
          rating: 4.8,
          downloads: 340
        },
        {
          name: 'Ruthless Executioner',
          type: 'execution',
          description: 'Will break a massive goal into extreme micro-granular tasks with timeline constraints',
          base_capability: 'Timeline enforcement',
          price_credits: 400,
          is_verified: true,
          rating: 4.9,
          downloads: 85
        }
      ];

      for (const agent of defaultAgents) {
        const docRef = await templatesRef.add({
          ...agent,
          creator_id: 'system',
          created_at: new Date()
        });
        agents.push({ id: docRef.id, ...agent });
      }
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('[GET /api/marketplace/agents]', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

async function createAgentHandler(req: Request, user: { userId: string }) {
  try {
    const body = await req.json();
    const { name, type, description, base_capability, special_abilities, price_credits } = body;

    const templatesRef = db.collection('agent_templates');
    const newDoc = {
      creator_id: user.userId,
      name,
      type,
      description,
      base_capability,
      special_abilities: special_abilities || {},
      price_credits: Number(price_credits),
      rating: 0,
      downloads: 0,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const docRef = await templatesRef.add(newDoc);

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/marketplace/agents]', error);
    return NextResponse.json({ error: 'Failed to create agent schema' }, { status: 500 });
  }
}

export const GET = withAuth(getAgentsHandler);
export const POST = withAuth(createAgentHandler);
