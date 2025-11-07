/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { requestId, action } = body;
    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be ACCEPT or REJECT" },
        { status: 400 }
      );
    }

  // prisma model access (cast local)
  const db = prisma as any;

  // Get the friend request
  const friendRequest = await db.friendshipRequest.findUnique({ where: { id: requestId } });

    if (!friendRequest) return NextResponse.json({ error: "Friend request not found" }, { status: 404 });

    // Verify the current user is the receiver
    if (friendRequest.receiverId !== decoded.userId) {
      return NextResponse.json({ error: "Not authorized to handle this request" }, { status: 403 });
    }

    if (friendRequest.status !== "PENDING") {
      return NextResponse.json({ error: "This request has already been handled" }, { status: 400 });
    }

    if (action === "ACCEPT") {
      // Create friendship in a transaction
      await prisma.$transaction(async (tx) => {
          // Update request status
          const t = tx as any;
          await t.friendshipRequest.update({ where: { id: requestId }, data: { status: "ACCEPTED" } });

        // Determine userId1 and userId2 (smaller ID first)
        const [userId1, userId2] = [friendRequest.senderId, friendRequest.receiverId].sort();

        // Create the friendship
        await t.friendship.create({ data: { userId1, userId2 } });
      });

      return NextResponse.json(
        { message: "Friend request accepted" },
        { status: 200 }
      );
    } else {
      // Reject the request
      await db.friendshipRequest.update({ where: { id: requestId }, data: { status: "REJECTED" } });

      return NextResponse.json(
        { message: "Friend request rejected" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error handling friend request:", error);
    return NextResponse.json(
      { error: "Failed to handle friend request" },
      { status: 500 }
    );
  }
}