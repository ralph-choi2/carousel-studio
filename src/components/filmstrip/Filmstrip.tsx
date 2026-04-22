import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { CarouselPage, CoverData } from '@/lib/types';
import { COMPONENT_MAP } from '@/components/templates';
import { B2bThumbPage } from '@/components/templates/B2bThumbPage';

interface FilmstripProps {
  pages: CarouselPage[];
  currentIndex: number;
  onSelect: (index: number) => void;
  b2bCoverData?: CoverData;
  isB2bActive?: boolean;
  onSelectB2b?: () => void;
}

const THUMB_WIDTH = 60;
const THUMB_HEIGHT = 75;
const CANVAS_SCALE = THUMB_WIDTH / 1080; // ~0.05556
const B2B_THUMB_WIDTH = 60;
const B2B_THUMB_HEIGHT = 34;                  // 60 * (243/432) ≈ 33.75
const B2B_CANVAS_SCALE = B2B_THUMB_WIDTH / 432; // ~0.139

export function Filmstrip({ pages, currentIndex, onSelect, b2bCoverData, isB2bActive, onSelectB2b }: FilmstripProps) {
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
          const isActive = index === currentIndex && !isB2bActive;
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

        {b2bCoverData && onSelectB2b && (
          <div className="flex flex-col items-center gap-1 flex-shrink-0 ml-2 pl-2 border-l border-canvas-border">
            <button
              onClick={onSelectB2b}
              className="rounded overflow-hidden flex-shrink-0 transition-all"
              style={{
                width: B2B_THUMB_WIDTH,
                height: B2B_THUMB_HEIGHT,
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: isB2bActive ? '0 0 0 2px #e94560' : '0 0 0 1px #333333',
              }}
              onMouseEnter={(e) => {
                if (!isB2bActive) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 0 0 2px rgba(233,69,96,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isB2bActive) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 0 0 1px #333333';
                }
              }}
              title="B2B 썸네일 미리보기 (편집 불가)"
            >
              <div style={{ pointerEvents: 'none' }}>
                <B2bThumbPage data={b2bCoverData} scale={B2B_CANVAS_SCALE} />
              </div>
            </button>
            <span
              className={cn(
                isB2bActive ? 'text-accent font-semibold' : 'text-muted-foreground'
              )}
              style={{ fontSize: 9, lineHeight: 1, userSelect: 'none' }}
            >
              B2B
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
