---
name: carousel-script-generator
description: IG 캐러셀 스크립트 JSON 생성. 성과 데이터, 가설, 경쟁사, wiki 컨텍스트 종합 참조. Triggers on "스크립트 생성", "캐러셀 기획", "콘텐츠 생성", "이번주 소재", "새 캐러셀".
---

# Carousel Script Generator

캐러셀 스크립트 JSON을 데이터 기반으로 생성하여 Apps Script 웹앱을 통해 구글 시트(`스크립트` 탭)에 직접 append. **캘린더 시트 등록(발행 준비)은 upload 스킬이 담당** — 이 스킬은 스크립트 생성 + `스크립트` 탭 append까지만.

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

Apps Script 웹앱으로 POST 호출 → `스크립트` 탭에 행 추가. **로컬 JSON 파일은 생성하지 않는다.**

- 웹앱 URL: `https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec`
- 시트 ID: `1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w`, 탭: `스크립트`
- Content-Type: `application/json` (Apps Script 서버는 `e.postData.contents` 파싱)

### POST body 구조

```json
{
  "action": "append_script",
  "title": "...",
  "hypothesis": "H-001",
  "pillar": 3,
  "pages": [
    { "component": "cover", "data": { "title": "...", "subtitle": "", "bg_prompt": "..." } },
    { "component": "intro", "data": { "header": "...", "body": "..." } },
    { "component": "cta" }
  ],
  "date": "2026-04-22",
  "caption": "",
  "series_title": "...",
  "format": "리프레임",
  "target_save": 150,
  "category": "insight",
  "pda": { "persona": "...", "desire": "...", "awareness": "...", "angle": "..." }
}
```

**caption은 빈 문자열 유지** — caption-writer 스킬이 별도 생성.

### 호출 템플릿 (bash heredoc)

각 스크립트마다 body JSON을 임시 파일로 쓰고 `curl -X POST` 로 전송. 응답의 `row` 를 파싱해 다음 단계(에디터 편집 / comfy-image / upload)에서 참조.

```bash
BODY=$(mktemp /tmp/carousel-script-XXXXXX.json)
cat > "$BODY" <<'JSON'
{
  "action": "append_script",
  "title": "...",
  "hypothesis": "H-001",
  "pillar": 3,
  "pages": [ ... ],
  "date": "2026-04-22",
  "caption": "",
  "series_title": "...",
  "format": "리프레임",
  "target_save": 150,
  "category": "insight",
  "pda": { "persona": "...", "desire": "...", "awareness": "...", "angle": "..." }
}
JSON

RESP=$(curl -sS -L -X POST \
  -H 'Content-Type: application/json' \
  --data-binary @"$BODY" \
  'https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec')

echo "$RESP"
ROW=$(echo "$RESP" | jq -r '.row')
echo "appended row: $ROW"
rm -f "$BODY"
```

- 응답 예: `{"ok":true,"row":42}` — `row` 가 `스크립트` 탭의 행 번호.
- 이후 스킬(comfy-image / export / upload)은 이 `row` 번호로 스크립트를 식별한다.
- 실패 응답(`ok:false`)이면 에러 메시지 확인 후 재시도.

> `gws` CLI는 OAuth 스코프 이슈로 Apps Script 웹앱 호출에 부적합 — `curl` 사용.

## 생성 개수

- 기본: 가설당 1개
- "이번주 소재" 요청 시: 주간 빈 슬롯에 맞춰 5개
- 사용자 지정 시: 해당 개수

## 생성 후 요약

```
### 생성 완료: {N}개 스크립트

| # | 소재명 | 가설 | 발행일 | 테마 | 시트 row |
|---|--------|------|--------|------|---------|
| 1 | ... | H-001 | 2026-04-17 | 직장 영어 | 42 |

다음 단계: 에디터에서 row 편집 → comfy-image로 배경 생성 → export → caption-writer → upload
```

`시트 row` 값은 Apps Script 응답의 `row` 필드를 그대로 사용한다.
