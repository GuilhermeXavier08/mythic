// src/app/api/games/route.ts
import { NextResponse } from 'next/server';
// Importe o 'prisma' da nossa lib, em vez do '@prisma/client'
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient(); <-- REMOVA ESTA LINHA

// GET (Busca todos os jogos)
export async function GET() {
  try {
    // Esta linha agora usa a instância única
    const games = await prisma.game.findMany();
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar jogos' }, { status: 500 });
  }
}