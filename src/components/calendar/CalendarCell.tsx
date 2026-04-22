import type { PipelineStatus } from '@/lib/status-mapping';
import { CalendarItem } from './CalendarItem';

export interface CellItemData {
  row: number;
  title: string;
  status: PipelineStatus;
}

interface CalendarCellProps {
  day: number;
  isOtherMonth?: boolean;
  isToday?: boolean;
  items: CellItemData[];
}

const MAX_VISIBLE = 3;

export function CalendarCell({ day, isOtherMonth, isToday, items }: CalendarCellProps) {
  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - MAX_VISIBLE;

  return (
    <div style={{
      background: isOtherMonth ? '#fafafa' : '#fff',
      minHeight: 118, padding: 8,
      display: 'flex', flexDirection: 'column', gap: 4,
      boxShadow: isToday ? 'inset 0 0 0 2px #111' : undefined,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, marginBottom: 2,
        color: isOtherMonth ? '#d1d5db' : '#111',
      }}>
        {day}{isToday ? ' · 오늘' : ''}
      </div>
      {!isOtherMonth && visible.map(it => (
        <CalendarItem key={it.row} row={it.row} title={it.title} status={it.status} />
      ))}
      {!isOtherMonth && overflow > 0 && (
        <div style={{
          fontSize: 10.5, color: '#6b7280', padding: '2px 6px',
          cursor: 'pointer', fontWeight: 600,
        }}>+{overflow} more</div>
      )}
    </div>
  );
}
