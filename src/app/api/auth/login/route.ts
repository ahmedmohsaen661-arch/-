import { NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'يرجى إدخال كلمة المرور' }, { status: 400 });
    }

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة، حاول مجدداً' }, { status: 401 });
    }

    const token = signToken({ role: 'admin', authAt: Date.now() });

    const response = NextResponse.json({
      success: true,
      token, // Return token for client-side Authorization header
      message: 'تم تسجيل الدخول بنجاح'
    });

    // Detect if connection is HTTPS
    const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
