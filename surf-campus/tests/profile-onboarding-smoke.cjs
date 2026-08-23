const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const BASE_URL = process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  let desktop;
  const phone = `139${String(Date.now()).slice(-8)}`;

  try {
    await page.request.delete(`${BASE_URL}/api/auth/session`);
    const login = await page.request.post(`${BASE_URL}/api/auth/phone`, { data: { phone, code: '123456' } });
    assert(login.ok(), '手机号登录没有建立新用户会话');
    await page.addInitScript(() => sessionStorage.setItem('surf-login-complete', 'true'));
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const dialog = page.locator('#profile-onboarding-dialog');
    await page.waitForSelector('#profile-onboarding-dialog[open]');
    assert(await page.locator('input[name="avatar"]').count() === 6, '首次资料弹层缺少头像选项');
    assert(await page.locator('#onboarding-username').count() === 1, '首次资料弹层缺少用户名');
    assert(await page.locator('#onboarding-bio').count() === 1, '首次资料弹层缺少简介');
    assert(await page.locator('#onboarding-birthday').count() === 1, '首次资料弹层缺少生日');

    await page.keyboard.press('Escape');
    assert(await dialog.getAttribute('open') !== null, '首次资料弹层可以被 Esc 跳过');

    await page.locator('#onboarding-username').fill('移动端新同学');
    await page.locator('label.avatar-choice').filter({ has: page.locator('input[value="wave"]') }).click();
    await page.locator('#onboarding-bio').fill('记录校园生活');
    await page.locator('#onboarding-birthday').fill('2005-03-18');
    await page.locator('#profile-onboarding-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.querySelector('#profile-onboarding-dialog')?.open);

    desktop = await context.newPage();
    await desktop.setViewportSize({ width: 1280, height: 900 });
    await desktop.addInitScript(() => sessionStorage.setItem('surf-login-complete', 'true'));
    await desktop.goto(BASE_URL, { waitUntil: 'networkidle' });
    await desktop.locator('.profile-button').click();
    await desktop.waitForSelector('#preferences-form');
    await desktop.locator('label.theme-choice').filter({ hasText: '黑暗模式' }).click();
    await desktop.locator('#preferences-form button[type="submit"]').click();
    await desktop.waitForFunction(() => document.documentElement.dataset.theme === 'dark');

    const profile = await page.request.get(`${BASE_URL}/api/profile`).then(response => response.json());
    const preferences = await page.request.get(`${BASE_URL}/api/profile/preferences`).then(response => response.json());
    assert(profile.username === '移动端新同学' && profile.avatar === 'wave' && profile.profile_complete === true, '资料没有完整持久化');
    assert(preferences.theme === 'dark', '主题没有持久化');
    console.log(JSON.stringify({ onboarding: 'ok', mobile: 'ok', profilePersistence: 'ok', themePersistence: 'ok' }));
  } finally {
    await page.request.delete(`${BASE_URL}/api/auth/session`);
    await desktop?.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
