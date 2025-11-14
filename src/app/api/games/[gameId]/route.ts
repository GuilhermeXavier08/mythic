// src/app/api/games/[gameId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET (Busca um jogo específico por ID)
export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;

    if (!gameId) {
      return NextResponse.json({ error: 'ID do jogo é obrigatório' }, { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        status: 'APPROVED', // Importante: Só retorna jogos aprovados
      },
      include: {
        // Inclui o nome do desenvolvedor na resposta
        developer: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Jogo não encontrado ou não aprovado' }, { status: 404 });
    }

    return NextResponse.json(game, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}