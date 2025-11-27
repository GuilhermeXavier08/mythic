// src/app/api/play/[gameId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
}

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    // 1. Autenticar o usuário
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    
    const userId = decoded.userId;

    // --- MUDANÇA AQUI ---
    // Em vez de: const { gameId } = params;
    // Acessamos diretamente para o aviso sumir
    const gameId = params.gameId;
    // --- FIM DA MUDANÇA ---

    // 2. Verificar se o usuário POSSUI este jogo
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: userId,
        gameId: gameId,
      },
      include: {
        game: { // 3. Se ele possui, pegue os dados do jogo
          select: {
            gameUrl: true,
            title: true,
          },
        },
      },
    });

    // 4. Se não houver compra, ou o jogo não for encontrado
    if (!purchase || !purchase.game) {
      return NextResponse.json(
        { error: 'Acesso negado. Você não possui este jogo.' },
        { status: 403 } // 403 Forbidden
      );
    }

    // 5. Sucesso: Retorna a URL e o título do jogo
    return NextResponse.json(purchase.game, { status: 200 });

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}