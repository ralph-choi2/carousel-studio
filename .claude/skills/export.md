---
name: export
description: 캐러셀 스튜디오 에디터에서 PNG Export. Triggers on "Export", "PNG 생성", "내보내기", "렌더".
---

# Carousel Export

에디터에서 편집 완료된 캐러셀을 PNG로 내보내기. 내부 Puppeteer 기반 — 기존 `carousel-render.js` 레거시 렌더러 사용 금지.

## 아키텍처

```
React 컴포넌트 → renderToStaticMarkup() → HTML
  → POST /api/export → Puppeteer (file:// goto)
  → output/{dateStr}/ PNG 파일들
```

## 실행

### 방법 1: 에디터 UI의 Export 버튼

### 방법 2: API 직접 호출 (에이전트용)

```bash
# dev 서버가 떠있어야 함 (npm run dev)
curl -X POST http://localhost:5173/api/export \
  -H 'Content-Type: application/json' \
  -d '{"filename":"2026-04-17-sugo.json","htmlPages":[...]}'
```

에이전트가 호출할 때는 `useExport` hook의 로직을 참조:
1. `data.pages`를 순회하며 `COMPONENT_MAP[page.component]`로 컴포넌트 찾기
2. `ReactDOMServer.renderToStaticMarkup(<Component data={page.data} scale={1} />)` 로 HTML 생성
3. `wrapHtml(markup)` 으로 CSS + font-face 포함한 full HTML 문서 래핑
4. `/api/export` POST

## 출력

- 경로: `carousel-studio/output/{dateStr}/`
- 파일명: `01_cover.png`, `02.png`, ..., `0N_cta.png`
- 해상도: **1080 x 1350** (4:5)

## 경로 변환 (중요)

`server/export.ts`의 `rewriteAssetPaths()`가 HTML 내 경로를 `file://` 로 변환:
- `/assets/` → `file://{PUBLIC_DIR}/assets/`
- `/images/` → `file://{PUBLIC_DIR}/images/`

배경 이미지(`bg_image`)가 `/images/2026-04-17/bg_cover.png` 형태로 저장되므로 이 변환 필수.

## 주의사항

- **dev 서버 필수**: `/api/export` 엔드포인트는 Vite dev server에 마운트됨
- **폰트 로딩**: CDN Pretendard font-face가 HTML에 포함됨. 오프라인 시 폰트 깨짐
- **CTA**: `CtaPage`는 정적 이미지 `/assets/cta.png` 렌더
- **기존 carousel-render.js 사용 금지**: 템플릿 경로, 컴포넌트 매핑이 다름
