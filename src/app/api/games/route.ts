import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculamos a média de cada jogo antes de enviar para o front
    const gamesWithRating = games.map(game => {
      const totalReviews = game.reviews.length;
      const sumRating = game.reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalReviews > 0 ? sumRating / totalReviews : 0;

      // Removemos o array 'reviews' pesado e deixamos só a média
      const { reviews, ...gameData } = game;
      
      return {
        ...gameData,
        averageRating
      };
    });

    return NextResponse.json(gamesWithRating, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar jogos' }, { status: 500 });
  }
}