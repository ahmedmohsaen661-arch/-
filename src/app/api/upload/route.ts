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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    // Verify it is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'الملف المرفوع يجب أن يكون صورة' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Check if Supabase Storage is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(fileName, buffer, {
            contentType: file.type,
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
        } else {
          console.warn('Supabase storage upload failed:', uploadError.message);
        }
      } catch (err) {
        console.warn('Supabase storage client exception:', err);
      }
    }

    // 2. Try Local uploads directory if writable
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExt = path.extname(file.name) || '.jpg';
      const cleanFileName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;
      const filePath = path.join(uploadsDir, cleanFileName);

      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${cleanFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: 'تم حفظ الصورة بنجاح'
      });
    } catch {
      // Local directory is read-only (e.g. Vercel serverless without Supabase Storage)
      // Convert to Base64 Data URI so it works 100% everywhere without requiring a disk
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${file.type || 'image/jpeg'};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUri,
        message: 'تم حفظ الصورة بنجاح (تخزين مباشر)'
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'فشل رفع وحفظ الصورة: ' + (error?.message || 'خطأ غير معروف')
    }, { status: 500 });
  }
}
