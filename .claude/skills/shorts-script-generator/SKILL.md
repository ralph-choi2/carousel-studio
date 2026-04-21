---
name: shorts-script-generator
description: Shorts 릴스용 Shadowing 스크립트 8씬 생성 후 온드미디어 `shorts` 탭에 append. Triggers on "쇼츠 스크립트", "쉐도잉 스크립트", "shorts 스크립트", "릴스 대본".
---

# Shorts Script Generator

IG 릴스(Shadowing 포맷) 스크립트 생성. 주제를 받아 커버 + 8씬을 작성하고 온드미디어 스프레드시트의 `shorts` 탭에 append. 반환된 rowIndex를 그대로 `shorts-publish` 스킬로 넘기면 n8n이 TTS·커버·Remotion·Drive 업로드까지 처리한다.

## Input

- **필수**: 주제 + 타겟 (예: "전치사 빼야 하는 동사 7가지, 비즈니스 영어")
- **선택**: 커버 비주얼 힌트, 시리즈 키, 기존 캐러셀과의 연결 맥락

## 시트 위치

| 항목 | 값 |
|------|----|
| Spreadsheet ID | `1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w` |
| 탭 이름 | `shorts` (sheetId 439326032) |
| 컬럼 범위 | A~V (22열) |

## 데이터 모델 (22열)

| 열 | 필드 | 설명 |
|----|------|------|
| A | Column | 상태 (빈값=렌더 대기, `complete`=완료) — 작성 시 **빈 문자열** |
| B | Comp | Remotion composition — 기본 `Shadowing` |
| C | Cover_Title | 커버 타이틀 (2줄 가능, `\n` 구분) |
| D | Cover_Sub | 서브 훅 |
| E | Cover_Prompt | Nano Banana 2 이미지 생성 프롬프트 (9:16 세로, 하단 1/3 카피 여백) |
| F~U | Scene1~8 (kor/eng 쌍) | 한국어 자막 + 영어 TTS. 총 16칸 |
| V | 업로드 디스크립션 | 마케팅 메타 (선택) |

n8n Filter 통과 조건: `Column is empty AND row_number == rowIndex`. 따라서 A열은 반드시 `""` 로 두고 재발행 시에도 수동 리셋만 하면 됨.

## 작성 규칙

### 커버
- **Cover_Title**: 한국어 훅. 공식:
  - 놀라움/발견 — "원어민은 안 붙여요"
  - 교정형 — "〇〇 말고 이렇게"
  - 대표 예시 문장 — "그 건에 대해 논의합시다"
- **Cover_Sub**: 짧은 확장 질문 or 강조 ("원어민은 뭐라고 할까요?" 같은 Q 형태 반응 좋음)
- **Cover_Prompt**: **9:16 세로 구도** 명시, 하단 1/3 clean negative space 강제. 주제별 비주얼 은유 선정:
  - 비즈니스 → 미국 오피스/오스틴 스카이라인 회의실
  - 일상 → 카페/거실/골든아워 실내
  - 영화/문장 → 3D 알파벳 큐브, 클레이 렌더

### 씬 (반드시 8개)
- 영어 `Scene*_Text`: 5~8 단어의 원어민 자연스러운 표현
- 한국어 `Scene*_Text_kor`: 20자 내외 맥락 + 뜻
- **빈 씬 금지** — TTS(ElevenLabs)가 빈 문자열에서 에러 발생. 자료가 7개뿐이면 8번째는 의미 있는 대체로 채움 (반복 대신 맥락 확장)
- 전치사·관용 표현 등 주제가 짧은 경우 톤 통일 (전부 비즈니스 or 전부 일상)

## 실행 단계

### 1. JSON 페이로드 구성

22개 원소 배열. Python으로 안전하게 생성 (이모지·개행 있는 한국어 포함 대비):

```python
import json
body = {"values": [[
  "",                                          # Column (빈값)
  "Shadowing",                                 # Comp
  "그 건에 대해 논의합시다",                       # Cover_Title
  "원어민은 뭐라고 할까요?",                       # Cover_Sub
  "A photo-realistic ... 9:16 portrait ...",    # Cover_Prompt
  "그 건에 대해 논의합시다", "Let's discuss the plan",
  "한 가지만 언급할게요",   "Let me mention one thing",
  # ... 총 8쌍
  "🚫 한국인이 자주 붙이는 ..."                   # 업로드 디스크립션
]]}
print(json.dumps(body, ensure_ascii=False))
```

### 2. shorts 탭 append

```bash
python3 build_payload.py > /tmp/shorts_row.json
gws sheets spreadsheets values append \
  --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"shorts!A:V","valueInputOption":"USER_ENTERED","insertDataOption":"INSERT_ROWS"}' \
  --json "$(cat /tmp/shorts_row.json)"
```

### 3. rowIndex 추출

append 응답의 `updates.updatedRange` 예시: `shorts!A3:V3` → `rowIndex = 3`.

## Output

```
### Shorts 스크립트 생성 완료

| 필드 | 값 |
|------|---|
| 탭 | shorts |
| rowIndex | {N} |
| Cover | {Cover_Title} / {Cover_Sub} |
| 씬 수 | 8 |

다음 단계: shorts-publish rowIndex={N}
```

## 관련 스킬

- `shorts-publish` — 이 행을 렌더·캡션·캘린더 등록까지 완주시키는 다음 단계
- `caption-writer` — publish 스킬이 체인 호출하는 캡션 생성 (릴스 템플릿 [A])
