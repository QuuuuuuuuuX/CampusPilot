const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const BASE_URL = process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000';
const CONTENT = `P0 浏览器闭环 ${Date.now()}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const student = await browser.newContext({ viewport: process.env.VERTICAL_MOBILE === '1' ? { width: 390, height: 844 } : { width: 1280, height: 900 }, isMobile: process.env.VERTICAL_MOBILE === '1', hasTouch: process.env.VERTICAL_MOBILE === '1' });
  const studentPage = await student.newPage();
  await studentPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await studentPage.waitForSelector('#composer-text');
  await studentPage.locator('#composer-text').focus();
  await studentPage.waitForSelector('#composer-section');
  await studentPage.locator('#composer-section').selectOption('academic');
  await studentPage.locator('#composer-text').fill(CONTENT);
  await studentPage.locator('[data-add-tag="CSE101"]').click();
  await Promise.all([
    studentPage.waitForResponse(response => response.url().includes('/api/community/posts') && response.request().method() === 'POST' && response.ok()),
    studentPage.locator('#publish-button').click(),
  ]);
  await studentPage.waitForSelector('.toast');
  assert((await studentPage.locator('.toast').innerText()).includes('提交审核'), '学生端未确认帖子进入审核');
  await studentPage.reload({ waitUntil: 'networkidle' });
  assert(!(await studentPage.locator('body').innerText()).includes(CONTENT), '待审核帖子提前出现在学生端');

  const admin = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const adminPage = await admin.newPage();
  await adminPage.goto(`${BASE_URL}/admin/`, { waitUntil: 'networkidle' });
  await adminPage.locator('#admin-nav [data-view="moderation"]').click();
  const row = adminPage.locator('tbody tr').filter({ hasText: CONTENT });
  await row.waitFor();
  await Promise.all([
    adminPage.waitForResponse(response => response.url().includes('/api/admin/posts/') && response.request().method() === 'PATCH' && response.ok()),
    row.locator('[data-moderate="published"]').click(),
  ]);
  await studentPage.reload({ waitUntil: 'networkidle' });
  assert((await studentPage.locator('body').innerText()).includes(CONTENT), '审核通过后学生端未展示帖子');

  await browser.close();
  console.log(JSON.stringify({ publish: 'ok', pending_hidden: 'ok', moderation: 'ok', student_visible_after_approval: 'ok', base: BASE_URL }));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
