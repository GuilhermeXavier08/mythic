import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);

    // 1. Busca compras para somar a receita real
    const purchases = await prisma.purchase.findMany({
      select: {
        pricePaid: true, // Prioridade: Preço pago com desconto
        game: {
          select: { price: true } // Fallback (caso seja compra antiga)
        }
      }
    });

    const totalRevenue = purchases.reduce((acc, purchase) => {
      // Usa o pricePaid. Se for 0 (e não for gratuito), pode ser dado legado, mas assumimos pricePaid como fonte da verdade para novas compras.
      return acc + (purchase.pricePaid);
    }, 0);

    const totalSales = await prisma.purchase.count();

    const totalGames = await prisma.game.count({
      where: { status: 'APPROVED' }
    });

    const pendingGames = await prisma.game.count({
      where: { status: 'PENDING' }
    });

    // Contagem simples de usuários (poderia ser prisma.user.count())
    const usersCount = await prisma.user.count();

    return NextResponse.json({
      revenue: totalRevenue,
      totalSales: totalSales,
      totalGames: totalGames,
      pendingGames: pendingGames,
      activeUsers: usersCount
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao calcular stats:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}