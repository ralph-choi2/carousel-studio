# 홈 캘린더 (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 빈 에디터 첫 화면을 월간 캘린더(`/`)로 대체. 날짜 셀에 산출물별 상태 뱃지 표시, 아이템 클릭 시 `/editor?row=N` 이동.

**Architecture:** React Router 신규 `/` 루트에 `HomePage` 추가. 서버 `/api/pipeline/status` 엔드포인트가 파일 시스템(`public/images/`, `output/`) + 캘린더 탭 데이터(`carousel.gs` 확장)를 조합해 row별 진행 상태(`empty|script_ready|image_ready|png_ready|uploaded|live`) 판정. 뱃지는 5종 매핑 (`기획중|스크립트|제작중|발행 준비|라이브`), 좌측 컬러 보더 미사용 — 7px 점 색상과 균일 회색 배경 + 진회색 hover 만으로 상태 표시.

**Tech Stack:** React 18, TypeScript 5.7, Vite 6, react-router-dom v7, Express 4 (Vite middleware 로 마운트), vitest 4 (environment: node).

**Parallelization plan:**
- **Wave 1** (Tasks 1·2·3 병렬): pure utils + Apps Script 확장 (타입 의존 없음)
- **Wave 2** (Task 1 완료 후, Tasks 4·5·6·7·8 병렬): data-loader 확장, 서버 엔드포인트, pure 컴포넌트 3개
- **Wave 3** (Task 8 완료 후, Tasks 9·10 병렬): CalendarCell, UnplacedList
- **Wave 4** (Task 9 완료 후): Task 11 MonthlyCalendar
- **Wave 5** (모든 선행 후): Task 12 HomePage
- **Wave 6**: Task 13 App.tsx 라우트 변경
- **Wave 7**: Task 14 Manual QA

**Spec reference:** `docs/superpowers/specs/2026-04-22-home-calendar-design.md`

---

## Task 1: Pipeline status enum + 뱃지 display 매핑

**Files:**
- Create: `src/lib/status-mapping.ts`
- Test: `src/lib/status-mapping.test.ts`

**Depends on:** none

- [ ] **Step 1.1: 테스트 먼저 작성**

Create `src/lib/status-mapping.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { statusToBadge, type PipelineStatus } from './status-mapping';

describe('statusToBadge', () => {
  it('maps empty to 기획중', () => {
    expect(statusToBadge('empty')).toEqual({ label: '기획중', dotColor: '#9ca3af' });
  });

  it('maps script_ready to 스크립트', () => {
    expect(statusToBadge('script_ready')).toEqual({ label: '스크립트', dotColor: '#3b82f6' });
  });

  it('maps image_ready to 제작중', () => {
    expect(statusToBadge('image_ready')).toEqual({ label: '제작중', dotColor: '#f97316' });
  });

  it('maps png_ready to 제작중 (same badge as image_ready)', () => {
    expect(statusToBadge('png_ready')).toEqual({ label: '제작중', dotColor: '#f97316' });
  });

  it('maps uploaded to 발행 준비', () => {
    expect(statusToBadge('uploaded')).toEqual({ label: '발행 준비', dotColor: '#8b5cf6' });
  });

  it('maps live to 라이브', () => {
    expect(statusToBadge('live')).toEqual({ label: '라이브', dotColor: '#10b981' });
  });

  it('falls back to 기획중 for unknown', () => {
    expect(statusToBadge('xxx' as PipelineStatus)).toEqual({ label: '기획중', dotColor: '#9ca3af' });
  });
});
```

- [ ] **Step 1.2: 실패 확인**

Run: `npm test -- src/lib/status-mapping.test.ts`
Expected: FAIL — `Cannot find module './status-mapping'`

- [ ] **Step 1.3: 구현**

Create `src/lib/status-mapping.ts`:

```ts
/**
 * 파이프라인 내부 status 값.
 * 각 스킬/파이프라인 단계 완료 후 이 값으로 전이.
 */
export type PipelineStatus =
  | 'empty'
  | 'script_ready'
  | 'image_ready'
  | 'png_ready'
  | 'uploaded'
  | 'live';

export interface BadgeDisplay {
  label: string;
  /** 7px 점 색상 (hex). 좌측 border 는 사용하지 않음. */
  dotColor: string;
}

const BADGE_MAP: Record<PipelineStatus, BadgeDisplay> = {
  empty:        { label: '기획중',    dotColor: '#9ca3af' },
  script_ready: { label: '스크립트',  dotColor: '#3b82f6' },
  image_ready:  { label: '제작중',    dotColor: '#f97316' },
  png_ready:    { label: '제작중',    dotColor: '#f97316' },
  uploaded:     { label: '발행 준비', dotColor: '#8b5cf6' },
  live:         { label: '라이브',    dotColor: '#10b981' },
};

export function statusToBadge(status: PipelineStatus): BadgeDisplay {
  return BADGE_MAP[status] ?? BADGE_MAP.empty;
}

/** 범례(Legend) 에 사용하는 뱃지 고유 종류. image_ready/png_ready 는 제작중으로 뭉침. */
export const LEGEND_STATUSES: PipelineStatus[] = [
  'empty', 'script_ready', 'image_ready', 'uploaded', 'live',
];
```

