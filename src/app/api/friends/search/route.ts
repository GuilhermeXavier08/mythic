// src/app/api/friends/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importe da nossa lib

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query de busca é obrigatória' }, { status: 400 });
  }

  const queryAsNumber = parseInt(query);
  const isNumber = !isNaN(queryAsNumber);

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // Busca por username (case insensitive)
          { 
            OR: [
              { username: { equals: query } },
              { username: { equals: query.toLowerCase() } },
              { username: { equals: query.toUpperCase() } },
              { username: { contains: query } },
              { username: { contains: query.toLowerCase() } },
              { username: { contains: query.toUpperCase() } }
            ]
          },
          
          // Se for um número, busca também pelo friendCode
          ...(isNumber ? [{ friendCode: queryAsNumber }] : []),
        ],
      },
      select: {
        id: true,
        username: true,
        friendCode: true,
      },
      take: 10,
    });

    return NextResponse.json(users, { status: 200 });
    
  } catch (error) {
    console.error("ERRO NA API DE BUSCA:", error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}