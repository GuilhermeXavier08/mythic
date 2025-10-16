// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Extrair os dados do corpo da requisição
    const body = await request.json();
    const { username, email, password } = body;

    // 2. Validar os dados de entrada
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    // 3. Verificar se o email ou username já existem
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 }); // 409 Conflict
    }

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso' }, { status: 409 });
    }

    // 4. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10); // O 10 é o "custo" do hash

    // 5. Salvar o novo usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // 6. Retornar uma resposta de sucesso (sem a senha!)
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}