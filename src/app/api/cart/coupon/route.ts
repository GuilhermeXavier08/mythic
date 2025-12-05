import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Busca o cupom (case insensitive, se possível, ou converte upper)
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() } 
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Este cupom foi desativado' }, { status: 400 });
    }

    // Verifica validade
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 });
    }

    // Verifica limite de uso
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Limite de uso do cupom atingido' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 });
  }
}