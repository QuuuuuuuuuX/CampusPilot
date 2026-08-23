const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await page.locator('[data-route="events"]').first().click();
  await page.waitForSelector('[data-event]');
  const calendar = await page.evaluate(async () => {
    const response = await fetch('/api/events/evt_1/calendar');
    return { status: response.status, body: await response.text() };
  });
  assert(calendar.status === 200 && calendar.body.includes('BEGIN:VCALENDAR') && calendar.body.includes('DTSTART'), '活动日历导出无效');
  assert((await page.locator('[data-event]').count()) >= 1, '活动页没有报名入口');
  await browser.close();
  console.log(JSON.stringify({ eventList: 'ok', calendarExport: 'ok', registrationEntry: 'ok' }));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
