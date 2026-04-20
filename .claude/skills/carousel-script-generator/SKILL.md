---
name: carousel-script-generator
description: IG 캐러셀 스크립트 JSON 생성. 성과 데이터, 가설, 경쟁사, wiki 컨텍스트 종합 참조. Triggers on "스크립트 생성", "캐러셀 기획", "콘텐츠 생성", "이번주 소재", "새 캐러셀".
---

# Carousel Script Generator

캐러셀 스크립트 JSON을 데이터 기반으로 생성하여 `data/` 디렉토리에 저장. **시트 등록은 upload 스킬이 담당** — 이 스킬은 순수 콘텐츠 생성만.

## 실행 전 컨텍스트 수집

아래 데이터를 순서대로 읽고, 생성에 반영한다. **모든 소스를 읽은 후 생성을 시작할 것.**

### 1. 전략 컨텍스트

```bash
cat wiki/playbooks/content-ops.md
cat wiki/domain/brand-voice.md
```

- 4기둥: 직장영어 업그레이드(주2) / 실전상황(주1) / 꾸준함(주1) / 무료체험전환(주1)
- 핵심 공식: '[X] 말고 이렇게'
- 벤치마크: 2/19 'To my knowledge' 저장률 3.97%, 공유 175

### 2. 가설 탭

```bash
gws sheets spreadsheets values get --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"가설!A:H"}' --format json
```

- 상태="테스트중"인 가설에 맞춰 스크립트 생성
- 상태="기각됨"인 가설의 안티패턴 회피

### 3. 과거 성과 데이터

```bash
gws sheets spreadsheets values get --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"캘린더!A:S"}' --format json
```

- 저장(P열)/도달(L열) = 저장률 계산
- 등급(S열) 상위/하위 패턴 분석

### 4. 한국인 영어 오류 패턴 (표현 소스)

```bash
cat wiki/content-sources/research/korean-english-errors.md
```

33개 오류 패턴 중 미사용 패턴 선택.

### 5. 경쟁사 트렌드 (선택적)

```bash
gws sheets spreadsheets values get --params '{"spreadsheetId":"1EbCoo53j4zjELsznr5To40cDynhi6SofXqjSoijvIlc","range":"RAW_CompetitorIg_Organic!A1:S5"}' --format json
```

## 슬라이드 구조 (컴포넌트 기반)

| # | 컴포넌트 | 역할 |
|---|----------|------|
| 1 | cover | 배경 이미지 + 메인 타이틀 + 훅 |
| 2 | intro | 공감 유도 + 핵심 메시지 |
| 3 | scene-card | 직역 vs 자연스러운 표현 (A/B 비교) |
| 4 | expression-card | 상황 1: 대안 표현 3개 |
| 5 | expression-card | 상황 2: 대안 표현 3개 |
| 6 | text-card | 문화 인사이트 or 보너스 |
| 7 | summary | 상황별 정리표 |
| 8 | cta | 팔로우 CTA (정적) |

### 줄바꿈 규약 (`\n`)

렌더 시 `\n` → `<br>` 자동 변환. **의미 단위 전환 지점에 선제적으로 `\n` 삽입**.

- 한국어 → 영어 전환 직전
- `대신` / `→` 뒤 긴 영어 인용 직전
- 짧은 한 줄(30자 이내)에는 불필요한 `\n` 금지

### Image 프롬프트 규칙

- 표현의 의미를 시각적으로 표현하는 장면
- 스타일: cinematic, warm lighting, professional setting
- 다양한 인종 + 프로페셔널 인물
- 텍스트 오버레이 없음
- `bg_prompt` 필드에 저장 (이미지 생성은 comfy-image 스킬이 담당)

## Output

`data/{YYYY-MM-DD}-{slug}.json` 파일 생성:

```json
{
  "meta": {
    "series_title": "...",
    "date": "2026-04-17",
    "title": "...",
    "pillar": 1,
    "format": "반전훅",
    "hypothesis": "H-001",
    "target_save": 150,
    "pda": { "persona": "...", "desire": "...", "awareness": "...", "angle": "..." }
  },
  "pages": [
    { "component": "cover", "data": { "title": "...", "subtitle": "", "bg_prompt": "..." } },
    { "component": "intro", "data": { "header": "...", "body": "..." } },
    ...
    { "component": "cta" }
  ],
  "caption": ""
}
```

**caption은 비워둠** — caption-writer 스킬이 별도 생성.

## 생성 개수

- 기본: 가설당 1개
- "이번주 소재" 요청 시: 주간 빈 슬롯에 맞춰 5개
- 사용자 지정 시: 해당 개수

## 생성 후 요약

```
### 생성 완료: {N}개 스크립트

| # | 소재명 | 가설 | 발행일 | 테마 | 파일 |
|---|--------|------|--------|------|------|
| 1 | ... | H-001 | 2026-04-17 | 직장 영어 | data/2026-04-17-sugo.json |

다음 단계: 에디터에서 편집 → comfy-image로 배경 생성 → export → caption-writer → upload
```
