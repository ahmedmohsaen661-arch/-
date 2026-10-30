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

export function checkAdminAuth(request?: Request): { valid: boolean; token?: string; payload?: any } {
  // 1. Check Authorization Bearer header first (works in all environments, HTTPS, HTTP, mobile)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7).trim();
      const res = verifyToken(token);
      if (res.valid) return { valid: true, token, payload: res.payload };
    }

    // 2. Check Cookie header string directly from request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        const res = verifyToken(token);
        if (res.valid) return { valid: true, token, payload: res.payload };
      }
    }
  }

  // 3. Check Cookie via Next.js cookies()
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const res = verifyToken(token);
      if (res.valid) return { valid: true, token, payload: res.payload };
    }
  } catch {
    // cookies() might throw in some static or non-standard context
  }

  return { valid: false };
}

export function isUserAdmin(request?: Request): boolean {
  return checkAdminAuth(request).valid;
}
