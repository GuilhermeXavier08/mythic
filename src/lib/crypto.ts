// src/lib/crypto.ts
import crypto from 'crypto';

// Em produção, isso ficaria no .env. Como é faculdade, deixei um fallback fixo.
// A chave PRECISA ter 32 caracteres para AES-256.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'br-utfpr-projeto-faculdade-key12'; // 32 chars
const IV_LENGTH = 16; // Para AES, isso é sempre 16

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text) return '';
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}