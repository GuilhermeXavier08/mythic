import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    
    // 1. Autenticação
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // 2. Receber a nota
    const body = await request.json();
    const { rating } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Nota inválida (1-5)' }, { status: 400 });
    }

    // 3. SEGURANÇA: Verificar se o usuário COMPROU o jogo
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_gameId: {
          userId: userId,
          gameId: gameId,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Você precisa comprar o jogo para avaliar.' }, { status: 403 });
    }

    // 4. Criar ou Atualizar a avaliação (Upsert)
    const review = await prisma.review.upsert({
      where: {
        userId_gameId: {
          userId: userId,
          gameId: gameId,
        },
      },
      update: {
        rating: rating,
      },
      create: {
        userId: userId,
        gameId: gameId,
        rating: rating,
      },
    });

    return NextResponse.json(review, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao avaliar' }, { status: 500 });
  }
}