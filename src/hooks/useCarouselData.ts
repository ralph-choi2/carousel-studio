import { useState, useCallback, useRef, useEffect } from 'react';
import type { CarouselFile, CarouselPage } from '@/lib/types';
import { loadCarouselRow, updateCarouselCells } from '@/lib/data-loader';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface CarouselDataState {
  row: number | null;
  data: CarouselFile | null;
  isDirty: boolean;
  isLoading: boolean;
  syncStatus: SyncStatus;
  lastSavedAt: number | null;
}

interface CarouselDataActions {
  load: (row: number) => Promise<void>;
  updatePage: (index: number, patch: Partial<CarouselPage>) => void;
  save: () => Promise<void>;
}

const AUTO_SAVE_DELAY_MS = 800;
const MAX_PAGES = 12;

export function useCarouselData(): CarouselDataState & CarouselDataActions {
  const [row, setRow] = useState<number | null>(null);
  const [data, setData] = useState<CarouselFile | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<CarouselFile | null>(null);
  const rowRef = useRef<number | null>(null);

  // debounced callback 이 최신 state 를 보도록 ref 동기화
  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { rowRef.current = row; }, [row]);

  const load = useCallback(async (targetRow: number) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setIsLoading(true);
    try {
      const loaded = await loadCarouselRow(targetRow);
      setRow(targetRow);
      setData(loaded);
      setIsDirty(false);
      setSyncStatus('idle');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSave = useCallback(
    async (targetRow: number, targetData: CarouselFile) => {
      setSyncStatus('saving');
      const cells: { col: string; value: unknown }[] = [];
      for (let i = 0; i < MAX_PAGES; i++) {
        cells.push({
          col: `page_${i + 1}`,
          value: targetData.pages[i] ?? '',
        });
      }
      try {
        await updateCarouselCells(targetRow, cells);
        setIsDirty(false);
        setLastSavedAt(Date.now());
        setSyncStatus('saved');
      } catch (err) {
        console.error('Carousel save failed:', err);
        setSyncStatus('error');
        throw err;
      }
    },
    [],
  );

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const r = rowRef.current;
      const d = dataRef.current;
      if (r != null && d) {
        performSave(r, d).catch(() => { /* syncStatus=error 로 표시됨 */ });
      }
    }, AUTO_SAVE_DELAY_MS);
  }, [performSave]);

  const updatePage = useCallback(
    (index: number, patch: Partial<CarouselPage>) => {
      setData((prev) => {
        if (!prev) return prev;
        const pages = prev.pages.map((page, i) =>
          i === index ? { ...page, ...patch } : page,
        );
        return { ...prev, pages };
      });
      setIsDirty(true);
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  const save = useCallback(async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const r = rowRef.current;
    const d = dataRef.current;
    if (r == null || !d) return;
    await performSave(r, d);
  }, [performSave]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  return {
    row, data, isDirty, isLoading, syncStatus, lastSavedAt,
    load, updatePage, save,
  };
}
