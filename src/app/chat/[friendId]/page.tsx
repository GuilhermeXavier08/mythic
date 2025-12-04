'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Chat.module.css';
import { FaPaperPlane, FaArrowLeft, FaUserCircle } from 'react-icons/fa';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export default function ChatPage() {
  const { friendId } = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getHeaders = () => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user?.id) headers['x-user-id'] = user.id;
    return headers;
  };

  const fetchMessages = async () => {
    if (!friendId || !user) return;
    try {
      // friendId do useParams pode ser string ou array, garantimos string
      const idToFetch = Array.isArray(friendId) ? friendId[0] : friendId;
      const res = await fetch(`/api/chat/${idToFetch}`, { headers: getHeaders() });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token && user) {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling a cada 3s
        return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId, token, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;
    const tempText = newMessage;
    setNewMessage(''); 

    try {
      const idToSend = Array.isArray(friendId) ? friendId[0] : friendId;
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ receiverId: idToSend, content: tempText })
      });
      fetchMessages();
    } catch (error) { setNewMessage(tempText); }
  };

  if (loading) return <div className={styles.container}><p style={{padding:20}}>Carregando...</p></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <FaArrowLeft />
        </button>
        <div className={styles.friendInfo}>
          <FaUserCircle size={32} className={styles.avatarIcon} />
          <span className={styles.friendName}>Chat</span> 
        </div>
      </header>

      <div className={styles.messagesArea}>
        {messages.map((msg) => {
          // Compara IDs para definir se a mensagem é minha ou do amigo
          const isMe = msg.senderId === user?.id;
          
          return (
            <div
              key={msg.id}
              className={`${styles.messageBubble} ${isMe ? styles.sent : styles.received}`}
            >
              <p>{msg.text}</p>
              <span className={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.input}
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}