/**
 * 한 달치 캘린더 그리드 날짜 배열 (일요일 시작, 35 or 42개).
 * 해당 월 첫 날짜 이전의 빈 셀을 이전 달 날짜로 채우고,
 * 마지막 날 이후를 다음 달 날짜로 채워 항상 7의 배수로 반환.
 *
 * @param year  4자리 연도 (예: 2026)
 * @param month 1~12
 */
export function getMonthGridDates(year: number, month: number): Date[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastOfMonth = new Date(Date.UTC(year, month, 0));

  // 첫 주 일요일 기준 시작일 (1 - firstDOW 만큼 뒤로)
  const startOffset = firstOfMonth.getUTCDay(); // 0=일 ~ 6=토
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - startOffset);

  // 마지막 주 토요일 기준 종료일 (6 - lastDOW 만큼 앞으로)
  const endOffset = 6 - lastOfMonth.getUTCDay();
  const gridEnd = new Date(lastOfMonth);
  gridEnd.setUTCDate(lastOfMonth.getUTCDate() + endOffset);

  const dates: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** `YYYY-MM-DD` 문자열로 변환 (UTC 기준). */
export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 한글 월 표시. */
export function formatYearMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

/** Date 두 개가 같은 날짜인지 (UTC). */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate();
}

/**
 * items 을 date 필드 기준으로 그루핑.
 * date 가 비어있거나 undefined 인 경우 "" 키로 모음.
 */
export function groupByDate<T extends { date?: string }>(
  items: T[],
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = item.date || '';
    (result[key] ||= []).push(item);
  }
  return result;
}
