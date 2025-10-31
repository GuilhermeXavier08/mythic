// src/app/api/games/submit/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function POST(request: Request) {
  try {
    // 1. Autenticar o usuário
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const userId = decoded.userId;

    // 2. Obter os dados do formulário
    const body = await request.json();
    const { title, description, price, imageUrl, gameUrl } = body;

    // 3. Validar os dados
    if (!title || !description || price === undefined || !imageUrl || !gameUrl) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }
    
    // 4. Criar o jogo no banco
    const newGame = await prisma.game.create({
      data: {
        title,
        description,
        price: parseFloat(price), // Garante que o preço é um número
        imageUrl,
        gameUrl,
        status: 'PENDING',       // Status inicial é PENDENTE
        developerId: userId,   // Linka ao usuário logado
      },
    });

    return NextResponse.json(newGame, { status: 201 }); // 201 Created

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    // Lida com o erro de título duplicado
    if (error.code === 'P2002' && error.meta?.target.includes('developerId') && error.meta?.target.includes('title')) {
      return NextResponse.json({ error: 'Você já enviou um jogo com este título.' }, { status: 409 });
    }
    console.error("Erro ao enviar jogo:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}