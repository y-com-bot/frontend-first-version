import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

for (const mode of ['http', 'offline'] as const) {
  test(`${mode}：从对话自动推荐、资料下载、纠错与暂停`, async ({ page }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.goto(mode === 'http' ? '/' : pathToFileURL(resolve('standalone/校园助手-双击打开.html')).href);
    const region = page.getByRole('region', { name: '适合你的下一步' });
    await expect(region).toContainText('先看看这些方向');
    await page.getByRole('textbox', { name: '向小X提问' }).fill('我想准备实习，但项目经历不多，应该从哪里开始？');
    await page.getByRole('button', { name: '发送问题', exact: true }).click();
    await expect(page.locator('.message.assistant')).toBeVisible();
    await page.getByRole('link', { name: '小X', exact: true }).click();
    await expect(region).toContainText('实习准备');
    await expect(region.getByRole('link')).toHaveCount(2);
    await expect(region.getByRole('link').first()).toContainText('从课程项目到作品集');
    await expect(region.getByRole('link').first()).toContainText('积累项目经历');
    await region.getByRole('button', { name: '推荐依据', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('我想准备实习，但项目经历不多');
    await expect(page.getByRole('dialog')).toContainText('想提升的方面');
    await page.getByRole('dialog').getByRole('link', { name: '查看原对话' }).first().click();
    await expect(page).toHaveURL(/#message-/);
    await expect(page.locator('.message.user')).toBeInViewport();
    await page.getByRole('link', { name: '小X', exact: true }).click();
    await region.getByRole('link').first().click();
    await expect(page.getByRole('heading', { name: '从课程项目到作品集：整理指南' })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /下载这份资料/ }).click();
    expect((await download).suggestedFilename()).toContain('作品集');
    await page.getByRole('button', { name: '返回首页推荐' }).click();
    await region.getByRole('button', { name: /调整推荐：从课程项目/ }).click();
    await page.getByRole('button', { name: '不感兴趣，换一条' }).click();
    await expect(region).not.toContainText('从课程项目到作品集');
    await expect(region).toContainText('第一份实习');
    await page.reload();
    await expect(region).not.toContainText('从课程项目到作品集');
    await region.getByRole('button', { name: '推荐依据', exact: true }).click();
    await page.getByRole('button', { name: '恢复隐藏的内容' }).click();
    await page.getByRole('button', { name: '暂停对话推荐', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('不使用对话信息');
    await page.getByRole('button', { name: '恢复对话推荐', exact: true }).click();
    await page.getByRole('button', { name: '忽略这条理解：实习准备' }).click();
    await expect(page.getByRole('dialog')).toContainText('还没有可用的对话依据');
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await expect(region).toContainText('先看看这些方向');
    expect(errors).toEqual([]);
    if (mode === 'offline') expect(requests).toEqual([]);
  });
}

test('旧版记录继续使用，旧消息不会覆盖同一对话中的新目标', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('campus-prototype-v1')!);
    delete saved.recommendationSettings;
    saved.conversations = [{ id: 'legacy-chat', title: '我想了解科研项目', updatedAt: new Date().toISOString(), messages: [
      { id: 'legacy-user', role: 'user', text: '我想了解科研项目' },
      { id: 'legacy-answer', role: 'assistant', text: '旧版示例回答' },
    ] }];
    localStorage.setItem('campus-prototype-v1', JSON.stringify(saved));
  });
  await page.goto('/chat/legacy-chat');
  await page.getByRole('textbox', { name: '向小X提问' }).fill('我现在想准备实习，但项目经历不多。');
  await page.getByRole('button', { name: '发送问题', exact: true }).click();
  await expect(page.locator('.message.assistant')).toHaveCount(2);
  await page.getByRole('link', { name: '小X', exact: true }).click();
  await expect(page.getByRole('region', { name: '适合你的下一步' })).toContainText('实习准备');
  await page.reload();
  await expect(page.getByRole('region', { name: '适合你的下一步' })).toContainText('实习准备');
});

test('不从第三人称或附件推断；新目标、已改善信息与学校范围更新', async ({ page }) => {
  await page.goto('/');
  const send = page.getByRole('button', { name: '发送问题', exact: true });
  const input = page.getByRole('textbox', { name: '向小X提问' });
  const region = page.getByRole('region', { name: '适合你的下一步' });
  await input.fill('我的朋友想准备实习，他没有项目经历，能给他建议吗？');
  await page.locator('input[type=file]').setInputFiles({ name: '没有项目经历.txt', mimeType: 'text/plain', buffer: Buffer.from('不是个人推荐依据') });
  await send.click();
  await expect(page.locator('.message.assistant')).toBeVisible();
  await page.getByRole('link', { name: '小X', exact: true }).click();
  await expect(region).toContainText('先看看这些方向');
  await input.fill('我想准备实习，我没有项目经历。');
  await send.click();
  await expect(page.locator('.message.assistant')).toBeVisible();
  await input.fill('我已经有项目经历了，我不打算找实习了，想先复习。我的课件和笔记很分散。');
  await send.click();
  await expect(page.locator('.message.assistant')).toHaveCount(2);
  await page.getByRole('link', { name: '小X', exact: true }).click();
  await expect(region).toContainText('学习提升');
  await expect(region).toContainText('整理学习资料');
  await region.getByRole('button', { name: '推荐依据', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toContainText('积累项目经历');
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await input.fill('我是南湖理工大学的学生，想了解科研项目申请。');
  await send.click();
  await expect(page.locator('.message.assistant')).toBeVisible();
  await page.getByRole('link', { name: '小X', exact: true }).click();
  await expect(region).toContainText('科研探索');
  await expect(region).not.toContainText('本科生科研项目申报说明');
  await region.getByRole('button', { name: '推荐依据', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('南湖理工大学');
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('link', { name: '我的', exact: true }).click();
  await page.getByRole('link', { name: '全部', exact: true }).click();
  await page.getByRole('button', { name: /删除对话 我是南湖理工大学/ }).click();
  await page.getByRole('button', { name: '删除对话', exact: true }).click();
  await page.getByRole('link', { name: '小X', exact: true }).click();
  await expect(region).toContainText('学习提升');
  await page.reload();
  await expect(region).toContainText('学习提升');
});
