import type { CarouselFile, CarouselItem } from '@/lib/types';
import type { PipelineStatus } from '@/lib/status-mapping';

/**
 * Apps Script 웹앱 v1 URL.
 * 시트 DB (스크립트 탭) 의 list/read/update 엔드포인트를 호출한다.
 * POST 시 Content-Type 을 `text/plain` 으로 두어 CORS preflight 를 회피한다
 * (Apps Script 웹앱은 OPTIONS 응답을 못 하므로 simple request 로 맞춰야 함).
 */
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec';

interface ApiError { error: string }

function assertOk<T extends object>(body: T | ApiError): asserts body is T {
  if ('error' in body && typeof body.error === 'string') {
    throw new Error(body.error);
  }
}

export async function listCarouselItems(): Promise<CarouselItem[]> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list_scripts`);
  if (!res.ok) throw new Error(`Failed to list scripts: ${res.statusText}`);
  const body = (await res.json()) as { items: CarouselItem[] } | ApiError;
  assertOk(body);
  return body.items ?? [];
}

export async function loadCarouselRow(row: number): Promise<CarouselFile> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=read_script&row=${row}`);
  if (!res.ok) throw new Error(`Failed to load row ${row}: ${res.statusText}`);
  const raw = (await res.json()) as Record<string, unknown> | ApiError;
  assertOk(raw);
  const r = raw as Record<string, unknown>;
  return {
    meta: {
      row: Number(r.row) || row,
      date: (r.date as string) ?? '',
      title: (r.title as string) ?? '',
      hypothesis: r.hypothesis as string | undefined,
      pillar: r.pillar ? Number(r.pillar) : undefined,
      caption: r.caption as string | undefined,
      status: r.status as string | undefined,
      series_title: r.series_title as string | undefined,
      format: r.format as string | undefined,
      target_save: r.target_save ? Number(r.target_save) : undefined,
      category: r.category as string | undefined,
      pda: r.pda as CarouselFile['meta']['pda'],
    },
    pages: (r.pages as CarouselFile['pages']) ?? [],
  };
}

export async function updateCarouselCells(
  row: number,
  cells: { col: string; value: unknown }[],
): Promise<{ updated_at: string; count: number }> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    // text/plain 으로 보내 CORS preflight 회피. Apps Script 가 e.postData.contents 로 받음.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'update_cells', row, cells }),
  });
  if (!res.ok) throw new Error(`Failed to update row ${row}: ${res.statusText}`);
  const body = (await res.json()) as
    | { ok: true; updated_at: string; count: number }
    | ApiError;
  assertOk(body);
  return { updated_at: body.updated_at, count: body.count };
}

/**
 * PNG Export 는 로컬 Vite dev server 의 /api/export 로 계속 호출.
 * Puppeteer 렌더는 서버 사이드 실행이라 그대로 둔다.
 */
export async function exportPng(
  filename: string,
  htmlPages: { index: number; component: string; html: string }[],
): Promise<void> {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, htmlPages }),
  });
  if (!res.ok) throw new Error(`Failed to export "${filename}": ${res.statusText}`);
}

/**
 * 여러 row 의 파이프라인 상태를 한 번에 조회.
 * 서버 `/api/pipeline/status` 가 파일 시스템 + 캘린더 탭 정보를 조합해 결정.
 */
export async function fetchPipelineStatus(
  rows: number[],
): Promise<Record<number, PipelineStatus>> {
  if (rows.length === 0) return {};
  const qs = rows.join(',');
  const res = await fetch(`/api/pipeline/status?rows=${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch pipeline status: ${res.statusText}`);
  const body = (await res.json()) as { statuses: Record<number, PipelineStatus> } | ApiError;
  assertOk(body);
  return body.statuses;
}
