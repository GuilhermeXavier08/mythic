// src/app/api/admin/games/[gameId]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

// PATCH (Atualiza o status de um jogo)
export async function PATCH(request: Request, ctx: any) {
  const { params } = ctx as { params: { gameId: string } };
  try {
    // 1. Verifica se é Admin
    await verifyAdmin(request);

    const { gameId } = params;
    const body = await request.json();
    const { status } = body; // Espera 'APPROVED' ou 'REJECTED'

    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // 2. Atualiza o jogo no banco
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedGame, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 401 });
  }
}