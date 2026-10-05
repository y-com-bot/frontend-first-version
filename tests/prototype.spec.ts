import { expect, test } from '@playwright/test';

test('首页、推荐填入、发送与对话持久化', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天有什么 想问的？' })).toBeVisible();
  const send = page.getByRole('button', { name: '发送问题', exact: true });
  await expect(send).toBeDisabled();
  const composer = await page.locator('.composer').boundingBox();
  const navigation = await page.locator('.tab-bar').boundingBox();
  expect(composer!.y + composer!.height).toBeLessThanOrEqual(navigation!.y);
  for (const selector of ['.attachment-button', '.send-button', '.question-row', '.tab-item']) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('button', { name: '保研和考研，应该如何选择？' }).click();
  await expect(page.getByRole('textbox', { name: '向小X提问' })).toHaveValue('保研和考研，应该如何选择？');
  await expect(page.locator('.app-window')).toHaveClass(/is-composing/);
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page).toHaveURL(/\/chat\//);
  await expect(page.locator('.message.assistant')).toContainText('条件、兴趣、时间');
  await page.getByRole('textbox', { name: '向小X提问' }).fill('我现在是大二，还需要准备什么？');
  await send.click();
  await expect(page.locator('.message.assistant')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('.message.user')).toHaveCount(2);
  await expect(page.locator('.message.assistant')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('通知搜索、筛选、收藏、下载与建议', async ({ page }) => {
  await page.goto('/plaza');
  await page.getByRole('searchbox', { name: '搜索通知与校园信息' }).fill('奖学金');
  await expect(page.locator('.content-row')).toHaveCount(1);
  await page.locator('.content-row').click();
  await expect(page.locator('.summary-panel')).toContainText('先确认申请类别');
  await page.getByRole('button', { name: '收藏', exact: true }).click();
  await page.getByRole('button', { name: '查看小X 建议' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.locator('.download-row').click();
  expect((await download).suggestedFilename()).toContain('奖学金');
  await page.goto('/mine/bookmarks');
  await expect(page.getByRole('link', { name: /奖学金申请/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: /奖学金申请/ })).toBeVisible();
  await page.goto('/plaza');
  await page.locator('.school-button').click();
  await page.getByRole('dialog').getByRole('button', { name: '云川大学', exact: true }).click();
  await expect(page.locator('.content-row')).toHaveCount(2);
  await page.locator('.topic-filters').getByRole('button', { name: '实习', exact: true }).click();
  await expect(page.getByRole('heading', { name: '还没有找到相关内容' })).toBeVisible();
});

test('论坛发帖、回复、赞同和刷新', async ({ page }) => {
  await page.goto('/plaza?tab=forum');
  await page.getByRole('link', { name: '发起讨论', exact: true }).click();
  await page.getByLabel('讨论标题').fill('想找学习搭子');
  await page.getByLabel('具体说说').fill('希望一起整理课程资料，每周互相分享学习计划。');
  await page.getByRole('button', { name: '发布讨论', exact: true }).click();
  await expect(page).toHaveURL(/\/thread\//);
  await expect(page.getByRole('heading', { name: '想找学习搭子', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: '参与讨论', exact: true }).fill('可以先从这周的课程开始！');
  await page.getByRole('button', { name: '发布回复', exact: true }).click();
  await expect(page.locator('.reply')).toContainText('可以先从这周');
  await page.getByRole('button', { name: /赞同校园同学的回复/ }).click();
  await expect(page.getByRole('button', { name: /赞同校园同学的回复/ })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('.reply')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '想找学习搭子', exact: true })).toBeVisible();
});

test('文件工具：样例、真实文件选择、结果下载与历史', async ({ page }) => {
  await page.goto('/agents/review');
  await expect(page.getByRole('button', { name: '查看示例审查结果' })).toBeDisabled();
  await page.getByRole('button', { name: /使用示例资料/ }).click();
  await page.getByRole('button', { name: '查看示例审查结果' }).click();
  await expect(page.getByRole('heading', { name: '三个值得检查的方向' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载结果', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('文件审查示例结果.txt');
  await page.goto('/mine/documents');
  await page.getByRole('link', { name: /实习简历/ }).click();
  await expect(page.getByRole('heading', { name: '三个值得检查的方向' })).toBeVisible();
  await page.goto('/agents/organize');
  await page.locator('input[type=file]').setInputFiles({ name: '课程资料.txt', mimeType: 'text/plain', buffer: Buffer.from('示例课程资料') });
  await expect(page.getByRole('heading', { name: '课程资料.txt', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '查看示例整理结果' }).click();
  await expect(page.getByRole('heading', { name: '一份清晰的整理思路' })).toBeVisible();
  await expect(page.getByText('这份结果用于演示流程，并非对文件的实际分析。')).toBeVisible();
  await page.goto('/mine/documents');
  await expect(page.locator('.row-link')).toHaveCount(2);
});

test('个人设置、历史与空页面', async ({ page }) => {
  await page.goto('/mine/settings');
  await page.getByLabel('昵称').fill('小林同学');
  await page.getByLabel('我的学校').selectOption('云川大学');
  await page.getByLabel('专业').fill('计算机科学');
  await page.getByRole('button', { name: '保存设置' }).click();
  await page.goto('/mine');
  await expect(page.getByRole('heading', { name: '小林同学', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '小林同学', exact: true })).toBeVisible();
  await page.goto('/mine/history');
  await expect(page.getByRole('heading', { name: '还没有对话记录' })).toBeVisible();
  await page.goto('/not-a-page');
  await expect(page.getByRole('heading', { name: '这个页面暂时找不到' })).toBeVisible();
});

test('窄屏和模拟软键盘视口：输入框始终在可见区域内', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('textbox', { name: '向小X提问' }).focus();
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport!, 'height', { configurable: true, value: 350 });
    Object.defineProperty(window.visualViewport!, 'offsetTop', { configurable: true, value: 30 });
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect(page.locator('html')).toHaveClass(/keyboard-open/);
  await expect(page.locator('.tab-bar')).toBeHidden();
  const box = await page.locator('.composer').boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(30);
  expect(box!.y + box!.height).toBeLessThanOrEqual(380);
  await page.getByRole('textbox', { name: '向小X提问' }).fill('校园生活');
  await page.getByRole('button', { name: '发送问题', exact: true }).click();
  await expect(page.locator('.message.assistant')).toBeVisible();
});

test('桌面居中与关键页面视觉检查', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto('/');
  const windowBox = await page.locator('.app-window').boundingBox();
  expect(Math.abs(windowBox!.x + windowBox!.width / 2 - 720)).toBeLessThan(1);
  await page.locator('.page-enter').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  await page.screenshot({ path: 'test-results/desktop-home.png', animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, name] of [['/', 'home'], ['/plaza', 'notices'], ['/plaza?tab=forum', 'forum'], ['/agents', 'agents'], ['/notice/course', 'notice-detail'], ['/mine', 'mine']]) {
    await page.goto(route!);
    await page.locator('h1').waitFor();
    await page.locator('.page-enter').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator('.app-header')).toBeVisible();
    const header = await page.locator('.app-header').boundingBox();
    expect(header!.y).toBeGreaterThanOrEqual(0);
    await page.screenshot({ path: `test-results/mobile-${name}.png`, animations: 'disabled' });
  }
});
