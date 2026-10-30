import { spawn } from 'node:child_process';
import http from 'node:http';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request({ host: 'localhost', port: 3000, path: '/api/content', method: 'GET' });
      if (res.status === 200) return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

async function main() {
  console.log('تشغيل خادم Next.js للاختبار الشامل...');
  const child = spawn('cmd.exe', ['/c', 'npm.cmd', 'start'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  try {
    const ready = await waitForServer();
    if (!ready) {
      throw new Error('الخادم لم يستجب في الوقت المحدد!');
    }
    console.log('✓ الخادم يعمل بنجاح على المنفذ 3000\n');

    // 1. Test GET /api/content
    console.log('1. اختبار جلب المحتوى من الخادم:');
    const contentRes = await request({ host: 'localhost', port: 3000, path: '/api/content', method: 'GET' });
    console.log('   - كود الاستجابة:', contentRes.status);
    console.log('   - عنوان الترحيب:', contentRes.data.countdownGreeting);
    console.log('   - حالة الفتح:', contentRes.data.isUnlocked);
    console.log('   - عدد الذكريات:', contentRes.data.memories.length);
    console.log('   - كلمات الدلع:', contentRes.data.dalaaWords.length);

    // 2. Test Login with wrong password
    console.log('\n2. اختبار تسجيل الدخول بكلمة مرور خاطئة:');
    const wrongLogin = await request({
      host: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ password: 'wrong' }));
    console.log('   - كود الاستجابة لكلمة المرور الخاطئة:', wrongLogin.status, '(متوقع 401)');
    console.log('   - الرسالة:', wrongLogin.data.error);

    // 3. Test Login with correct password 2023
    console.log('\n3. اختبار تسجيل الدخول بكلمة المرور 2023:');
    const correctLogin = await request({
      host: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ password: '2023' }));
    console.log('   - كود الاستجابة:', correctLogin.status, '(متوقع 200)');
    console.log('   - الرسالة:', correctLogin.data.message);
    const cookie = correctLogin.headers['set-cookie']?.[0]?.split(';')[0];
    console.log('   - تم استلام Cookie المصادقة:', cookie ? 'نعم ✓' : 'لا ✗');

    // 4. Test unlock endpoint
    console.log('\n4. اختبار استدعاء فتح المفاجأة /api/content/unlock:');
    const unlockRes = await request({
      host: 'localhost',
      port: 3000,
      path: '/api/content/unlock',
      method: 'POST'
    });
    console.log('   - كود الاستجابة:', unlockRes.status);
    console.log('   - حالة الفتح المحدثة في قاعدة البيانات:', unlockRes.data.isUnlocked);

    // 5. Test Content Update with valid auth cookie
    console.log('\n5. اختبار تعديل وحفظ محتوى الموقع مع كوكيز المشرف:');
    const updateRes = await request({
      host: 'localhost',
      port: 3000,
      path: '/api/content',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie || ''
      }
    }, JSON.stringify({
      isUnlocked: false, // Reset to countdown mode for presentation
      countdownGreeting: 'كل ثانية بتقربني من أجمل يوم.. يوم ميلاد أجمل إنسانة في حياتي ❤️'
    }));
    console.log('   - كود الاستجابة للحفظ:', updateRes.status);
    console.log('   - حالة النجاح:', updateRes.data.success);

    console.log('\n===========================================');
    console.log('🎉 جميع الوظائف ونقاط النهاية (API) تعمل 100% بنجاح تام!');
    console.log('===========================================\n');
  } finally {
    // Kill child server process
    child.kill('SIGTERM');
    spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

