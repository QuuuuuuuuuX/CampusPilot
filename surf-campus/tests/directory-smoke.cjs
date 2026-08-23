const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let dialogOpened = false;
  let chatRequest = null;
  page.on('dialog', async dialog => { dialogOpened = true; await dialog.dismiss(); });
  await page.route('**/api/messaging/chat?*', async route => {
    chatRequest = new URL(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', message: '消息已发送' }) });
  });
  await page.goto(process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await page.locator('[data-route="directory"]').first().click();
  await page.waitForSelector('#directory-form');
  assert(await page.locator('[data-start-chat]').count() >= 1, '通讯录没有私聊入口');
  const chatButton = page.locator('[data-start-chat]').first();
  await chatButton.click();
  const chatForm = page.locator('[data-directory-chat-form]').first();
  await chatForm.waitFor({ state: 'visible' });
  assert(!dialogOpened, '私聊仍使用脱离页面上下文的浏览器对话框');
  assert(await chatButton.getAttribute('aria-expanded') === 'true', '私聊按钮未暴露展开状态');
  await chatForm.locator('textarea').fill('你好，想交流一下项目经验。');
  await chatForm.locator('button[type="submit"]').click();
  await page.waitForFunction(() => !document.querySelector('[data-directory-chat-form]'));
  await page.waitForTimeout(80);
  assert(chatRequest?.searchParams.get('message') === '你好，想交流一下项目经验。', '私聊消息未按输入提交');
  assert(chatRequest?.searchParams.get('target_id'), '私聊目标成员缺失');
  assert((await page.locator('#admin-content').count()) === 0, '学生端错误渲染管理端容器');
  await page.locator('#directory-keyword').fill('数据科学');
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/directory?keyword=') && response.ok()),
    page.locator('#directory-form').press('Enter'),
  ]);
  assert((await page.locator('.result-section').first().innerText()).includes('王小明'), '跨学院/年级搜索未返回成员');
  assert(await page.locator('[data-group-message-form]').count() >= 1, '项目群消息入口缺失');
  await browser.close();
  console.log(JSON.stringify({ directory: 'ok', crossYearDiscovery: 'ok', inlinePrivateChat: 'ok', noNativeDialog: 'ok', projectGroup: 'ok' }));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
