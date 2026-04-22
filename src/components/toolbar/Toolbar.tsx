import { Download, Loader2, Check, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CarouselItem } from '@/lib/types';
import type { SyncStatus } from '@/hooks/useCarouselData';

interface ToolbarProps {
  items: CarouselItem[];
  itemsLoading?: boolean;
  currentRow: number | null;
  onRowSelect: (row: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
  isExporting?: boolean;
  syncStatus?: SyncStatus;
  lastSavedAt?: number | null;
}

function useRelativeTime(ts: number | null | undefined): string {
  const [, tick] = useState(0);
  useEffect(() => {
    if (ts == null) return;
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, [ts]);
  if (ts == null) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5) return '방금';
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  return `${Math.floor(min / 60)}시간 전`;
}

function SyncBadge({
  status, lastSavedAt,
}: { status?: SyncStatus; lastSavedAt?: number | null }) {
  const relative = useRelativeTime(lastSavedAt ?? null);
  if (!status || status === 'idle') return null;
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Loader2 className="w-3 h-3 animate-spin" />
        저장 중...
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Check className="w-3 h-3 text-green-600" />
        저장됨{relative ? ` · ${relative}` : ''}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive shrink-0">
        <AlertTriangle className="w-3 h-3" />
        저장 실패
      </span>
    );
  }
  return null;
}

export function Toolbar({
  items,
  itemsLoading = false,
  currentRow,
  onRowSelect,
  zoom,
  onZoomChange,
  onExport,
  isExporting = false,
  syncStatus,
  lastSavedAt,
}: ToolbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname === '/component' ? 'component' : 'editor';

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b bg-background">
      {/* Home 버튼 — 홈 캘린더로 돌아가기 */}
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="홈 캘린더로"
        className="shrink-0 flex items-center justify-center w-7 h-7 rounded hover:bg-accent/50 text-muted-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Brand */}
      <span className="font-bold text-sm shrink-0">Carousel Studio</span>

      {/* Row selector (로딩 중엔 스피너 + "Loading..." placeholder) */}
      <Select
        value={currentRow != null ? String(currentRow) : ''}
        onValueChange={(v) => onRowSelect(Number(v))}
        disabled={itemsLoading}
      >
        <SelectTrigger className="w-[320px] h-8 text-xs bg-accent/30">
          {itemsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Loading scripts...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a carousel..." />
          )}
        </SelectTrigger>
        <SelectContent>
          {items.filter((item) => item.source !== 'calendar').map((item) => (
            <SelectItem
              key={item.row}
              value={String(item.row)}
              className="text-xs"
            >
              {`#${item.row} · ${item.title}${item.date ? ` (${item.date})` : ''}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tab navigation */}
      <Tabs value={currentTab} onValueChange={(value) => navigate(`/${value}`)}>
        <TabsList className="h-8">
          <TabsTrigger value="editor" className="text-xs px-3 py-1">
            Editor
          </TabsTrigger>
          <TabsTrigger value="component" className="text-xs px-3 py-1">
            Component
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sync status badge (자동 저장 상태 표시) */}
      <SyncBadge status={syncStatus} lastSavedAt={lastSavedAt} />

      {/* Zoom */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground w-9 text-right">
          {zoom}%
        </span>
        <Slider
          min={20}
          max={100}
          step={5}
          value={[zoom]}
          onValueChange={([val]) => onZoomChange(val)}
          className="w-24"
        />
      </div>

      {/* Export button */}
      <Button
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
        Export
      </Button>
    </div>
  );
}
