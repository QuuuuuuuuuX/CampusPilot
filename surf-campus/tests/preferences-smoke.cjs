const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.request.post(`${process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000'}/api/auth/phone`, { data: { phone: '19155147738', code: '123456' } });
  await page.request.patch(`${process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000'}/api/profile`, { data: { username: '偏好测试用户', bio: '', birthday: '', avatar: 'sun' } });
  await page.addInitScript(() => sessionStorage.setItem('surf-login-complete', 'true'));
  await page.goto(process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await page.locator('.profile-button').click();
  await page.waitForSelector('#preferences-form');
  assert(await page.locator('input[name="sections"]').count() === 4, '偏好页缺少受控分区选择');
  assert(await page.locator('#preference-interests').count() === 1, '偏好页缺少兴趣 Tag 输入');
  assert(await page.locator('#content-language').count() === 1, '偏好页缺少语言模式');
  assert((await page.locator('.result-section').last().innerText()).includes('积分'), '参与记录未展示积分');
  await page.locator('.primary-nav [data-route="feed"]').click();
  await page.waitForSelector('.post');
  assert(await page.locator('.context-rail').isVisible(), '默认校园速览侧栏不可见');
  await browser.close();
  console.log(JSON.stringify({ preferencePage: 'ok', feedEntry: 'ok', contextRail: 'ok' }));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
