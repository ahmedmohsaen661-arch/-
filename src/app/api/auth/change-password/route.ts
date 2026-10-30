import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/auth';
import { updateAdminPassword, verifyAdminPassword } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!isUserAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح لك بتغيير كلمة المرور' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل' }, { status: 400 });
    }

    if (currentPassword && !(await verifyAdminPassword(currentPassword))) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    }

    await updateAdminPassword(newPassword);

    return NextResponse.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'فشل تغيير كلمة المرور' }, { status: 500 });
  }
}
