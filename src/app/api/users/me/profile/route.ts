import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

// Garanta que esta chave secreta está no seu arquivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        } catch (err) {
            console.error('[GET /api/users/me/profile] Erro de JWT:', err);
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const userId = decoded.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                bio: true,
                avatarUrl: true,
                friendCode: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error('[GET /api/users/me/profile] Erro:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar perfil' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        } catch (err) {
            // Se o token expirou (TokenExpiredError) ou é inválido
            console.error('[PUT /api/users/me/profile] Erro de JWT:', err);
            return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });
        }

        const userId = decoded.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const form = await request.formData();
        const username = form.get('username')?.toString() || undefined;
        const email = form.get('email')?.toString() || undefined;
        const bio = form.get('bio')?.toString() || undefined;
        const avatar = form.get('avatar') as unknown as File | null;

        // --- Checagem de Unicidade ---
        if (username) {
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing && existing.id !== userId) {
                return NextResponse.json({ error: 'Nome de usuário já está em uso' }, { status: 409 });
            }
        }
        if (email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== userId) {
                return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
            }
        }

        // --- Lógica de Upload de Avatar ---
        let avatarUrl: string | undefined = undefined;
        if (avatar && typeof (avatar as any).arrayBuffer === 'function') {
            try {
                const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
                await fs.mkdir(uploadsDir, { recursive: true });

                const originalName = (avatar as any).name || `${userId}.jpg`;
                const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filename = `${userId}-${Date.now()}-${safeName}`;
                const filePath = path.join(uploadsDir, filename);

                const buffer = Buffer.from(await (avatar as any).arrayBuffer());
                await fs.writeFile(filePath, buffer);
                avatarUrl = `/uploads/avatars/${filename}`;
            } catch (err) {
                console.error('Erro salvando avatar:', err);
                // NOTA: Se o upload falhar, você pode querer lançar um erro 500
            }
        }

        // --- Construção do Objeto de Dados para o Prisma ---
        const updateData: {
            username?: string;
            email?: string;
            bio?: string | null;
            avatarUrl?: string | null;
        } = {};

        if (username !== undefined) {
            updateData.username = username;
        }
        if (email !== undefined) {
            updateData.email = email;
        }
        // Se bio for vazio (''), define como null no banco (limpando o campo opcional)
        if (bio !== undefined) {
            updateData.bio = bio === '' ? null : bio;
        }
        // Adiciona avatarUrl apenas se um novo arquivo foi carregado
        if (avatarUrl) {
            updateData.avatarUrl = avatarUrl;
        }

        // --- Execução da Atualização no Prisma ---
        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                bio: true,         
                avatarUrl: true,   
                friendCode: true,  
                createdAt: true,   
            }, 
        });

        return NextResponse.json({ user: updated }, { status: 200 });

    } catch (error: any) {
        if (error && typeof error === 'object' && 'clientVersion' in error) {
            console.error('[Prisma Client Error Details]:', error);
            return NextResponse.json({
                error: 'Erro de validação do banco (Prisma)',
                details: error.message || 'Verifique o console do servidor para detalhes.'
            }, { status: 500 });
        }

        console.error('[PUT /api/users/me/profile] Erro Genérico:', error);
        return NextResponse.json({ error: 'Erro interno ao atualizar perfil' }, { status: 500 });
    }
}