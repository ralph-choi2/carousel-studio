#!/usr/bin/env tsx
/**
 * Agent-driven carousel export.
 * Opens the running dev server in headless Puppeteer, picks a file,
 * triggers the Export button, and waits for completion.
 *
 * Usage:
 *   tsx scripts/agent_export.ts 2026-04-20-small-talk.json
 */
import puppeteer from 'puppeteer';

const BASE = 'http://localhost:5173';

async function main() {
  const filename = process.argv[2];
  if (!filename) {
    console.error('Usage: tsx scripts/agent_export.ts <filename.json>');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  let alertMessage: string | null = null;
  page.on('dialog', async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  console.log(`▶ Navigate ${BASE}/editor`);
  await page.goto(`${BASE}/editor`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for row selector to load (items populated, Loading... gone)
  await page.waitForFunction(
    () => {
      const trigger = document.querySelector('[role="combobox"]');
      if (!trigger) return false;
      const txt = trigger.textContent ?? '';
      return !txt.includes('Loading');
    },
    { timeout: 15000 }
  );

  console.log(`▶ Open file selector`);
  const selectTrigger = await page.$('[role="combobox"]');
  if (!selectTrigger) throw new Error('File select trigger not found');
  await selectTrigger.click();
  await new Promise((r) => setTimeout(r, 300));

  console.log(`▶ Pick ${filename}`);
  const picked = await page.evaluate((target: string) => {
    const items = Array.from(document.querySelectorAll('[role="option"]'));
    const match = items.find((el) => (el.textContent ?? '').includes(target));
    if (!match) return false;
    (match as HTMLElement).click();
    return true;
  }, filename);
  if (!picked) throw new Error(`Option "${filename}" not found in dropdown`);

  // Wait for data load (canvas renders pages)
  await page.waitForFunction(
    () => document.body.innerText.includes('Page') || document.querySelector('[data-page-index]') !== null,
    { timeout: 10000 }
  ).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));

  console.log(`▶ Click Export`);
  const exportClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim().includes('Export'));
    if (!btn) return false;
    (btn as HTMLButtonElement).click();
    return true;
  });
  if (!exportClicked) throw new Error('Export button not found');

  // Wait for alert (doExport triggers alert on success)
  console.log(`▶ Waiting for export to finish (Puppeteer PNG render)...`);
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    if (alertMessage) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  await browser.close();

  if (!alertMessage) {
    console.error('❌ Timeout — no completion alert received');
    process.exit(1);
  }
  console.log(`✓ ${alertMessage}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
