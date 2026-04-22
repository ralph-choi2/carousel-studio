#!/usr/bin/env tsx
/**
 * B2B 썸네일 1회성 백필 스크립트.
 *
 * - data/*.json 에서 cover 데이터를 읽어 B2bThumbPage 렌더
 * - bg_image 필드는 로컬 public/images 경로로 override
 * - B2B Drive 기존 날짜 폴더에 thumb_b2b.png 업로드
 *
 * 실행:
 *   npx tsx scripts/backfill-b2b-thumb.ts --dry-run
 *   npx tsx scripts/backfill-b2b-thumb.ts
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { B2bThumbPage } from '../src/components/templates/B2bThumbPage.js';
import { exportThumbnail } from '../server/export.js';
import type { CoverData, CarouselFile } from '../src/lib/types.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

interface BackfillEntry {
  publishDate: string;        // B2B Drive 날짜 폴더명
  dataFile: string;            // data/*.json 파일명
  bgSrc: string;               // public/images/... 절대 경로
}

const BACKFILL_MAP: BackfillEntry[] = [
  { publishDate: '2026-04-09', dataFile: '2026-04-09-please-check.json',    bgSrc: 'public/images/2026-04-09/bg_cover.png' },
  { publishDate: '2026-04-10', dataFile: '2026-04-10-office-disagree.json', bgSrc: 'public/images/2026-04-10-office-disagree/bg_cover.png' },
  { publishDate: '2026-04-13', dataFile: '2026-04-14-i-think.json',         bgSrc: 'public/images/2026-04-14-i-think/bg_cover.png' },
  { publishDate: '2026-04-14', dataFile: '2026-04-15-im-sorry.json',        bgSrc: 'public/images/2026-04-15-im-sorry/bg_cover.png' },
  { publishDate: '2026-04-15', dataFile: '2026-04-15-zoom.json',            bgSrc: 'public/images/2026-04-15-zoom/bg_cover.png' },
  { publishDate: '2026-04-17', dataFile: '2026-04-17-sugo.json',            bgSrc: 'public/images/2026-04-17/bg_cover.png' },
  { publishDate: '2026-04-20', dataFile: '2026-04-20-small-talk.json',      bgSrc: 'public/images/2026-04-20/bg_cover.png' },
];

const B2B_PARENT = '1CCRMLkvTIWTwfX4QIAHNXd6k-z8hP6nF';

const THUMB_CSS = `
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 432px; height: 243px; overflow: hidden; font-family: 'Pretendard', -apple-system, sans-serif; word-break: keep-all; background: #FFFFFF; }
`;

function wrapThumbHtml(markup: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${THUMB_CSS}</style></head><body>${markup}</body></html>`;
}

interface DriveFile { id: string; name: string; mimeType: string; }

function listB2bDateFolders(): Record<string, string> {
  const out = execSync(
    `gws drive files list --params '${JSON.stringify({
      q: `'${B2B_PARENT}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 100,
    })}'`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );
  const parsed = JSON.parse(out);
  const map: Record<string, string> = {};
  for (const f of (parsed.files as DriveFile[])) map[f.name] = f.id;
  return map;
}

function uploadToB2B(folderId: string, localPath: string) {
  execSync(
    `gws drive files create --params '${JSON.stringify({})}' --json '${JSON.stringify({
      name: 'thumb_b2b.png',
      parents: [folderId],
    })}' --upload '${localPath}'`,
    { stdio: 'inherit' }
  );
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(`[backfill-b2b-thumb] ${dryRun ? 'DRY RUN' : 'LIVE'} — 대상 ${BACKFILL_MAP.length}개`);

  const b2bFolders = listB2bDateFolders();
  console.log(`[backfill-b2b-thumb] B2B Drive 날짜 폴더: ${Object.keys(b2bFolders).length}개 발견`);

  const report = { success: [] as string[], skipped: [] as { date: string; reason: string }[] };

  for (const entry of BACKFILL_MAP) {
    const folderId = b2bFolders[entry.publishDate];
    if (!folderId) {
      report.skipped.push({ date: entry.publishDate, reason: 'B2B Drive 날짜 폴더 없음' });
      continue;
    }

    const bgAbs = path.join(ROOT, entry.bgSrc);
    if (!fs.existsSync(bgAbs)) {
      report.skipped.push({ date: entry.publishDate, reason: `배경이미지 없음: ${entry.bgSrc}` });
      continue;
    }

    const dataPath = path.join(ROOT, 'data', entry.dataFile);
    if (!fs.existsSync(dataPath)) {
      report.skipped.push({ date: entry.publishDate, reason: `data JSON 없음: ${entry.dataFile}` });
      continue;
    }

    const carousel: CarouselFile = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const coverPage = carousel.pages.find(p => p.component === 'cover');
    if (!coverPage) {
      report.skipped.push({ date: entry.publishDate, reason: 'cover 페이지 없음' });
      continue;
    }

    const coverData: CoverData = {
      ...(coverPage.data as CoverData),
      bg_image: `file://${bgAbs}`,
    };

    const markup = ReactDOMServer.renderToStaticMarkup(
      React.createElement(B2bThumbPage, { data: coverData, scale: 1 })
    );
    const html = wrapThumbHtml(markup);

    const outPath = path.join('/tmp', `backfill_thumb_${entry.publishDate}.png`);
    if (!dryRun) {
      await exportThumbnail(html, outPath);
      uploadToB2B(folderId, outPath);
    }

    report.success.push(entry.publishDate);
    console.log(`  ✓ ${entry.publishDate} (${entry.dataFile})`);
  }

  console.log('\n=== 리포트 ===');
  console.log(`성공: ${report.success.length}개 — ${report.success.join(', ')}`);
  console.log(`skip: ${report.skipped.length}개`);
  for (const s of report.skipped) console.log(`  - ${s.date}: ${s.reason}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
