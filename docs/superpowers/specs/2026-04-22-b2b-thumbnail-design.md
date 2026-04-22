# B2B 추가 커버 썸네일 설계

작성일: 2026-04-22
상태: Draft → 리뷰 대기

## 1. 배경

- 기존 파이프라인: 캐러셀 콘텐츠 Export 후 온드미디어 Drive + B2B Drive(CJ 마이크로러닝) 병렬 업로드. B2B는 CTA(`08_cta.png`)만 교체해서 업로드.
- 신규 요청: B2B 고객사 자체 플랫폼(LMS 등)에 업로드 시, **캐러셀과 별개의 추가 커버 썸네일 이미지**가 필요. 같은 이미지·텍스트 재활용, 새 기획 없음.
- 적용 범위: 4월 B2B에 이미 업로드된 콘텐츠(백필) + 신규 콘텐츠(자동화).

## 2. 목표

1. 캐러셀 Export 시 B2B 전용 16:9 썸네일(`thumb_b2b.png`) 자동 생성.
2. `upload` 스킬이 B2B Drive 날짜 폴더에 `thumb_b2b.png` 도 함께 업로드.
3. 4월 라이브 콘텐츠 중 복구 가능한 7개에 대해 1회성 백필 스크립트 제공.
4. 시트 DB(스크립트 탭 / 캘린더 탭) 구조는 **변경하지 않음** (단일 진실 원천 유지, 팀원 워크플로우 무중단).

## 3. 결정 사항 요약

| 항목 | 결정 |
|------|------|
| 해상도 | 864 × 486 (Figma 432×243 × 2, 16:9) |
| 컴포넌트 | `src/components/templates/B2bThumbPage.tsx` |
| 출력 파일명 | `thumb_b2b.png` |
| 데이터 소스 | cover 페이지의 `title`, `bg_image` 재활용 (subtitle 미사용) |
| 로고 에셋 | `public/assets/logo_u_mark.svg` (Figma 벡터 이관) |
| B2B Drive 배치 | 기존 날짜 폴더 **내부**에 `thumb_b2b.png` |
| 온드미디어 Drive | **미업로드** (B2B 전용) |
| 자동 생성 트리거 | Export 파이프라인 통합 (`/api/export`) |
| 신규 vs 백필 | 신규: 자동화 / 백필: 1회성 스크립트 |
| 백필 대상 판정 | B2B Drive 부모 폴더 조회로 기존 날짜 폴더 확인 + 복구 가능 콘텐츠만 처리 |

## 4. 전체 아키텍처

```
[신규 파이프라인]
스크립트 시트 → 에디터 → /api/export
                            ├── 01_cover.png ~ 08_cta.png (기존)
                            └── thumb_b2b.png              (신규)
                         → output/{date}/
                         → upload 스킬
                            ├── 온드미디어 Drive: 01~08
                            └── B2B Drive: 01~07 + cta_b2b + thumb_b2b

[백필 파이프라인] (1회성)
scripts/backfill-b2b-thumb.ts
  → B2B Drive 날짜 폴더 list
  → 각 날짜 × 매핑된 data JSON → exportThumbnail() → Drive 업로드
  → 리포트
```

핵심 원칙:
- 시트 DB(`스크립트` / `캘린더` 탭) 구조 변경 없음.
- `exportThumbnail(data, outPath)` 함수를 Export 파이프라인과 백필 스크립트가 공유 (DRY).

## 5. B2bThumbPage 컴포넌트 스펙

### 5.1 캔버스

- 내부 CSS 기준: **432 × 243** (Figma와 1:1 일치)
- Puppeteer viewport: `{ width: 432, height: 243, deviceScaleFactor: 2 }` → 출력 **864 × 486**
- 배경색: white (fallback)

### 5.2 레이아웃 (432×243 기준)

```
(0,0) ┌──────────────────────────────────────┐
      │ [logo 24×24 @ (10,10), opacity 0.6]   │
      │                                        │
      │  (bg_cover.png, opacity 0.8, cover)    │
      │                                        │
      │  gradient: transparent 34.774% → black │
      │                                        │
      │                                        │
      │          [Title — Pretendard Bold]     │  ← y=183, h=42
      │          32px, center, white           │  px:10, py:18
      │                                        │
      └──────────────────────────────────────┘ (432,243)
```

### 5.3 스타일 상세

| 요소 | 위치/크기 | 스타일 |
|------|---------|--------|
| 컨테이너 | 432 × 243 | background: white |
| bg_cover.png | `inset:0; w:100%; h:100%` | `object-fit:cover; opacity:0.8` |
| gradient-overlay | `inset:0` | `linear-gradient(to bottom, rgba(0,0,0,0) 34.774%, #000 100%)` |
| 텍스트 컨테이너 | `inset:0; flex flex-col items-center justify-end; padding:18px 10px` | — |
| Title | w:412 영역 | `font: Pretendard Bold 32px; line-height:1.3; letter-spacing:-0.64px; color:#fff; text-align:center; white-space:pre-line` |
| 로고 | `position:absolute; top:10; left:10; w:24; h:24` | `opacity:0.6` |

