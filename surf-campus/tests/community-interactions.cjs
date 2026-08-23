const { chromium } = require('/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) { if (!condition) throw new Error(message); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(process.env.SURF_E2E_BASE_URL || 'http://127.0.0.1:8000', { waitUntil: 'networkidle' });

  const bodyLinks = page.locator('.post-copy[data-open-post]');
  const bodyCount = await bodyLinks.count();
  assert(bodyCount >= 1, '帖子正文没有详情入口');
  await bodyLinks.nth(0).click();
  await page.waitForSelector('.detail-comments');
  assert(await page.locator('[data-comment-form]').count() === 0, '普通详情页不应自动打开评论输入');
  await page.locator('[data-route="feed"]').first().click();
  await page.waitForSelector('.post');

  const commentButtons = page.locator('[data-comment-post]');
  const commentCount = await commentButtons.count();
  assert(commentCount >= 1, '帖子没有评论入口');
  await commentButtons.nth(0).click();
  await page.waitForSelector('.detail-comments');
  assert(await page.locator('[data-comment-form]').count() === 1, '评论入口没有打开详情评论框');

  const likeButton = page.locator('[data-like-post]').first();
  const likesBefore = Number((await likeButton.innerText()).replace(/\D/g, '') || 0);
  const pressedBefore = await likeButton.getAttribute('aria-pressed');
  await likeButton.click();
  await page.waitForFunction(value => document.querySelector('[data-like-post]')?.getAttribute('aria-pressed') !== value, pressedBefore);
  const likesAfter = Number((await page.locator('[data-like-post]').innerText()).replace(/\D/g, '') || 0);
  await page.locator('[data-like-post]').click();
  await page.waitForFunction(value => document.querySelector('[data-like-post]')?.getAttribute('aria-pressed') === value, pressedBefore);
  const likesRestored = Number((await page.locator('[data-like-post]').innerText()).replace(/\D/g, '') || 0);
  assert(Math.abs(likesAfter - likesBefore) === 1 && likesRestored === likesBefore, '点赞不是幂等切换');

  const collectButton = page.locator('[data-collect-post]');
  assert(await collectButton.count() === 1, '收藏入口缺失');
  await collectButton.click();
  const collectionForm = page.locator('[data-collection-form]');
  assert(await collectionForm.count() === 1, '收藏入口没有展开个人 Tag 表单');
  await collectionForm.locator('input[name="tag"]').fill('回归测试Tag');
  await collectionForm.locator('button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('[data-collection-form]')?.textContent.includes('#回归测试Tag'));
  await page.locator('[data-remove-collection]').click();

  await page.locator('[data-route="feed"]').first().click();
  await page.locator('#composer-text').focus();
  await page.waitForSelector('#tag-input');
  await page.locator('#tag-input').fill('学生自定义 Tag');
  await page.locator('#tag-input').press('Enter');
  assert((await page.locator('.selected-tag').innerText()).includes('#学生自定义 Tag'), '学生无法添加自定义 Tag');

  await page.locator('[data-route="resources"]').first().click();
  await page.waitForSelector('#resource-year');
  await page.locator('#resource-year').selectOption('year1');
  await page.locator('#resource-term').selectOption('autumn');
  await page.locator('#resource-major').selectOption('common');
  const courseOptions = await page.locator('#resource-course option').allTextContents();
  assert(courseOptions.includes('CSE101 程序设计基础'), '资料路径没有联动到大一共同课程');
  assert((await page.locator('.resource-path-summary').innerText()).includes('大一 / 上学期 / 大一共同课程'), '资料路径摘要不完整');
  assert(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), '资料筛选产生横向溢出');

  await browser.close();
  console.log(JSON.stringify({ bodyDetail: 'ok', commentDetail: 'ok', likeToggle: 'ok', collectionTag: 'ok', customTag: 'ok', resourcePath: 'ok' }));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
