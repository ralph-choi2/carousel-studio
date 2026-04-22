---
name: comfy-image
description: fal.ai nano-banana-2 + gws CLI 로컬 스크립트로 캐러셀 배경 이미지 생성 후 Drive 저장 + 시트 URL 기록. Triggers on "이미지 생성", "배경 만들어", "comfy", "ComfyUI", "이미지 채워".
---

# Carousel Image Generation (fal.ai 로컬 스크립트)

캐러셀 cover / scene-card 배경 이미지를 `scripts/generate-images.ts` 로컬 스크립트로 생성한다. 스크립트 내부에서 fal.ai `fal-ai/nano-banana-2`(= Google Nano Banana 2, 기존 Gemini 3 Flash Image와 동일 모델) API 직접 호출 → 로컬 tmp 저장 → `gws drive +upload` 로 공용 폴더 적재 + anyone 권한 부여 → 공개 URL 을 시트 셀 `pages[idx].data.bg_image` 에 기록.

Apps Script `gen_image` 엔드포인트는 **비상용 fallback** 으로만 유지 (아래 별도 절 참조).

## 전체 흐름

```
시트 row N
  ↓ read_script (웹앱, GET)
pages[].data.bg_prompt
  ↓ fal.ai nano-banana-2 (aspect_ratio:"3:4", resolution:"1K", 페이지 병렬)
fal CDN URL (임시)
  ↓ 바이너리 다운 → /tmp/{key}.png
PNG 파일
  ↓ gws drive +upload --parent CAROUSEL_FOLDER
fileId
  ↓ gws drive permissions create (role:reader, type:anyone)
https://lh3.googleusercontent.com/d/{fileId}
  ↓ update_cells (웹앱, POST)
pages[idx].data.bg_image = URL
```

## 사전 조건

1. **`.env`** — 프로젝트 루트.
   ```bash
   cp .env.example .env
   # 그 뒤 FAL_API_KEY= 에 팀 관리자가 별도 채널로 공유한 키 붙여넣기
   ```
2. **`gws` CLI 인증** — `/gog` 스킬 참조. `ralphchoi2@bcm.co.kr` OAuth 상태여야 Drive 업로드 + permissions create 호출 가능.
3. **Node ≥ 20** + `tsx` (이미 devDependency).

## 실행

```bash
# row 12의 bg_prompt 있는 모든 페이지 중 bg_image 비어있는 것만 생성
npm run gen-images -- --row 12

# 특정 페이지만
npm run gen-images -- --row 12 --pages 0,2,4

# bg_image 이미 있어도 덮어쓰기
npm run gen-images -- --row 12 --force

# 대상 프리뷰 (호출 없음)
npm run gen-images -- --row 12 --dry-run
```

페이지 단위 병렬 호출 — 4~5장 캐러셀도 수십 초 내 완료. Apps Script 6분 제한 이슈 없음.

## 프롬프트 규칙

- 캐러셀 배경이므로 텍스트 오버레이가 붙을 것을 고려
- 타겟: 비즈니스 영어 학습자 → 시네마틱 / 미드 톤
- 인물 포함 시 **다양한 인종** + 프로페셔널 세팅 (오피스, 카페, 원격근무 등)
- 구도/조명/피사계 심도 명시 ("shallow depth of field", "soft natural light", "overhead shot")
- 채도는 muted / professional tones 선호 (과한 원색 X)

**쓰지 말 것** — 프롬프트에 다음 문구 포함 금지:

- `3:4`, `1080x1350`, `aspect ratio` 등 비율/해상도 지정 문구
- `no text`, `no watermark`, `no letters` 등 네거티브 프롬프트

이유: 스크립트가 fal.ai `aspect_ratio:"3:4"` + `resolution:"1K"` 파라미터로 정확히 지정한다. 프롬프트 중복은 오히려 모델을 혼란시켜 품질 저하.

## 키 네이밍

스크립트가 자동으로 `{date}-row{N}-{component}-{idx}.png` 포맷 사용. 예:

- `2026-04-22-row12-cover-0.png`
- `2026-04-22-row12-scene-card-2.png`

`{date}` 는 해당 row의 date 컬럼을 사용, 없으면 실행일 (YYYY-MM-DD).

## fal.ai 호출 파라미터 (참고)

스크립트가 자동 세팅, 수동 변경 불필요:

```json
{
  "prompt": "<bg_prompt>",
  "aspect_ratio": "3:4",
  "resolution": "1K",
  "num_images": 1,
  "output_format": "png"
}
```

출력 크기: 1024×1365. 에디터는 CSS `object-fit: cover` 로 1080×1350 캔버스 맞춤.

단가: $0.08/장 (1K 기준). 월 100장 ≈ $8. `resolution:"2K"` 는 1.5배 ($0.12), 현재 용도엔 과함.

## 비상 fallback: Apps Script `gen_image` 웹앱

**일상 사용 금지.** fal.ai 장애 / 키 만료 / 심각한 쿼터 이슈 등 비상시에만.

```bash
WEBAPP="https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec"

curl -sL -X POST "${WEBAPP}" \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "gen_image",
    "prompt": "...",
    "key": "2026-04-22-row12-cover-0"
  }'
# 응답: {ok:true, url:"https://lh3.googleusercontent.com/d/{id}", fileId, key}
```

제한:

- Gemini 3.1 Flash Image 사용 — API tier 제한으로 자주 rate limit
- Apps Script 6분 실행 제한 내 동기 실행
- 페이지별 순차 호출만 가능 (병렬 불가 — 동시 여러 건이면 timeout)

비상 호출 후에도 `bg_image` 를 시트에 적재하려면 별도 `update_cells` 호출 필요.

## 트러블슈팅

- `FAL_API_KEY missing` — `.env` 가 프로젝트 루트에 있는지 + 값이 채워졌는지 확인.
- `fal submit 401` — 키 만료/오탈자. fal.ai 대시보드에서 재발급.
- `fal submit 429` — quota. 1~2분 대기 후 재시도, 또는 `--pages` 로 소량 분할.
- `fal.ai poll timeout` — 3분 내 COMPLETED 안 됨. 재실행으로 충분. 반복되면 fal status 페이지 확인.
- `gws upload: no id` — gws 인증 만료. `gws drive files list --params '{"pageSize":1}'` 로 확인 후 재인증.
- `permissions create` 실패 — Shared Drive 편집자 권한 없음. 팀 관리자에게 `CAROUSEL_DRIVE_FOLDER_ID` 편집자 권한 요청.

## 레거시 (사용 금지)

- ~~로컬 ComfyUI 서버 (127.0.0.1:8000)~~
- ~~`~/ComfyUI/.env`, `~/Documents/ComfyUI/.env` 설정~~
- ~~`GeminiNanoBanana2` / `GeminiImage2Node` / `ComfyUI_NanoBanana` 노드 워크플로우~~
- ~~sharp 후처리 (trim + 1080x1350 cover resize)~~
- ~~`public/images/{date}/bg_*.png` 로컬 저장~~
- ~~JSON `bg_image` 에 `/images/...` 로컬 경로 기록~~
- ~~Apps Script `gen_image` 를 일상적으로 호출~~ (비상 fallback 전용)

이제 이미지 생성/저장은 전부 로컬 스크립트 + fal.ai + Drive 에서 처리되며, `bg_image` 에는 항상 `https://lh3.googleusercontent.com/d/...` 형태의 Drive CDN URL 이 들어간다. 3:4 비율은 fal.ai 가 파라미터로 직접 생성, 에디터는 CSS `object-fit: cover` 로 처리.
