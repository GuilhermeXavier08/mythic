import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Busca os itens da wishlist e inclui os dados do Jogo
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: decoded.userId },
      include: {
        game: true // Traz todos os dados do jogo
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapeia para retornar uma lista limpa de jogos
    const games = wishlistItems.map(item => item.game);

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar wishlist' }, { status: 500 });
  }
}