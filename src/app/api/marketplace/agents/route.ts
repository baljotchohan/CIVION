import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/middleware';

async function getAgentsHandler(req: Request, user: { userId: number }) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const sortBy = searchParams.get('sortBy') || 'downloads';

    let queryStr = `
      SELECT 
        id, name, type, description, base_capability, 
        price_credits, rating, downloads, is_verified,
        creator_id, created_at
      FROM agent_templates
      WHERE rating >= $1
    `;
    const params: any[] = [minRating];

    if (type && type !== 'all') {
      params.push(type);
      queryStr += ` AND type = $${params.length}`;
    }

    queryStr += `
      ORDER BY ${sortBy === 'price' ? 'price_credits' : 'downloads'} DESC
      LIMIT 50
    `;

    const result = await query(queryStr, params);
    return NextResponse.json({ agents: result.rows });
  } catch (error) {
    console.error('[GET /api/marketplace/agents]', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

async function createAgentHandler(req: Request, user: { userId: number }) {
  try {
    const body = await req.json();
    const { name, type, description, base_capability, special_abilities, price_credits } = body;

    const result = await query(
      `INSERT INTO agent_templates 
       (creator_id, name, type, description, base_capability, special_abilities, price_credits)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        user.userId,
        name,
        type,
        description,
        base_capability,
        JSON.stringify(special_abilities || {}),
        price_credits,
      ]
    );

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/marketplace/agents]', error);
    return NextResponse.json({ error: 'Failed to create agent schema' }, { status: 500 });
  }
}

export const GET = withAuth(getAgentsHandler);
export const POST = withAuth(createAgentHandler);