- [ ] **Step 1.4: 테스트 통과 확인**

Run: `npm test -- src/lib/status-mapping.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 1.5: 커밋**

```bash
git add src/lib/status-mapping.ts src/lib/status-mapping.test.ts
git commit -m "feat(carousel-studio): pipeline status enum + 뱃지 매핑"
```

---

## Task 2: Calendar utilities (날짜 그루핑, 월 범위)

**Files:**
- Create: `src/lib/calendar-utils.ts`
- Test: `src/lib/calendar-utils.test.ts`

**Depends on:** none

- [ ] **Step 2.1: 테스트 먼저 작성**

Create `src/lib/calendar-utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { groupByDate, getMonthGridDates, formatYearMonth } from './calendar-utils';

describe('groupByDate', () => {
  it('groups items by date field', () => {
    const items = [
      { row: 1, date: '2026-04-22', title: 'A' },
      { row: 2, date: '2026-04-22', title: 'B' },
      { row: 3, date: '2026-04-23', title: 'C' },
    ];
    const result = groupByDate(items);
    expect(result['2026-04-22']).toHaveLength(2);
    expect(result['2026-04-23']).toHaveLength(1);
  });

  it('puts empty/missing date into "" bucket', () => {
    const items = [
      { row: 1, date: '', title: 'A' },
      { row: 2, date: undefined as unknown as string, title: 'B' },
      { row: 3, date: '2026-04-22', title: 'C' },
    ];
    const result = groupByDate(items);
    expect(result['']).toHaveLength(2);
    expect(result['2026-04-22']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByDate([])).toEqual({});
  });
});

describe('getMonthGridDates', () => {
  it('returns 35 dates for 2026-04 (Apr 1 is Wed, fits in 5 rows)', () => {
    const dates = getMonthGridDates(2026, 4);
    expect(dates).toHaveLength(35);
    // First date is Sun 2026-03-29 (week-start for Apr 1 Wed)
    expect(dates[0].toISOString().slice(0, 10)).toBe('2026-03-29');
    // Last date is Sat 2026-05-02
    expect(dates[34].toISOString().slice(0, 10)).toBe('2026-05-02');
  });

  it('returns 42 dates for 2026-08 (Aug 1 is Sat, needs 6 rows)', () => {
    const dates = getMonthGridDates(2026, 8);
    expect(dates).toHaveLength(42);
  });
});

describe('formatYearMonth', () => {
  it('formats as 한글', () => {
    expect(formatYearMonth(2026, 4)).toBe('2026년 4월');
    expect(formatYearMonth(2026, 12)).toBe('2026년 12월');
  });
});
```

- [ ] **Step 2.2: 실패 확인**

Run: `npm test -- src/lib/calendar-utils.test.ts`
Expected: FAIL — module not found

- [ ] **Step 2.3: 구현**

Create `src/lib/calendar-utils.ts`:

```ts
/**
 * 한 달치 캘린더 그리드 날짜 배열 (일요일 시작, 35 or 42개).
 * 해당 월 첫 날짜 이전의 빈 셀을 이전 달 날짜로 채우고,
 * 마지막 날 이후를 다음 달 날짜로 채워 항상 7의 배수로 반환.
 *
 * @param year  4자리 연도 (예: 2026)
 * @param month 1~12
 */
export function getMonthGridDates(year: number, month: number): Date[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastOfMonth = new Date(Date.UTC(year, month, 0));

  // 첫 주 일요일 기준 시작일 (1 - firstDOW 만큼 뒤로)
  const startOffset = firstOfMonth.getUTCDay(); // 0=일 ~ 6=토
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - startOffset);

  // 마지막 주 토요일 기준 종료일 (6 - lastDOW 만큼 앞으로)
  const endOffset = 6 - lastOfMonth.getUTCDay();
  const gridEnd = new Date(lastOfMonth);
  gridEnd.setUTCDate(lastOfMonth.getUTCDate() + endOffset);

  const dates: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** `YYYY-MM-DD` 문자열로 변환 (UTC 기준). */
export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 한글 월 표시. */
export function formatYearMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

/** Date 두 개가 같은 날짜인지 (UTC). */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate();
}

/**
 * items 을 date 필드 기준으로 그루핑.
 * date 가 비어있거나 undefined 인 경우 "" 키로 모음.
 */
export function groupByDate<T extends { date?: string }>(
  items: T[],
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = item.date || '';
    (result[key] ||= []).push(item);
  }
  return result;
}
```

- [ ] **Step 2.4: 테스트 통과 확인**

Run: `npm test -- src/lib/calendar-utils.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 2.5: 커밋**

```bash
git add src/lib/calendar-utils.ts src/lib/calendar-utils.test.ts
git commit -m "feat(carousel-studio): calendar-utils (월 그리드, 날짜 그루핑)"
```

---

## Task 3: Apps Script `list_scripts` 확장 (캘린더 탭 조인)

**Files:**
- Modify: `/Users/ianchoi/workspace/marketing/data/marketing-hub/code/content-ops/carousel.gs:153-174`

**Depends on:** none

