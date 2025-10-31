// src/app/api/games/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET (Busca todos os jogos APROVADOS)
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      // --- MUDANÇA CRÍTICA AQUI ---
      where: {
        status: 'APPROVED' // Só mostra jogos aprovados na loja pública
      }
      // --- FIM DA MUDANÇA ---
    });
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar jogos' }, { status: 500 });
  }
}