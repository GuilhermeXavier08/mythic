// src/app/api/cart/[itemId]/route.ts
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

// --- DELETE: REMOVE UM ITEM DO CARRINHO ---
export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    // Agora esta linha funciona
    const userId = await getUserIdFromToken(request); 
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { itemId } = params; // ID do CartItem, não do jogo

    // 1. Verifica se o usuário é "dono" deste item do carrinho
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: userId,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado ou não pertence a você' }, { status: 404 });
    }

    // 2. Deleta o item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Item removido com sucesso' }, { status: 200 });

  } catch (error) {
    console.error("Erro ao remover item:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}