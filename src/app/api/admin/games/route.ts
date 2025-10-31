// src/app/api/admin/games/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

// GET (Busca todos os jogos PENDENTES)
export async function GET(request: Request) {
  try {
    // 1. Verifica se o usuário é um Admin
    await verifyAdmin(request);

    // 2. Se for admin, busca os jogos
    const pendingGames = await prisma.game.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        developer: { // Inclui os dados do desenvolvedor
          select: { username: true, email: true }
        }
      }
    });

    return NextResponse.json(pendingGames, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 401 });
  }
}