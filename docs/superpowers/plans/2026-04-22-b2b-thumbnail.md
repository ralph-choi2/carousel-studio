# B2B 추가 커버 썸네일 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 캐러셀 Export 시 B2B용 16:9 썸네일(`thumb_b2b.png`)을 자동 생성하고, upload 스킬이 B2B Drive에 함께 업로드하도록 확장한다. 추가로 4월 라이브 7개 콘텐츠에 대한 1회성 백필을 수행한다.

**Architecture:** `B2bThumbPage` 컴포넌트를 신설해 cover 페이지의 `title`/`bg_image`를 16:9 레이아웃으로 재렌더. `/api/export` payload에 `thumbHtml` 필드를 추가해 서버가 별도 viewport(432×243, deviceScaleFactor 2)로 캡처. 백필 스크립트는 Puppeteer 렌더 + `gws drive` 업로드를 반복.

**Tech Stack:** React 18, Vite, Express(vite middleware), Puppeteer, TypeScript, Vitest, gws(Google Workspace CLI)

**Spec:** `docs/superpowers/specs/2026-04-22-b2b-thumbnail-design.md`

---

## File Structure

**신규 생성:**
- `public/assets/logo_u_mark.svg` — Figma에서 추출한 U 심볼
- `public/images/2026-04-09/bg_cover.png`, `public/images/2026-04-10-office-disagree/bg_cover.png`, `public/images/2026-04-14-i-think/bg_cover.png`, `public/images/2026-04-15-im-sorry/bg_cover.png`, `public/images/2026-04-15-zoom/bg_cover.png` — tmp image 이관
- `src/components/templates/B2bThumbPage.tsx` — 16:9 썸네일 컴포넌트
- `src/components/templates/B2bThumbPage.test.tsx` — 스냅샷/구조 테스트
- `scripts/backfill-b2b-thumb.ts` — 1회성 백필 스크립트

**수정:**
- `server/export.ts` — `exportThumbnail()` 헬퍼 + 썸네일 전용 viewport 분기
- `vite.config.ts` — `/api/export` 라우트에서 `thumbHtml` payload 수신
- `src/hooks/useExport.tsx` — cover 페이지 찾아 `B2bThumbPage` 렌더해 `thumbHtml` 추가
- `.claude/skills/upload/SKILL.md` — B2B 섹션에 `thumb_b2b.png` 업로드 지시 추가

**설명:**
- `B2bThumbPage`는 기존 templates 디렉토리에 위치하되, `COMPONENT_MAP`에는 등록하지 않음 (데이터 상 별도 page type 아님, cover 복제 렌더 전용)
- `server/export.ts` 는 함수 2개로 분리: 기존 `exportPages` + 신규 `exportThumbnail`. 공유 상수(`PUBLIC_DIR`, `rewriteAssetPaths`)는 모듈 내부에서 재사용
- 백필 스크립트는 Node 환경에서 `ReactDOMServer` + `puppeteer` 직접 사용 (vite 미들웨어 경유 안 함)

---

## Task 1: 로고 SVG 에셋 이관

**Files:**
- Create: `public/assets/logo_u_mark.svg`
- Source: `/tmp/figma_logo_preview.svg` (Figma MCP로 다운로드 완료)

- [ ] **Step 1: SVG 파일 복사**

```bash
cp /tmp/figma_logo_preview.svg public/assets/logo_u_mark.svg
```

- [ ] **Step 2: 파일 내용 확인**

Run:
```bash
ls -la public/assets/logo_u_mark.svg
head -c 200 public/assets/logo_u_mark.svg
```
Expected: 약 1.1KB SVG 파일. `<svg ... viewBox="0 0 24 24"` 로 시작.

- [ ] **Step 3: 커밋**

```bash
git add public/assets/logo_u_mark.svg
git commit -m "feat(carousel-studio): add U mark SVG for B2B thumbnail logo"
```

---

## Task 2: 백필용 배경이미지 이관 (tmp → public/images)

**Files:**
- Create: `public/images/2026-04-09/bg_cover.png`
- Create: `public/images/2026-04-10-office-disagree/bg_cover.png`
- Create: `public/images/2026-04-14-i-think/bg_cover.png`
- Create: `public/images/2026-04-15-im-sorry/bg_cover.png`
- Create: `public/images/2026-04-15-zoom/bg_cover.png`

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir -p public/images/2026-04-09 \
         public/images/2026-04-10-office-disagree \
         public/images/2026-04-14-i-think \
         public/images/2026-04-15-im-sorry \
         public/images/2026-04-15-zoom
