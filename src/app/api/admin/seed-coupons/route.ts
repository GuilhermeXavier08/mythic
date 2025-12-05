import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Limpa cupons antigos para evitar duplicatas erradas (Opcional, cuidado em produção)
    // await prisma.coupon.deleteMany(); 

    // 2. Cria o cupom MYTHIC10
    const c1 = await prisma.coupon.upsert({
      where: { code: 'MYTHIC10' },
      update: {}, // Se já existe, não muda nada
      create: { 
        code: 'MYTHIC10', 
        discount: 10, 
        type: 'PERCENTAGE',
        isActive: true,
        maxUses: 1000
      }
    });

    // 3. Cria o cupom DESCONTO5
    const c2 = await prisma.coupon.upsert({
        where: { code: 'DESCONTO5' },
        update: {},
        create: { 
          code: 'DESCONTO5', 
          discount: 5, 
          type: 'FIXED',
          isActive: true,
          maxUses: 1000
        }
      });

    return NextResponse.json({ 
        message: 'Cupons criados/verificados com sucesso!',
        created: [c1, c2]
    });

  } catch (error: any) {
    console.error("Erro ao criar cupons:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}