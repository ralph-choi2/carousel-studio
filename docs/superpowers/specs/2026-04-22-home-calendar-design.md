# 홈 캘린더 (Phase 1) — 설계안

- **작성일**: 2026-04-22
- **작성자**: 브레인스토밍 세션 (ralphchoi + Claude)
- **상태**: Draft — 사용자 리뷰 대기

---

## 배경

팀원이 carousel-studio를 실행하면 **빈 에디터 화면**과 마주쳐 "이전 작업 상태가 뭐였지?", "지금 뭘 해야 하지?" 파악 불가능. 현재는 시트(스프레드시트)를 별도 탭에서 열어 확인하는 방식. JSON 스크립트 구조 때문에 비개발 팀원 진입장벽도 있음.

파이프라인(스크립트 → 이미지 → PNG Export → Drive 업로드 → 발행)이 **스킬 자연어 트리거 기반**이라 어떤 스킬을 언제 호출해야 할지 기억해야 함.

## 목표 (Phase 1)

- 실행 시 첫 화면 = **월간 캘린더** 로 상태 한눈에 파악
- 날짜 단위로 "어떤 산출물이, 어느 단계에 있는지" 뱃지로 표시
- 아이템 클릭 = 해당 row 에디터로 바로 이동

## 스코프 밖 (Phase 2 이후)

- Generate 버튼 / 다음 액션 자동 실행
- 백엔드 파이프라인 오케스트레이션 API
- `status` 컬럼 자동 업데이트 로직
- 각 스킬(comfy-image, export, upload) 수정
- 신규 row 생성 UI (스크립트 생성은 기존 `/carousel-script-generator` 스킬 사용)
- Claude Agent SDK 내장 채팅 UI

---

## 아키텍처

### 라우팅 변경

`src/app/App.tsx`:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />             {/* 신규: 홈 캘린더 */}
  <Route path="/editor" element={<EditorPage />} />     {/* 기존 유지 */}
  <Route path="/component" element={<ComponentPage />} />  {/* 기존 */}
</Routes>
```

- `/` 리다이렉트 제거, `HomePage` 마운트
- `/editor` 는 query param `?row=N` 으로 진입 (기존 드롭다운에서 선택하던 방식과 동일)
- 에디터 내 drop-down 유지 (row 간 빠른 전환은 편집 중 필요)

### 신규 컴포넌트

```
src/pages/HomePage.tsx               — 컨테이너
src/components/calendar/
  ├── MonthNav.tsx                   — < YYYY년 M월 > 오늘 버튼
  ├── Legend.tsx                     — 상태 범례
  ├── MonthlyCalendar.tsx            — 7 × 5~6 그리드
  ├── CalendarCell.tsx               — 단일 날짜 셀
  ├── CalendarItem.tsx               — 셀 내 산출물 1개 (● 제목)
  └── UnplacedList.tsx               — 날짜 미정 초안 리스트
```

### 신규 서버 API

`vite.config.ts` 의 `createApiApp()` 에 라우트 추가:

```
GET /api/pipeline/status?rows=1,2,3,...
→ 200 OK
→ { "1": "script_ready", "2": "png_ready", "3": "live", ... }
```

구현:
1. 요청 받은 row 번호들에 대해 `loadCarouselRow(row)` 호출 (현재 `data-loader.ts` 와 동일 Apps Script 웹앱 사용) — **date, title 등 메타 확보**
2. 각 row별로 상태 판정:
   - 캘린더 탭 H열(상태) = "라이브" → `live`
   - 캘린더 탭 J열(Drive 링크) 존재 → `uploaded`
   - `output/{date}/` 디렉토리 존재 + PNG 파일 있음 → `png_ready`
   - `public/images/{date}/` 디렉토리 존재 + 이미지 파일 있음 → `image_ready`
   - `pages` 배열 비어있지 않음 (`pages.length >= 1`) → `script_ready`
   - 그 외 → `empty`
3. 캘린더 탭 조회는 **기존 `list_scripts` 응답을 확장**하는 방식을 우선 검토:
   - 옵션 A (권장): Apps Script `list_scripts` 가 내부에서 캘린더 탭을 조인해 `calendar_status`, `drive_url` 필드를 각 row에 포함하여 반환 → 클라이언트는 기존 호출 1회로 필요한 모든 정보 확보
   - 옵션 B: 별도 `action=list_calendar` 엔드포인트 신설 → 서버가 두 응답을 조합
   - 캘린더 탭 컬럼 실제 매핑 (`sheet-setup.gs` 기준): A=발행일, F=소재명, H=상태, J=Drive 링크, K=캡션. `채널(C)="IG Carousel"` 필터 필요.
   - **매칭 키는 `date + title(소재명)` 근사**. title 변경 시 연결 끊김. 장기적으론 unique id 컬럼 도입 필요 (아래 "알려진 한계" 참고)
4. 옵션 A 로 구현 시 `/api/pipeline/status` 는 `list_scripts` 한 번만 호출 + 파일 시스템 체크만 수행 → 단순

---

## 데이터 흐름

```
HomePage mount
  │
  ├─ listCarouselItems()          (기존 Apps Script, 전체 스크립트 탭 row)
  │
  ├─ items.filter(현재 월 범위)
  │
  ├─ fetch(/api/pipeline/status?rows=[...])   (신규)
  │     └─ 서버: 파일 시스템 체크 + 캘린더 탭 조회 → status 맵 반환
  │
  ├─ 날짜별 그루핑
  │   {
  │     "2026-04-22": [
  │       { row: 12, title: "카페 주문 영어", status: "script_ready" },
  │       { row: 13, title: "비즈니스 팁", status: "empty" },
  │       ...
  │     ],
  │     ...
  │     "": [/* date 비어있는 row → 미배치 리스트 */]
  │   }
  │
  └─ 렌더
