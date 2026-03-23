// POST /api/auth/login — authenticate a user using Firestore

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';
import { verifyPassword } from '@/lib/hash';
import { createToken } from '@/lib/jwt';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createToken(userDoc.id, user.email);

    return NextResponse.json(
      { user: { id: userDoc.id, email: user.email, username: user.username }, token },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[login]', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
