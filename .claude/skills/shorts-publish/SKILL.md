---
name: shorts-publish
description: shorts 탭 rowIndex를 받아 n8n webhook으로 렌더 기동 → 완료 폴링 → caption-writer 체인 호출 → 온드미디어 캘린더 append. Triggers on "쇼츠 발행", "릴스 발행", "shorts 렌더", "shorts 캘린더 등록".
---

# Shorts Publish

`shorts-script-generator`로 append된 행을 한 번에 발행 준비 상태까지 가져간다.
n8n "MKT SNS Shorts automation 2" 워크플로우가 TTS(8)·Gemini 커버·HTML 오버레이·Remotion·Drive 업로드·시트 마킹을 자동 처리하므로 본 스킬은 **기동 + 대기 + 후처리(캡션·캘린더)**만 담당.

## Input

- **필수**: `rowIndex` (shorts 탭 행 번호, 2 이상)
- **선택**: `publishDate` (YYYY-MM-DD, 기본 오늘 KST), `publishTime` (HH:MM, 기본 `19:00`), `theme` (기본 "비즈니스 영어"), `hypothesisId`

## 상수 (하드코딩)

| 항목 | 값 |
|------|-----|
| Workflow ID | `pE4SjYSyJQTTCZw6` (MKT SNS Shorts automation 2) |
| Webhook URL | `https://bcmcontents.app.n8n.cloud/webhook/299caea9-a3e8-49e4-840f-01a7b33691e6` |
| Auth Header | `AFM_Claude_Auth: contents12##` |
| 시트 ID | `1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w` |
| shorts 탭 | `shorts` (sheetId `439326032`) |
| 캘린더 탭 | `캘린더` (A~T 20열) |
| MP4 Drive 폴더 | `1VuLtQjpQtD3RO-KP6ue7y9RVaOJiTgqN` |
| SNS 썸네일 Drive 폴더 | `1HVpV0xThq6GydgBX0mrOViQE2mwZeSR7` |

`.env` 사용: `N8N_BASE_URL`, `N8N_API_KEY` (executions 폴링·디버깅용).

## 실행 단계

### 1. Webhook 발사

```bash
ROW=3
curl -sS -X POST "https://bcmcontents.app.n8n.cloud/webhook/299caea9-a3e8-49e4-840f-01a7b33691e6" \
  -H "AFM_Claude_Auth: contents12##" \
  -H "Content-Type: application/json" \
  -d "{\"rowIndex\": ${ROW}}" \
  -w "\nHTTP=%{http_code}\n"
```

기대: HTTP 200, body 내용은 무시 (응답은 workflow trigger ack).

**Filter 안전망**: n8n Filter가 `Column is empty AND row_number == rowIndex` 둘 다 요구.  이미 complete인 행에 재발사 시 조용히 건너뜀 (중복 발행 방지).

### 2. 완료 폴링

가장 간단한 방식은 **시트 A열 `complete` 관측**. 평균 3~4분.

```bash
until gws sheets spreadsheets values get \
  --params "{\"spreadsheetId\":\"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w\",\"range\":\"shorts!A${ROW}\"}" \
  | grep -q '"complete"'; do sleep 20; done
```

에러 대비: `executions` API로 최신 status 확인. status=error면 상세에서 노드별 에러 메시지 조회.

```bash
set -a; source /Users/ianchoi/workspace/marketing/.env; set +a
curl -sS "$N8N_BASE_URL/api/v1/executions?workflowId=pE4SjYSyJQTTCZw6&limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
# 실패 시 includeData=true 로 runData 덤프
```

### 3. Drive 링크 수집

MP4는 폴더 내 `createdTime` 최신 1건. SNS 썸네일은 `name contains '_sns_{ROW}'` 로 rowIndex별 매칭.

