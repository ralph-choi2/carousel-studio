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

const CACHE_KEY = 'carousel_studio_items_v1';

function readCache(): CarouselItem[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CarouselItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}

function writeCache(items: CarouselItem[]): void {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch { /* quota */ }
}

export function HomePage() {
  const today = useMemo(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }, []);
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1); // 1-12

  // SWR 패턴: 캐시 즉시 보여주고 백그라운드로 fresh fetch.
  // sessionStorage 캐시가 있으면 initial state 로 사용해 grid 를 즉시 렌더.
  const [items, setItems] = useState<CarouselItem[]>(() => readCache() ?? []);
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRefreshing(true);
    setError(null);
    listCarouselItems()
      .then((all) => {
        if (cancelled) return;
        setItems(all);
        writeCache(all);
      })
      .catch((err) => { if (!cancelled) setError(String(err)); })
      .finally(() => { if (!cancelled) setRefreshing(false); });
    return () => { cancelled = true; };
  }, []);

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

  const isFirstLoad = refreshing && items.length === 0;

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: 24,
      fontFamily: "'Pretendard', -apple-system, sans-serif",
    }}>
      <div style={{ position: 'relative' }}>
        <MonthNav year={year} month={month} onPrev={goPrev} onNext={goNext} onToday={goToday} />
        {refreshing && items.length > 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 80,
            fontSize: 11, color: '#9ca3af',
          }}>새로고침 중…</div>
        )}
      </div>
      <Legend />
      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: 12 }}>
          상태 조회 실패: {error}. 캐시된 데이터를 표시합니다.
        </div>
      )}
      <MonthlyCalendar year={year} month={month} itemsByDate={itemsByDate} today={today} />
      <UnplacedList items={unplaced} />
      {isFirstLoad && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          padding: '8px 14px', background: '#111', color: '#fff',
          borderRadius: 20, fontSize: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>데이터 불러오는 중…</div>
      )}
    </div>
  );
}
