// JWT token creation and verification for CIVION V1.2

import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'civion_dev_secret_change_in_production';
const EXPIRATION = (process.env.JWT_EXPIRATION as string) || '7d';

export interface DecodedToken {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export function createToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, SECRET, { expiresIn: EXPIRATION } as jwt.SignOptions);
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch {
    return null;
  }
}
