/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 });
    }

    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      if (!decoded?.userId) {
        return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 });
      }
    } catch (jwtError) {
      console.error('[DEBUG] Erro de JWT:', jwtError);
      return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });
    }

  // prisma model access (cast local)
  const db = prisma as any;

  const friends = await db.$transaction(async (tx: any) => {
      // Get all friendships where the user is either user1 or user2
      const friendships = await tx.friendship.findMany({
        where: {
          OR: [
            { userId1: decoded.userId },
            { userId2: decoded.userId },
          ],
        },
        include: {
          user1: { select: { id: true, username: true, friendCode: true, avatarUrl: true } },
          user2: { select: { id: true, username: true, friendCode: true, avatarUrl: true } },
        },
      });

      // Transform the data to return only the friend's information
      return friendships.map((friendship: any) => {
        const friend = friendship.userId1 === decoded.userId ? friendship.user2 : friendship.user1;
        return { id: friend.id, username: friend.username, friendCode: friend.friendCode, avatarUrl: friend.avatarUrl || null, friendshipId: friendship.id };
      });
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}