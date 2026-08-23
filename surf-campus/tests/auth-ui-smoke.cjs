const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const BASE_URL = process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    const visitorResponse = await page.request.delete(`${BASE_URL}/api/auth/xjtlu/binding`);
    assert(visitorResponse.ok(), '无法切换到手机访客状态');
    const profileResponse = await page.request.patch(`${BASE_URL}/api/profile`, { data: { username: '身份测试用户', bio: '', birthday: '', avatar: 'sun' } });
    assert(profileResponse.ok(), '无法准备已完成资料的测试会话');
    await page.addInitScript(() => sessionStorage.setItem('surf-login-complete', 'true'));
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.post');
    const avatar = page.locator('.top-avatar');
    assert(await avatar.isVisible(), '移动端身份头像不可见');
    await avatar.click();
    await page.waitForSelector('#view-root h1');
    assert((await page.locator('#view-root h1').innerText()).includes('身份与登录'), '移动端头像没有进入身份页');
    assert((await page.locator('#view-root .identity-card').filter({ hasText: '只能浏览' }).innerText()).includes('只能浏览'), '手机访客身份页未显示只读权限');
    await page.locator('.mobile-nav [data-route="feed"]').click();
    await page.waitForSelector('.composer-gate');
    assert((await page.locator('#view-root').innerText()).includes('绑定 XJTLU 账号后发布'), '手机访客发帖器未显示绑定入口');
    assert(await page.locator('[data-like-post]').count() === 0, '手机访客不应看到可直接点赞的按钮');
    assert(await page.locator('.action-button.is-locked[data-route="identity"]').count() >= 1, '手机访客缺少绑定后点赞提示');
    console.log(JSON.stringify({ mobileIdentityRoute: 'ok', visitorReadOnlyUI: 'ok' }));
  } finally {
    await page.request.post(`${BASE_URL}/api/auth/xjtlu/mock-bind`, { data: { account: 'zhang.san@student.xjtlu.edu.cn' } });
    await browser.close();
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
