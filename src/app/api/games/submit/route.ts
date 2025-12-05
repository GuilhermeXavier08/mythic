import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

export async function POST(request: Request) {
  try {
    // 1. Autenticar (código existente...)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    if (decoded.role === 'ADMIN') {
      return NextResponse.json({ error: 'Administradores não podem enviar jogos.' }, { status: 403 });
    }
    const userId = decoded.userId;

    // 2. Obter dados (ADICIONAR genre)
    const body = await request.json();
    const { title, description, price, imageUrl, gameUrl, genre } = body;

    // 3. Validações
    if (!title || !description || price === undefined || !imageUrl || !gameUrl || !genre) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const priceNumber = parseFloat(price);

    // --- NOVA REGRA: PREÇO MÁXIMO ---
    if (priceNumber > 5) {
      return NextResponse.json({ error: 'O preço máximo permitido para jogos é R$ 5,00.' }, { status: 400 });
    }
    
    // 4. Criar o jogo no banco
    const newGame = await prisma.game.create({
      data: {
        title,
        description,
        price: priceNumber,
        imageUrl,
        gameUrl,
        genre: genre, // Salva o gênero escolhido
        status: 'PENDING',
        developerId: userId,
      },
    });

    return NextResponse.json(newGame, { status: 201 });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    if (error.code === 'P2002') { 
      return NextResponse.json({ error: 'Você já enviou um jogo com este título.' }, { status: 409 });
    }
    console.error("Erro ao enviar jogo:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}