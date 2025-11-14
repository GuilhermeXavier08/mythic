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

  // 1. Ordena os IDs para checar a tabela Friendship corretamente
  const [userA, userB] = [decoded.userId, targetUser.id].sort();

  const existingFriendship = await db.friendship.findUnique({
    where: {
      userId1_userId2: {
        userId1: userA,
        userId2: userB,
      },
    },
  });

  if (existingFriendship) {
    return NextResponse.json({ error: "Você já é amigo deste usuário" }, { status: 409 });
  }

  // 2. Verificar por QUALQUER pedido PENDENTE em ambas as direções (A->B ou B->A)
  const existingPendingRequest = await db.friendshipRequest.findFirst({
    where: {
      status: 'PENDING',
      OR: [
        // Opção 1: O pedido já existe e foi enviado por mim (remetente -> alvo)
        { senderId: decoded.userId, receiverId: targetUser.id },
        // Opção 2: O pedido já existe e foi enviado pelo alvo para mim (alvo -> remetente)
        { senderId: targetUser.id, receiverId: decoded.userId },
      ],
    },
  });

  // 3. Lidar com o pedido existente
  if (existingPendingRequest) {
    // Se o pedido foi enviado POR MIM (Opção 1)
    if (existingPendingRequest.senderId === decoded.userId) {
      return NextResponse.json(
        { error: "Você já enviou um pedido de amizade para este usuário." },
        { status: 409 }
      );
    }

    // Se o pedido foi enviado PELO ALVO (Opção 2)
    if (existingPendingRequest.senderId === targetUser.id) {
      return NextResponse.json(
        { error: "Este usuário já te enviou um pedido. Verifique seus pedidos recebidos." },
        { status: 409 }
      );
    }
  }

  // 4. Limpar quaisquer pedidos antigos que terminaram em aceito/rejeitado
  // Isso permite re-adicionar após remover um amigo
  await db.friendshipRequest.deleteMany({
    where: {
      OR: [
        { senderId: decoded.userId, receiverId: targetUser.id },
        { senderId: targetUser.id, receiverId: decoded.userId },
      ],
      status: { in: ['ACCEPTED', 'REJECTED'] },
    },
  });

  // 5. Criar novo pedido de amizade (agora com segurança)
  const friendRequest = await db.friendshipRequest.create({
    data: {
      senderId: decoded.userId,
      receiverId: targetUser.id,
    },
  });

    return NextResponse.json(friendRequest, { status: 201 });
  } catch (error: unknown) {
    console.error("[ERROR] Erro ao enviar solicitação:", error);
    return NextResponse.json({ error: "Falha ao enviar solicitação de amizade. Tente novamente." }, { status: 500 });
  }
}