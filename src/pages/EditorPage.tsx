import { useState } from 'react';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { Filmstrip } from '@/components/filmstrip/Filmstrip';
import { Inspector, type InspectorSelection } from '@/components/inspector/Inspector';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import type { useCarouselData } from '@/hooks/useCarouselData';
import type { CarouselItem } from '@/lib/types';

interface EditorPageProps {
  items: CarouselItem[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  carousel: ReturnType<typeof useCarouselData>;
  onExport: () => void;
  isExporting?: boolean;
}

export function EditorPage({
  items, zoom, onZoomChange, carousel, onExport, isExporting,
}: EditorPageProps) {
  const {
    row, data, isDirty, isLoading, syncStatus, lastSavedAt,
    load, updatePage, save,
  } = carousel;
  const totalPages = data?.pages.length ?? 0;
  const { currentIndex, goTo, goNext, goPrev } = usePageNavigation(totalPages);
  const [selection, setSelection] = useState<InspectorSelection | null>(null);

  const handlePageChange = (next: number) => {
    setSelection(null);
    goTo(next);
  };
  const handleNext = () => { setSelection(null); goNext(); };
  const handlePrev = () => { setSelection(null); goPrev(); };

  const currentPage = data?.pages[currentIndex];
  const currentPreset = selection && currentPage?.styles?.[selection.field];
  const currentColor = selection && currentPage?.colors?.[selection.field];

  const handlePresetChange = (field: string, preset: string | null) => {
    if (!currentPage) return;
    const nextStyles = { ...(currentPage.styles ?? {}) };
    if (preset == null) delete nextStyles[field];
    else nextStyles[field] = preset;
    updatePage(currentIndex, {
      styles: Object.keys(nextStyles).length ? nextStyles : undefined,
    });
  };

  const handleColorChange = (field: string, token: string | null) => {
    if (!currentPage) return;
    const nextColors = { ...(currentPage.colors ?? {}) };
    if (token == null) delete nextColors[field];
    else nextColors[field] = token;
    updatePage(currentIndex, {
      colors: Object.keys(nextColors).length ? nextColors : undefined,
    });
  };

  const handleResetAll = (field: string) => {
    if (!currentPage) return;
    const nextStyles = { ...(currentPage.styles ?? {}) };
    const nextColors = { ...(currentPage.colors ?? {}) };
    delete nextStyles[field];
    delete nextColors[field];
    updatePage(currentIndex, {
      styles: Object.keys(nextStyles).length ? nextStyles : undefined,
      colors: Object.keys(nextColors).length ? nextColors : undefined,
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        items={items}
        currentRow={row}
        onRowSelect={load}
        zoom={zoom}
        onZoomChange={onZoomChange}
        isDirty={isDirty}
        onSave={save}
        onExport={onExport}
        isExporting={isExporting}
        syncStatus={syncStatus}
        lastSavedAt={lastSavedAt}
      />
      {data ? (
        <>
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <Canvas
              pages={data.pages}
              currentIndex={currentIndex}
              zoom={zoom}
              onNext={handleNext}
              onPrev={handlePrev}
              onPageDataChange={(i, d) => updatePage(i, { data: d })}
              selection={selection}
              onSelect={(field, defaultPreset, defaultColor) =>
                setSelection({ field, defaultPreset, defaultColor })
              }
            />
            <Inspector
              selection={selection}
              currentPreset={currentPreset ?? undefined}
              currentColor={currentColor ?? undefined}
              onPresetChange={handlePresetChange}
              onColorChange={handleColorChange}
              onResetAll={handleResetAll}
            />
          </div>
          <Filmstrip
            pages={data.pages}
            currentIndex={currentIndex}
            onSelect={handlePageChange}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {isLoading ? 'Loading...' : 'Select a carousel to start editing'}
        </div>
      )}
    </div>
  );
}