```

- [ ] **Step 2: 이미지 복사 (매핑대로)**

```bash
cp "/Users/ianchoi/tmp image/carousel_bg_00001_.png" public/images/2026-04-09/bg_cover.png
cp "/Users/ianchoi/tmp image/carousel_bg_00012_.png" public/images/2026-04-10-office-disagree/bg_cover.png
cp "/Users/ianchoi/tmp image/carousel_bg_00014_.png" public/images/2026-04-14-i-think/bg_cover.png
cp "/Users/ianchoi/tmp image/carousel_bg_00035_.png" public/images/2026-04-15-im-sorry/bg_cover.png
cp "/Users/ianchoi/tmp image/carousel_bg_00030_.png" public/images/2026-04-15-zoom/bg_cover.png
```

- [ ] **Step 3: 복사 검증**

Run:
```bash
ls -la public/images/2026-04-09/bg_cover.png \
       public/images/2026-04-10-office-disagree/bg_cover.png \
       public/images/2026-04-14-i-think/bg_cover.png \
       public/images/2026-04-15-im-sorry/bg_cover.png \
       public/images/2026-04-15-zoom/bg_cover.png
```
Expected: 5개 파일 존재, 각 수 MB 크기.

- [ ] **Step 4: 커밋**

```bash
git add public/images/2026-04-09 \
        public/images/2026-04-10-office-disagree \
        public/images/2026-04-14-i-think \
        public/images/2026-04-15-im-sorry \
        public/images/2026-04-15-zoom
git commit -m "chore(carousel-studio): backfill missing bg_cover.png for 4월 B2B thumbnail"
```

---

## Task 3: B2bThumbPage 컴포넌트 작성

**Files:**
- Create: `src/components/templates/B2bThumbPage.tsx`
- Test: `src/components/templates/B2bThumbPage.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

Create `src/components/templates/B2bThumbPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import { B2bThumbPage, THUMB_WIDTH, THUMB_HEIGHT } from './B2bThumbPage';

describe('B2bThumbPage', () => {
  it('exports 432 x 243 canvas dimensions', () => {
    expect(THUMB_WIDTH).toBe(432);
    expect(THUMB_HEIGHT).toBe(243);
  });

  it('renders title from cover data', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 'Hello\nWorld' }} />
    );
    expect(html).toContain('Hello');
    expect(html).toContain('World');
  });

  it('includes bg_image src when provided', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't', bg_image: 'https://x.com/a.png' }} />
    );
    expect(html).toContain('src="https://x.com/a.png"');
  });

  it('falls back to empty bg when bg_image is absent', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't' }} />
    );
    // no exception; container present
    expect(html).toContain('b2b-thumb-root');
  });

  it('renders logo image from /assets/logo_u_mark.svg', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't' }} />
    );
    expect(html).toContain('/assets/logo_u_mark.svg');
  });

  it('does not render subtitle', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't', subtitle: '서브타이틀' }} />
    );
    expect(html).not.toContain('서브타이틀');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- B2bThumbPage`
Expected: `Cannot find module './B2bThumbPage'` (파일 없음)

- [ ] **Step 3: 컴포넌트 구현**

Create `src/components/templates/B2bThumbPage.tsx`:

```tsx
import type { CoverData } from '@/lib/types';

export const THUMB_WIDTH = 432;
export const THUMB_HEIGHT = 243;

const FALLBACK_BG = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}"><rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" fill="#111"/></svg>`
);

interface B2bThumbPageProps {
  data: CoverData;
  scale?: number;
}

export function B2bThumbPage({ data, scale = 1 }: B2bThumbPageProps) {
  const bgSrc = data.bg_image || FALLBACK_BG;

  return (
    <div style={{
      width: THUMB_WIDTH * scale,
      height: THUMB_HEIGHT * scale,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div
        className="b2b-thumb-root"
        style={{
          width: THUMB_WIDTH,
          height: THUMB_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          fontFamily: "'Pretendard', -apple-system, sans-serif",
          wordBreak: 'keep-all',
        }}
      >
        <img
          src={bgSrc}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 34.774%, #000 100%)',
          zIndex: 1,
        }} />

        <img
          src="/assets/logo_u_mark.svg"
          alt=""
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 24,
            height: 24,
            opacity: 0.6,
            zIndex: 2,
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '18px 10px',
          zIndex: 3,
        }}>
          <p style={{
            width: 412,
            fontFamily: "'Pretendard', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.3,
            letterSpacing: '-0.64px',
            color: '#FFFFFF',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            margin: 0,
          }}>
            {data.title}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test -- B2bThumbPage`
Expected: 6개 테스트 전부 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/components/templates/B2bThumbPage.tsx src/components/templates/B2bThumbPage.test.tsx
git commit -m "feat(carousel-studio): add B2bThumbPage component (16:9 cover thumbnail)"
```

