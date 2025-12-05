import { prisma } from '@/lib/prisma';

// Função para dar uma medalha e notificar o usuário
export async function awardBadge(userId: string, badgeCode: string) {
  try {
    // 1. Acha a medalha no banco pelo código (ex: "FIRST_BUY")
    const badge = await prisma.badge.findUnique({
      where: { code: badgeCode }
    });

    if (!badge) {
        console.warn(`Gamification: Medalha com código '${badgeCode}' não encontrada no banco.`);
        return; 
    }

    // 2. Verifica se o usuário já tem essa medalha
    const alreadyHas = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id
        }
      }
    });

    if (alreadyHas) return; // Já tem, não faz nada

    // 3. Dá a medalha e cria a notificação em uma transação
    await prisma.$transaction([
      prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id
        }
      }),
      prisma.notification.create({
        data: {
          userId,
          message: `Parabéns! Você desbloqueou a conquista: ${badge.name} 🎉`,
          link: `/profile/${userId}` // Link para ver a medalha no perfil
        }
      })
    ]);

    console.log(`Gamification: Medalha ${badgeCode} entregue para ${userId}`);

  } catch (error) {
    console.error("Erro ao entregar medalha:", error);
  }
}