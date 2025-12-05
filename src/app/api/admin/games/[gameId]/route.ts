/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

// PATCH (Atualiza o status de um jogo - Aprovar/Rejeitar)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> } // <--- Correção de Tipo
) {
  try {
    // 1. Aguardar params (Obrigatório no Next.js novo)
    const { gameId } = await params;

    // 2. Verifica se é Admin
    await verifyAdmin(request);

    const body = await request.json();
    const { status } = body; // Espera 'APPROVED' ou 'REJECTED'

    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // 3. Atualiza o jogo no banco
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedGame, { status: 200 });

  } catch (error: any) {
    console.error("Erro no PATCH:", error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 401 }); // 401 ou 500 dependendo do erro
  }
}

// DELETE (Remove o jogo do banco e suas dependências)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> } // <--- Correção de Tipo
) {
  try {
    // 1. Aguardar params
    const { gameId } = await params;

    // 2. Verifica se é Admin
    await verifyAdmin(request);

    // 3. Deleta o jogo e dependências via Transação
    // (Resolve o erro de Foreign Key Constraint)
    await prisma.$transaction([
      // Remove avaliações
      prisma.review.deleteMany({
        where: { gameId: gameId },
      }),
      // Remove itens do carrinho
      prisma.cartItem.deleteMany({
        where: { gameId: gameId },
      }),
      // Remove histórico de compras
      prisma.purchase.deleteMany({
        where: { gameId: gameId },
      }),
      // Finalmente, remove o jogo
      prisma.game.delete({
        where: { id: gameId },
      }),
    ]);

    return NextResponse.json({ message: 'Jogo removido com sucesso.' }, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao deletar jogo:", error);
    
    return NextResponse.json(
      { error: error.message || 'Erro ao remover o jogo.' }, 
      { status: 500 }
    );
  }
}