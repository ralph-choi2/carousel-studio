import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPONENT_MAP } from '@/components/templates';
import type { CarouselPage, PageData } from '@/lib/types';

interface CanvasProps {
  pages: CarouselPage[];
  currentIndex: number;
  zoom: number; // e.g. 50 means 50%
  onNext: () => void;
  onPrev: () => void;
  onPageDataChange: (index: number, data: PageData) => void;
}

export function Canvas({ pages, currentIndex, zoom, onNext, onPrev, onPageDataChange }: CanvasProps) {
  const page = pages[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === pages.length - 1;
  const scale = zoom / 100;

  const Component = page ? COMPONENT_MAP[page.component] : undefined;

  return (
    <div
      className="relative flex flex-row items-center justify-center w-full h-full bg-canvas-bg"
      style={{ minHeight: 0 }}
    >
      {/* Left arrow */}
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

      {/* Center: current page */}
      <div className="flex flex-1 items-center justify-center min-w-0">
        {page && Component ? (
          <Component
            data={page.data}
            editable
            scale={scale}
            onDataChange={(data: PageData) => onPageDataChange(currentIndex, data)}
          />
        ) : (
          <div className="text-white/30 text-lg">No page</div>
        )}
      </div>

      {/* Right arrow */}
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

      {/* Page indicator — absolute bottom center */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white/80 text-sm select-none"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        {currentIndex + 1} / {pages.length}
      </div>
    </div>
  );
}
