// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Instancie o Prisma fora da função (ou use a lib que fizemos)
import { prisma } from '@/lib/prisma';

// --- NOVA FUNÇÃO HELPER ---
// Esta função gera um código e verifica se ele já existe no banco
async function generateUniqueFriendCode(): Promise<number> {
  let code: number;
  // Loop until we find a code that isn't used
  while (true) {
    // Gera um número aleatório entre 100.000.000 e 999.999.999
    code = Math.floor(100_000_000 + Math.random() * 900_000_000);

    // Verifica se algum usuário já tem esse código
    const existingUser = await prisma.user.findUnique({ where: { friendCode: code } });
    if (!existingUser) break;
  }

  return code; // Retorna o código único
}
// --- FIM DA FUNÇÃO HELPER ---


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 });
    }

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // --- GERA O NOVO CÓDIGO ---
    const friendCode = await generateUniqueFriendCode();

    // --- SALVA O USUÁRIO COM O NOVO CÓDIGO ---
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        friendCode: friendCode, // <-- ADICIONADO
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}