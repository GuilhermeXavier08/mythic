// src/app/api/users/me/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// Função auxiliar para verificar o token e decodificar o userId
async function authenticate(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Não autorizado', status: 401 };
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    if (!user) {
      return { error: 'Usuário não encontrado', status: 404 };
    }

    return { user };

  } catch (error) {
    console.error("[DEBUG] Erro de autenticação:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return { error: 'Sua sessão expirou. Por favor, faça login novamente.', status: 401 };
    }
    return { error: 'Token inválido. Por favor, faça login novamente.', status: 401 };
  }
}

// ---------------------------------------------------------------------

// [SEU CÓDIGO ORIGINAL] Rota GET para obter informações do usuário
export async function GET(request: Request) {
  const authResult = await authenticate(request);

  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const user = authResult.user;

  // Se o usuário foi encontrado, retorna as informações
  return NextResponse.json(user, { status: 200 });
}

export async function DELETE(request: Request) {
  const authResult = await authenticate(request);

  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id: userId } = authResult.user!; // ID do usuário autenticado

  try {
    await prisma.$transaction(async (tx) => {

      // 1. Deletar Amizades (Friendship) e Requisições (FriendshipRequest)
      await tx.friendship.deleteMany({ where: { OR: [{ userId1: userId }, { userId2: userId }] } });
      await tx.friendshipRequest.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });

      // 2. Deletar Carrinho (Cart) e Itens de Carrinho
      // A ordem é importante: primeiro os itens (filhos), depois o carrinho (pai)
      const userCart = await tx.cart.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        await tx.cart.delete({ where: { id: userCart.id } });
      }

      // 3. Deletar Compras (Purchase)
      await tx.purchase.deleteMany({ where: { userId: userId } });

      // 4. Deletar Jogos Submetidos (Game), se o usuário for developer
      await tx.game.deleteMany({ where: { developerId: userId } });

      // 5. Finalmente, deletar o Usuário
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Retorna 204 No Content para deleção bem-sucedida.
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    // Se a conta já foi excluída ou outro erro de DB
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário já excluído ou não encontrado.' }, { status: 404 });
    }

    console.error("Erro ao deletar conta:", error);
    return NextResponse.json({ error: 'Falha interna ao processar a exclusão da conta.' }, { status: 500 });
  }
}