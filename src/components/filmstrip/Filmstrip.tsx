import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { CarouselPage } from '@/lib/types';
import { COMPONENT_MAP } from '@/components/templates';

interface FilmstripProps {
  pages: CarouselPage[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const THUMB_WIDTH = 60;
const THUMB_HEIGHT = 75;
const CANVAS_SCALE = THUMB_WIDTH / 1080; // ~0.05556

export function Filmstrip({ pages, currentIndex, onSelect }: FilmstripProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }, [currentIndex]);

  return (
    <div
      className="bg-canvas-surface border-t border-canvas-border px-3 py-3"
      style={{ flexShrink: 0 }}
    >
      <div className="flex flex-row gap-2 overflow-x-auto">
        {pages.map((page, index) => {
          const isActive = index === currentIndex;
          const Component = COMPONENT_MAP[page.component];
          const pageNumber = String(index + 1).padStart(2, '0');

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <button
                ref={isActive ? activeRef : null}
                onClick={() => onSelect(index)}
                className={cn(
                  'rounded overflow-hidden flex-shrink-0 transition-all',
                  isActive
                    ? 'ring-2'
                    : 'ring-1 hover:ring-2'
                )}
                style={{
                  width: THUMB_WIDTH,
                  height: THUMB_HEIGHT,
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  // Use box-shadow to implement ring with exact color
                  boxShadow: isActive
                    ? '0 0 0 2px #e94560'
                    : '0 0 0 1px #333333',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 0 2px rgba(233,69,96,0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 0 1px #333333';
                  }
                }}
              >
                <div style={{ pointerEvents: 'none' }}>
                  {Component ? (
                    <Component
                      data={page.data}
                      scale={CANVAS_SCALE}
                    />
                  ) : (
                    <div
                      style={{
                        width: THUMB_WIDTH,
                        height: THUMB_HEIGHT,
                        background: '#16213e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 8,
                        color: '#555',
                      }}
                    >
                      {page.component}
                    </div>
                  )}
                </div>
              </button>

              <span
                className={cn(
                  isActive
                    ? 'text-accent font-semibold'
                    : 'text-muted-foreground'
                )}
                style={{ fontSize: 9, lineHeight: 1, userSelect: 'none' }}
              >
                {pageNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
