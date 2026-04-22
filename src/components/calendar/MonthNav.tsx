import { formatYearMonth } from '@/lib/calendar-utils';

interface MonthNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNav({ year, month, onPrev, onNext, onToday }: MonthNavProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={onPrev} style={navBtnStyle} aria-label="이전 달">‹</button>
        <span>{formatYearMonth(year, month)}</span>
        <button onClick={onNext} style={navBtnStyle} aria-label="다음 달">›</button>
      </div>
      <button onClick={onToday} style={{
        background: '#111', color: '#fff', border: 'none', padding: '8px 14px',
        borderRadius: 8, fontSize: 13, cursor: 'pointer',
      }}>오늘</button>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: '#f3f4f6', border: 'none', width: 32, height: 32,
  borderRadius: 8, fontSize: 16, cursor: 'pointer', color: '#111',
};
