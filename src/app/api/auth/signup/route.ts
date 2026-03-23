// POST /api/auth/signup — create a new CIVION user using Firestore

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';
import { hashPassword } from '@/lib/hash';
import { createToken } from '@/lib/jwt';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = signupSchema.parse(body);

    const usersRef = db.collection('users');

    // Check if user already exists
    const existing = await usersRef.where('email', '==', email).limit(1).get();
    
    if (!existing.empty) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const docRef = await usersRef.add({
      email,
      password_hash: passwordHash,
      username: username || email.split('@')[0],
      created_at: new Date()
    });

    const token = createToken(docRef.id, email);

    return NextResponse.json(
      { user: { id: docRef.id, email, username: username || email.split('@')[0] }, token },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[signup]', error);
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
