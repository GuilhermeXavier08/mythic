/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

type DecodedToken = { userId: string };

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 });
    }

    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      if (!decoded?.userId) {
        return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 });
      }
    } catch (jwtError) {
      console.error('[DEBUG] Erro de JWT:', jwtError);
      return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });
    }

    const body = await request.json();
    const { targetIdentifier } = body as { targetIdentifier?: string };
    if (!targetIdentifier) {
      return NextResponse.json({ error: "ID do amigo ou nome de usuário é obrigatório" }, { status: 400 });
    }

    // Buscar usuário por friendCode, id ou username
    const userWhereOr: Prisma.UserWhereInput[] = [];

    // Se é numérico, busca por friendCode
    if (/^\d+$/.test(targetIdentifier)) {
      userWhereOr.push({ friendCode: parseInt(targetIdentifier, 10) });
    }

    // Se parece um UUID, busca por id
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(targetIdentifier)) {
      userWhereOr.push({ id: targetIdentifier });
    }

    // Tenta pelo username também
    userWhereOr.push({ username: targetIdentifier });

    const targetUser = await prisma.user.findFirst({ where: { OR: userWhereOr } });

    if (!targetUser) {
      // Log para debug (não expõe em produção)
      console.log(`[DEBUG] Usuário não encontrado. Tentativa: ${targetIdentifier}, buscado como: ${JSON.stringify(userWhereOr)}`);
      return NextResponse.json({ error: "Usuário não encontrado. Verifique se o ID ou nome de usuário está correto." }, { status: 404 });
    }

    // Prevent self-friending
    if (targetUser.id === decoded.userId) {
      return NextResponse.json({ error: "Você não pode enviar solicitação de amizade para si mesmo" }, { status: 400 });
    }

  // Check if they are already friends
  // prisma client model access: alguns ambientes TS podem não reconhecer automaticamente os modelos gerados,
  // então fazemos uma cast local controlado.
  const db = prisma as any;

  const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { AND: [{ userId1: decoded.userId }, { userId2: targetUser.id }] },
          { AND: [{ userId1: targetUser.id }, { userId2: decoded.userId }] },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ error: "Você já é amigo deste usuário" }, { status: 409 });
    }

    // Check for existing pending request
  const existingRequest = await db.friendshipRequest.findFirst({
      where: {
        OR: [
          { AND: [{ senderId: decoded.userId }, { receiverId: targetUser.id }, { status: 'PENDING' }] },
          { AND: [{ senderId: targetUser.id }, { receiverId: decoded.userId }, { status: 'PENDING' }] },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Já existe uma solicitação de amizade pendente com este usuário" }, { status: 409 });
    }

    // Create new friend request
  const friendRequest = await db.friendshipRequest.create({ data: { senderId: decoded.userId, receiverId: targetUser.id } });

    return NextResponse.json(friendRequest, { status: 201 });
  } catch (error: unknown) {
    console.error("[ERROR] Erro ao enviar solicitação:", error);
    return NextResponse.json({ error: "Falha ao enviar solicitação de amizade. Tente novamente." }, { status: 500 });
  }
}