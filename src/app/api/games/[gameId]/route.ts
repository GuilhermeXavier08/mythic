import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// Helper para pegar ID do usuário (opcional nesta rota, usado para saber se o user já avaliou)
async function getUserId(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Tipagem correta para o Next.js 15+
interface RouteParams {
  params: Promise<{ gameId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // CORREÇÃO AQUI: Aguardamos o params antes de usar
    const { gameId } = await params;
    const userId = await getUserId(request);

    // 1. Busca o jogo e o desenvolvedor
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        developer: {
          select: { username: true }
        },
        reviews: true // Trazemos as reviews para calcular a média
      }
    });

    if (!game) {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 });
    }

    // 2. Calcula média de avaliações
    const totalReviews = game.reviews.length;
    const averageRating = totalReviews > 0
      ? game.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

    // 3. Verifica se o usuário atual já avaliou
    let currentUserRating = 0;
    if (userId) {
      const userReview = game.reviews.find(r => r.userId === userId);
      if (userReview) {
        currentUserRating = userReview.rating;
      }
    }

    // 4. Monta a resposta limpa (sem mandar o array de reviews inteiro se não precisar)
    const responseData = {
      id: game.id,
      title: game.title,
      description: game.description,
      price: game.price,
      imageUrl: game.imageUrl,
      gameUrl: game.gameUrl,
      genre: game.genre,
      createdAt: game.createdAt,
      developer: game.developer,
      // Dados calculados
      averageRating,
      totalReviews,
      currentUserRating
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Erro ao buscar detalhes do jogo:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}