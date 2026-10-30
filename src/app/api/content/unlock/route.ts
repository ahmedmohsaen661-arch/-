import { NextResponse } from 'next/server';
import { unlockSurprise, getSiteContent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await unlockSurprise();
    const content = await getSiteContent();
    return NextResponse.json({ success: true, isUnlocked: content.isUnlocked });
  } catch (error) {
    console.error('Error unlocking surprise:', error);
    return NextResponse.json({ error: 'Failed to unlock surprise' }, { status: 500 });
  }
}
