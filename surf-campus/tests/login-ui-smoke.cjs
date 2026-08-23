const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');

const BASE_URL = process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const executablePath = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync(executablePath) ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const originalResponse = await page.request.get(`${BASE_URL}/api/auth/session`);
  const original = await originalResponse.json();

  try {
    await page.request.delete(`${BASE_URL}/api/auth/session`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const login = page.locator('#login-experience');
    assert(await login.isVisible(), '首次访问没有显示互动登录页');
    assert(await page.locator('.mascot').count() === 4, '卡通角色数量不是 4');

    await page.locator('#login-email').focus();
    assert(await login.getAttribute('data-mood') === 'email', '邮箱聚焦没有触发好奇状态');

    await page.locator('#login-password').focus();
    assert(await login.getAttribute('data-mood') === 'password', '密码聚焦没有触发遮眼状态');
    await page.waitForTimeout(180);
    const handOpacity = await page.locator('.mascot-orange .arm-left').evaluate(element => Number(getComputedStyle(element).opacity));
    assert(handOpacity > 0, '密码聚焦时角色双手没有出现');

    await page.locator('#password-toggle').click();
    assert(await login.getAttribute('data-mood') === 'peek', '显示密码没有触发偷看状态');

    await page.locator('#login-email').fill('student@xjtlu.edu.cn');
    await page.locator('#login-password').fill('wrong12');
    await page.locator('#email-login-form .login-submit').click();
    await page.waitForSelector('#email-login-message:not(:empty)');
    assert((await page.locator('#email-login-message').innerText()).includes('不正确'), '错误密码没有显示恢复信息');

    await page.locator('#login-password').fill('SURF2026');
    await page.locator('#email-login-form .login-submit').click();
    await login.waitFor({ state: 'hidden' });
    assert(await page.locator('#app-shell').isVisible(), '登录成功后没有进入校园首页');

    console.log(JSON.stringify({ firstVisitGate: 'ok', fourMascots: 'ok', emailFocus: 'ok', passwordCover: 'ok', peekState: 'ok', errorState: 'ok', successEntry: 'ok' }));
  } finally {
    if (original.phone_authenticated) {
      const masked = original.phone_masked || '138****0001';
      const phone = `${masked.slice(0, 3)}0000${masked.slice(-4)}`;
      await page.request.post(`${BASE_URL}/api/auth/phone`, { data: { phone, code: '123456' } });
      if (original.campus_verified) {
        await page.request.post(`${BASE_URL}/api/auth/xjtlu/mock-bind`, { data: { account: original.campus_account || 'student@student.xjtlu.edu.cn' } });
      }
    } else {
      await page.request.delete(`${BASE_URL}/api/auth/session`);
    }
    await browser.close();
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