- [ ] **Step 3.1: carousel_listScripts_ 함수를 확장하여 캘린더 탭 조인 로직 추가**

기존 `carousel_listScripts_` 함수를 아래로 교체 (line 153-174 전체):

```javascript
function carousel_listScripts_(e) {
  const sheet = carousel_getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return carousel_json_({ items: [] });

  const data = sheet.getRange(2, 1, last - 1, CAROUSEL_TOTAL_COLS).getValues();

  // 캘린더 탭 미리 인덱싱 (channel="IG Carousel" filter).
  // 매칭 키: date + title (소재명)
  const ss = SpreadsheetApp.openById(getProps_().SPREADSHEET_ID);
  const calSheet = ss.getSheetByName('캘린더');
  const calIndex = {}; // { "YYYY-MM-DD|title": { status, drive_url } }
  if (calSheet && calSheet.getLastRow() >= 2) {
    const calData = calSheet.getRange(2, 1, calSheet.getLastRow() - 1, 11).getValues();
    for (let i = 0; i < calData.length; i++) {
      const cv = calData[i];
      const channel = String(cv[2] || ''); // C열
      if (channel !== 'IG Carousel') continue;
      const dateRaw = cv[0]; // A열
      const dateStr = dateRaw instanceof Date
        ? Utilities.formatDate(dateRaw, 'Asia/Seoul', 'yyyy-MM-dd')
        : String(dateRaw || '').substring(0, 10);
      const title = String(cv[5] || ''); // F열 소재명
      const status = String(cv[7] || ''); // H열 상태
      const driveUrl = String(cv[9] || ''); // J열 Drive 링크
      if (!dateStr || !title) continue;
      calIndex[dateStr + '|' + title] = {
        calendar_status: status,
        drive_url: driveUrl,
      };
    }
  }

  const items = [];
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (!v[0]) continue; // skip empty rows
    const dateStr = v[15] instanceof Date
      ? Utilities.formatDate(v[15], 'Asia/Seoul', 'yyyy-MM-dd')
      : String(v[15] || '').substring(0, 10);
    const title = String(v[0] || '');
    const calMatch = calIndex[dateStr + '|' + title] || {};
    items.push({
      row: i + 2,
      title: title,
      hypothesis: v[1],
      pillar: v[14],
      date: dateStr,
      caption: v[16],
      status: v[17],
      calendar_status: calMatch.calendar_status || '',
      drive_url: calMatch.drive_url || '',
    });
  }
  return carousel_json_({ items: items });
}
```

- [ ] **Step 3.2: clasp push 로 배포**

```bash
cd /Users/ianchoi/workspace/marketing/data/marketing-hub/code/content-ops
clasp push --force
```

- [ ] **Step 3.3: 배포 확인 (브라우저에서 웹앱 URL 직접 호출)**

```bash
curl 'https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec?action=list_scripts' | python3 -m json.tool | head -60
```

Expected: 각 item 에 `calendar_status`, `drive_url` 필드 존재. 이미 라이브된 row는 `calendar_status: "라이브"` 반환.

- [ ] **Step 3.4: content-ops repo 커밋**

```bash
cd /Users/ianchoi/workspace/marketing/data/marketing-hub/code
git add content-ops/carousel.gs
git commit -m "feat(carousel): list_scripts 에 캘린더 탭 status + drive_url 조인"
```

---

## Task 4: data-loader 타입 확장 + `fetchPipelineStatus`

**Files:**
- Modify: `src/lib/data-loader.ts`
- Modify: `src/lib/types.ts:21-30`

**Depends on:** Task 1 (PipelineStatus 타입)

- [ ] **Step 4.1: `CarouselItem` 타입에 신규 필드 추가**

`src/lib/types.ts` line 21-30 의 `CarouselItem` interface 에 2개 필드 추가:

```ts
/** list_scripts 결과 아이템 (에디터 드롭다운용) */
export interface CarouselItem {
  row: number;
  title: string;
  hypothesis: string;
  pillar: string;
  date: string;
  caption: string;
  status: string;
  /** 캘린더 탭 H열 값 (예: "발행 준비", "라이브"). 매칭 안 되면 "". */
  calendar_status?: string;
  /** 캘린더 탭 J열 Drive URL. 매칭 안 되면 "". */
  drive_url?: string;
}
```

- [ ] **Step 4.2: `fetchPipelineStatus` 함수 추가**

`src/lib/data-loader.ts` 파일 끝에 추가:

