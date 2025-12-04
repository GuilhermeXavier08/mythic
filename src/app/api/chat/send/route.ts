import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <--- Importando do seu arquivo correto

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id'); // Substitua pela sua auth real

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content } = body;

    // Validação básica
    if (!receiverId || !content) {
        return NextResponse.json({ error: 'Faltam dados' }, { status: 400 });
    }

    // Salva a mensagem no banco
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        senderId: userId,
        receiverId: receiverId,
      },
    });

    return NextResponse.json(newMessage);

  } catch (error) {
    console.error('Erro ao enviar:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}