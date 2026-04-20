import { useState, useCallback } from 'react';
import type { CarouselFile, CarouselPage, PageData } from '@/lib/types';
import { loadCarouselFile, saveCarouselFile } from '@/lib/data-loader';

interface CarouselDataState {
  filename: string | null;
  data: CarouselFile | null;
  isDirty: boolean;
  isLoading: boolean;
}

interface CarouselDataActions {
  load: (file: string) => Promise<void>;
  updatePage: (index: number, patch: Partial<CarouselPage>) => void;
  save: () => Promise<void>;
}

export function useCarouselData(): CarouselDataState & CarouselDataActions {
  const [filename, setFilename] = useState<string | null>(null);
  const [data, setData] = useState<CarouselFile | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (file: string) => {
    setIsLoading(true);
    try {
      const loaded = await loadCarouselFile(file);
      setFilename(file);
      setData(loaded);
      setIsDirty(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePage = useCallback((index: number, patch: Partial<CarouselPage>) => {
    setData((prev) => {
      if (!prev) return prev;
      const pages = prev.pages.map((page, i) =>
        i === index ? { ...page, ...patch } : page
      );
      return { ...prev, pages };
    });
    setIsDirty(true);
  }, []);

  const save = useCallback(async () => {
    if (!filename || !data) return;
    setIsLoading(true);
    try {
      await saveCarouselFile(filename, data);
      setIsDirty(false);
    } finally {
      setIsLoading(false);
    }
  }, [filename, data]);

  return { filename, data, isDirty, isLoading, load, updatePage, save };
}
