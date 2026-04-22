#!/usr/bin/env tsx
/**
 * Carousel 배경 이미지 로컬 생성 스크립트.
 *
 *   시트(row) → fal.ai nano-banana-2 → 로컬 tmp → gws drive +upload → 시트 bg_image 적재
 *
 * Apps Script `gen_image` 엔드포인트 의존을 제거한다. (기존 엔드포인트는 비상용 fallback 으로 유지)
 * 페이지 단위 병렬 호출로 캐러셀 1건(보통 3~5장) 전체를 수 초 ~ 수십 초에 처리한다.
 *
 * 사용:
 *   npm run gen-images -- --row 12
 *   npm run gen-images -- --row 12 --pages 0,2,4   # 특정 페이지만
 *   npm run gen-images -- --row 12 --force          # bg_image 있어도 덮어쓰기
 *   npm run gen-images -- --row 12 --dry-run        # 대상만 출력, 호출 없음
 *
 * 선행 조건:
 *   - `.env` 에 `FAL_API_KEY` 설정
 *   - `gws` CLI 인증 (`/gog` 스킬 참조) — Drive 업로드/권한 부여에 사용
 */

import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------

const WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec';
const FAL_MODEL = 'fal-ai/nano-banana-2';
const FAL_TIMEOUT_MS = 180_000;
const DEFAULT_DRIVE_FOLDER_ID = '1W9RcqlEjik-O-Jr83l-mfFXco2E6Gaqa';

// ---------------------------------------------------------------------------
// env 로드 (외부 의존 없이 .env 수동 파싱)
// ---------------------------------------------------------------------------

