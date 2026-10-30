import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'romantic_secret_birthday_key_2026_super_secure';
export const COOKIE_NAME = 'admin_token';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { valid: boolean; payload?: any } {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export function isUserAdmin(request?: Request): boolean {
  // 1. Check Authorization Bearer header first (works in all environments, HTTPS, HTTP, mobile)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7).trim();
      const { valid } = verifyToken(token);
      if (valid) return true;
    }
  }

  // 2. Check Cookie
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const { valid } = verifyToken(token);
      if (valid) return true;
    }
  } catch {
    // cookies() might throw in some static or non-standard context
  }

  return false;
}
