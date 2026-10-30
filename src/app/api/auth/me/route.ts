import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authenticated = isUserAdmin(request);
  return NextResponse.json({ authenticated });
}
