// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// --- Interface e Helper que já usamos ---
interface UserPayload {
  userId: string;
}

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
// --- Fim do Helper ---

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 1. Encontrar o carrinho do usuário e seus itens
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true, // Pega todos os CartItems
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Seu carrinho está vazio' }, { status: 400 });
    }

    // 2. Preparar os dados para a criação das 'Purchases'
    const purchaseData = cart.items.map((item) => ({
      userId: userId,
      gameId: item.gameId,
    }));

    // 3. Executar a transação
    // Isso garante que ambas as operações (criar compras e limpar carrinho)
    // aconteçam, ou nenhuma delas aconteça.
    await prisma.$transaction(async (tx) => {
      // (a) Cria as novas compras
      await tx.purchase.createMany({
        data: purchaseData,
        skipDuplicates: true, // Ignora se o usuário já comprou (segurança extra)
      });

      // (b) Deleta todos os itens do carrinho
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
    });

    return NextResponse.json({ message: 'Compra finalizada com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error("Erro no checkout:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao finalizar a compra' }, { status: 500 });
  }
}