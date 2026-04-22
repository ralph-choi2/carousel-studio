import { getMonthGridDates, toDateKey, isSameDay } from '@/lib/calendar-utils';
import { CalendarCell, type CellItemData } from './CalendarCell';

interface MonthlyCalendarProps {
  year: number;
  month: number; // 1-12
  itemsByDate: Record<string, CellItemData[]>;
  today: Date;
}

const WEEKDAYS = [
  { label: '일', color: '#ef4444' },
  { label: '월', color: '#6b7280' },
  { label: '화', color: '#6b7280' },
  { label: '수', color: '#6b7280' },
  { label: '목', color: '#6b7280' },
  { label: '금', color: '#6b7280' },
  { label: '토', color: '#3b82f6' },
];

export function MonthlyCalendar({ year, month, itemsByDate, today }: MonthlyCalendarProps) {
  const dates = getMonthGridDates(year, month);

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 1, background: '#e5e7eb',
      border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
    }}>
      {WEEKDAYS.map(w => (
        <div key={w.label} style={{
          background: '#f9fafb', padding: '10px 12px', fontSize: 12,
          fontWeight: 600, color: w.color, textAlign: 'left',
        }}>{w.label}</div>
      ))}
      {dates.map(d => {
        const key = toDateKey(d);
        const items = itemsByDate[key] ?? [];
        const isOtherMonth = d.getUTCMonth() + 1 !== month;
        const isToday = isSameDay(d, today);
        return (
          <CalendarCell
            key={key}
            day={d.getUTCDate()}
            isOtherMonth={isOtherMonth}
            isToday={isToday}
            items={items}
          />
        );
      })}
    </div>
  );
}
