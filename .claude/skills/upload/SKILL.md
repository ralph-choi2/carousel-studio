---
name: upload
description: Export된 PNG를 Drive 업로드 + 캘린더 시트 등록. Triggers on "업로드", "Drive 올려", "캘린더 등록", "발행 준비", "시트에 등록", "온드미디어 등록".
---

# Carousel Upload

Export된 PNG 파일들을 Drive 2곳(온드미디어 + B2B)에 업로드하고 온드미디어 캘린더 시트에 등록.

## 전제 조건

- `output/{dateStr}/` 에 PNG 파일 존재 (export 스킬로 생성)
- JSON 데이터 파일에 meta 정보 (date, title, hypothesis 등)

## 기본 동작 (중요)

**항상 두 Drive 모두 업로드가 기본값.** 사용자가 "B2B 빼고" 등 명시적으로 제외하지 않는 한 묻지 말고 둘 다 병렬 업로드 진행. 온드미디어는 캘린더 시트 업데이트까지, B2B는 업로드만.

## Step 1: Drive 업로드 (2곳 병렬, 기본값)

### 온드미디어 Drive (공유드라이브, 캘린더 연동)

- **Parent folder**: `1rKLReQnMF1iv_jo-ZB-1ewqn7-4PAaM9`
- **Drive ID**: `0APrFZFCcNf0zUk9PVA`
- **`supportsAllDrives: true` 필수** (모든 API 호출에)

```bash
# 1) 날짜 폴더 생성
gws drive files create --params '{"supportsAllDrives":true}' \
  --json '{"name":"{YYYY-MM-DD}","mimeType":"application/vnd.google-apps.folder","parents":["1rKLReQnMF1iv_jo-ZB-1ewqn7-4PAaM9"]}'

# 2) 파일 업로드 (각 파일마다)
cd output/{dateStr}
gws drive files create --params '{"supportsAllDrives":true}' \
  --json '{"name":"01_cover.png","parents":["{DATE_FOLDER_ID}"]}' \
  --upload ./01_cover.png

# 3) 공개 권한 (n8n 발행용)
gws drive permissions create \
  --params '{"fileId":"{ID}","supportsAllDrives":true}' \
  --json '{"role":"reader","type":"anyone"}'
```

### B2B Drive (CJ 마이크로러닝, 개인드라이브)

- **Parent folder**: `1CCRMLkvTIWTwfX4QIAHNXd6k-z8hP6nF`
- **개인 드라이브**이므로 `supportsAllDrives` 불필요 (기본 `{}`)
- 캘린더 시트 업데이트 안 함

**파일 구성** — page_01~07은 온드미디어와 동일, **page_08(CTA)만 교체**:
- 온드미디어: `public/assets/cta.png` (보라, Uphone.English)
- B2B: `public/assets/cta_b2b.png` (Bite English + Uphone.English)

```bash
# B2B 패키지 준비
B2B_TMP=/tmp/b2b_pkg_{slug}
mkdir -p "$B2B_TMP"
cp output/{dateStr}/0{1_cover,2,3,4,5,6,7}.png "$B2B_TMP"/
cp public/assets/cta_b2b.png "$B2B_TMP/08_cta.png"

# 1) 날짜 폴더 생성 (supportsAllDrives 없음)
gws drive files create --params '{}' \
  --json '{"name":"{YYYY-MM-DD}","mimeType":"application/vnd.google-apps.folder","parents":["1CCRMLkvTIWTwfX4QIAHNXd6k-z8hP6nF"]}'

# 2) 파일 업로드 (각각)
cd "$B2B_TMP"
gws drive files create \
  --json '{"name":"01_cover.png","parents":["{B2B_FOLDER_ID}"]}' \
  --upload ./01_cover.png
```

온드미디어 + B2B 두 작업은 **병렬 실행** (백그라운드 `&` + `wait`).

## Step 2: 캘린더 시트 등록

**Spreadsheet**: `1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w`

### J열 (Drive 링크) 포맷

개별 파일 링크를 **콤마+공백** 구분. 폴더 링크 금지.

```
https://drive.google.com/file/d/AAA/view, https://drive.google.com/file/d/BBB/view, ...
```

### 업데이트할 열

| 열 | 내용 |
|----|------|
| H | 상태 → **발행 준비** |
| J | Drive 링크 (위 포맷) |
| K | 캡션 (caption-writer 스킬로 생성) |

```bash
# 행 번호를 먼저 찾기 (소재명으로 매칭)
gws sheets spreadsheets values get \
  --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"캘린더!F:F"}' \
  --format json

# H, J열 업데이트
gws sheets spreadsheets values update \
  --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"캘린더!H{row}:J{row}","valueInputOption":"USER_ENTERED"}' \
  --json '{"values":[["발행 준비","","Drive링크들"]]}'
```

### 새 행 추가 (캘린더에 아직 없으면)

```bash
gws sheets spreadsheets values append \
  --params '{"spreadsheetId":"1oXy79mcXXEgXAZz9IrnxCaM3JvzJQye4BohTkZ5NU9w","range":"캘린더!A:T","valueInputOption":"USER_ENTERED","insertDataOption":"INSERT_ROWS"}' \
  --json '{"values":[["발행일","시간","IG Carousel","카드뉴스","테마","소재명","가설ID","발행 준비","","Drive링크","캡션","","","","","","","","",""]]}'
```

## 날짜 검증 (중요)

업로드 전 교차 확인:
- JSON `meta.date` ↔ 캘린더 발행일 ↔ output 폴더명 ↔ Drive 폴더명

과거 에이전트가 날짜를 +1일 밀어서 생성한 버그 있음. KST 기준 날짜 재확인.

## 자동 발행 조건

`checkAndPublish()`가 매시간 체크:
- 상태 = "발행 준비" + 발행일 = 오늘 + 발행 시간 <= 현재
→ Meta API / YouTube API로 자동 발행

## Output

```
### 업로드 완료: {소재명}

| Drive | 폴더 | 파일 수 |
|-------|------|---------|
| 온드미디어 | 2026-04-17 | 8개 |
| B2B | 2026-04-17 | 8개 |

캘린더: "발행 준비" 등록 완료. {시간}에 자동 발행.
```
