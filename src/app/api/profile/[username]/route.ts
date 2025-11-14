/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário por username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        friendCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil do usuário' },
      { status: 500 }
    );
  }
}
