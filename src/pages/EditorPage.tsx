import { Toolbar } from '@/components/toolbar/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { Filmstrip } from '@/components/filmstrip/Filmstrip';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import type { useCarouselData } from '@/hooks/useCarouselData';

interface EditorPageProps {
  files: string[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  carousel: ReturnType<typeof useCarouselData>;
  onExport: () => void;
  isExporting?: boolean;
}

export function EditorPage({ files, zoom, onZoomChange, carousel, onExport, isExporting }: EditorPageProps) {
  const { filename, data, isDirty, isLoading, load, updatePage, save } = carousel;
  const totalPages = data?.pages.length ?? 0;
  const { currentIndex, goTo, goNext, goPrev } = usePageNavigation(totalPages);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        files={files}
        currentFile={filename}
        onFileSelect={load}
        zoom={zoom}
        onZoomChange={onZoomChange}
        isDirty={isDirty}
        onSave={save}
        onExport={onExport}
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