```ts
import type { PipelineStatus } from '@/lib/status-mapping';

/**
 * 여러 row 의 파이프라인 상태를 한 번에 조회.
 * 서버 `/api/pipeline/status` 가 파일 시스템 + 캘린더 탭 정보를 조합해 결정.
 */
export async function fetchPipelineStatus(
  rows: number[],
): Promise<Record<number, PipelineStatus>> {
  if (rows.length === 0) return {};
  const qs = rows.join(',');
  const res = await fetch(`/api/pipeline/status?rows=${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch pipeline status: ${res.statusText}`);
  const body = (await res.json()) as { statuses: Record<number, PipelineStatus> } | ApiError;
  assertOk(body);
  return body.statuses;
}
```

- [ ] **Step 4.3: TypeScript 체크 통과 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4.4: 커밋**

```bash
git add src/lib/types.ts src/lib/data-loader.ts
git commit -m "feat(carousel-studio): CarouselItem 에 calendar_status/drive_url + fetchPipelineStatus"
```

---

## Task 5: 서버 `/api/pipeline/status` 엔드포인트

**Files:**
- Create: `server/pipeline-status.ts`
- Create: `server/pipeline-status.test.ts`
- Modify: `vite.config.ts:7-33` (createApiApp 확장)

**Depends on:** Task 1 (PipelineStatus 타입)

- [ ] **Step 5.1: 순수 판정 함수 테스트 먼저 작성**

Create `server/pipeline-status.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { determineStatus } from './pipeline-status';

describe('determineStatus', () => {
  const baseFs = { imagesExist: false, pngExist: false };
  const baseItem = { pages: [] as unknown[], calendar_status: '', drive_url: '' };

  it('returns live when calendar_status = 라이브', () => {
    expect(determineStatus({ ...baseItem, calendar_status: '라이브' }, baseFs)).toBe('live');
  });

  it('returns uploaded when drive_url present', () => {
    expect(determineStatus({ ...baseItem, drive_url: 'https://drive.google.com/x' }, baseFs)).toBe('uploaded');
  });

  it('returns png_ready when output PNG exist', () => {
    expect(determineStatus(baseItem, { imagesExist: true, pngExist: true })).toBe('png_ready');
  });

  it('returns image_ready when only images exist', () => {
    expect(determineStatus(baseItem, { imagesExist: true, pngExist: false })).toBe('image_ready');
  });

  it('returns script_ready when pages is non-empty but no images', () => {
    expect(determineStatus({ ...baseItem, pages: [{ component: 'cover' }] }, baseFs)).toBe('script_ready');
  });

  it('returns empty otherwise', () => {
    expect(determineStatus(baseItem, baseFs)).toBe('empty');
  });

  it('live takes precedence over drive_url', () => {
    expect(determineStatus(
      { ...baseItem, calendar_status: '라이브', drive_url: 'https://x' },
      { imagesExist: true, pngExist: true },
    )).toBe('live');
  });
});
```

- [ ] **Step 5.2: 실패 확인**

Run: `npm test -- server/pipeline-status.test.ts`
Expected: FAIL — module not found

- [ ] **Step 5.3: 순수 로직 + Express 핸들러 구현**

Create `server/pipeline-status.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import type { PipelineStatus } from '../src/lib/status-mapping.js';

interface StatusItemInput {
  pages?: unknown[];
  calendar_status?: string;
  drive_url?: string;
}

interface FsSignals {
  imagesExist: boolean;
  pngExist: boolean;
}

/** 우선순위: live > uploaded > png_ready > image_ready > script_ready > empty */
export function determineStatus(
  item: StatusItemInput,
  fs: FsSignals,
): PipelineStatus {
  if (item.calendar_status === '라이브') return 'live';
  if (item.drive_url && item.drive_url.trim().length > 0) return 'uploaded';
  if (fs.pngExist) return 'png_ready';
  if (fs.imagesExist) return 'image_ready';
  if (Array.isArray(item.pages) && item.pages.length > 0) return 'script_ready';
  return 'empty';
}

/** 주어진 디렉토리가 존재하고 파일 1개 이상 포함하는지. */
function dirHasFiles(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) return false;
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) return false;
    return fs.readdirSync(dirPath).some(f => !f.startsWith('.'));
  } catch {
    return false;
  }
}

/**
 * Express 핸들러. 클라이언트가 rows=1,2,3 로 요청하면 각 row 의 파이프라인 상태 반환.
 * 서버는 자체적으로 Apps Script list_scripts 를 호출해 item 메타를 얻고,
 * 파일 시스템을 체크해 determineStatus 적용.
 */
export async function handlePipelineStatus(
  req: Request,
  res: Response,
  projectRoot: string,
  fetchItems: () => Promise<Array<{ row: number } & StatusItemInput & { date?: string }>>,
) {
  try {
    const rowsParam = String(req.query.rows || '');
    const requestedRows = rowsParam
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => Number.isFinite(n) && n > 0);
    if (requestedRows.length === 0) {
      res.status(400).json({ error: 'Missing rows param' });
      return;
    }

    const allItems = await fetchItems();
    const byRow = new Map<number, typeof allItems[number]>();
    for (const it of allItems) byRow.set(it.row, it);

    const statuses: Record<number, PipelineStatus> = {};
    for (const row of requestedRows) {
      const item = byRow.get(row);
      if (!item) {
        statuses[row] = 'empty';
        continue;
      }
      const date = item.date || '';
      const imagesDir = path.join(projectRoot, 'public', 'images', date);
      const outputDir = path.join(projectRoot, 'output', date);
      statuses[row] = determineStatus(item, {
        imagesExist: date ? dirHasFiles(imagesDir) : false,
        pngExist: date ? dirHasFiles(outputDir) : false,
      });
    }
    res.json({ statuses });
  } catch (err) {
    console.error('pipeline-status error:', err);
    res.status(500).json({ error: String(err) });
  }
}
```

- [ ] **Step 5.4: `vite.config.ts` 에 라우트 등록**

기존 `vite.config.ts` 의 `createApiApp()` 를 아래로 교체:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { exportPages } from './server/export.js';
import { handlePipelineStatus } from './server/pipeline-status.js';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec';

async function fetchAppsScriptItems() {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list_scripts`);
  if (!res.ok) throw new Error(`Apps Script list_scripts failed: ${res.statusText}`);
  const body = (await res.json()) as { items?: Array<Record<string, unknown>> };
  return (body.items ?? []).map(raw => ({
    row: Number(raw.row),
    date: String(raw.date ?? ''),
    pages: [] as unknown[], // pages 는 read_script 에서만 반환. script_ready 판정은 date 유무로 대용 불가이므로 별도 후처리.
    calendar_status: String(raw.calendar_status ?? ''),
    drive_url: String(raw.drive_url ?? ''),
  }));
}

function createApiApp() {
  const app = express();
  const projectRoot = path.resolve(__dirname);

  app.post('/api/export', express.json({ limit: '50mb' }), async (req, res) => {
    const { filename, htmlPages, thumbHtml } = req.body as {
      filename: string;
      htmlPages: { index: number; component: string; html: string }[];
      thumbHtml?: string;
    };
    if (!filename || !Array.isArray(htmlPages)) {
      res.status(400).json({ error: 'Missing filename or htmlPages' });
      return;
    }
    try {
      const dateStr = filename.replace(/\.json$/, '');
      const outputDir = await exportPages(dateStr, htmlPages, thumbHtml);
      res.json({ ok: true, outputDir, count: htmlPages.length, thumb: Boolean(thumbHtml) });
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.get('/api/pipeline/status', (req, res) => {
    handlePipelineStatus(req, res, projectRoot, fetchAppsScriptItems);
  });

  return app;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(createApiApp());
      },
    },
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
});
```

**중요**: `fetchAppsScriptItems` 에서 `pages: []` 로 두면 `script_ready` 판정 불가. Phase 1 단순화 — **date 가 존재하면 `script_ready` 간주**하는 fallback 을 `determineStatus` 호출 전에 적용하거나, `list_scripts` 응답에 `pages_count` 를 추가하여 해결. Step 5.5 에서 후자 선택.

- [ ] **Step 5.5: Apps Script 추가 확장 — pages_count 필드**

Task 3 에서 수정한 `carousel_listScripts_` 에 `pages_count` 추가. `/Users/ianchoi/workspace/marketing/data/marketing-hub/code/content-ops/carousel.gs` 의 `carousel_listScripts_` 내 for 루프 안, items.push 부분 수정:

```javascript
// 페이지 셀 (C~N, index 2~13) 중 비어있지 않은 개수
let pagesCount = 0;
for (let p = 2; p < 2 + CAROUSEL_MAX_PAGES; p++) {
  if (v[p]) pagesCount++;
}

items.push({
  row: i + 2,
  title: title,
  hypothesis: v[1],
  pillar: v[14],
  date: dateStr,
  caption: v[16],
  status: v[17],
  pages_count: pagesCount,
  calendar_status: calMatch.calendar_status || '',
  drive_url: calMatch.drive_url || '',
});
```

그리고 `fetchAppsScriptItems` 의 매핑 수정 (pages 를 pages_count 기반으로):

```ts
async function fetchAppsScriptItems() {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list_scripts`);
  if (!res.ok) throw new Error(`Apps Script list_scripts failed: ${res.statusText}`);
  const body = (await res.json()) as { items?: Array<Record<string, unknown>> };
  return (body.items ?? []).map(raw => {
    const pagesCount = Number(raw.pages_count ?? 0);
    return {
      row: Number(raw.row),
      date: String(raw.date ?? ''),
      pages: Array(pagesCount).fill(null) as unknown[], // length 만 중요
      calendar_status: String(raw.calendar_status ?? ''),
      drive_url: String(raw.drive_url ?? ''),
    };
  });
}
```

clasp push 재실행:

```bash
cd /Users/ianchoi/workspace/marketing/data/marketing-hub/code/content-ops && clasp push --force
```

- [ ] **Step 5.6: 테스트 통과 확인**

Run: `npm test -- server/pipeline-status.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5.7: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 5.8: 수동 smoke test**

