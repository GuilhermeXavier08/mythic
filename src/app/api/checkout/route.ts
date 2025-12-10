import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { awardBadge } from '@/lib/gamification';
import { encrypt } from '@/lib/crypto'; // <--- IMPORTAMOS A CRIPTOGRAFIA

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

interface UserPayload {
  userId: string;
}

async function getUserIdFromToken(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // --- MUDANÇA: Recebemos também os dados do cartão ---
    const { couponCode, paymentData } = await request.json();

    // Validação básica se os dados vieram (mesmo sendo fake)
    if (!paymentData || !paymentData.cardNumber || !paymentData.cvv) {
        return NextResponse.json({ error: 'Dados de pagamento incompletos' }, { status: 400 });
    }
    // ----------------------------------------------------

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
            include: { game: true }
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Seu carrinho está vazio' }, { status: 400 });
    }

    // Lógica de Cupom (MANTIDA IGUAL)
    let discountMultiplier = 1; 
    let couponIdToUpdate = null;

    if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
            where: { code: couponCode.toUpperCase() } 
        });

        if (coupon && coupon.isActive && (coupon.usedCount < coupon.maxUses)) {
             if (!coupon.expiresAt || new Date() < coupon.expiresAt) {
                couponIdToUpdate = coupon.id;

                if (coupon.type === 'PERCENTAGE') {
                    discountMultiplier = 1 - (coupon.discount / 100);
                } else if (coupon.type === 'FIXED') {
                    const cartTotal = cart.items.reduce((acc, item) => acc + item.game.price, 0);
                    if (cartTotal > 0) {
                        const finalTotal = Math.max(0, cartTotal - coupon.discount);
                        discountMultiplier = finalTotal / cartTotal;
                    } else {
                        discountMultiplier = 0;
                    }
                }
             }
        }
    }

    const purchaseData = cart.items.map((item) => {
        const originalPrice = item.game.price;
        const finalPrice = originalPrice * discountMultiplier;
        return {
            userId: userId,
            gameId: item.gameId,
            pricePaid: parseFloat(finalPrice.toFixed(2))
        };
    });

    const purchasedGameIds = cart.items.map((item) => item.gameId);

    // Transação
    await prisma.$transaction(async (tx) => {
      // 1. Criar as compras
      await tx.purchase.createMany({
        data: purchaseData,
        skipDuplicates: true,
      });

      // 2. Limpar carrinho
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 3. Limpar wishlist
      if (purchasedGameIds.length > 0) {
        await tx.wishlist.deleteMany({
          where: {
            userId: userId,
            gameId: { in: purchasedGameIds }
          }
        });
      }

      // 4. Atualizar cupom
      if (couponIdToUpdate) {
        await tx.coupon.update({
            where: { id: couponIdToUpdate },
            data: { usedCount: { increment: 1 } }
        });
      }

      // 5. --- NOVO: SALVAR DADOS CRIPTOGRAFADOS DO CARTÃO ---
      // Nunca salvamos cartão real, mas como é fake e o requisito pede:
      await tx.paymentLog.create({
        data: {
            userId: userId,
            encryptedCardName: encrypt(paymentData.cardName),
            encryptedCardNumber: encrypt(paymentData.cardNumber), // Criptografado!
            encryptedCVV: encrypt(paymentData.cvv),               // Criptografado!
            encryptedExpiry: encrypt(paymentData.expiry)
        }
      });
      // -----------------------------------------------------
    });

    await awardBadge(userId, 'FIRST_BUY');

    await prisma.notification.create({
      data: {
        userId,
        message: `Compra realizada com sucesso!`,
        link: '/library' 
      }
    });

    return NextResponse.json({ message: 'Compra finalizada!' }, { status: 200 });

  } catch (error) {
    console.error("Erro no checkout:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}