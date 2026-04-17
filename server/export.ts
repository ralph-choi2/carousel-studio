import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const WIDTH = 1080;
const HEIGHT = 1350;
const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'output');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

interface ExportPage {
  index: number;
  component: string;
  html: string;
}

/** Rewrite `/assets/...` paths → absolute `file://...` paths for Puppeteer file:// loading */
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

export async function exportPages(dateStr: string, pages: ExportPage[]): Promise<string> {
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
  } finally {
    await browser.close();
  }
  return outDir;
}
