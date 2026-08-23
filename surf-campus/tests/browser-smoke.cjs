const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`page: ${error.message}`));

  const feedStart = Date.now();
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await page.waitForSelector('.post');
  await page.waitForSelector('.priority-strip button');
  const priorityVisibleMs = Date.now() - feedStart;
  assert(priorityVisibleMs < 10000, `校园任务速览超过 10 秒才可用：${priorityVisibleMs}ms`);
  assert(await page.locator('.priority-strip button').count() === 3, '未同时聚合通知、今日任务和近期活动');
  const desktopPosts = await page.locator('.post').count();
  assert(desktopPosts >= 1, '首页没有渲染已审核帖子');
  assert(!(await page.locator('body').innerText()).includes('吐槽一下食堂'), '匿名树洞内容混入公共话题流');
  assert(await page.locator('.context-rail').isVisible(), '桌面端校园速览侧栏不可见');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '桌面端发生横向溢出');
  await page.screenshot({ path: 'docs/p0-home-desktop.png', fullPage: true });

  await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/discover/tags/CSE101') && response.ok()),
    page.locator('[data-tag="CSE101"]').first().click(),
  ]);
  await page.waitForSelector('.result-summary');
  assert((await page.locator('h1').innerText()).includes('CSE101'), 'Tag 聚合页标题错误');

  await page.locator('[data-route="feed"]').first().click();
  await page.locator('#composer-text').focus();
  await page.waitForSelector('#composer-section');
  await page.locator('#composer-text').fill('仅用于前端状态验证，不提交');
  await page.locator('[data-add-tag="CSE101"]').click();
  assert(await page.locator('#publish-button').isEnabled(), '文字与 Tag 输入后发布按钮未启用');

  let mediaRequests = 0;
  await page.route('**/api/media', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    mediaRequests += 1;
    const type = body.mime?.startsWith('video/') ? 'video' : 'image';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: `browser_media_${mediaRequests}`, type, url: `/media/browser-${mediaRequests}.${type === 'video' ? 'webm' : 'jpg'}`, name: body.name, mime: body.mime, size: 256, duration: body.duration || null }) });
  });
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 180;
    const context = canvas.getContext('2d');
    const stream = canvas.captureStream(12);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    const stopped = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start();
    for (let frame = 0; frame < 8; frame += 1) {
      context.fillStyle = frame % 2 ? '#176341' : '#236984';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#fff'; context.font = '24px sans-serif'; context.fillText('SURF media test', 50, 96);
      await new Promise(resolve => setTimeout(resolve, 45));
    }
    recorder.stop();
    await stopped;
    const file = new File([new Blob(chunks, { type: 'video/webm' })], 'surf-smoke.webm', { type: 'video/webm' });
    const transfer = new DataTransfer(); transfer.items.add(file);
    const input = document.querySelector('#video-input');
    Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => document.querySelector('.upload-status')?.textContent.includes('已上传'), null, { timeout: 10000 });
  assert(mediaRequests === 2, `视频与封面应产生 2 次媒体上传，实际 ${mediaRequests}`);
  assert(await page.locator('.upload-tile video').count() === 1, '视频附件预览未显示');
  await page.locator('[data-remove-upload]').click();
  await page.unroute('**/api/media');

  await page.locator('#global-search').fill('CSE101');
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/search') && response.ok()),
    page.locator('#global-search').press('Enter'),
  ]);
  await page.waitForSelector('.result-summary');
  assert((await page.locator('.result-summary').innerText()).includes('条内容'), '聚合搜索结果未渲染');
  await page.locator('[data-route="resources"]').first().click();
  await page.waitForSelector('#question-form');
  assert(await page.locator('.result-section').count() === 2, '学生端未同时展示资料与课程问答');
  await page.locator('[data-resource-open]').first().click();
  await page.waitForSelector('.resource-detail');
  assert((await page.locator('.resource-detail').innerText()).includes('当前只有资料元数据'), '无文件资料未展示明确的元数据状态');
  await page.locator('[data-route="search"]').first().click();
  await page.waitForSelector('#search-page-form');
  await page.locator('[data-search-mode="ai"]').click();
  await page.locator('#search-keyword').fill('CSE101');
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/chat') && response.ok()),
    page.locator('#search-page-form').press('Enter'),
  ]);
  await page.waitForSelector('.search-ai-answer');
  assert((await page.locator('.search-ai-answer').innerText()).includes('引用关键词'), '搜索问 AI 未显示来源/不确定性提示');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  mobilePage.on('console', message => { if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`); });
  mobilePage.on('pageerror', error => errors.push(`mobile page: ${error.message}`));
  await mobilePage.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await mobilePage.waitForSelector('.post');
  assert(await mobilePage.locator('.mobile-nav').isVisible(), '移动端底部导航不可见');
  assert(!(await mobilePage.locator('.sidebar').isVisible()), '移动端仍显示桌面侧栏');
  assert(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '移动端发生横向溢出');
  await mobilePage.screenshot({ path: 'docs/p0-home-mobile.png', fullPage: true });

  const admin = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const adminPage = await admin.newPage();
  adminPage.on('console', message => { if (message.type() === 'error') errors.push(`admin console: ${message.text()}`); });
  adminPage.on('pageerror', error => errors.push(`admin page: ${error.message}`));
  await adminPage.goto('http://127.0.0.1:8000/admin/', { waitUntil: 'networkidle' });
  await adminPage.waitForSelector('.metric');
  assert(await adminPage.locator('.metric').count() === 4, '管理概览指标数量错误');
  await adminPage.locator('#admin-nav [data-view="moderation"]').click();
  await adminPage.waitForSelector('tbody tr');
  assert(await adminPage.locator('tbody tr').count() >= 1, '管理端审核队列为空');
  await adminPage.locator('#admin-nav [data-view="notifications"]').click();
  await adminPage.waitForSelector('#notification-form');
  assert(await adminPage.locator('[data-notification-admin-action]').count() >= 1, '管理端没有通知置顶/撤回操作');
  await adminPage.locator('#admin-nav [data-view="learning"]').click();
  await adminPage.waitForSelector('#resource-form');
  assert(await adminPage.locator('[data-answer-form]').count() >= 1, '管理端没有课程人工回答入口');
  await adminPage.locator('#admin-nav [data-view="events"]').click();
  await adminPage.waitForSelector('#event-form');
  assert(await adminPage.locator('[data-event-status]').count() >= 1, '管理端没有活动下线入口');
  await adminPage.locator('#admin-nav [data-view="overview"]').click();
  await adminPage.screenshot({ path: 'docs/p0-admin-desktop.png', fullPage: true });

  assert(errors.length === 0, `浏览器错误：${errors.join(' | ')}`);
  const errorsBeforePermissionTest = errors.length;
  await adminPage.locator('#role-select').selectOption('student');
  await adminPage.waitForSelector('.error');
  assert((await adminPage.locator('.error').innerText()).includes('无权访问管理端'), '学生角色未显示权限拒绝');

  await browser.close();
  console.log(JSON.stringify({ desktopPosts, priorityVisibleMs, desktop: 'ok', mobile: 'ok', search: 'ok', tag: 'ok', composer: 'ok', videoAndCoverUploads: mediaRequests, admin: 'ok', roleGuard: 'ok', consoleErrors: errorsBeforePermissionTest }));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
