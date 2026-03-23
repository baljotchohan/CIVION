// Auth middleware helper for Next.js App Router route handlers

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, DecodedToken } from './jwt';

export type AuthedRequest = NextRequest & { user: DecodedToken };

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

export function getUserFromRequest(req: NextRequest): DecodedToken | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

type RouteHandler = (
  req: NextRequest,
  user: DecodedToken
) => Promise<NextResponse>;

/**
 * Wrap a route handler to require a valid JWT.
 * Usage: export const POST = withAuth(async (req, user) => { ... });
 */
export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized — missing or invalid token' },
        { status: 401 }
      );
    }
    return handler(req, user);
  };
}
