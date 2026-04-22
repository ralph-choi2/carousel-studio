import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';

const WIDTH = 1080;
const HEIGHT = 1350;
const THUMB_WIDTH = 432;
const THUMB_HEIGHT = 243;
const THUMB_SCALE = 2;                     // 결과 PNG = 864 × 486
const THUMB_FILENAME = 'thumb_b2b.png';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'output');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

interface ExportPage {
  index: number;
  component: string;
  html: string;
}

/** Rewrite `/assets/...` and `/images/...` paths to absolute file:// for Puppeteer */
function rewriteAssetPaths(html: string): string {
  const publicFileUrl = `file://${PUBLIC_DIR}`;
  return html
    .replace(/src="\/assets\//g, `src="${publicFileUrl}/assets/`)
    .replace(/src="\/images\//g, `src="${publicFileUrl}/images/`)
    .replace(/url\(\/assets\//g, `url(${publicFileUrl}/assets/`)
    .replace(/url\('\/assets\//g, `url('${publicFileUrl}/assets/`)
    .replace(/url\("\/assets\//g, `url("${publicFileUrl}/assets/`)
    .replace(/url\(\/images\//g, `url(${publicFileUrl}/images/`)
    .replace(/url\('\/images\//g, `url('${publicFileUrl}/images/`)
    .replace(/url\("\/images\//g, `url("${publicFileUrl}/images/`);
}

export async function exportPages(dateStr: string, pages: ExportPage[], thumbHtml?: string): Promise<string> {
  const outDir = path.join(OUTPUT_DIR, dateStr);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const page of pages) {
      const browserPage = await browser.newPage();
      await browserPage.setViewport({ width: WIDTH, height: HEIGHT });

      const resolvedHtml = rewriteAssetPaths(page.html);
      const tmpHtml = path.join(outDir, `_tmp_${page.index}.html`);
      fs.writeFileSync(tmpHtml, resolvedHtml, 'utf-8');

      await browserPage.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0', timeout: 30000 });

      const pageNum = String(page.index + 1).padStart(2, '0');
      const suffix = page.index === 0 ? '_cover' : page.component === 'cta' ? '_cta' : '';
      const outPath = path.join(outDir, `${pageNum}${suffix}.png`);

      await browserPage.screenshot({ path: outPath, type: 'png' });
      await browserPage.close();
      fs.unlinkSync(tmpHtml);
    }

    if (thumbHtml) {
      await exportThumbnail(thumbHtml, path.join(outDir, THUMB_FILENAME), browser);
    }
  } finally {
    await browser.close();
  }
  return outDir;
}

/**
 * Render a single B2B thumbnail HTML to PNG at 864 × 486 (16:9).
 *
 * Reusable by both the /api/export pipeline and the backfill script.
 * Accepts an optional browser — the caller is responsible for closing it.
 * If no browser is passed, launches/closes a new one internally.
 */
export async function exportThumbnail(
  html: string,
  outPath: string,
  browser?: Browser
): Promise<void> {
  const shouldCloseBrowser = !browser;
  const b = browser ?? await puppeteer.launch({ headless: true });
  try {
    const browserPage = await b.newPage();
    await browserPage.setViewport({
      width: THUMB_WIDTH,
      height: THUMB_HEIGHT,
      deviceScaleFactor: THUMB_SCALE,
    });

    const resolvedHtml = rewriteAssetPaths(html);
    const outDir = path.dirname(outPath);
    fs.mkdirSync(outDir, { recursive: true });
    const tmpHtml = path.join(outDir, `_tmp_thumb_${Date.now()}.html`);
    fs.writeFileSync(tmpHtml, resolvedHtml, 'utf-8');

    await browserPage.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await browserPage.screenshot({ path: outPath, type: 'png' });
    await browserPage.close();
    fs.unlinkSync(tmpHtml);
  } finally {
    if (shouldCloseBrowser) await b.close();
  }
}
