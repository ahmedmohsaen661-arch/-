import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = checkAdminAuth(request);
  return NextResponse.json({
    authenticated: auth.valid,
    token: auth.token || null,
  });
}
