import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function UserFriendList({ userId }: { userId: string }) {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userId1: userId }, { userId2: userId }] },
    include: {
      user1: { select: { id: true, username: true, friendCode: true } },
      user2: { select: { id: true, username: true, friendCode: true } },
    },
    take: 12,
  });

  const friends = friendships.map((f: any) => (f.userId1 === userId ? f.user2 : f.user1));

  return (
    <section>
      <h3 style={{ color: '#fff', marginBottom: 12 }}>Amigos</h3>
      {friends.length === 0 ? (
        <div style={{ color: '#a7a7a7', padding: 12, borderRadius: 8, border: '1px dashed #3a3a3a' }}>Nenhum amigo público.</div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {friends.map((fr: any) => (
            <Link key={fr.id} href={`/profile/${fr.username}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#1a1a1a', padding: 12, borderRadius: 8, minWidth: 140 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{fr.username}</div>
                <div style={{ color: '#a7a7a7' }}>ID: {fr.friendCode}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
