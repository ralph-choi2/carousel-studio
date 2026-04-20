/**
 * Inspector 패널과 Export 경로에서 공용으로 사용하는 스타일 해상도 유틸.
 * 한 곳에서만 정의해 에디터/Export 간 불일치를 원천 차단.
 */

export function resolveClassName(
  field: string,
  styles: Record<string, string> | undefined,
  defaultPreset: string
): string {
  return styles?.[field] ?? defaultPreset;
}

function toCssColor(value: string): string {
  return value.startsWith('--') ? `var(${value})` : value;
}

export function resolveColor(
  field: string,
  colors: Record<string, string> | undefined,
  defaultColor?: string
): string | undefined {
  const value = colors?.[field] ?? defaultColor;
  return value ? toCssColor(value) : undefined;
}
