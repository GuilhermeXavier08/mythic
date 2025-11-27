// src/app/api/purchase/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
}

export async function POST(request: Request) {
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

    // 2. Obter o gameId do corpo da requisição
    const { gameId } = await request.json();
    if (!gameId) {
      return NextResponse.json({ error: 'ID do Jogo é obrigatório' }, { status: 400 });
    }

    // 3. Tentar criar a compra
    // A mágica acontece aqui. O '@@unique([userId, gameId])' no schema.prisma
    // vai falhar e gerar um erro P2002 se o usuário tentar comprar o mesmo jogo duas vezes.
    const newPurchase = await prisma.purchase.create({
      data: {
        userId: userId,
        gameId: gameId,
      },
    });

    return NextResponse.json(newPurchase, { status: 201 }); // 201 Created

  } catch (error: any) {
    // 4. Lidar com erros
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }
    
    // Erro P2002: Violação de restrição única (usuário já comprou este jogo)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Você já possui este jogo' }, { status: 409 }); // 409 Conflict
    }

    console.error("Erro na compra:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}