Run: `npm run dev` (포트 5173)
별도 터미널에서:

```bash
curl 'http://localhost:5173/api/pipeline/status?rows=2,3,4' | python3 -m json.tool
```

Expected: `{ "statuses": { "2": "live", "3": "...", "4": "..." } }` 같은 형태. 실제 row 번호에 따라 값 달라짐.

- [ ] **Step 5.9: 커밋 (두 repo 모두)**

carousel-studio:
```bash
git add server/pipeline-status.ts server/pipeline-status.test.ts vite.config.ts
git commit -m "feat(carousel-studio): /api/pipeline/status 엔드포인트 + 순수 판정 함수"
```

content-ops (이미 Task 3 에서 커밋됐지만 pages_count 추가로 새 커밋):
```bash
cd /Users/ianchoi/workspace/marketing/data/marketing-hub/code
git add content-ops/carousel.gs
git commit -m "feat(carousel): list_scripts 에 pages_count 필드 추가"
```

---

## Task 6: `<Legend>` 컴포넌트

**Files:**
- Create: `src/components/calendar/Legend.tsx`

**Depends on:** Task 1 (LEGEND_STATUSES, statusToBadge)

- [ ] **Step 6.1: 구현**

```tsx
import { LEGEND_STATUSES, statusToBadge } from '@/lib/status-mapping';

export function Legend() {
  return (
    <div style={{
      display: 'flex', gap: 16, fontSize: 12, color: '#6b7280',
      marginBottom: 12, flexWrap: 'wrap',
    }}>
      {LEGEND_STATUSES.map(status => {
        const { label, dotColor } = statusToBadge(status);
        return (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: dotColor,
            }} />
            {label}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 6.3: 커밋**

```bash
git add src/components/calendar/Legend.tsx
git commit -m "feat(carousel-studio): Legend 컴포넌트 (상태 뱃지 범례)"
```

---

## Task 7: `<MonthNav>` 컴포넌트

**Files:**
- Create: `src/components/calendar/MonthNav.tsx`

**Depends on:** Task 2 (formatYearMonth)

- [ ] **Step 7.1: 구현**

```tsx
import { formatYearMonth } from '@/lib/calendar-utils';

