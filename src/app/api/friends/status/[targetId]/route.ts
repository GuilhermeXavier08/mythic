/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(request: Request, { params }: { params: { targetId: string } }) {
  try {
    const { targetId } = params;
    if (!targetId) {
      return NextResponse.json({ error: 'targetId obrigatório' }, { status: 400 });
    }

    // Optional auth: if Authorization header present, use it to get current user
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let currentUserId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded?.userId || null;
      } catch (err) {
        // ignore invalid token, treat as unauthenticated
        currentUserId = null;
      }
    }

    // If no current user, return NOT_FRIENDS (client can treat as public visitor)
    if (!currentUserId) {
      return NextResponse.json({ status: 'NOT_FRIENDS' }, { status: 200 });
    }

    if (currentUserId === targetId) {
      return NextResponse.json({ status: 'SELF' }, { status: 200 });
    }

    // Check friendship using ordered keys
    const [userA, userB] = [currentUserId, targetId].sort();

    const friendship = await prisma.friendship.findUnique({
      where: {
        userId1_userId2: {
          userId1: userA,
          userId2: userB,
        },
      },
    });

    if (friendship) {
      return NextResponse.json({ status: 'FRIENDS' }, { status: 200 });
    }

    // Check for pending request either direction
    const pending = await prisma.friendshipRequest.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { senderId: currentUserId, receiverId: targetId },
          { senderId: targetId, receiverId: currentUserId },
        ],
      },
    });

    if (pending) {
      return NextResponse.json({ status: 'PENDING', pendingSenderId: pending.senderId }, { status: 200 });
    }

    return NextResponse.json({ status: 'NOT_FRIENDS' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao obter status de amizade:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
