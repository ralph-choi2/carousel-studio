import { useState, useEffect, useMemo } from 'react';
import { listCarouselItems } from '@/lib/data-loader';
import { groupByDate } from '@/lib/calendar-utils';
import type { CarouselItem } from '@/lib/types';
import { deriveStatusFromItem } from '@/lib/status-mapping';
import { MonthNav } from '@/components/calendar/MonthNav';
import { Legend } from '@/components/calendar/Legend';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { UnplacedList } from '@/components/calendar/UnplacedList';
import type { CellItemData } from '@/components/calendar/CalendarCell';

export function HomePage() {
  const today = useMemo(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }, []);
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1); // 1-12
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCarouselItems()
      .then((all) => { if (!cancelled) setItems(all); })
      .catch((err) => { if (!cancelled) setError(String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // status 는 Apps Script 응답만으로 client-side 유도 → 네트워크 왕복 1회로 단축.
  // image_ready / png_ready (파일 시스템 기반) 은 여기서 판정하지 않음.
  const cellItems: CellItemData[] = useMemo(() => items.map(it => ({
    row: it.row,
    title: it.title,
    status: deriveStatusFromItem(it),
    source: it.source,
    driveUrl: it.drive_url,
  })), [items]);

  const itemsByDate = useMemo(() => groupByDate(
    cellItems.map((it, idx) => ({
      ...it,
      date: items[idx].date || '',
    })),
  ), [cellItems, items]);

  const unplaced: CellItemData[] = itemsByDate[''] ?? [];

  const goPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const goNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => {
    setYear(today.getUTCFullYear());
    setMonth(today.getUTCMonth() + 1);
  };

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: 24,
      fontFamily: "'Pretendard', -apple-system, sans-serif",
    }}>
      <MonthNav year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
      <Legend />
      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: 12 }}>
          상태 조회 실패: {error}. 뱃지 없이 렌더합니다.
        </div>
      )}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      ) : (
        <>
          <MonthlyCalendar year={year} month={month} itemsByDate={itemsByDate} today={today} />
          <UnplacedList items={unplaced} />
        </>
      )}
    </div>
  );
}