function loadDotEnv() {
  try {
    const text = readFileSync(join(process.cwd(), '.env'), 'utf-8');
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const [, key, valRaw] = m;
      if (process.env[key]) continue;
      process.env[key] = valRaw.replace(/^['"]|['"]$/g, '');
    }
  } catch {
    /* .env 없어도 OK */
  }
}

loadDotEnv();

const FAL_API_KEY = process.env.FAL_API_KEY;
const DRIVE_FOLDER_ID =
  process.env.CAROUSEL_DRIVE_FOLDER_ID ?? DEFAULT_DRIVE_FOLDER_ID;

if (!FAL_API_KEY) {
  console.error('FAL_API_KEY missing. Copy .env.example → .env and fill it in.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

interface Page {
  component: string;
  data: {
    bg_prompt?: string;
    bg_image?: string;
    [k: string]: unknown;
  };
}

interface RowResponse {
  row: number;
  date?: string;
  title?: string;
  pages: Page[];
}

// ---------------------------------------------------------------------------
// CLI 파싱
// ---------------------------------------------------------------------------

interface Options {
  row: number;
  pages?: number[];
  force: boolean;
  dryRun: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  let row: number | undefined;
  let pages: number[] | undefined;
  let force = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--row') row = Number(args[++i]);
    else if (a === '--pages')
      pages = args[++i].split(',').map((s) => Number(s.trim()));
    else if (a === '--force') force = true;
    else if (a === '--dry-run') dryRun = true;
    else if (a === '-h' || a === '--help') {
      printUsage();
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      printUsage();
      process.exit(1);
    }
  }

  if (!row || Number.isNaN(row)) {
    printUsage();
    process.exit(1);
  }
  return { row, pages, force, dryRun };
}

function printUsage() {
  console.log(
    'Usage: npm run gen-images -- --row <N> [--pages 0,2,4] [--force] [--dry-run]',
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// 웹앱 read_script / update_cells
// ---------------------------------------------------------------------------

async function readRow(row: number): Promise<RowResponse> {
  const res = await fetch(`${WEBAPP_URL}?action=read_script&row=${row}`);
  if (!res.ok) throw new Error(`read_script ${res.status}`);
  const body = (await res.json()) as RowResponse | { error: string };
  if ('error' in body) throw new Error(body.error);
  return body;
}

async function updateCells(
  row: number,
  cells: { col: string; value: unknown }[],
): Promise<void> {
  const res = await fetch(WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'update_cells', row, cells }),
  });
  if (!res.ok) throw new Error(`update_cells ${res.status}`);
  const body = (await res.json()) as { ok?: boolean; error?: string };
  if (body.error) throw new Error(body.error);
}

// ---------------------------------------------------------------------------
// fal.ai queue (submit → poll → result)
// ---------------------------------------------------------------------------

interface FalSubmit {
  request_id: string;
  status_url: string;
  response_url: string;
}

async function falGenerate(prompt: string): Promise<string> {
  // aspect_ratio / resolution 파라미터로 3:4 1024x1365 PNG 를 직접 요청.
  // (기존 Apps Script 가 프롬프트 뒤에 "Aspect ratio 3:4 ..." 문구를 덧붙이던 트릭 불필요)
  const submitRes = await fetch(`https://queue.fal.run/${FAL_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '3:4',
      resolution: '1K',
      num_images: 1,
      output_format: 'png',
    }),
  });
  if (!submitRes.ok) {
    throw new Error(`fal submit ${submitRes.status}: ${await submitRes.text()}`);
  }
  const submit = (await submitRes.json()) as FalSubmit;

  const started = Date.now();
  while (true) {
    if (Date.now() - started > FAL_TIMEOUT_MS) throw new Error('fal.ai poll timeout');
    await sleep(2000);
    const sRes = await fetch(submit.status_url, {
      headers: { Authorization: `Key ${FAL_API_KEY}` },
    });
    if (!sRes.ok) continue;
    const s = (await sRes.json()) as { status: string };
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED') throw new Error(`fal FAILED: ${JSON.stringify(s)}`);
  }

  const rRes = await fetch(submit.response_url, {
    headers: { Authorization: `Key ${FAL_API_KEY}` },
  });
  if (!rRes.ok) throw new Error(`fal result ${rRes.status}`);
  const result = (await rRes.json()) as { images?: { url: string }[] };
  const url = result.images?.[0]?.url;
  if (!url) throw new Error(`fal no image: ${JSON.stringify(result)}`);
  return url;
}

// ---------------------------------------------------------------------------
// Drive 업로드 + 공개 권한 (gws CLI)
// ---------------------------------------------------------------------------

function driveUploadPublic(filePath: string, name: string): string {
  // `+upload` 헬퍼는 supportsAllDrives 플래그가 없어 Shared Drive 폴더로 올리면
  // "File not found" 에러. raw `files create` + `--upload` multipart 로 호출.
  const uploadOut = execFileSync(
    'gws',
    [
      'drive',
      'files',
      'create',
      '--params',
      JSON.stringify({ supportsAllDrives: true, fields: 'id' }),
      '--json',
      JSON.stringify({ name, parents: [DRIVE_FOLDER_ID] }),
      '--upload',
      filePath,
    ],
    { encoding: 'utf-8' },
  );
  const uploaded = JSON.parse(uploadOut) as { id?: string };
  const fileId = uploaded.id;
  if (!fileId) throw new Error(`gws upload: no id in ${uploadOut}`);

  execFileSync(
    'gws',
    [
      'drive',
      'permissions',
      'create',
      '--params',
      JSON.stringify({ fileId, supportsAllDrives: true }),
      '--json',
      JSON.stringify({ role: 'reader', type: 'anyone' }),
    ],
    { encoding: 'utf-8' },
  );

  // 3rd-party embed 에서 쿠키/리다이렉트 이슈 없는 CDN URL.
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();
  console.log(
    `[gen-images] row=${opts.row}` +
      (opts.pages ? ` pages=${opts.pages.join(',')}` : '') +
      (opts.force ? ' force' : '') +
      (opts.dryRun ? ' dry-run' : ''),
  );

  const doc = await readRow(opts.row);
  const targets = (doc.pages ?? [])
    .map((p, idx) => ({ p, idx }))
    .filter(({ p, idx }) => {
      if (opts.pages && !opts.pages.includes(idx)) return false;
      if (!p?.data?.bg_prompt) return false;
      if (!opts.force && p.data.bg_image) return false;
      return true;
    });

  if (targets.length === 0) {
    console.log('[gen-images] no target pages (add --force to regenerate existing)');
    return;
  }

  console.log(`[gen-images] ${targets.length} page(s) queued:`);
  for (const { idx, p } of targets) {
    console.log(
      `  page_${idx + 1} (${p.component}): "${p.data.bg_prompt!.slice(0, 64)}..."`,
    );
  }

  if (opts.dryRun) return;

  const date = (doc.date || new Date().toISOString()).slice(0, 10);
  // `gws files create --upload` 는 current directory 밖 경로를 거부. 프로젝트 내부 tmp 사용.
  const baseDir = join(process.cwd(), 'output', '.tmp-gen');
  mkdirSync(baseDir, { recursive: true });
  const tmp = mkdtempSync(join(baseDir, 'batch-'));

  const results = await Promise.all(
    targets.map(async ({ p, idx }) => {
      const key = `${date}-row${opts.row}-${p.component}-${idx}`;
      try {
        console.log(`  [p${idx + 1}] fal.ai generating…`);
        const falUrl = await falGenerate(p.data.bg_prompt!);

        const imgRes = await fetch(falUrl);
        if (!imgRes.ok) throw new Error(`download ${imgRes.status}`);
        const buf = Buffer.from(await imgRes.arrayBuffer());
        const file = join(tmp, `${key}.png`);
        writeFileSync(file, buf);
        console.log(`  [p${idx + 1}] downloaded ${(buf.length / 1024).toFixed(0)}KB`);

        const publicUrl = driveUploadPublic(file, `${key}.png`);
        unlinkSync(file);
        console.log(`  [p${idx + 1}] drive → ${publicUrl}`);
        return { idx, p, publicUrl, ok: true as const };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  [p${idx + 1}] FAILED: ${msg}`);
        return { idx, p, ok: false as const, error: msg };
      }
    }),
  );

  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* noop */
  }

  const successes = results.filter((r): r is Extract<typeof r, { ok: true }> => r.ok);
  if (successes.length === 0) {
    console.error('[gen-images] all failed; sheet not updated');
    process.exit(1);
  }

  const cells = successes.map(({ idx, p, publicUrl }) => ({
    col: `page_${idx + 1}`,
    value: {
      component: p.component,
      data: { ...p.data, bg_image: publicUrl },
    },
  }));
  await updateCells(opts.row, cells);
  console.log(`[gen-images] sheet updated: ${cells.length} page(s)`);

  const failed = results.length - successes.length;
  if (failed > 0) {
    console.warn(`[gen-images] ${failed} page(s) failed — see logs above`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
