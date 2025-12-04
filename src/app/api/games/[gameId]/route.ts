import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;

    // 1. Tentar identificar o usuário (Opcional)
    let userId: string | null = null;
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // Se o token for inválido, apenas seguimos como visitante
      }
    }

    // 2. Buscar o jogo
    const game = await prisma.game.findFirst({
      where: { id: gameId, status: 'APPROVED' },
      include: {
        developer: { select: { username: true } },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 });
    }

    // 3. Calcular Média
    const aggregations = await prisma.review.aggregate({
      where: { gameId: gameId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 4. Buscar a nota do usuário ATUAL (se estiver logado)
    let currentUserRating = 0;
    if (userId) {
      const userReview = await prisma.review.findUnique({
        where: {
          userId_gameId: {
            userId: userId,
            gameId: gameId,
          },
        },
      });
      if (userReview) {
        currentUserRating = userReview.rating;
      }
    }

    // 5. Retornar tudo
    return NextResponse.json({
      ...game,
      averageRating: aggregations._avg.rating || 0,
      totalReviews: aggregations._count.rating || 0,
      currentUserRating: currentUserRating, // <--- Enviamos a nota do usuário
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}