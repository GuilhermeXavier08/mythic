// src/lib/adminAuth.ts
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Verifica o token de autorização e checa se o usuário é um Admin.
 * Retorna o ID do usuário se for admin, ou lança um erro caso contrário.
 */
export async function verifyAdmin(request: Request): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Não autorizado: Sem token');
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

  if (!decoded || !decoded.userId) {
    throw new Error('Não autorizado: Token inválido');
  }

  // Verifica se a role no token é ADMIN
  if (decoded.role !== 'ADMIN') {
    throw new Error('Não autorizado: Acesso negado');
  }

  // Opcional, mas recomendado: Verificar no banco se o usuário *ainda* é admin
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Não autorizado: Acesso negado');
  }

  return user.id;
}