### 5.4 데이터 인터페이스

`CoverData` 타입 그대로 사용. 신규 타입 없음.

```ts
type B2bThumbProps = {
  data: CoverData;          // { title, subtitle?, bg_image? } — subtitle은 무시
  scale?: number;           // 에디터 미리보기용 (기본 1)
};
```

### 5.5 bg_image 데이터 소스 분기

`bg_image` 는 컴포넌트 입장에선 단순 URL/경로 문자열이지만, 실제 소스는 두 갈래:

| 시나리오 | bg_image 값 | 비고 |
|---------|-----------|------|
| 신규 파이프라인 (Export) | `https://lh3.googleusercontent.com/...` | 스크립트 시트에 저장된 Drive 공개 URL. Puppeteer가 외부 fetch (기존 cover와 동일 동작) |
| 백필 스크립트 | `file:///abs/path/public/images/{date-slug}/bg_cover.png` | 로컬 경로로 override. 시트에 URL 없는 라이브 콘텐츠 대응 |

백필 로직에서 data JSON 로드 후 **`data.pages[0].data.bg_image` 를 로컬 `file://` URL 로 덮어쓴 뒤 렌더**해야 함.

## 6. Export 파이프라인 수정

### 6.1 클라이언트 (`src/hooks/useExport.ts`)

- `data.pages`에서 `component === 'cover'` 인 첫 페이지를 찾음.
- `<B2bThumbPage data={coverData} />` 를 `ReactDOMServer.renderToStaticMarkup` 으로 추가 HTML 생성.
- `wrapHtml` 으로 CSS/폰트 포함한 full HTML 문서 래핑 (단, 기존 PageWrapper scale과 별개의 16:9 스케일 필요 — 새 wrapper 함수 또는 인라인 처리).
- 요청 payload 확장:
  ```ts
  POST /api/export
  {
    filename: string,
    htmlPages: ExportPage[],   // 기존 (1080×1350 viewport)
    thumbHtml?: string          // 신규 (432×243 viewport, deviceScaleFactor:2)
  }
  ```

### 6.2 서버 (`server/export.ts`)

- 기존 루프는 그대로 (`width:1080, height:1350, deviceScaleFactor:1`).
- `thumbHtml` 수신 시 별도 루프:
  ```ts
  await browserPage.setViewport({ width: 432, height: 243, deviceScaleFactor: 2 });
  // → output/{date}/thumb_b2b.png
  ```
- 공통 헬퍼 export: `exportThumbnail(html: string, outPath: string): Promise<void>` — 백필 스크립트 재사용용.

### 6.3 파일명 규칙

- 기존: `01_cover.png ~ 08_cta.png` (순번 규칙)
- 신규: `thumb_b2b.png` (순번 없음, suffix로 구분)

## 7. Upload 스킬 수정

`carousel-studio/.claude/skills/upload/SKILL.md` 수정 사항:

### 7.1 B2B 섹션 업데이트

```diff
 ### B2B Drive (CJ 마이크로러닝, 개인드라이브)
 
 **파일 구성** — page_01~07은 온드미디어와 동일, **page_08(CTA)만 교체**:
+추가로 `thumb_b2b.png` (16:9 커버 썸네일) 를 함께 업로드. 파일명 그대로 유지.
 
 ```bash
 B2B_TMP=/tmp/b2b_pkg_{slug}
 mkdir -p "$B2B_TMP"
 cp output/{dateStr}/0{1_cover,2,3,4,5,6,7}.png "$B2B_TMP"/
 cp public/assets/cta_b2b.png "$B2B_TMP/08_cta.png"
+cp output/{dateStr}/thumb_b2b.png "$B2B_TMP/"
```

### 7.2 주의

- 온드미디어 섹션은 **건드리지 않음** (`thumb_b2b.png` 업로드 대상 아님).
- Export 스킬 완료 후 `output/{date}/thumb_b2b.png` 파일 존재 여부를 업로드 전 체크 (누락 시 경고).

## 8. 백필 스크립트

### 8.1 경로

`scripts/backfill-b2b-thumb.ts`

### 8.2 매핑 테이블 (하드코딩)

data JSON 파일명 날짜 ≠ 캘린더 발행일 이슈가 있어 명시적 매핑 사용:

```ts
const BACKFILL_MAP = [
  { publishDate: '2026-04-09', dataFile: '2026-04-09-please-check.json',    bgSrc: 'public/images/2026-04-09/bg_cover.png' },
  { publishDate: '2026-04-10', dataFile: '2026-04-10-office-disagree.json', bgSrc: 'public/images/2026-04-10-office-disagree/bg_cover.png' },
  { publishDate: '2026-04-13', dataFile: '2026-04-14-i-think.json',         bgSrc: 'public/images/2026-04-14-i-think/bg_cover.png' },
  { publishDate: '2026-04-14', dataFile: '2026-04-15-im-sorry.json',        bgSrc: 'public/images/2026-04-15-im-sorry/bg_cover.png' },
  { publishDate: '2026-04-15', dataFile: '2026-04-15-zoom.json',            bgSrc: 'public/images/2026-04-15-zoom/bg_cover.png' },
  { publishDate: '2026-04-17', dataFile: '2026-04-17-sugo.json',            bgSrc: 'public/images/2026-04-17/bg_cover.png' },
  { publishDate: '2026-04-20', dataFile: '2026-04-20-small-talk.json',      bgSrc: 'public/images/2026-04-20/bg_cover.png' },
];
```

### 8.3 로직

```
1. B2B Drive 부모 폴더(1CCRMLkvTIWTwfX4QIAHNXd6k-z8hP6nF) list → 날짜 폴더 inventory
2. BACKFILL_MAP 순회:
   - B2B Drive에 해당 publishDate 폴더 없음 → skip + report
   - data JSON load
   - bgSrc(로컬 경로) 존재 확인, 없으면 skip + report
   - cover.data.bg_image 를 `file://${absPath(bgSrc)}` 로 override (섹션 5.5)
   - B2bThumbPage 렌더 → exportThumbnail() → /tmp/{publishDate}_thumb.png
   - gws drive files create → B2B 날짜 폴더에 thumb_b2b.png 업로드
   - (개인드라이브이므로 supportsAllDrives 불필요)