interface MonthNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNav({ year, month, onPrev, onNext, onToday }: MonthNavProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={onPrev} style={navBtnStyle} aria-label="이전 달">‹</button>
        <span>{formatYearMonth(year, month)}</span>
        <button onClick={onNext} style={navBtnStyle} aria-label="다음 달">›</button>
      </div>
      <button onClick={onToday} style={{
        background: '#111', color: '#fff', border: 'none', padding: '8px 14px',
        borderRadius: 8, fontSize: 13, cursor: 'pointer',
      }}>오늘</button>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: '#f3f4f6', border: 'none', width: 32, height: 32,
  borderRadius: 8, fontSize: 16, cursor: 'pointer', color: '#111',
};
```

- [ ] **Step 7.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 7.3: 커밋**

```bash
git add src/components/calendar/MonthNav.tsx
git commit -m "feat(carousel-studio): MonthNav 컴포넌트 (월 네비게이션)"
```

---

## Task 8: `<CalendarItem>` 컴포넌트 (셀 내 단일 산출물)

**Files:**
- Create: `src/components/calendar/CalendarItem.tsx`

**Depends on:** Task 1 (PipelineStatus, statusToBadge)

- [ ] **Step 8.1: 구현**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statusToBadge, type PipelineStatus } from '@/lib/status-mapping';

interface CalendarItemProps {
  row: number;
  title: string;
  status: PipelineStatus;
}

export function CalendarItem({ row, title, status }: CalendarItemProps) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const { dotColor } = statusToBadge(status);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/editor?row=${row}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 8px', borderRadius: 5,
        fontSize: 11.5, cursor: 'pointer',
        background: hover ? '#d1d5db' : '#f3f4f6',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'background 0.12s',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: dotColor,
        flexShrink: 0,
      }} />
      <span style={{
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: '#111', fontWeight: 500,
      }}>{title}</span>
    </div>
  );
}
```

- [ ] **Step 8.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 8.3: 커밋**

```bash
git add src/components/calendar/CalendarItem.tsx
git commit -m "feat(carousel-studio): CalendarItem 컴포넌트 (점+제목, 클릭시 에디터 이동)"
```

---

## Task 9: `<CalendarCell>` 컴포넌트 (단일 날짜 셀)

**Files:**
- Create: `src/components/calendar/CalendarCell.tsx`

**Depends on:** Task 8 (CalendarItem)

- [ ] **Step 9.1: 구현**

```tsx
import type { PipelineStatus } from '@/lib/status-mapping';
import { CalendarItem } from './CalendarItem';

export interface CellItemData {
  row: number;
  title: string;
  status: PipelineStatus;
}

interface CalendarCellProps {
  day: number;
  isOtherMonth?: boolean;
  isToday?: boolean;
  items: CellItemData[];
}

const MAX_VISIBLE = 3;

export function CalendarCell({ day, isOtherMonth, isToday, items }: CalendarCellProps) {
  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - MAX_VISIBLE;

  return (
    <div style={{
      background: isOtherMonth ? '#fafafa' : '#fff',
      minHeight: 118, padding: 8,
      display: 'flex', flexDirection: 'column', gap: 4,
      boxShadow: isToday ? 'inset 0 0 0 2px #111' : undefined,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, marginBottom: 2,
        color: isOtherMonth ? '#d1d5db' : '#111',
      }}>
        {day}{isToday ? ' · 오늘' : ''}
      </div>
      {!isOtherMonth && visible.map(it => (
        <CalendarItem key={it.row} row={it.row} title={it.title} status={it.status} />
      ))}
      {!isOtherMonth && overflow > 0 && (
        <div style={{
          fontSize: 10.5, color: '#6b7280', padding: '2px 6px',
          cursor: 'pointer', fontWeight: 600,
        }}>+{overflow} more</div>
      )}
    </div>
  );
}
```

