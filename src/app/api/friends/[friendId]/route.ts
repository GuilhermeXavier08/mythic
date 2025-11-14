/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function DELETE(
  request: Request,
  { params }: { params: { friendId: string } }
) {
  try {
    // Autenticação: Obter o userId do JWT
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

    const userId = decoded.userId;
    const friendId = params.friendId;

    // Validação: Verificar se o friendId é válido
    if (!friendId || friendId.trim() === '') {
      return NextResponse.json(
        { error: 'ID do amigo inválido.' },
        { status: 400 }
      );
    }

    // Remoção: Encontrar e deletar o registro na tabela Friendship
    // A amizade é armazenada com IDs ordenados (userId1 < userId2)
    const [userId1, userId2] = [userId, friendId].sort();

    // Usar transaction para garantir que ambas as operações aconteçam juntas
    const db = prisma as any;
    const result = await db.$transaction(async (tx: any) => {
      // 1. Deletar a entrada na tabela Friendship
      const friendship = await tx.friendship.delete({
        where: {
          userId1_userId2: {
            userId1,
            userId2,
          },
        },
      }).catch(() => null); // Se não existir, retorna null

      // 2. Deletar os registros de FriendshipRequest ACCEPTED associados
      const deletedRequests = await tx.friendshipRequest.deleteMany({
        where: {
          OR: [
            // O pedido pode ter sido enviado por userId para friendId
            { senderId: userId, receiverId: friendId },
            // O pedido pode ter sido enviado por friendId para userId
            { senderId: friendId, receiverId: userId },
          ],
          status: 'ACCEPTED',
        },
      });

      return { friendship, deletedRequestsCount: deletedRequests.count };
    });

    if (!result.friendship) {
      return NextResponse.json(
        { error: 'Amizade não encontrada.' },
        { status: 404 }
      );
    }

    // Resposta de sucesso
    return NextResponse.json(
      { 
        message: 'Amigo removido com sucesso.',
        deletedRequests: result.deletedRequestsCount,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Erro ao remover amigo:', error);

    // Verificar se é erro de registro não encontrado
    if (error instanceof Error && error.message.includes('An operation failed because it depends on one or more records that were required but not found')) {
      return NextResponse.json(
        { error: 'Amizade não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao remover amigo.' },
      { status: 500 }
    );
  }
}
