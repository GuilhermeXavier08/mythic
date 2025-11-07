// src/app/api/users/me/route.ts
import { NextResponse } from 'next/server';
// import { headers } from 'next/headers'; // <-- Não precisamos mais desta linha
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// --- CORREÇÃO AQUI: Adicionamos 'request: Request' como argumento ---
export async function GET(request: Request) {
  try {
    
    // --- CORREÇÃO AQUI: Usamos 'request.headers.get' ---
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        friendCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("[DEBUG] Erro de autenticação:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Sua sessão expirou. Por favor, faça login novamente.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Token inválido. Por favor, faça login novamente.' }, { status: 401 });
  }
}