```

상태 재조회는 마운트 시 + 월 변경 시 + 수동 리프레시 버튼 클릭 시.

---

## Status 값 체계

내부값 (저장/판정):

| 값 | 의미 |
|----|------|
| `empty` | `pages` 미완성 또는 비어있음 |
| `script_ready` | `pages` 채워짐, 이미지 없음 |
| `image_ready` | `public/images/{date}/` 이미지 존재 |
| `png_ready` | `output/{date}/` PNG 존재 |
| `uploaded` | 캘린더 탭 J열(Drive 링크) 존재 |
| `live` | 캘린더 탭 H열 = "라이브" |

캘린더 뱃지 매핑 (display):

| 내부값 | 라벨 | 점 색상 (hex) |
|--------|------|---------------|
| `empty` | 기획중 | `#9ca3af` (gray-400) |
| `script_ready` | 스크립트 | `#3b82f6` (blue-500) |
| `image_ready` | 제작중 | `#f97316` (orange-500) |
| `png_ready` | 제작중 | `#f97316` (orange-500) |
| `uploaded` | 발행 준비 | `#8b5cf6` (purple-500) |
| `live` | 라이브 | `#10b981` (emerald-500) |

`image_ready`, `png_ready` 는 뱃지에서 동일 "제작중"으로 뭉침 (내부는 세분화, 표시는 단순화).

---

## UI 스펙

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ [‹] 2026년 4월 [›]                           [오늘]        │
│───────────────────────────────────────────────────────────│
│ ● 기획중  ● 스크립트  ● 제작중  ● 발행 준비  ● 라이브     │
│───────────────────────────────────────────────────────────│
│ 일     월     화     수     목     금     토              │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                │
│ │29 │ │30 │ │31 │ │ 1 │ │ 2 │ │ 3 │ │ 4 │                │
│ │   │ │   │ │   │ │●영어│ │   │ │●일상│ │   │                │
│ │   │ │   │ │   │ │●B2B │ │   │ │    │ │   │                │
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                │
│                          ...                              │
│───────────────────────────────────────────────────────────│
│ 📝 미배치 초안 (2) · 날짜 미정                            │
│   ● 스몰토크 모음 · 기획중                                │
│   ● 면접 팁 시리즈 · 스크립트                             │
└───────────────────────────────────────────────────────────┘
```

### 셀 컴포넌트 (CalendarCell)

- `min-height: 118px`, `padding: 8px`, `background: #fff`
- 상단: 날짜 숫자 (13px, semibold). 오늘이면 `· 오늘` 추가 + 셀 테두리 `inset 0 0 0 2px #111`
- 다른 달 날짜는 `background: #fafafa`, `color: #d1d5db`, 클릭 비활성

### 아이템 컴포넌트 (CalendarItem)

- `display: flex`, `gap: 6px`, `padding: 4px 8px`, `border-radius: 5px`
- 배경: `#f3f4f6` (균일 회색)
- Hover: `#d1d5db` (진한 회색)
- 좌측 점: 7×7px, 상태별 색상 (위 표 참고)
- 제목: `font-size: 11.5px`, `font-weight: 500`, 한 줄 ellipsis
- **좌측 컬러 보더는 사용하지 않음** (접근성 이슈로 제거 확정)
- 클릭 → `navigate('/editor?row={row}')`

