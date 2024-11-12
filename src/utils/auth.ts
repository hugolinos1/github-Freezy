import { SignJWT, jwtVerify } from 'jose';
import { User } from '../types';

const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET);

export async function createToken(user: User): Promise<string> {
  const jwt = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return jwt;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}