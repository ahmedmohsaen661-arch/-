import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/auth';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!isUserAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح لك برفع الصور' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let fileExt = 'jpg';

    if (contentType.includes('application/json')) {
      // JSON Base64 Payload
      const json = await request.json();
      const base64Str = json.image || json.dataUrl || json.imageBase64;
      if (!base64Str) {
        return NextResponse.json({ error: 'لم يتم إرسال بيانات الصورة' }, { status: 400 });
      }

      // Check if data URI
      const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        fileExt = mimeType.split('/')[1] || 'jpg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Str, 'base64');
      }
    } else {
      // Standard Multipart Form Data
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
      }

      mimeType = file.type || 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        return NextResponse.json({ error: 'الملف المرفوع يجب أن يكون صورة' }, { status: 400 });
      }

      fileExt = path.extname(file.name).replace('.', '') || (mimeType.split('/')[1] || 'jpg');
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    // 1. Check if Supabase Storage is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const fileName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('memories')
            .getPublicUrl(fileName);

          return NextResponse.json({
            success: true,
            url: publicData.publicUrl,
            message: 'تم رفع الصورة بنجاح إلى التخزين السحابي'
          });
        }
      } catch (err) {
        console.warn('Supabase storage client exception:', err);
      }
    }

    // 2. Try Local uploads directory
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanFileName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = path.join(uploadsDir, cleanFileName);

      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${cleanFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: 'تم حفظ الصورة بنجاح'
      });
    } catch (diskErr) {
      console.warn('Local disk save failed, using base64 fallback:', diskErr);

      // Fallback: Convert to Base64 Data URI so it works 100% everywhere without needing disk
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUri,
        message: 'تم حفظ الصورة بنجاح'
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'فشل رفع وحفظ الصورة: ' + (error?.message || 'خطأ غير معروف')
    }, { status: 500 });
  }
}
