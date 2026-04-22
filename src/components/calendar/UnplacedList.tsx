import type { CellItemData } from './CalendarCell';
import { CalendarItem } from './CalendarItem';

interface UnplacedListProps {
  items: CellItemData[];
}

export function UnplacedList({ items }: UnplacedListProps) {
  if (items.length === 0) return null;
  return (
    <div style={{
      marginTop: 20, padding: 16, background: '#fafafa', borderRadius: 8,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 10,
      }}>
        📝 미배치 초안 ({items.length}) · 날짜 미정
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(it => (
          <CalendarItem key={it.row} row={it.row} title={it.title} status={it.status} />
        ))}
      </div>
    </div>
  );
}
