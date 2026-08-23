const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await page.locator('#composer-text').focus();
  await page.locator('[data-ai-insert="composer-text"]').click();
  assert((await page.locator('#composer-text').inputValue()).includes('@AI'), '发帖器未插入 @AI');

  const postId = await page.locator('.post').first().getAttribute('data-post-id');
  await page.locator('[data-comment-post]').first().click();
  const commentInput = page.locator(`[id^="comment-input-"]`).first();
  await page.locator(`[data-ai-insert="${await commentInput.getAttribute('id')}"]`).click();
  assert((await commentInput.inputValue()).includes('@AI'), '评论框未插入 @AI');

  const response = await page.evaluate(async id => {
    const result = await fetch('/api/community/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id, message: '请概括当前话题' }),
    });
    return { status: result.status, body: await result.json() };
  }, postId);
  assert(response.status === 200, `社区 AI 接口状态错误：${response.status}`);
  assert(response.body.source?.post_id === postId, 'AI 回答未返回帖子来源');
  assert(response.body.uncertainty, 'AI 回答未返回不确定性提示');
  await browser.close();
  console.log(JSON.stringify({ composerMention: 'ok', commentMention: 'ok', contextualAI: 'ok' }));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
