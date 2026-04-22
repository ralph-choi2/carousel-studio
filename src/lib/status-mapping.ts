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
