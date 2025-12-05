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

    const games = await prisma.game.findMany({
      where: {
        developerId: decoded.userId // Filtra pelo ID do usuário logado
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar jogos' }, { status: 500 });
  }
}