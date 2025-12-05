import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Lista de Medalhas Iniciais
  const badges = [
    {
      code: 'FIRST_BUY',
      name: 'Primeira Compra',
      description: 'Comprou seu primeiro jogo na Mythic Store.',
      iconUrl: '🛍️'
    },
    {
      code: 'GAME_DEV',
      name: 'Criador de Mundos',
      description: 'Publicou seu primeiro jogo na loja.',
      iconUrl: '🛠️'
    },
    {
      code: 'BETA_TESTER',
      name: 'Pioneiro',
      description: 'Entrou na Mythic Store durante o beta.',
      iconUrl: '🚀'
    }
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {},
      create: b
    });
  }

  return NextResponse.json({ message: 'Medalhas criadas!' });
}