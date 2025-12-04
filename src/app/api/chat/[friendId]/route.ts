import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

    const { friendId } = await params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        senderId: true, // <--- ENVIAMOS O ID DE QUEM MANDOU
        createdAt: true,
      }
    });

    // Retorna os dados puros, sem tentar converter para 'me' ou 'friend' aqui
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      text: msg.content,
      senderId: msg.senderId, // <--- MUDANÇA IMPORTANTE
      timestamp: msg.createdAt
    }));

    return NextResponse.json(formattedMessages);

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}