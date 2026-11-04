import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { browser } from '../../scripts/execution.mjs';
const client = await browser();
const errors = [];
try {
  const page = await client.newPage({ viewport: { width: 1360, height: 1000 } });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:8198/outputs/harbor-v2/');
  await page.waitForFunction(() => [...document.querySelectorAll('video')].every(v => v.readyState >= 1));
  const durations = await page.locator('video').evaluateAll(items => items.map(v => v.duration));
  assert.deepEqual(durations, [24, 18]);
  await page.getByRole('button', { name: '부두의 응답', exact: true }).click();
  await page.waitForFunction(() => {
    const v = document.querySelector('#new');
    return !v.seeking && Math.abs(v.currentTime - 21) < .01;
  });
  await page.screenshot({ path: 'evidence/harbor-v2/review-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '처음부터', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('#new').paused);
  await page.locator('summary').click();
  await page.locator('#old').evaluate(v => v.play());
  assert.equal(await page.locator('#new').evaluate(v => v.paused), true);
  await page.locator('#old').evaluate(v => v.pause());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'evidence/harbor-v2/review-mobile.png', fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ pass: true, durations, bookmark: 21, exclusivePlayback: true, mobileWidth: 390, horizontalOverflow: overflow, pageErrors: errors }, null, 2));
} finally { await client.close(); }