Phase 1 에서 `+N more` 클릭 시 확장은 미구현 (추후 단순 alert 또는 모달 추가). 현재는 시각적 표시만.

- [ ] **Step 9.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 9.3: 커밋**

```bash
git add src/components/calendar/CalendarCell.tsx
git commit -m "feat(carousel-studio): CalendarCell (날짜 셀 + 최대 3개 아이템 + overflow)"
```

---

## Task 10: `<UnplacedList>` 컴포넌트 (date 없는 초안 목록)

**Files:**
- Create: `src/components/calendar/UnplacedList.tsx`

**Depends on:** Task 8 (CalendarItem)

- [ ] **Step 10.1: 구현**

```tsx
import type { CellItemData } from './CalendarCell';
import { CalendarItem } from './CalendarItem';

interface UnplacedListProps {
  items: CellItemData[];
}

export function UnplacedList({ items }: UnplacedListProps) {
  if (items.length === 0) return null;
  return (
    <div style={{
      marginTop: 20, padding: 16, background: '#fafafa', borderRadius: 8,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 10,
      }}>
        📝 미배치 초안 ({items.length}) · 날짜 미정
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(it => (
          <CalendarItem key={it.row} row={it.row} title={it.title} status={it.status} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 10.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 10.3: 커밋**

```bash
git add src/components/calendar/UnplacedList.tsx
git commit -m "feat(carousel-studio): UnplacedList (date 미정 초안 목록)"
```

---

## Task 11: `<MonthlyCalendar>` 컴포넌트 (7×5~6 그리드)

**Files:**
- Create: `src/components/calendar/MonthlyCalendar.tsx`

**Depends on:** Task 2 (getMonthGridDates, toDateKey, isSameDay), Task 9 (CalendarCell)

- [ ] **Step 11.1: 구현**

```tsx
import { getMonthGridDates, toDateKey, isSameDay } from '@/lib/calendar-utils';
import { CalendarCell, type CellItemData } from './CalendarCell';

interface MonthlyCalendarProps {
  year: number;
  month: number; // 1-12
  itemsByDate: Record<string, CellItemData[]>;
  today: Date;
}

const WEEKDAYS = [
  { label: '일', color: '#ef4444' },
  { label: '월', color: '#6b7280' },
  { label: '화', color: '#6b7280' },
  { label: '수', color: '#6b7280' },
  { label: '목', color: '#6b7280' },
  { label: '금', color: '#6b7280' },
  { label: '토', color: '#3b82f6' },
];

