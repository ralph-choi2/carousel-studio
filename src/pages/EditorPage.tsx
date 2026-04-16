import { useState, useEffect, useCallback } from 'react';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { Filmstrip } from '@/components/filmstrip/Filmstrip';
import { useCarouselData } from '@/hooks/useCarouselData';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { listDataFiles } from '@/lib/data-loader';

export function EditorPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [zoom, setZoom] = useState(50);
  const [isExporting, setIsExporting] = useState(false);
  const { filename, data, isDirty, isLoading, load, updatePage, save } = useCarouselData();
  const totalPages = data?.pages.length ?? 0;
  const { currentIndex, goTo, goNext, goPrev } = usePageNavigation(totalPages);

  useEffect(() => {
    listDataFiles().then(setFiles).catch(console.error);
  }, []);

  const handleExport = useCallback(async () => {
    // Placeholder — will be wired in Task 14
    setIsExporting(true);
    try {
      alert('Export not yet implemented');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        files={files}
        currentFile={filename}
        onFileSelect={load}
        zoom={zoom}
        onZoomChange={setZoom}
        isDirty={isDirty}
        onSave={save}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {data ? (
        <>
          <Canvas
            pages={data.pages}
            currentIndex={currentIndex}
            zoom={zoom}
            onNext={goNext}
            onPrev={goPrev}
            onPageDataChange={updatePage}
          />
          <Filmstrip
            pages={data.pages}
            currentIndex={currentIndex}
            onSelect={goTo}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {isLoading ? 'Loading...' : 'Select a file to start editing'}
        </div>
      )}
    </div>
  );
}
