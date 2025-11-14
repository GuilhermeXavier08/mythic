/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface SearchResultWithStatus {
  id: string;
  username: string;
  friendCode: number;
  isFriend: boolean;
  requestStatus: 'PENDING' | 'NONE';
}

export async function GET(request: Request) {
  try {
    // Autenticação: Obter userId do JWT
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login novamente.' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      if (!decoded?.userId) {
        return NextResponse.json(
          { error: 'Não autorizado. Faça login novamente.' },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error('[DEBUG] Erro de JWT:', jwtError);
      return NextResponse.json(
        { error: 'Sessão expirada. Faça login novamente.' },
        { status: 401 }
      );
    }

    const currentUserId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query de busca é obrigatória' },
        { status: 400 }
      );
    }

    const queryAsNumber = parseInt(query);
    const isNumber = !isNaN(queryAsNumber);

    // Buscar usuários
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // Busca por username (case insensitive)
          {
            OR: [
              { username: { equals: query } },
              { username: { equals: query.toLowerCase() } },
              { username: { equals: query.toUpperCase() } },
              { username: { contains: query } },
              { username: { contains: query.toLowerCase() } },
              { username: { contains: query.toUpperCase() } },
            ],
          },
          // Se for um número, busca também pelo friendCode
          ...(isNumber ? [{ friendCode: queryAsNumber }] : []),
        ],
      },
      select: {
        id: true,
        username: true,
        friendCode: true,
      },
      take: 10,
    });

    // Para cada usuário encontrado, verificar o status de amizade
    const resultsWithStatus: SearchResultWithStatus[] = await Promise.all(
      users.map(async (user) => {
        // Verificar se já são amigos (Friendship)
        const [userId1, userId2] = [currentUserId, user.id].sort();
        const friendship = await prisma.friendship.findUnique({
          where: {
            userId1_userId2: {
              userId1,
              userId2,
            },
          },
        });

        const isFriend = !!friendship;

        // Verificar se há pedido pendente (FriendshipRequest)
        const pendingRequest = await prisma.friendshipRequest.findFirst({
          where: {
            status: 'PENDING',
            OR: [
              { senderId: currentUserId, receiverId: user.id },
              { senderId: user.id, receiverId: currentUserId },
            ],
          },
        });

        const requestStatus = pendingRequest ? 'PENDING' : 'NONE';

        return {
          id: user.id,
          username: user.username,
          friendCode: user.friendCode,
          isFriend,
          requestStatus,
        };
      })
    );

    return NextResponse.json(resultsWithStatus, { status: 200 });
  } catch (error) {
    console.error('ERRO NA API DE BUSCA:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}