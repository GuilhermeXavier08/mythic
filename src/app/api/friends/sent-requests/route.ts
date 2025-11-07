/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // prisma model access (cast local)
  const db = prisma as any;

    const requests = await db.friendshipRequest.findMany({
      where: { senderId: decoded.userId, status: 'PENDING' },
      include: { receiver: { select: { id: true, username: true, friendCode: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    return NextResponse.json({ error: "Failed to fetch sent friend requests" }, { status: 500 });
  }
}