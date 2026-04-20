import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPONENT_MAP } from '@/components/templates';
import type { CarouselPage, PageData } from '@/lib/types';
import type { InspectorSelection } from '@/components/inspector/Inspector';

interface CanvasProps {
  pages: CarouselPage[];
  currentIndex: number;
  zoom: number;
  onNext: () => void;
  onPrev: () => void;
  onPageDataChange: (index: number, data: PageData) => void;
  selection: InspectorSelection | null;
  onSelect: (field: string, defaultPreset: string, defaultColor?: string) => void;
}

export function Canvas({
  pages,
  currentIndex,
  zoom,
  onNext,
  onPrev,
  onPageDataChange,
  selection,
  onSelect,
}: CanvasProps) {
  const page = pages[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === pages.length - 1;
  const scale = zoom / 100;
  const Component = page ? COMPONENT_MAP[page.component] : undefined;

  return (
    <div
      className="relative flex flex-row items-center justify-center flex-1 bg-canvas-bg"
      style={{ minHeight: 0 }}
    >
      <div className="flex items-center justify-center" style={{ width: 56, flexShrink: 0 }}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white/60 hover:text-white hover:bg-white/10"
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center min-w-0">
        {page && Component ? (
          <Component
            data={page.data}
            styles={page.styles}
            colors={page.colors}
            editable
            scale={scale}
            selectedField={selection?.field}
            onDataChange={(data: PageData) => onPageDataChange(currentIndex, data)}
            onSelect={onSelect}
          />
        ) : (
          <div className="text-white/30 text-lg">No page</div>
        )}
      </div>
      <div className="flex items-center justify-center" style={{ width: 56, flexShrink: 0 }}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white/60 hover:text-white hover:bg-white/10"
          onClick={onNext}
          disabled={isLast}
          aria-label="Next page"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white/80 text-sm select-none"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        {currentIndex + 1} / {pages.length}
      </div>
    </div>
  );
}
