const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const student = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let dialogOpened = false;
  let applicationBody = null;
  student.on('dialog', async dialog => { dialogOpened = true; await dialog.dismiss(); });
  await student.route('**/api/opportunities/apply', async route => {
    applicationBody = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', message: '申请已提交，等待招募发起人处理' }) });
  });
  await student.goto(process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await student.locator('[data-route="opportunities"]').first().click();
  await student.waitForSelector('.opportunity-row');
  assert((await student.locator('.opportunity-row').first().innerText()).includes('匹配'), '学生端未展示技能匹配理由');
  assert(await student.locator('[data-apply-opportunity]').count() >= 1, '学生端没有申请入口');
  const applyButton = student.locator('[data-apply-opportunity]').first();
  const opportunityId = await applyButton.getAttribute('data-apply-opportunity');
  await applyButton.click();
  const applyForm = student.locator(`[data-opportunity-apply-form="${opportunityId}"]`);
  await applyForm.waitFor({ state: 'visible' });
  await student.waitForFunction(() => document.activeElement?.matches('[data-opportunity-apply-form] textarea'));
  assert(!dialogOpened, '招募申请仍使用脱离页面上下文的浏览器对话框');
  assert(await applyButton.getAttribute('aria-expanded') === 'true', '申请按钮未暴露展开状态');
  await applyForm.locator('textarea').fill('有相关前端经验，每周可投入 6 小时。');
  await applyForm.locator('button[type="submit"]').click();
  await pageWaitFor(() => applicationBody !== null);
  await student.waitForFunction(() => !document.querySelector('[data-opportunity-apply-form]'));
  assert(applicationBody.opportunity_id === opportunityId, '申请未关联正确招募');
  assert(applicationBody.message === '有相关前端经验，每周可投入 6 小时。', '申请留言未按输入提交');
  assert(Array.isArray(applicationBody.skills), '申请未带上当前技能');

  const admin = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await admin.goto(`${process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000'}/admin/`, { waitUntil: 'networkidle' });
  await admin.locator('#admin-nav [data-view="opportunities"]').click();
  await admin.waitForSelector('#opportunity-form');
  assert(await admin.locator('tbody tr').count() >= 1, '管理端招募列表为空');
  assert((await admin.locator('#admin-content').innerText()).includes('申请人'), '管理端未展示申请管理列');
  await admin.locator('#role-select').selectOption('teacher');
  await admin.waitForSelector('#opportunity-form');
  assert(await admin.locator('#opportunity-form button[type="submit"]').isEnabled(), '教师角色不能发布科研/志愿者招募');
  await browser.close();
  console.log(JSON.stringify({ studentMatching: 'ok', inlineApplication: 'ok', noNativeDialog: 'ok', adminRecruitment: 'ok', teacherRecruitment: 'ok' }));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});

function pageWaitFor(predicate, timeout = 3000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      if (predicate()) return resolve();
      if (Date.now() - started > timeout) return reject(new Error('等待拦截请求超时'));
      setTimeout(poll, 20);
    };
    poll();
  });
}
