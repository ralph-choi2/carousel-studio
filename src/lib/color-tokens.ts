/**
 * templates.css의 :root CSS 변수와 1:1 매핑되는 색상 토큰 메타.
 *
 * ⚠️ templates.css :root와 이중 정의. 한쪽 변경 시 반드시 다른 쪽도 동기화할 것.
 */

export interface ColorToken {
  id: string;                              // CSS var (e.g. "--tpl-text-primary")
  name: string;                            // UI label (e.g. "Text / primary")
  group: 'Text' | 'Accent' | 'Background';
  hex: string;                             // 프리뷰 용 실제 색상
}

export const COLOR_TOKENS: ColorToken[] = [
  { id: '--tpl-text-primary',   name: 'Text / primary',      group: 'Text',       hex: '#111111' },
  { id: '--tpl-text-secondary', name: 'Text / secondary',    group: 'Text',       hex: '#545454' },
  { id: '--tpl-text-tertiary',  name: 'Text / tertiary',     group: 'Text',       hex: '#999999' },
  { id: '--tpl-text-white',     name: 'Text / white',        group: 'Text',       hex: '#FFFFFF' },
  { id: '--tpl-text-dark',      name: 'Text / dark',         group: 'Text',       hex: '#0F0F0F' },
  { id: '--tpl-accent-purple',  name: 'Accent / purple',     group: 'Accent',     hex: '#8F54FF' },
  { id: '--tpl-bg-light',       name: 'Background / light',  group: 'Background', hex: '#F7F7F7' },
  { id: '--tpl-bg-dark',        name: 'Background / dark',   group: 'Background', hex: '#141420' },
];

export function getTokenById(id: string): ColorToken | undefined {
  return COLOR_TOKENS.find((t) => t.id === id);
}

export function groupedTokens(): Record<string, ColorToken[]> {
  return COLOR_TOKENS.reduce<Record<string, ColorToken[]>>((acc, t) => {
    (acc[t.group] ??= []).push(t);
    return acc;
  }, {});
}
