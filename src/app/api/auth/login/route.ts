// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // --- CRIAÇÃO DO TOKEN ---
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      // MUDANÇA AQUI: De '1h' para '365d' (1 ano de duração)
      { expiresIn: '365d' } 
    );
    // ------------------------

    return NextResponse.json({ message: 'Login bem-sucedido!', token }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}