export function MonthlyCalendar({ year, month, itemsByDate, today }: MonthlyCalendarProps) {
  const dates = getMonthGridDates(year, month);

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 1, background: '#e5e7eb',
      border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
    }}>
      {WEEKDAYS.map(w => (
        <div key={w.label} style={{
          background: '#f9fafb', padding: '10px 12px', fontSize: 12,
          fontWeight: 600, color: w.color, textAlign: 'left',
        }}>{w.label}</div>
      ))}
      {dates.map(d => {
        const key = toDateKey(d);
        const items = itemsByDate[key] ?? [];
        const isOtherMonth = d.getUTCMonth() + 1 !== month;
        const isToday = isSameDay(d, today);
        return (
          <CalendarCell
            key={key}
            day={d.getUTCDate()}
            isOtherMonth={isOtherMonth}
            isToday={isToday}
            items={items}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 11.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 11.3: 커밋**

```bash
git add src/components/calendar/MonthlyCalendar.tsx
git commit -m "feat(carousel-studio): MonthlyCalendar (7×5~6 그리드 + 요일 헤더)"
```

---

## Task 12: `<HomePage>` 컨테이너 (데이터 로드 + 월 state)

**Files:**
- Create: `src/pages/HomePage.tsx`

**Depends on:** Tasks 1, 2, 4, 6, 7, 10, 11

- [ ] **Step 12.1: 구현**

```tsx
import { useState, useEffect, useMemo } from 'react';
import { listCarouselItems, fetchPipelineStatus } from '@/lib/data-loader';
import { groupByDate } from '@/lib/calendar-utils';
import type { CarouselItem } from '@/lib/types';
import type { PipelineStatus } from '@/lib/status-mapping';
import { MonthNav } from '@/components/calendar/MonthNav';
import { Legend } from '@/components/calendar/Legend';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { UnplacedList } from '@/components/calendar/UnplacedList';
import type { CellItemData } from '@/components/calendar/CalendarCell';

export function HomePage() {
  const today = useMemo(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }, []);
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1); // 1-12
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [statuses, setStatuses] = useState<Record<number, PipelineStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCarouselItems()
      .then(async (all) => {
        if (cancelled) return;
        setItems(all);
        const rows = all.map(i => i.row);
        if (rows.length > 0) {
          const st = await fetchPipelineStatus(rows);
          if (!cancelled) setStatuses(st);
        }
      })
      .catch(err => { if (!cancelled) setError(String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const cellItems: CellItemData[] = useMemo(() => items.map(it => ({
    row: it.row,
    title: it.title,
    status: statuses[it.row] ?? 'empty',
  })), [items, statuses]);

  // 현재 월 grid 범위에 속하는 것만 그루핑 (다른 달은 표시 안 됨)
  const itemsByDate = useMemo(() => groupByDate(
    cellItems.map((it, idx) => ({
      ...it,
      date: items[idx].date || '',
    })),
  ), [cellItems, items]);

  const unplaced: CellItemData[] = itemsByDate[''] ?? [];

  const goPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const goNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => {
    setYear(today.getUTCFullYear());
    setMonth(today.getUTCMonth() + 1);
  };

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: 24,
      fontFamily: "'Pretendard', -apple-system, sans-serif",
    }}>
      <MonthNav year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
      <Legend />
      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: 12 }}>
          상태 조회 실패: {error}. 뱃지 없이 렌더합니다.
        </div>
      )}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      ) : (
        <>
          <MonthlyCalendar year={year} month={month} itemsByDate={itemsByDate} today={today} />
          <UnplacedList items={unplaced} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 12.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 12.3: 커밋**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(carousel-studio): HomePage (월 캘린더 컨테이너 + 데이터 로드)"
```

---

## Task 13: `App.tsx` 라우트 변경 — `/` → HomePage

**Files:**
- Modify: `src/app/App.tsx:2,4,50-51`

**Depends on:** Task 12

- [ ] **Step 13.1: App.tsx 수정**

`src/app/App.tsx` line 2, 4, 50-51 수정.

Line 2 변경 (Navigate 제거 - 이제 안 쓰므로):
```tsx
import { Routes, Route } from 'react-router-dom';
```

Line 4 위에 HomePage import 추가:
```tsx
import { HomePage } from '@/pages/HomePage';
import { EditorPage } from '@/pages/EditorPage';
```

Line 50-51 변경 — 기존 Navigate 를 HomePage 로 교체:
```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route
    path="/editor"
    element={
      <EditorPage
        ...
```

(나머지는 그대로)

- [ ] **Step 13.2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 13.3: 커밋**

```bash
git add src/app/App.tsx
git commit -m "feat(carousel-studio): '/' 루트를 HomePage 로 변경 (홈 캘린더 활성화)"
```

---

## Task 14: 수동 QA + 수정

**Files:** 없음 (확인만)

**Depends on:** Tasks 1~13

- [ ] **Step 14.1: 개발 서버 띄우기**

```bash
npm run dev
```

브라우저 `http://localhost:5173` 열기.

- [ ] **Step 14.2: 체크리스트 확인**

1. 홈 로드 시 2026년 4월 캘린더 렌더
2. 범례 5종 보임
3. 오늘 날짜(2026-04-22) 셀 테두리 강조
4. 각 셀에 산출물 있으면 `● 제목` 뱃지 표시
5. 뱃지 클릭 시 `/editor?row=N` 으로 이동
6. 에디터에서 뒤로가기 → 홈 캘린더로
7. 월 네비 `‹`/`›` 동작
8. "오늘" 버튼 동작
9. 미배치 섹션 (date 없는 row 가 있을 때만) 표시
10. 뱃지 hover 시 배경 진해짐 (`#d1d5db`)
11. **좌측 컬러 보더 없는지 확인** (접근성 요구사항)

- [ ] **Step 14.3: 문제 발견 시 수정 + 재테스트**

발견된 문제를 작은 커밋으로 수정. 문제 없으면 Task 완료.

- [ ] **Step 14.4: 에디터 드롭다운 동작 확인**

에디터에서 기존 드롭다운으로 row 전환 시 URL 은 **변경되지 않아도 OK** (Phase 1 스코프 밖). 하지만 드롭다운으로 row 전환 후 홈으로 돌아간 뒤 해당 row 뱃지가 최신 상태인지만 확인.

- [ ] **Step 14.5: 최종 푸시 (선택)**

```bash
git log --oneline -20
git push origin main
```

---

## Self-Review 결과

**Spec coverage**: 스펙 모든 섹션 대응.
- 라우팅 변경 → Task 13
- 신규 컴포넌트 8개 → Tasks 6·7·8·9·10·11·12
- 신규 API `/api/pipeline/status` → Task 5
- Status 6단계 / 뱃지 5종 매핑 → Task 1
- Apps Script 확장 → Task 3 (+ Task 5.5 에서 pages_count 보강)
- 데이터 흐름 → Task 12 (HomePage)
- 오류 처리 → Task 12 (에러 배너)
- 테스트 → Tasks 1·2·5 (utils + 서버 순수 로직)
- 알려진 한계 → 스펙에 이미 기재, 구현 변경 없음

**Placeholder scan**: 없음. 모든 step 에 실제 코드/명령 포함.

**Type consistency**:
- `PipelineStatus` — Task 1 에서 정의, Task 4·5·6·7·8·9·10·11·12 에서 동일 이름으로 사용
- `CellItemData` — Task 9 에서 정의 + export, Task 10·11·12 에서 import
- `CarouselItem` — 기존 타입에 `calendar_status`, `drive_url` 추가 (Task 4)
- `statusToBadge` 반환 타입 `BadgeDisplay` — Task 1 일관 유지

**Scope check**: Phase 1 내에서 완결. Phase 2 (Generate 버튼) 는 분리됨.
