import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const WIDTH = 1080;
const HEIGHT = 1350;
const OUTPUT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'output');

interface ExportPage {
  index: number;
  component: string;
  html: string;
}

export async function exportPages(dateStr: string, pages: ExportPage[]): Promise<string> {
  const outDir = path.join(OUTPUT_DIR, dateStr);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const page of pages) {
      const browserPage = await browser.newPage();
      await browserPage.setViewport({ width: WIDTH, height: HEIGHT });

      const tmpHtml = path.join(outDir, `_tmp_${page.index}.html`);
      fs.writeFileSync(tmpHtml, page.html, 'utf-8');

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
