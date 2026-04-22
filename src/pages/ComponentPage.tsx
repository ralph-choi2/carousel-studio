import { useState, useCallback } from 'react';
import { COMPONENT_MAP, TEMPLATE_TYPES } from '@/components/templates';
import { SAMPLE_DATA_MAP } from '@/lib/sample-data';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Inspector, type InspectorSelection } from '@/components/inspector/Inspector';
import type { useCarouselData } from '@/hooks/useCarouselData';
import type { CarouselItem, PageData } from '@/lib/types';

const THUMB_SCALE = 160 / 1080;

interface ComponentPageProps {
  items: CarouselItem[];
  itemsLoading?: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  carousel: ReturnType<typeof useCarouselData>;
}

export function ComponentPage({
  items, itemsLoading, zoom, onZoomChange, carousel,
}: ComponentPageProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<PageData>({} as PageData);
  const [activeStyles, setActiveStyles] = useState<Record<string, string>>({});
  const [activeColors, setActiveColors] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<InspectorSelection | null>(null);

  const handleSelectType = (type: string) => {
    setActiveType(type);
    setActiveData((SAMPLE_DATA_MAP[type] ?? {}) as PageData);
    setActiveStyles({});
    setActiveColors({});
    setSelection(null);
  };

  const handlePresetChange = useCallback((field: string, preset: string | null) => {
    setActiveStyles((prev) => {
      const next = { ...prev };
      if (preset == null) delete next[field];
      else next[field] = preset;
      return next;
    });
  }, []);

  const handleColorChange = useCallback((field: string, token: string | null) => {
    setActiveColors((prev) => {
      const next = { ...prev };
      if (token == null) delete next[field];
      else next[field] = token;
      return next;
    });
  }, []);

  const handleResetAll = useCallback((field: string) => {
    setActiveStyles((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setActiveColors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const ActiveComponent = activeType ? COMPONENT_MAP[activeType] : null;
  const scale = zoom / 100;

  const currentPreset = selection ? activeStyles[selection.field] : undefined;
  const currentColor = selection ? activeColors[selection.field] : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Toolbar
        items={items}
        itemsLoading={itemsLoading}
        currentRow={carousel.row}
        onRowSelect={carousel.load}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onExport={() => {}}
        syncStatus={carousel.syncStatus}
        lastSavedAt={carousel.lastSavedAt}
      />

      <div className="flex flex-1 min-h-0">
        {/* Left: template list */}
        <div
          className="overflow-y-auto border-r bg-background"
          style={{ width: 192, flexShrink: 0 }}
        >
          <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b px-3 py-2">
            Templates
          </div>
          {TEMPLATE_TYPES.map((type) => {
            const Comp = COMPONENT_MAP[type];
            const data = SAMPLE_DATA_MAP[type];
            if (!Comp || !data) return null;
            const isActive = type === activeType;
            return (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className={`w-full flex flex-col items-center gap-1.5 p-2 transition-colors focus:outline-none ${
                  isActive
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div
                  className={`overflow-hidden rounded-md transition-all ${
                    isActive
                      ? 'ring-2 ring-primary'
                      : 'ring-1 ring-border'
                  }`}
                  style={{ width: 160, height: 200 }}
                >
                  <Comp
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={data as any}
                    scale={THUMB_SCALE}
                  />
                </div>
                <span className={`text-xs w-full text-center truncate px-1 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {type}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center: editable canvas */}
        <div className="relative flex flex-1 items-center justify-center bg-canvas-bg min-w-0">
          {ActiveComponent ? (
            <ActiveComponent
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={activeData as any}
              styles={activeStyles}
              colors={activeColors}
              editable
              scale={scale}
              selectedField={selection?.field}
              onDataChange={(d: PageData) => setActiveData(d)}
              onSelect={(field, defaultPreset, defaultColor) =>
                setSelection({ field, defaultPreset, defaultColor })
              }
            />
          ) : (
            <div className="text-white/30 text-base select-none">
              템플릿을 선택하세요
            </div>
          )}
          {/* type label */}
          {activeType && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white/80 text-sm select-none"
              style={{ background: 'rgba(0,0,0,0.6)' }}
            >
              {activeType}
            </div>
          )}
        </div>

        {/* Right: inspector */}
        <Inspector
          selection={selection}
          currentPreset={currentPreset}
          currentColor={currentColor}
          onPresetChange={handlePresetChange}
          onColorChange={handleColorChange}
          onResetAll={handleResetAll}
        />
      </div>
    </div>
  );
}
