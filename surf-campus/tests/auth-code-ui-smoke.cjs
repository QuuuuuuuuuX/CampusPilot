const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');

const BASE_URL = process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const executablePath = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync(executablePath) ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    await page.request.delete(`${BASE_URL}/api/auth/session`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.locator('#create-account').click();
    assert(await page.locator('#email-register-form').isVisible(), 'Sign up 没有进入邮箱注册表单');
    await page.locator('#register-email').fill(`ui_${Date.now()}@example.com`);
    await page.locator('#send-email-code').click();
    await page.waitForSelector('#email-register-message.is-success');
    assert((await page.locator('#email-register-message').innerText()).includes('123456'), '本地邮箱验证码没有显示');
    await page.locator('#register-email-code').fill('123456');
    await page.locator('#register-password').fill('secret123');
    await page.locator('#register-password-confirm').fill('secret123');
    await page.locator('#email-register-form .login-submit').click();
    await page.locator('#login-experience').waitFor({ state: 'hidden' });

    await page.request.delete(`${BASE_URL}/api/auth/session`);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#phone-login-tab').click();
    await page.locator('#login-phone').fill('13800138000');
    await page.locator('#send-code').click();
    await page.waitForSelector('#phone-login-message.is-success');
    assert((await page.locator('#phone-login-message').innerText()).includes('123456'), '本地短信验证码没有显示');
    console.log(JSON.stringify({ emailSignupUI: 'ok', phoneCodeUI: 'ok' }));
  } finally {
    await page.request.delete(`${BASE_URL}/api/auth/session`);
    await browser.close();
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
