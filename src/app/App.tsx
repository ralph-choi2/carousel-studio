import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import { EditorPage } from '@/pages/EditorPage';
import { ComponentPage } from '@/pages/ComponentPage';
import { useCarouselData } from '@/hooks/useCarouselData';
import { useExport } from '@/hooks/useExport';
import { listCarouselItems } from '@/lib/data-loader';
import type { CarouselFile, CarouselItem } from '@/lib/types';

/** 시트 row 의 title/date 로부터 export 결과 디렉토리 이름 유도. */
function deriveFilename(data: CarouselFile): string {
  const date = data.meta.date || 'untitled';
  const titleSlug = (data.meta.title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  return titleSlug ? `${date}-${titleSlug}` : date;
}

export default function App() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [zoom, setZoom] = useState(50);
  const carousel = useCarouselData();
  const { isExporting, doExport } = useExport();

  useEffect(() => {
    listCarouselItems().then(setItems).catch(console.error);
  }, []);

  const handleExport = useCallback(async () => {
    if (carousel.row == null || !carousel.data) return;
    const filename = deriveFilename(carousel.data);
    const outDir = await doExport(filename, carousel.data);
    if (outDir) alert(`Exported to: ${outDir}`);
  }, [carousel.row, carousel.data, doExport]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route
          path="/editor"
          element={
            <EditorPage
              items={items}
              zoom={zoom}
              onZoomChange={setZoom}
              carousel={carousel}
              onExport={handleExport}
              isExporting={isExporting}
            />
          }
        />
        <Route
          path="/component"
          element={
            <ComponentPage
              items={items}
              zoom={zoom}
              onZoomChange={setZoom}
              carousel={carousel}
            />
          }
        />
      </Routes>
      <Agentation />
    </>
  );
}
