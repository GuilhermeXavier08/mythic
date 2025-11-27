// src/app/api/library/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
}

export async function GET(request: Request) {
  try {
    // 1. Autenticar o usuário
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const userId = decoded.userId;

    // 2. Buscar as compras do usuário e incluir os dados dos jogos
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: userId,
      },
      include: {
        // Pega os dados do jogo relacionado a cada compra
        game: true, 
      },
      orderBy: {
        purchasedAt: 'desc', // Opcional: mostrar mais recentes primeiro
      }
    });

    return NextResponse.json(purchases, { status: 200 });

  } catch (error: any) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }
    console.error("Erro ao buscar biblioteca:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}