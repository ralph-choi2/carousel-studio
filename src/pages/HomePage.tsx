import { useState, useEffect, useMemo } from 'react';
import { listCarouselItems, fetchPipelineStatus } from '@/lib/data-loader';
import { groupByDate } from '@/lib/calendar-utils';
import type { CarouselItem } from '@/lib/types';
import type { PipelineStatus } from '@/lib/status-mapping';
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
  const [statuses, setStatuses] = useState<Record<number, PipelineStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCarouselItems()
      .then(async (all) => {
        if (cancelled) return;
        setItems(all);
        const rows = all.map(i => i.row);
        if (rows.length > 0) {
          const st = await fetchPipelineStatus(rows);
          if (!cancelled) setStatuses(st);
        }
      })
      .catch(err => { if (!cancelled) setError(String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const cellItems: CellItemData[] = useMemo(() => items.map(it => ({
    row: it.row,
    title: it.title,
    status: statuses[it.row] ?? 'empty',
    source: it.source,
    driveUrl: it.drive_url,
  })), [items, statuses]);

  // 날짜별 그루핑 (다른 달 항목은 MonthlyCalendar 렌더링 단계에서 자동 필터링됨)
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
