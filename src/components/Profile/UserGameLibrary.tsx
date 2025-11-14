import { prisma } from '@/lib/prisma';

export default async function UserGameLibrary({ userId }: { userId: string }) {
  // Busca simples de compras públicas do usuário
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { game: { select: { id: true, title: true, imageUrl: true } } },
    take: 12,
  });

  return (
    <section style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ color: '#fff', marginBottom: '0.75rem' }}>Jogos</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
        {purchases.length === 0 ? (
          <div style={{ color: '#a7a7a7', padding: '1rem', borderRadius: 8, border: '1px dashed #3a3a3a' }}>
            Nenhum jogo na biblioteca pública.
          </div>
        ) : (
          purchases.map((p: any) => (
            <div key={p.game.id} style={{ background: '#1a1a1a', padding: 8, borderRadius: 8, textAlign: 'center' }}>
              {p.game.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.game.imageUrl} alt={p.game.title} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6 }} />
              ) : (
                <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a7a7a7' }}>Sem imagem</div>
              )}
              <div style={{ marginTop: 8, color: '#fff', fontWeight: 600 }}>{p.game.title}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
