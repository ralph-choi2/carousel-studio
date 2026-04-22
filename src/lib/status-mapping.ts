/**
 * 파이프라인 내부 status 값.
 * 각 스킬/파이프라인 단계 완료 후 이 값으로 전이.
 */
export type PipelineStatus =
  | 'empty'
  | 'script_ready'
  | 'image_ready'
  | 'png_ready'
  | 'uploaded'
  | 'live';

export interface BadgeDisplay {
  label: string;
  /** 7px 점 색상 (hex). 좌측 border 는 사용하지 않음. */
  dotColor: string;
}

const BADGE_MAP: Record<PipelineStatus, BadgeDisplay> = {
  empty:        { label: '기획중',    dotColor: '#9ca3af' },
  script_ready: { label: '스크립트',  dotColor: '#3b82f6' },
  image_ready:  { label: '제작중',    dotColor: '#f97316' },
  png_ready:    { label: '제작중',    dotColor: '#f97316' },
  uploaded:     { label: '발행 준비', dotColor: '#8b5cf6' },
  live:         { label: '라이브',    dotColor: '#10b981' },
};

export function statusToBadge(status: PipelineStatus): BadgeDisplay {
  return BADGE_MAP[status] ?? BADGE_MAP.empty;
}

/** 범례(Legend) 에 사용하는 뱃지 고유 종류. image_ready/png_ready 는 제작중으로 뭉침. */
export const LEGEND_STATUSES: PipelineStatus[] = [
  'empty', 'script_ready', 'image_ready', 'uploaded', 'live',
];

/**
 * Apps Script `list_scripts` 응답만으로 status 를 유도.
 * 파일 시스템 체크(image_ready, png_ready)는 생략 — 클라이언트에서 빠른 응답 우선.
 * (세분화된 image_ready/png_ready 는 /api/pipeline/status 엔드포인트에서만 판정)
 */
export function deriveStatusFromItem(item: {
  calendar_status?: string;
  drive_url?: string;
  pages_count?: number;
}): PipelineStatus {
  if (item.calendar_status === '라이브') return 'live';
  if (item.drive_url && item.drive_url.length > 0) return 'uploaded';
  if (item.pages_count && item.pages_count > 0) return 'script_ready';
  return 'empty';
}