---

## Task 4: server/export.ts 에 exportThumbnail 헬퍼 추가

**Files:**
- Modify: `server/export.ts`

- [ ] **Step 1: 썸네일 전용 상수 + 함수 추가**

Replace the contents of `server/export.ts` with:

```ts
import puppeteer from 'puppeteer';
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
  browser?: puppeteer.Browser
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
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add server/export.ts
git commit -m "feat(carousel-studio): add exportThumbnail helper for B2B 16:9 thumbnail rendering"
```

---

## Task 5: vite.config.ts - /api/export 에서 thumbHtml 수신

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: API 핸들러 확장**

Replace the `app.post('/api/export', ...)` block in `vite.config.ts` with:

```ts
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
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add vite.config.ts
git commit -m "feat(carousel-studio): /api/export accepts optional thumbHtml payload"
```

---

## Task 6: useExport hook - cover 페이지를 B2bThumbPage 로 재렌더

**Files:**
- Modify: `src/hooks/useExport.tsx`

- [ ] **Step 1: B2bThumbPage import + thumbHtml 생성**

Replace the contents of `src/hooks/useExport.tsx` with:

```tsx
import { useCallback, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import type { CarouselFile, CoverData } from '@/lib/types';
import { COMPONENT_MAP } from '@/components/templates';
import { B2bThumbPage } from '@/components/templates/B2bThumbPage';
import templatesCss from '@/styles/templates.css?raw';

const BASE_CSS = `
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraLight.woff2') format('woff2'); font-weight: 200; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Light.woff2') format('woff2'); font-weight: 300; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: swap; }
@font-face { font-family: 'Noto Sans KR'; src: url('https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuozeLTq8H4hGPNdCCehzJE.0.woff2') format('woff2'); font-weight: 700; font-display: swap; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px;
  height: 1350px;
  overflow: hidden;
  font-family: 'Pretendard', -apple-system, sans-serif;
  word-break: keep-all;
  color: #111111;
  background: #F7F7F7;
}
:root {
  --tpl-bg-light: #F7F7F7;
  --tpl-bg-dark: #141420;
  --tpl-text-primary: #111111;
  --tpl-text-secondary: #545454;
  --tpl-text-tertiary: #999999;
  --tpl-text-white: #FFFFFF;
  --tpl-accent-purple: #8F54FF;
}
`;

const THUMB_CSS = `
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 432px; height: 243px; overflow: hidden; font-family: 'Pretendard', -apple-system, sans-serif; word-break: keep-all; background: #FFFFFF; }
`;

function wrapHtml(markup: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}\n${templatesCss}</style></head><body>${markup}</body></html>`;
}

