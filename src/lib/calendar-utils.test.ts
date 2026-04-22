import { describe, it, expect } from 'vitest';
import { groupByDate, getMonthGridDates, formatYearMonth } from './calendar-utils';

describe('groupByDate', () => {
  it('groups items by date field', () => {
    const items = [
      { row: 1, date: '2026-04-22', title: 'A' },
      { row: 2, date: '2026-04-22', title: 'B' },
      { row: 3, date: '2026-04-23', title: 'C' },
    ];
    const result = groupByDate(items);
    expect(result['2026-04-22']).toHaveLength(2);
    expect(result['2026-04-23']).toHaveLength(1);
  });

  it('puts empty/missing date into "" bucket', () => {
    const items = [
      { row: 1, date: '', title: 'A' },
      { row: 2, date: undefined as unknown as string, title: 'B' },
      { row: 3, date: '2026-04-22', title: 'C' },
    ];
    const result = groupByDate(items);
    expect(result['']).toHaveLength(2);
    expect(result['2026-04-22']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByDate([])).toEqual({});
  });
});

describe('getMonthGridDates', () => {
  it('returns 35 dates for 2026-04 (Apr 1 is Wed, fits in 5 rows)', () => {
    const dates = getMonthGridDates(2026, 4);
    expect(dates).toHaveLength(35);
    // First date is Sun 2026-03-29 (week-start for Apr 1 Wed)
    expect(dates[0].toISOString().slice(0, 10)).toBe('2026-03-29');
    // Last date is Sat 2026-05-02
    expect(dates[34].toISOString().slice(0, 10)).toBe('2026-05-02');
  });

  it('returns 42 dates for 2026-08 (Aug 1 is Sat, needs 6 rows)', () => {
    const dates = getMonthGridDates(2026, 8);
    expect(dates).toHaveLength(42);
  });
});

describe('formatYearMonth', () => {
  it('formats as 한글', () => {
    expect(formatYearMonth(2026, 4)).toBe('2026년 4월');
    expect(formatYearMonth(2026, 12)).toBe('2026년 12월');
  });
});
