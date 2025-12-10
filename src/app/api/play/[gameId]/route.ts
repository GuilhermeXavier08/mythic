import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
}

// 1. MUDANÇA NA ASSINATURA: params agora é uma Promise
export async function GET(
  request: Request,
  props: { params: Promise<{ gameId: string }> } 
) {
  try {
    // 2. MUDANÇA AQUI: Aguarde os params antes de ler o ID
    const params = await props.params;
    const gameId = params.gameId;

    // --- Autenticação ---
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    // Adicionei tratamento de erro no verify para evitar crash se o token for malformado
    let decoded: UserPayload;
    try {
        decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (err) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
    if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
    const userId = decoded.userId;

    // --- Verificar Compra ---
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: userId,
        gameId: gameId,
      },
      include: {
        game: { 
          select: {
            gameUrl: true,
            title: true,
          },
        },
      },
    });

    // Se não houver compra, ou o jogo não for encontrado
    if (!purchase || !purchase.game) {
      return NextResponse.json(
        { error: 'Acesso negado. Você não possui este jogo.' },
        { status: 403 }
      );
    }

    // Sucesso
    return NextResponse.json(purchase.game, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API Play:", error); // Bom para debugar
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}