function wrapThumbHtml(markup: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${THUMB_CSS}</style></head><body>${markup}</body></html>`;
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const doExport = useCallback(async (filename: string, data: CarouselFile) => {
    setIsExporting(true);
    try {
      const htmlPages = data.pages.map((page, index) => {
        const Component = COMPONENT_MAP[page.component];
        if (!Component) return { index, component: page.component, html: '' };
        const markup = ReactDOMServer.renderToStaticMarkup(
          <Component
            data={page.data}
            styles={page.styles}
            colors={page.colors}
            scale={1}
          />
        );
        return { index, component: page.component, html: wrapHtml(markup) };
      });

      const coverPage = data.pages.find(p => p.component === 'cover');
      const thumbHtml = coverPage
        ? wrapThumbHtml(
            ReactDOMServer.renderToStaticMarkup(
              <B2bThumbPage data={coverPage.data as CoverData} scale={1} />
            )
          )
        : undefined;

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, htmlPages, thumbHtml }),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const result = await res.json();
      return result.outputDir as string;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { isExporting, doExport };
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/hooks/useExport.tsx
git commit -m "feat(carousel-studio): useExport emits thumbHtml from cover page"
```

---

## Task 7: 수동 Export 검증 (dev server)

**Files:** (실행만, 수정 없음)

- [ ] **Step 1: dev 서버 실행**

Run (background): `npm run dev`

- [ ] **Step 2: 에디터에서 4/22 intro-template 콘텐츠 Export**

브라우저 열고 http://localhost:5173 접속 → 드롭다운에서 `2026-04-22-intro-template` 선택 → Export 버튼 클릭.

- [ ] **Step 3: 결과 파일 확인**

Run:
```bash
ls -la output/2026-04-22-intro-template/thumb_b2b.png
file output/2026-04-22-intro-template/thumb_b2b.png
```
Expected: `thumb_b2b.png` 존재, `PNG image data, 864 x 486` 출력.

- [ ] **Step 4: 시각 검증 (수동)**

`output/2026-04-22-intro-template/thumb_b2b.png` 를 이미지 뷰어로 열어 다음 확인:
- 16:9 비율
- 좌상단 U 로고 (반투명)
- 하단에 타이틀 텍스트 (흰색, Pretendard Bold, 가운데 정렬)
- 배경 이미지 + 하단 그라디언트
- subtitle 미표시

통과 시 다음 스텝. 실패 시 root cause 파악 후 Task 3~6 중 관련 Task로 복귀.

- [ ] **Step 5: dev 서버 종료**

백그라운드 작업 종료 (ctrl+c 또는 해당 PID kill).

---

## Task 8: upload 스킬 SKILL.md 수정

**Files:**
- Modify: `.claude/skills/upload/SKILL.md`

- [ ] **Step 1: B2B Drive 섹션 업데이트**

아래 diff를 적용:

```diff
 ### B2B Drive (CJ 마이크로러닝, 개인드라이브)

 - **Parent folder**: `1CCRMLkvTIWTwfX4QIAHNXd6k-z8hP6nF`
 - **개인 드라이브**이므로 `supportsAllDrives` 불필요 (기본 `{}`)
 - 캘린더 시트 업데이트 안 함

 **파일 구성** — page_01~07은 온드미디어와 동일, **page_08(CTA)만 교체**:
 - 온드미디어: `public/assets/cta.png` (보라, Uphone.English)
 - B2B: `public/assets/cta_b2b.png` (Bite English + Uphone.English)
+- **추가**: `output/{dateStr}/thumb_b2b.png` (16:9 커버 썸네일, Export 결과물) 도 같은 날짜 폴더에 업로드

 ```bash
 # B2B 패키지 준비
 B2B_TMP=/tmp/b2b_pkg_{slug}
 mkdir -p "$B2B_TMP"
 cp output/{dateStr}/0{1_cover,2,3,4,5,6,7}.png "$B2B_TMP"/
 cp public/assets/cta_b2b.png "$B2B_TMP/08_cta.png"
+cp output/{dateStr}/thumb_b2b.png "$B2B_TMP/"
```

파일 `/Users/ianchoi/workspace/marketing/contents/carousel-studio/.claude/skills/upload/SKILL.md` 를 열고 **B2B Drive** 섹션의 "파일 구성" 항목과 bash 블록을 위 diff대로 수정.

- [ ] **Step 2: 검증**

Run:
```bash
grep -n "thumb_b2b" .claude/skills/upload/SKILL.md
```
Expected: 2곳에 `thumb_b2b` 언급 (설명 1줄 + cp 명령 1줄).

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills/upload/SKILL.md
git commit -m "docs(upload): B2B 업로드에 thumb_b2b.png 포함"
```

---

## Task 9: 백필 스크립트 작성

**Files:**
- Create: `scripts/backfill-b2b-thumb.ts`

- [ ] **Step 1: 스크립트 작성**

Create `scripts/backfill-b2b-thumb.ts`:

```ts
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
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit scripts/backfill-b2b-thumb.ts`
Expected: 에러 없음. (또는 `npx tsc --noEmit` 전체 체크로 대체 가능)

- [ ] **Step 3: 커밋**

```bash
git add scripts/backfill-b2b-thumb.ts
git commit -m "feat(carousel-studio): add B2B thumbnail backfill script"
```

---

## Task 10: 백필 dry-run 검증

**Files:** (실행만)

- [ ] **Step 1: dry-run 실행**

Run: `npx tsx scripts/backfill-b2b-thumb.ts --dry-run`
Expected:
```
[backfill-b2b-thumb] DRY RUN — 대상 7개
[backfill-b2b-thumb] B2B Drive 날짜 폴더: N개 발견
  ✓ 2026-04-09 (2026-04-09-please-check.json)
  ✓ 2026-04-10 (2026-04-10-office-disagree.json)
  ...
=== 리포트 ===
성공: 7개 — 2026-04-09, ...
skip: 0개 (혹은 B2B 폴더 부재 시 해당 날짜만 skip)
```

- [ ] **Step 2: 실패 원인 분석 (skip 있을 경우)**

skip된 항목이 있으면:
- "B2B Drive 날짜 폴더 없음": 해당 날짜는 B2B 업로드 이력 없음 → BACKFILL_MAP에서 제거 또는 그대로 skip 허용
- "배경이미지 없음": Task 2에서 복사 누락 → 재복사
- "data JSON 없음": 매핑 오류 → `BACKFILL_MAP` 수정

수정 필요 시 Task 2 또는 Task 9로 복귀.

- [ ] **Step 3: 실제 실행 검증을 위한 1개 테스트 (optional)**

`BACKFILL_MAP` 을 임시로 1개 항목만 남겨서 실제 업로드 시도:

```bash
npx tsx scripts/backfill-b2b-thumb.ts
```
Expected: B2B Drive `2026-04-09` 폴더에 `thumb_b2b.png` 생성됨. `gws drive files list` 로 확인.

검증 후 `BACKFILL_MAP` 전체 복원.

---

## Task 11: 백필 실제 실행

**Files:** (실행만)

- [ ] **Step 1: 실제 백필 실행**

Run: `npx tsx scripts/backfill-b2b-thumb.ts`
Expected: 성공 7개, skip 0~N개 (B2B Drive 실제 상태에 따름).

- [ ] **Step 2: Drive 결과 확인**

각 날짜 폴더에 `thumb_b2b.png` 생성됐는지 확인:

```bash
for date in 2026-04-09 2026-04-10 2026-04-13 2026-04-14 2026-04-15 2026-04-17 2026-04-20; do
  echo "=== $date ==="
  gws drive files list --params "$(cat <<EOF
{"q":"'B2B_DATE_FOLDER_ID' in parents and name='thumb_b2b.png' and trashed=false","fields":"files(id,name,size)"}
EOF
)"
done
```

(실제 실행 시 `B2B_DATE_FOLDER_ID` 는 Task 10 dry-run 출력에서 얻은 각 날짜의 folder ID로 치환)

- [ ] **Step 3: 샘플 1개 다운로드 → 시각 검증**

```bash
gws drive files get --params '{"fileId":"<uploaded_thumb_id>","alt":"media"}' --output /tmp/backfill_verify.png
file /tmp/backfill_verify.png
open /tmp/backfill_verify.png
```
Expected: 864 × 486 PNG, 디자인 스펙대로 렌더됨.

- [ ] **Step 4: 리포트 저장 (optional)**

스크립트 출력을 `docs/superpowers/runs/2026-04-22-b2b-backfill.log` 로 저장.

```bash
mkdir -p docs/superpowers/runs
npx tsx scripts/backfill-b2b-thumb.ts 2>&1 | tee docs/superpowers/runs/2026-04-22-b2b-backfill.log
git add docs/superpowers/runs/
git commit -m "chore(carousel-studio): record B2B backfill run log"
```

---

## Task 12: 최종 회귀 테스트 + 푸시

**Files:** (검증만)

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm run test`
Expected: 기존 테스트 + 신규 B2bThumbPage 테스트 모두 PASS.

- [ ] **Step 2: 린트**

Run: `npm run lint`
Expected: 에러 없음.

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: git 상태 확인**

```bash
git status
git log --oneline -15
```
Expected: 작업 디렉토리 clean, 커밋 history에 이 플랜의 step별 커밋들 기록.

- [ ] **Step 5: 사용자에게 보고**

다음 내용을 메시지로 정리:
- 커밋 N개 추가
- 백필 결과: 성공 N개, skip N개
- 신규 콘텐츠(4/22 이후)는 에디터 Export 시 자동으로 `thumb_b2b.png` 생성됨
- 다음 업로드 시부터 upload 스킬이 자동으로 B2B Drive에 함께 올림

사용자 승인 후 push:

```bash
git push origin main
```

---

## 주의사항 / 알려진 제약

- Puppeteer `networkidle0` 대기 시, `lh3.googleusercontent.com` URL 이 네트워크 지연으로 timeout 가능. 30초 내 해결 안 되면 `timeout: 60000` 로 늘릴 것.
- 백필 스크립트에서 `gws drive files create --upload` 는 파일 경로를 shell 인용 처리. 경로에 공백 있으면 깨짐 — 작업 디렉토리(carousel-studio)는 공백 없음 확인됨.
- `ReactDOMServer.renderToStaticMarkup` 은 Node ESM 환경에서도 동작. `import React from 'react'` 명시 필수 (백필 스크립트에서 `React.createElement` 사용).
- 개인 드라이브 업로드는 `supportsAllDrives` 불필요. 온드미디어(공유드라이브) 와 다름에 유의.
