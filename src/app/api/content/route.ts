import { NextResponse } from 'next/server';
import { getSiteContent, updateSiteContent } from '@/lib/db';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isUserAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل المحتوى' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await updateSiteContent(body);
    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    console.error('Error updating site content:', error);
    return NextResponse.json({
      error: 'حدث خطأ أثناء حفظ التعديلات: ' + (error?.message || 'يرجى مراجعة إعدادات الخادم')
    }, { status: 500 });
  }
}
