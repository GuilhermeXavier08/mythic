'use client';

import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import styles from './NotificationBell.module.css'; // Crie um CSS básico ou use inline
import Link from 'next/link';

interface Notification {
  id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (e) { console.error(e); }
  };

  // Busca inicial e polling a cada 60s (opcional)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Marca como lido visualmente
      setUnreadCount(0);
      // Marca como lido no backend
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={handleOpen}
        style={{ 
          background: 'transparent', border: 'none', color: 'white', 
          cursor: 'pointer', position: 'relative', fontSize: '1.2rem' 
        }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            background: 'red', color: 'white', fontSize: '0.7rem',
            borderRadius: '50%', width: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '40px', right: '0',
          width: '300px', background: '#222', border: '1px solid #444',
          borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          zIndex: 100, overflow: 'hidden'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #333', fontWeight: 'bold' }}>
            Notificações
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhuma notificação.</p>
            ) : (
              notifications.map(note => (
                <div key={note.id} style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #333',
                  background: note.read ? 'transparent' : 'rgba(112, 0, 255, 0.1)'
                }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{note.message}</p>
                  {note.link && (
                    <Link href={note.link} onClick={() => setIsOpen(false)} style={{ fontSize: '0.8rem', color: '#7000ff' }}>
                      Ver detalhes →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}