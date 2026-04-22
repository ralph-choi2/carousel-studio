/**
 * templates.css의 .tpl-* 클래스와 1:1 매핑되는 프리셋 메타데이터.
 *
 * ⚠️ templates.css와 이중 정의. 한쪽 변경 시 반드시 다른 쪽도 동기화할 것.
 */

export interface TypographyPreset {
  id: string;       // CSS class (e.g. "tpl-cover-title")
  name: string;     // UI label (e.g. "Cover / title")
  group: string;    // Category (e.g. "Cover")
  size: number;     // px
  weight: number;   // 400, 500, 600, 700
  family: 'Pretendard' | 'Noto Sans KR';
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  // === Cover ===
  { id: 'tpl-cover-title',     name: 'Cover / title',     group: 'Cover',   size: 105, weight: 800, family: 'Pretendard' },
  { id: 'tpl-cover-subtitle',  name: 'Cover / subtitle',  group: 'Cover',   size: 48, weight: 600, family: 'Pretendard' },
  { id: 'tpl-cover-badge',     name: 'Cover / badge',     group: 'Cover',   size: 50, weight: 600, family: 'Pretendard' },
  // === Section ===
  { id: 'tpl-section-title',    name: 'Section / title',    group: 'Section', size: 66, weight: 600, family: 'Pretendard' },
  { id: 'tpl-section-subtitle', name: 'Section / subtitle', group: 'Section', size: 70, weight: 600, family: 'Pretendard' },
  // === Card ===
  { id: 'tpl-card-english',    name: 'Card / english',    group: 'Card',    size: 44, weight: 700, family: 'Noto Sans KR' },
  { id: 'tpl-card-korean',     name: 'Card / korean',     group: 'Card',    size: 42, weight: 400, family: 'Pretendard' },
  { id: 'tpl-card-english-lg', name: 'Card / english-lg', group: 'Card',    size: 42, weight: 700, family: 'Noto Sans KR' },
  { id: 'tpl-card-korean-lg',  name: 'Card / korean-lg',  group: 'Card',    size: 42, weight: 600, family: 'Pretendard' },
  // === Body ===
  { id: 'tpl-body-primary',    name: 'Body / primary',    group: 'Body',    size: 44, weight: 600, family: 'Pretendard' },
  { id: 'tpl-body-secondary',  name: 'Body / secondary',  group: 'Body',    size: 42, weight: 400, family: 'Pretendard' },
  // === Scene ===
  { id: 'tpl-scene-bold',      name: 'Scene / bold',      group: 'Scene',   size: 40, weight: 600, family: 'Pretendard' },
  { id: 'tpl-scene-regular',   name: 'Scene / regular',   group: 'Scene',   size: 37, weight: 400, family: 'Pretendard' },
  // === Quote ===
  { id: 'tpl-quote-text',      name: 'Quote / text',      group: 'Quote',   size: 50, weight: 600, family: 'Pretendard' },
  // === Source ===
  { id: 'tpl-source-citation', name: 'Source / citation', group: 'Source',  size: 24, weight: 600, family: 'Pretendard' },
  // === Logo ===
  { id: 'tpl-logo-brand',      name: 'Logo / brand',      group: 'Logo',    size: 36, weight: 700, family: 'Noto Sans KR' },
];

/** id로 프리셋 조회 (미존재 시 undefined) */
export function getPresetById(id: string): TypographyPreset | undefined {
  return TYPOGRAPHY_PRESETS.find((p) => p.id === id);
}

/** 그룹별로 묶어 Inspector 드롭다운 렌더용 */
export function groupedPresets(): Record<string, TypographyPreset[]> {
  return TYPOGRAPHY_PRESETS.reduce<Record<string, TypographyPreset[]>>((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {});
}
