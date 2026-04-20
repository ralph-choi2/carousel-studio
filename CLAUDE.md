# Carousel Studio

IG 캐러셀 콘텐츠 제작 스튜디오. React 에디터 + Express API + Puppeteer Export.

## 아키텍처

```
data/{date}.json → 에디터(편집) → /api/export → output/{date}/ PNG → Drive 업로드
```

| 레이어 | 기술 | 경로 |
|--------|------|------|
| 에디터 | React + Vite | src/ |
| API | Express (Vite middleware) | server/api.ts |
| Export | Puppeteer (headless) | server/export.ts |
| 템플릿 | React 컴포넌트 | src/components/templates/ |
| 스타일 | CSS (디자인 토큰) | src/styles/templates.css |

## 파일 흐름

```
1. data/*.json          ← 스크립트 (script-generator 스킬)
2. public/images/{date}/ ← 배경 이미지 (comfy-image 스킬)
3. output/{date}/*.png   ← Export 결과 (export 스킬)
4. Drive + 시트          ← 업로드 (upload 스킬)
```

## 컴포넌트 매핑

| JSON component | React 컴포넌트 | 용도 |
|----------------|---------------|------|
| cover | CoverPage | 배경 이미지 + 타이틀 |
| intro | IntroPage | 공감 유도 |
| scene-card | SceneCardPage | A/B 비교 (배경 이미지) |
| expression-card | ExpressionCardPage | 표현 3개 카드 |
| text-card | TextCardPage | 텍스트 카드 |
| summary | TextCardPage | 상황별 정리 |
| similar | SimilarPage | 유사 표현 |
| dialog-card | DialogCardPage | 대화 예시 |
| cta | CtaPage | 정적 CTA 이미지 |

## 스킬 파이프라인

```
carousel-script-generator → (에디터 편집) → comfy-image → export → caption-writer → upload
```

| 스킬 | 역할 |
|------|------|
| carousel-script-generator | JSON 스크립트 생성 (data/) |
| comfy-image | ComfyUI 배경 이미지 생성 (public/images/) |
| export | Puppeteer PNG Export (output/) |
| caption-writer | IG 캡션 생성 |
| upload | Drive 업로드 + 캘린더 시트 등록 |

## 개발

```bash
npm run dev    # Vite dev server (에디터 + API)
npm run build  # Production build
```

## 레거시 (사용 금지)

- `scripts/carousel-render.js` — 구 HTML 템플릿 렌더러. carousel-studio 내부 export 사용할 것.
- `carousel-data/` — 구 데이터 디렉토리. `data/` 사용할 것.
- `templates/` — 구 HTML 템플릿. React 컴포넌트 사용할 것.

## 캔버스 스펙

- 해상도: **1080 x 1350** (4:5)
- 폰트: Pretendard (CDN), Noto Sans KR (CDN)
- CSS: `word-break: keep-all` 전역 적용
- 디자인 토큰: `src/styles/templates.css` (:root 변수)
