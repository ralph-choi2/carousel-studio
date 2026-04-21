---
name: comfy-image
description: Apps Script + Gemini 3.1 Flash Image로 캐러셀 배경 이미지 생성 후 Drive 저장 + 시트 URL 기록. Triggers on "이미지 생성", "배경 만들어", "comfy", "ComfyUI", "이미지 채워".
---

# Carousel Image Generation (Gemini via Apps Script)

캐러셀 cover / scene-card 배경 이미지를 Apps Script 웹앱의 `gen_image` 엔드포인트로 생성. Apps Script 내부에서 Gemini 3.1 Flash Image(= Nano Banana 2) API 호출 → Drive 공용 폴더 저장 → 공개 URL 반환. 반환된 URL을 스크립트 시트 셀의 `pages[idx].data.bg_image` 필드에 기록한다.

## 전체 흐름

1. **시트 row 읽기** — `GET ?action=read_script&row=N` → `pages[]` 배열 획득
2. **pages 순회** — 각 페이지의 `data.bg_prompt` 확인, 값 있는 컴포넌트만 대상
3. **gen_image 호출** — `POST {action:"gen_image", prompt, key}` → `{ok:true, url}` 수신
4. **pages 패치** — 해당 `pages[idx].data.bg_image = url`
5. **update_cells 호출** — 패치된 페이지 JSON 전체를 셀에 write (페이지 단위 전체 write, partial patch 불가)
6. 다음 페이지로 반복

## 사전 확인

Apps Script 웹앱 v1 URL이 살아있는지 간단 체크:

```bash
WEBAPP="https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec"
curl -sL "${WEBAPP}?action=list_scripts" -o /dev/null -w "%{http_code}\n"
# 200 이어야 정상
```

200이 아니면 Apps Script 배포 상태부터 확인하고 사용자에게 안내.

## API 호출 예시

### 1) 시트 row 읽기 (bg_prompt 수급)

```bash
WEBAPP="https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec"
ROW=12
curl -sL "${WEBAPP}?action=read_script&row=${ROW}"
# 응답: {row, title, hypothesis, pages:[{component, data:{bg_prompt, ...}}, ...], ...}
```

### 2) gen_image 호출

```bash
curl -sL -X POST "${WEBAPP}" \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "gen_image",
    "prompt": "Close-up of a laptop screen showing email draft, soft office lighting, clean minimal desk, shallow depth of field, muted tones, professional atmosphere",
    "key": "2026-04-22-please-check-cover-0"
  }'
# 응답: {ok:true, url:"https://drive.google.com/uc?id=...", fileId:"..."}
```

### 3) update_cells 호출 (이미지 URL을 페이지 JSON에 반영)

```bash
curl -sL -X POST "${WEBAPP}" \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "update_cells",
    "row": 12,
    "cells": [
      {
        "col": "page_1",
        "value": {
          "component": "cover",
          "data": {
            "title": "...",
            "subtitle": "...",
            "bg_prompt": "...",
            "bg_image": "https://drive.google.com/uc?id=..."
          }
        }
      }
    ]
  }'
# 응답: {ok:true, updated_at:"...", count:1}
```

**중요**: page 셀은 통째로 write하는 구조. 기존 `title`/`subtitle`/`bg_prompt` 필드를 반드시 그대로 포함해서 보내야 한다 (안 보내면 삭제됨). 항상 read → 수정 → 전체 write 순서.

## 키 네이밍 규칙

`key`: `{date}-{slug}-{component}-{idx}` 형식 권장. Drive에 `{key}.png`로 저장된다.

예시:
- `2026-04-22-please-check-cover-0`
- `2026-04-22-please-check-scene-card-2`
- `2026-04-22-please-check-scene-card-4`

- `{date}` — 발행 예정일 (YYYY-MM-DD)
- `{slug}` — title/hypothesis 기반 짧은 영문 slug
- `{component}` — `cover`, `scene-card` 등
- `{idx}` — pages 배열 인덱스

## 프롬프트 규칙

- 캐러셀 배경이므로 텍스트 오버레이 금지
- 타겟: 비즈니스 영어 학습자 → 시네마틱/미드 톤 권장
- 인물 포함 시 **다양한 인종** + 프로페셔널 세팅 (오피스, 카페, 원격근무 등)
- 구도/조명/피사계 심도 명시 (예: "shallow depth of field", "soft natural light", "overhead shot")
- 채도는 muted / professional tones 선호 (과한 원색 X)

**쓰지 말 것** — Apps Script가 자동으로 다음 문구를 붙이므로 프롬프트에 중복 기재 금지:

> Aspect ratio 3:4 (1080x1350). No text, no watermark, no letters, no UI elements.

즉 프롬프트에 "3:4", "1080x1350", "no text", "no watermark" 쓰지 말 것. 중복되면 품질 저하.

## 기존 comfy 레거시 주의 (deprecated)

아래는 전부 과거 방식. **사용 금지**:

- ~~로컬 ComfyUI 서버 (127.0.0.1:8000)~~
- ~~`~/ComfyUI/.env`, `~/Documents/ComfyUI/.env` 설정~~
- ~~`GeminiNanoBanana2` / `GeminiImage2Node` / `ComfyUI_NanoBanana` 노드 워크플로우~~
- ~~sharp 후처리 (trim + 1080x1350 cover resize)~~
- ~~`public/images/{date}/bg_*.png` 로컬 저장~~
- ~~JSON의 `bg_image`에 `/images/...` 로컬 경로 기록~~

본 스킬은 이제 **로컬 서버 불필요**. 모든 이미지 생성/저장은 Apps Script + Drive에서 처리되며, `bg_image`에는 항상 `https://drive.google.com/uc?id=...` 형태의 Drive URL이 들어간다. 3:4 비율은 Gemini가 바로 생성하고, 에디터는 CSS `object-fit: cover`로 처리하므로 별도 리사이즈 불필요.