### 오버플로우

- 셀당 아이템 최대 3개 표시, 넘으면 `+N more` 텍스트 버튼
- `+N more` 클릭 → **확장 팝오버** (해당 날짜 전체 리스트 드롭다운)

### 미배치 섹션

- 캘린더 아래. `background: #fafafa`, `padding: 16px`
- `date` 비어있는 row들을 리스트로 표시 (아이템 컴포넌트 재사용 가능)
- 클릭 동작 동일

### 월 네비게이션

- `‹` `›` 이전/다음 월
- "오늘" 버튼 → 현재 월 + 스크롤을 오늘 셀로
- 월 표시 포맷: `YYYY년 M월` (한글)

---

## 에러 처리

| 시나리오 | 동작 |
|----------|------|
| `listCarouselItems()` 실패 | 전체 페이지에 에러 상태 + 재시도 버튼 |
| `/api/pipeline/status` 실패 | 캘린더는 렌더 (뱃지 없이 제목만) + 상단 배너로 알림 |
| 특정 row 상태 판정 실패 | 해당 아이템을 `empty`로 fallback (로그만 남김) |
| Apps Script 웹앱 타임아웃 | 5초 timeout → 에러 처리 동일 |

## 테스트

Unit:
- 날짜별 그루핑 로직 (`groupByDate`) — 빈 date, 여러 row 같은 date, 월 경계
- 상태 판정 로직 (서버측) — 각 상태 조건 분기
- 뱃지 매핑 함수 (`statusToBadge`)

Integration:
- `/api/pipeline/status` 실제 파일 시스템 + Apps Script 응답 mock
- HomePage 월 전환, 수동 리프레시

Manual QA:
- 4월 실제 데이터로 브라우저 확인
- 오늘 셀 강조 정확
- 미배치 섹션 표시

---

## 알려진 한계 / 향후 고려

1. **row 매칭 키 약함**: 스크립트 탭 row ↔ 캘린더 탭 row 매칭이 `date + title` 근사. title 변경 시 끊김. **Phase 2에서 unique id 컬럼 추가 검토**.
2. **파일 시스템 기반 감지의 로컬성**: `public/images/`, `output/` 은 개발자 로컬 디스크. EC2 배포 시 동작 안 함. Phase 1은 **로컬 개발 환경 전용**. 팀 공유하려면 상태를 원격 저장소(시트/DB)에 반영하는 방식으로 Phase 2 에서 업그레이드 필요.
3. **여러 포맷 혼재**: 스크립트 탭에 carousel 외 다른 포맷(shorts 등)이 섞여있을 수 있음. Phase 1은 **전부 표시**하되, format 별 필터는 Phase 2에 도입.
4. **날짜 포맷**: `meta.date` 포맷 가정 `YYYY-MM-DD`. 예외 케이스(빈 문자열, 잘못된 포맷)는 미배치 섹션으로 분류.

## 파일 변경 요약

**신규**
- `src/pages/HomePage.tsx`
- `src/components/calendar/MonthNav.tsx`
- `src/components/calendar/Legend.tsx`
- `src/components/calendar/MonthlyCalendar.tsx`
- `src/components/calendar/CalendarCell.tsx`
- `src/components/calendar/CalendarItem.tsx`
- `src/components/calendar/UnplacedList.tsx`
- `src/lib/calendar-utils.ts` — 날짜 그루핑, 월 범위 계산
- `src/lib/status-mapping.ts` — status → 뱃지 display 매핑

**수정**
- `src/app/App.tsx` — 라우트 변경 (`/` → HomePage)
- `vite.config.ts` — `/api/pipeline/status` 엔드포인트 추가
- `data/marketing-hub/code/apps-script` — 옵션 A: `list_scripts` 확장 (캘린더 탭 조인) / 옵션 B: `list_calendar` 신규 엔드포인트. 어느 쪽이든 별도 clasp push 필요
- `src/lib/data-loader.ts` — `CarouselItem` 타입에 `calendar_status?`, `drive_url?` 필드 추가 (옵션 A 기준)

**미수정** (Phase 1 외)
- 기존 스킬 4개 (`comfy-image`, `export`, `upload`, `caption-writer`) — 손대지 않음
- `server/export.ts`, `scripts/generate-images.ts` 등 실행체 — 손대지 않음
