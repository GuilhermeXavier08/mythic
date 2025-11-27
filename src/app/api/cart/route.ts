// src/app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken'; // <-- Importe o jwt

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// --- ESTE É O CÓDIGO QUE FALTAVA ---
interface UserPayload {
  userId: string;
}

// Helper para pegar o token e o ID do usuário
async function getUserIdFromToken(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
// --- FIM DO CÓDIGO FALTANTE ---


// --- GET: BUSCA OS ITENS DO CARRINHO ---
export async function GET(request: Request) {
  try {
    // Agora esta linha funciona
    const userId = await getUserIdFromToken(request); 
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            game: true,
          },
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    if (!cart) {
      // (Esta é a correção do erro anterior)
      return NextResponse.json([], { status: 200 });
    }

    // Retorna apenas os itens (que é um array)
    return NextResponse.json(cart.items, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// --- POST: ADICIONA UM ITEM AO CARRINHO ---
export async function POST(request: Request) {
  try {
    // E esta linha também funciona
    const userId = await getUserIdFromToken(request); 
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { gameId } = await request.json();
    if (!gameId) {
      return NextResponse.json({ error: 'ID do Jogo é obrigatório' }, { status: 400 });
    }

    // 1. Verifica se o usuário JÁ POSSUI este jogo
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId, gameId },
    });
    if (existingPurchase) {
      return NextResponse.json({ error: 'Você já possui este jogo' }, { status: 409 });
    }

    // 2. Encontra o carrinho do usuário, ou CRIA UM se não existir
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // 3. Tenta criar o CartItem
    const newCartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        gameId: gameId,
      },
      include: {
        game: true, // Retorna o item com os dados do jogo
      },
    });

    return NextResponse.json(newCartItem, { status: 201 });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Este jogo já está no seu carrinho' }, { status: 409 });
    }
    console.error("Erro ao adicionar ao carrinho:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}