3. 최종 리포트: [성공 N개, skip M개 (사유별)]
```

### 8.4 실행

```bash
npx tsx scripts/backfill-b2b-thumb.ts --dry-run   # 검증
npx tsx scripts/backfill-b2b-thumb.ts             # 실제 실행
```

### 8.5 이미지 복구 선행 작업

스크립트 실행 전 배경이미지 정리:

| 소스 | 목적 경로 |
|------|---------|
| `/Users/ianchoi/tmp image/carousel_bg_00001_.png` | `public/images/2026-04-09/bg_cover.png` |
| `/Users/ianchoi/tmp image/carousel_bg_00012_.png` | `public/images/2026-04-10-office-disagree/bg_cover.png` |
| `/Users/ianchoi/tmp image/carousel_bg_00014_.png` | `public/images/2026-04-14-i-think/bg_cover.png` |
| `/Users/ianchoi/tmp image/carousel_bg_00035_.png` | `public/images/2026-04-15-im-sorry/bg_cover.png` |
| `/Users/ianchoi/tmp image/carousel_bg_00030_.png` | `public/images/2026-04-15-zoom/bg_cover.png` |

04-17, 04-20 은 기보유 (이관 불필요).

## 9. 로고 에셋 이관

Figma node 90:23 ("logo vector") → SVG 다운로드 완료 (`/tmp/figma_logo_preview.svg`).

- 이관 경로: `public/assets/logo_u_mark.svg`
- 사용: `<img src="/assets/logo_u_mark.svg" style={{width:24, height:24, opacity:0.6}} />`
- `server/export.ts` 의 `rewriteAssetPaths()` 로직이 `/assets/` 경로를 `file://` 로 변환하므로 별도 수정 불필요.

## 10. 제외/보류 항목 (스코프 밖)

- **04-08 "Get out of hand"**: data 파일 없음 → 스코프 제외
- **04-16 "작심삼일"**: data 매핑 불명확(present-bias / reframe 후보) → 보류
- **시트 DB 구조 변경** (신규 칼럼 추가): 불필요. cover 재활용
- **온드미디어 Drive 썸네일 업로드**: B2B 전용이므로 미대상
- **에디터 UI 썸네일 미리보기**: YAGNI. Export 결과물로만 확인

## 11. 리스크/확인 포인트

1. **프로덕션 해상도 864×486** — 고객사 스펙이 1280×720 / 1920×1080 요구 시 `deviceScaleFactor` 조정 필요 (한 줄 변경)
2. **로고 SVG opacity 처리** — SVG 내부 `opacity="0.6"` + 컴포넌트 인라인 `opacity:0.6` 이중 적용 주의 (하나만 적용되도록 검증)
3. **title 줄바꿈** — cover 데이터의 `\n` 문자열이 16:9 좁은 높이에서 깨질 수 있음. 최대 2줄 기준 검증 필요. 장문 타이틀은 수동 조정 고지
4. **B2B Drive 권한** — 개인 드라이브(`supportsAllDrives:false`) 이므로 업로드 권한 확인

## 12. 작업 순서 (implementation plan 개요)

1. 로고 SVG 이관 (`/tmp/figma_logo_preview.svg` → `public/assets/logo_u_mark.svg`)
2. 배경이미지 이관 (tmp image 5장 → `public/images/{date-slug}/bg_cover.png`)
3. `B2bThumbPage.tsx` 컴포넌트 구현
4. `server/export.ts` 에 썸네일 전용 viewport 분기 + `exportThumbnail` 헬퍼 추가
5. `src/hooks/useExport.ts` 에 thumbHtml payload 추가
6. Dev 서버 실행 후 에디터에서 신규 콘텐츠 Export 테스트 → `thumb_b2b.png` 검증
7. `upload` 스킬 SKILL.md 수정
8. `scripts/backfill-b2b-thumb.ts` 작성 + `--dry-run` 검증
9. 백필 실행 + 리포트 확인
10. 코드 커밋 + 문서화
