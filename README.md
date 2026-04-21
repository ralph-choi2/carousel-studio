# Carousel Studio

IG 캐러셀 콘텐츠 제작 스튜디오. **React 에디터 + Apps Script 웹앱(시트 DB) + Puppeteer Export**.

## 아키텍처

```
        Google 시트 "스크립트" 탭  ←─ 팀원이 직접 편집 가능
              ▲  │
              │  ▼ read_script / update_cells (JSON API)
     Apps Script 웹앱 v1 (content-ops)
       │                       ▲
       ▼ gen_image             │
  Gemini 3.1 Flash Image       │
       │                       │
       ▼                       │
   Drive (공용 폴더)            │
                                │
                          React 에디터 (localhost)
                                │
                                ▼ Puppeteer
                          output/*.png → Drive 업로드
```

- **Source of truth**: 온드미디어 시트 `스크립트` 탭 (`1oXy79m...`)
- **백엔드**: Apps Script 웹앱 (`content-ops`) — 에디터·스킬 공용 단일 URL
- **로컬 실행**: React 에디터(Vite dev server) + Puppeteer(Export)

## Quick Start

```bash
npm install
npm run dev
```

`http://localhost:5173` → 드롭다운에서 소재(row) 선택 → 편집하면 **자동저장** (800ms debounce, 상단 배지에 상태 표시).

## 필수 설치

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 앱 실행 |
| npm | - | 패키지 관리 |

스킬 파이프라인까지 쓸 경우 추가:

| 도구 | 용도 | 필요 스킬 |
|------|------|----------|
| [gws CLI](https://github.com/nguyenvanhien1992/gws) | 시트/Drive 접근 | `carousel-script-generator`, `upload` |
| [clasp](https://github.com/google/clasp) | Apps Script 배포 | (백엔드 수정 시) |

> **참고**: 과거에 필요했던 **로컬 ComfyUI 서버는 더 이상 불필요**합니다. `comfy-image` 스킬이 Apps Script + Gemini API 호출로 전환됐습니다. `~/ComfyUI/.env` 설정도 무시해도 됩니다.

## 디렉토리 구조

```
carousel-studio/
├── src/
│   ├── app/              # React 앱 엔트리 (App.tsx, main.tsx)
│   ├── components/
│   │   ├── canvas/       # 선택 페이지 확대 뷰
│   │   ├── filmstrip/    # 하단 썸네일 네비
│   │   ├── toolbar/      # 드롭다운 + 동기화 배지 + Zoom + Export
│   │   ├── inspector/    # 우측 속성 패널 (preset/color)
│   │   ├── templates/    # 캐러셀 페이지 컴포넌트 (11종)
│   │   └── ui/           # shadcn/ui
│   ├── pages/            # Editor / Component
│   ├── hooks/            # useCarouselData(Apps Script 호출), useExport
│   ├── lib/              # types, data-loader(Apps Script fetch), styles
│   └── styles/           # global.css, templates.css (디자인 토큰)
├── server/
│   ├── api.ts            # (deprecated — vite.config.ts 가 실제 처리)
│   └── export.ts         # Puppeteer PNG 렌더
├── vite.config.ts        # dev server + /api/export 라우트
├── data/                 # (레거시) 로컬 JSON — 현재는 시트가 원천
├── public/assets/        # 로고, CTA, 아이콘, 배경 이미지
├── output/               # Export 결과 PNG (Drive 업로드 전 스테이징)
└── .claude/skills/       # Claude Code 스킬 (파이프라인 자동화)
```

## 스킬 파이프라인

```
carousel-script-generator → (에디터 편집) → comfy-image → export → caption-writer → upload
```

| 스킬 | 역할 | 트리거 |
|------|------|--------|
| `carousel-script-generator` | JSON 스크립트 생성 → 시트 `append_script` | "스크립트 생성", "이번주 소재" |
| `comfy-image` | Gemini 3.1 Flash Image 로 배경 생성 → Drive → 시트 셀 URL 기록 | "이미지 생성", "배경 만들어" |
| `export` | Puppeteer 로 1080×1350 PNG Export | "PNG 생성", "export" |
| `caption-writer` | IG 캡션 작성 | "캡션 써줘" |
| `upload` | Export PNG 를 Drive 업로드 + 캘린더 시트 등록 | "업로드", "시트에 등록" |

## 주요 기능

### Editor

- **드롭다운에서 소재(row) 선택** — 로딩 중 스피너 + disabled. 팀원이 시트에 만든 소재가 여기 드롭다운에 바로 나타남.
- 좌우 화살표 / 키보드 ← → 로 페이지 전환, 하단 필름스트립 클릭
- `contentEditable` 텍스트 실시간 수정, 우측 Inspector 로 스타일/컬러 조정
- **자동저장** (800ms debounce) — 툴바 동기화 배지 "저장 중... / ✓ 저장됨 · 3초 전 / ⚠ 저장 실패"
- **Row 전환 시 미저장 변경 자동 flush** 후 새 row 로드 (데이터 손실 방지)
- **Export PNG** → Puppeteer로 1080×1350 스크린샷 → `output/{date-slug}/page_*.png`. Export 직전 최신 상태 자동 저장.

### Component

- 등록된 11개 템플릿 갤러리 + 디자인 토큰 (컬러, 타이포그래피) 참조

## 데이터 소스 · 엔드포인트

**시트 (온드미디어 `스크립트` 탭)**
- ID: `1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w`
- 컬럼 스키마:
  - A `소재명` / B `가설ID`
  - C~N `Text1~12` — 페이지별 컴포넌트 JSON stringify (pages[0..11])
  - O `기둥` / P `date` / Q `caption` / R `status`
  - S~Z `series_title`, `format`, `target_save`, `category`, `pda_persona`, `pda_desire`, `pda_awareness`, `pda_angle`

**Apps Script 웹앱 v1 URL**
`https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec`

| 엔드포인트 | 용도 |
|------------|------|
| `GET ?action=list_scripts` | 소재 목록 (드롭다운 채우기) |
| `GET ?action=read_script&row=N` | 단일 소재 JSON |
| `POST {action:"append_script", ...}` | 신규 소재 append (generator 스킬) |
| `POST {action:"update_cells", row, cells}` | 셀 업데이트 (에디터 자동저장 · comfy-image) |
| `POST {action:"gen_image", prompt, key}` | Gemini → Drive 저장 → URL 반환 |

> 브라우저에서 POST 호출 시 CORS preflight 회피를 위해 `Content-Type: text/plain;charset=utf-8` 사용 (`data-loader.ts` 기본값).

**Drive 공용 폴더**: `carousel-studio-assets`  
(`1W9RcqlEjik-O-Jr83l-mfFXco2E6Gaqa`, Shared Drive)

## 초기 세팅 (Apps Script — 1회)

새로 프로젝트를 clone 한 팀원 / 웹앱 소유자가 한 번만:

1. **Apps Script 에디터** 열기: https://script.google.com/d/1Illu1nRC4WUGCUGKCs1JVRuxWuKBdKqIgyh3QgNdjTDoDgVu6LOYXIFr/edit
2. 좌측 **서비스 +** → **Drive API v3** 추가 (Shared Drive 쓰기 지원 위해)
3. `setupProperties()` 함수 ▶ 실행 → 권한 팝업 "허용"
4. Script Properties 값 확인 (`listProperties()`):
   - `SPREADSHEET_ID`
   - `GEMINI_API_KEY`
   - `CAROUSEL_DRIVE_FOLDER_ID` = `1W9RcqlEjik-O-Jr83l-mfFXco2E6Gaqa`
   - `WEBAPP_TOKEN` (빈 값이면 인증 스킵)

## 개발

```bash
npm run dev       # Vite dev server (Editor + /api/export)
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # 타입 체크 (커밋 전 권장)
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
| text-card / text-card-v2 | TextCardPage | 텍스트 카드 |
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
2. Claude Code 에 요청: "이 디자인으로 새 `xxx` 컴포넌트 만들어줘"
3. `src/components/templates/XxxPage.tsx` 생성
4. `src/components/templates/index.tsx` 의 `COMPONENT_MAP` 에 등록
5. Component 페이지에서 자동 노출

## 트러블슈팅

| 증상 | 원인 / 해결 |
|------|------------|
| 드롭다운에 소재 목록 안 뜸 | Apps Script 웹앱 v1 URL 응답 확인: `curl -sL "$URL?action=list_scripts"` |
| 드롭다운 선택 후 이미지 ❌ (403) | Drive URL 포맷이 `drive.google.com/uc?id=` 인 경우 브라우저 embed 시 빈번. **`lh3.googleusercontent.com/d/{id}` 사용** (최신 `gen_image` 가 자동 적용) |
| Apps Script "DriveApp 액세스 거부" | Shared Drive 는 Advanced Drive Service(v3) 필요. `appsscript.json` 푸시 후 에디터에서 **"+ 서비스 → Drive API v3"** 수동 추가 + 재배포 |
| `curl` POST 에 405 Method Not Allowed | `-X POST` 옵션 빼기. `-L` 과 충돌해서 302 redirect 후에도 POST 유지 → `/macros/echo` 에서 405. `--data-binary @file` 만 쓰면 POST 기본 + 302 시 GET 변환 |
| 시트 접근 실패 | `gws auth login` 재인증 |
| Export 깨짐 | `public/assets/` 이미지 존재 확인 |

## 레거시 (사용 금지)

- `scripts/carousel-render.js` — 구 HTML 템플릿 렌더러. carousel-studio 내부 export 사용.
- `carousel-data/`, `data/*.json` — 구 로컬 데이터. 현재는 시트가 원천.
- `templates/` (저장소 루트) — 구 HTML 템플릿. React 컴포넌트 사용.
- 로컬 ComfyUI 서버 / `~/ComfyUI/.env` — Apps Script gen_image 로 대체됨.
