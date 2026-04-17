# Carousel Studio

IG 캐러셀 콘텐츠 제작 스튜디오. React 에디터 + Express API + Puppeteer Export.

## Quick Start

```bash
npm install
npm run dev
```

`http://localhost:5173` 접속 — 에디터 실행.

## 필수 설치

### 코드 실행만 (Editor + Export)

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 앱 실행 |
| npm | - | 패키지 관리 |

이것만 있으면 에디터 띄우고 PNG Export 가능.

### 전체 파이프라인 (스킬 사용 시)

추가로 필요:

| 도구 | 용도 | 필요 스킬 |
|------|------|----------|
| [gws CLI](https://github.com/nguyenvanhien1992/gws) | 구글 시트/Drive 접근 | `script-generator`, `upload` |
| ComfyUI (로컬 서버) | AI 배경 이미지 생성 | `comfy-image` |

### ComfyUI API 키 설정

사용자 홈 기준 2개 파일에 동일 내용 저장:

```bash
~/ComfyUI/.env
~/Documents/ComfyUI/.env
```

내용:
```env
COMFY_ACCOUNT=work
COMFY_KEY_PERSONAL=comfyui-xxxxxx
COMFY_KEY_WORK=comfyui-xxxxxx
```

## 디렉토리 구조

```
carousel-studio/
├── src/
│   ├── app/              # React 앱 엔트리 (App.tsx, main.tsx)
│   ├── components/
│   │   ├── canvas/       # 캔버스 (선택 페이지 확대 뷰)
│   │   ├── filmstrip/    # 하단 썸네일 네비
│   │   ├── toolbar/      # 상단 툴바
│   │   ├── templates/    # 캐러셀 페이지 컴포넌트 (11종)
│   │   └── ui/           # shadcn/ui
│   ├── pages/            # Editor / Component
│   ├── hooks/            # useCarouselData, usePageNavigation, useExport
│   ├── lib/              # types, data-loader, sample-data, utils
│   └── styles/           # global.css, templates.css (디자인 토큰)
├── server/
│   ├── api.ts            # Express API (files CRUD)
│   └── export.ts         # Puppeteer PNG 렌더
├── data/                 # 캐러셀 JSON 데이터
├── public/assets/        # 로고, CTA, 아이콘, 배경 이미지
├── public/images/        # ComfyUI 생성 이미지 (날짜별)
├── output/               # Export 결과 PNG
└── .claude/skills/       # Claude Code 스킬 (파이프라인 자동화)
```

## 스킬 파이프라인

```
script-generator → (에디터 편집) → comfy-image → export → caption-writer → upload
```

| 스킬 | 역할 | 트리거 |
|------|------|--------|
| `script-generator` | JSON 스크립트 자동 생성 | "스크립트 생성", "이번주 소재" |
| `comfy-image` | 배경 이미지 생성 | "이미지 생성", "배경 만들어" |
| `export` | PNG Export | "PNG 생성", "export" |
| `caption-writer` | IG 캡션 작성 | "캡션 써줘" |
| `upload` | Drive 업로드 + 시트 등록 | "업로드", "시트에 등록" |

## 주요 기능

### Editor

- 파일 선택 → 모든 페이지 편집
- 좌우 화살표 / 키보드 ← → 로 페이지 전환
- 하단 필름스트립 클릭
- contentEditable 텍스트 실시간 수정
- Agentation 요소 선택 → Claude Code 협업
- Save → JSON 파일에 반영
- Export PNG → Puppeteer로 1080×1350 스크린샷

### Component

- 등록된 11개 템플릿 갤러리
- 디자인 토큰 (컬러, 타이포그래피) 참조

## 개발

```bash
npm run dev       # Vite dev server (Editor + API)
npm run build     # Production build
npm run lint      # ESLint
```

## 캔버스 스펙

- 해상도: **1080 × 1350** (4:5 IG 포스트)
- 폰트: Pretendard, Noto Sans KR (CDN)
- 디자인 토큰: `src/styles/templates.css` (`:root` 변수, `.tpl-*` 클래스)

## 컴포넌트 매핑

| JSON `component` | React 컴포넌트 | 용도 |
|------------------|---------------|------|
| cover | CoverPage | 커버 (배경 + 타이틀) |
| intro | IntroPage | 공감 유도 |
| text-card | TextCardPage | 텍스트 카드 |
| scene-card | SceneCardPage | A/B 비교 (배경 이미지) |
| expression-card | ExpressionCardPage | 표현 카드 리스트 |
| similar | SimilarPage | 유사 표현 |
| xo-card | XoCardPage | Before/After |
| before-after-card | BeforeAfterPage | 3개월 전/지금 |
| dialog-card | DialogCardPage | A/B 대화 |
| quote-card | QuotePage | 인용구 |
| cta | CtaPage | 정적 CTA 이미지 |

## 새 템플릿 추가

1. Figma 디자인 준비
2. Claude Code에 요청: "이 디자인으로 새 `xxx` 컴포넌트 만들어줘"
3. `src/components/templates/XxxPage.tsx` 생성
4. `src/components/templates/index.tsx`의 `COMPONENT_MAP`에 등록
5. Component 페이지에서 자동 노출

## 트러블슈팅

- **Export가 깨짐** — `public/assets/` 이미지가 있는지 확인
- **ComfyUI "Payment Required"** — `~/ComfyUI/.env`의 `COMFY_ACCOUNT` 값 확인
- **시트 접근 실패** — `gws` 인증 확인 (`gws auth login`)
