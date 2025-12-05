import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// Helper para pegar ID do usuário
async function getUserId(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

// GET: Retorna ARRAY de IDs dos jogos na wishlist (Ex: ['game_1', 'game_2'])
export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json([]); // Se não logado, retorna vazio

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      select: { gameId: true } // Seleciona APENAS o ID para ser rápido
    });

    // Transforma [{gameId: '1'}, {gameId: '2'}] em ['1', '2']
    const ids = wishlist.map(item => item.gameId);
    
    return NextResponse.json(ids);
  } catch (error) {
    console.error("Erro GET Wishlist:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST: Adiciona ou Remove (Toggle)
export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { gameId } = await request.json();
    if (!gameId) {
        return NextResponse.json({ error: 'Game ID obrigatório' }, { status: 400 });
    }

    // Verifica se já existe
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (existing) {
      // REMOVE
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false, message: 'Removido da wishlist' });
    } else {
      // ADICIONA
      await prisma.wishlist.create({
        data: { userId, gameId },
      });
      return NextResponse.json({ added: true, message: 'Adicionado à wishlist' });
    }
  } catch (error) {
    console.error("Erro POST Wishlist:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}