```bash
# 최종 MP4
gws drive files list --params '{"q":"'"'"'1VuLtQjpQtD3RO-KP6ue7y9RVaOJiTgqN'"'"' in parents and mimeType='"'"'video/mp4'"'"'","fields":"files(id,name,webViewLink)","orderBy":"createdTime desc","pageSize":1,"supportsAllDrives":true,"includeItemsFromAllDrives":true,"corpora":"allDrives"}'

# SNS 썸네일 (rowIndex별)
gws drive files list --params "{\"q\":\"'1HVpV0xThq6GydgBX0mrOViQE2mwZeSR7' in parents and name contains '_sns_${ROW}'\",\"fields\":\"files(id,name,webViewLink,createdTime)\",\"orderBy\":\"createdTime desc\",\"pageSize\":1,\"supportsAllDrives\":true,\"includeItemsFromAllDrives\":true,\"corpora\":\"allDrives\"}"
```

n8n이 이미 Share file 노드로 공개 권한 부여하므로 별도 permissions 호출 불필요.

### 4. 캡션 생성 — `caption-writer` 체인 호출

- 포맷: **릴스 [A] 핵심 표현 3가지**
- 소스: shorts 탭 rowIndex 행의 Scene1~3 (또는 가장 임팩트 있는 3개) + Cover_Title
- 규칙: 해시태그 7개, 이모지 3개, 300~400자, 끝에 `*AI로 생성된 콘텐츠입니다.` 한 줄
- 고정 해시 5 (`#민병철유폰 #전화영어 #화상영어 #영어회화 #영어표현`) + 주제 태그 2

caption-writer 스킬 SKILL.md 참조.

### 5. 캘린더 append (탭 `캘린더`, A~T)

Python으로 payload 조립 후 `--json "$(cat ...)"` 전달 (개행·이모지 안전).

```python
import json
caption = "..."  # caption-writer 결과
body = {"values": [[
  "2026-04-21", "19:00", "IG Reels", "릴스", "비즈니스 영어",
  "원어민은 전치사 안 붙여요 — 비즈니스 동사 7가지",  # 소재명
  "",                 # 가설ID
  "발행 준비", "",     # 상태 / URL
  "https://drive.google.com/file/d/{MP4_ID}/view",   # J Drive 링크
  caption,            # K 캡션
  "", "", "", "", "", "", "", "",   # L~S 성과 지표 (미채움)
  "https://drive.google.com/file/d/{SNS_ID}/view"    # T 커버/썸네일
]]}
```

```bash
gws sheets spreadsheets values append \
  --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"캘린더!A:T","valueInputOption":"USER_ENTERED","insertDataOption":"INSERT_ROWS"}' \
  --json "$(cat /tmp/calendar_row.json)"
```

## Output

```
### Shorts 발행 등록 완료

| 필드 | 값 |
|------|---|
| shorts 탭 rowIndex | {N} |
| 캘린더 행 | {M} |
| 발행일 | 2026-04-21 19:00 |
| MP4 | {webViewLink} |
| 썸네일 | {webViewLink} |
| 캡션 훅 | {첫 줄} |
| 상태 | 발행 준비 |
```

## 주의사항

- **B2B 업로드 없음** — shorts 파이프라인은 온드미디어 단일 타겟
- **워크플로우 JSON PUT 금지** — n8n API PUT 후 Webhook credential 매핑이 이전 stale 값으로 되돌아가는 버그 있음. 수정이 필요하면 UI에서 Save → activate 토글로 진행
- **경로 참조 시 `.first()` 강제** — Filter / Mark complete 등 다운스트림 노드에서 `$('Webhook').item` 대신 `$('Webhook').first()` 필수. paired-item 추적 실패로 ExpressionError 난 선례 있음
- 첫 호출 시 Production URL이 미등록 상태일 수 있음 — deactivate → activate 토글로 재등록

## 관련 스킬

- `shorts-script-generator` — 앞 단계. 22열 행 append 후 rowIndex 반환
- `caption-writer` — 본 스킬에서 릴스 [A] 템플릿으로 체인 호출
- `upload` (carousel 전용) — 본 스킬과 별개. 캐러셀 PNG 업로드용
