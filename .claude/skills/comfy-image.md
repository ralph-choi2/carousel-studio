---
name: comfy-image
description: ComfyUI로 캐러셀 배경 이미지 생성. Triggers on "이미지 생성", "배경 만들어", "comfy", "ComfyUI", "이미지 채워".
---

# ComfyUI Image Generation

캐러셀 커버/scene-card 배경 이미지를 ComfyUI GeminiNanoBanana2 노드로 생성.

## 사전 확인

```bash
# ComfyUI 서버 상태 확인
curl -s http://127.0.0.1:8000/system_stats | head -3
```

서버 안 뜨면 ComfyUI 앱 실행 필요 (사용자에게 안내).

## API 키 (.env)

사용자 홈 디렉토리 기준 2곳 — 둘 다 동기화 필요:
- `~/ComfyUI/.env` ← 외부 스크립트에서 읽음
- `~/Documents/ComfyUI/.env` ← ComfyUI 앱이 읽음

```env
COMFY_ACCOUNT=work          # work 또는 personal
COMFY_KEY_PERSONAL=comfyui-xxxxxx...
COMFY_KEY_WORK=comfyui-xxxxxx...
```

**"Payment Required" 에러 = 키가 잘못됨**. `COMFY_ACCOUNT` 값 확인 후 전환.

> 팀원 초기 설정: ComfyUI 설치 경로가 다를 수 있음. 위 2개 경로에 `.env` 파일이 없으면 본인 환경에 맞게 생성.

## 워크플로우

```json
{
  "1": {
    "inputs": {
      "prompt": "{프롬프트}. No text, no watermark, no letters.",
      "model": "Nano Banana 2 (Gemini 3.1 Flash Image)",
      "seed": 42,
      "aspect_ratio": "3:4",
      "resolution": "2K",
      "response_modalities": "IMAGE",
      "thinking_level": "MINIMAL"
    },
    "class_type": "GeminiNanoBanana2"
  },
  "2": {
    "inputs": { "filename_prefix": "carousel_bg", "images": ["1", 0] },
    "class_type": "SaveImage"
  }
}
```

### 큐 등록

```bash
curl -X POST http://127.0.0.1:8000/prompt \
  -H 'Content-Type: application/json' \
  -d '{"prompt": <workflow>, "client_id": "<uuid>", "extra_data": {"api_key_comfy_org": "<key>"}}'
```

### 결과 폴링

`/history/{prompt_id}` 에서 `status.completed` 확인. 완료 시 `outputs` 에서 이미지 filename 추출.

### 이미지 다운로드 + 후처리

```
/view?filename={name}&subfolder={sub}&type=output
→ sharp: trim(black) + resize(1080x1350, cover, centre) + png
→ public/images/{date}/bg_cover.png 또는 bg_scene.png
```

## JSON 업데이트

생성된 이미지 경로를 JSON data의 `bg_image` 필드에 추가:

```json
{
  "component": "cover",
  "data": {
    "bg_image": "/images/2026-04-17/bg_cover.png",
    "bg_prompt": "..."
  }
}
```

`bg_image`가 있으면 에디터와 Export 모두 이 이미지를 사용. 없으면 그라디언트 fallback.

## 사용 가능한 노드 목록

| class_type | 용도 |
|------------|------|
| GeminiNanoBanana2 | 텍스트→이미지 (주력) |
| GeminiImage2Node | Nano Banana Pro (고품질) |
| ComfyUI_NanoBanana | Gemini 2.5 Flash (로컬 API 키 사용, Cloud 크레딧 불필요) |

크레딧 부족 시 `ComfyUI_NanoBanana` 노드로 전환 가능 (inputs 구조 다름: `operation`, `quality`, `temperature`).

## 프롬프트 규칙

- 캐러셀 배경이므로 텍스트 오버레이 금지 ("No text, no watermark" 항상 추가)
- 3:4 비율 (1080x1350에 맞춤)
- 인물 포함 시 다양한 인종 + 프로페셔널 설정
- 시네마틱/미드 톤 권장 (타겟: 비즈니스 영어 학습자)
