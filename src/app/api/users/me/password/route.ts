/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function PUT(request: Request) {
  try {
    // Autenticação: Obter userId do JWT
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login novamente.' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      if (!decoded?.userId) {
        return NextResponse.json(
          { error: 'Não autorizado. Faça login novamente.' },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error('[DEBUG] Erro de JWT:', jwtError);
      return NextResponse.json(
        { error: 'Sessão expirada. Faça login novamente.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Obter dados do corpo da requisição
    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    // Validação
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias.' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'A nova senha deve ser diferente da senha atual.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Verificar se a senha atual está correta
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta.' },
        { status: 401 }
      );
    }

    // Criptografar a nova senha
    const hashedPassword = await hash(newPassword, 10);

    // Atualizar a senha no banco
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: 'Senha atualizada com sucesso.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar a senha.' },
      { status: 500 }
    );
  }
}
