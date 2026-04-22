import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import type { PipelineStatus } from '../src/lib/status-mapping.js';

interface StatusItemInput {
  pages?: unknown[];
  calendar_status?: string;
  drive_url?: string;
}

interface FsSignals {
  imagesExist: boolean;
  pngExist: boolean;
}

/** 우선순위: live > uploaded > png_ready > image_ready > script_ready > empty */
export function determineStatus(
  item: StatusItemInput,
  fsSignals: FsSignals,
): PipelineStatus {
  if (item.calendar_status === '라이브') return 'live';
  if (item.drive_url && item.drive_url.trim().length > 0) return 'uploaded';
  if (fsSignals.pngExist) return 'png_ready';
  if (fsSignals.imagesExist) return 'image_ready';
  if (Array.isArray(item.pages) && item.pages.length > 0) return 'script_ready';
  return 'empty';
}

/** 주어진 디렉토리가 존재하고 파일 1개 이상 포함하는지. */
function dirHasFiles(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) return false;
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) return false;
    return fs.readdirSync(dirPath).some(f => !f.startsWith('.'));
  } catch {
    return false;
  }
}

/**
 * Express 핸들러. 클라이언트가 rows=1,2,3 로 요청하면 각 row 의 파이프라인 상태 반환.
 * 서버는 자체적으로 Apps Script list_scripts 를 호출해 item 메타를 얻고,
 * 파일 시스템을 체크해 determineStatus 적용.
 */
export async function handlePipelineStatus(
  req: Request,
  res: Response,
  projectRoot: string,
  fetchItems: () => Promise<Array<{ row: number } & StatusItemInput & { date?: string }>>,
) {
  try {
    const rowsParam = String(req.query.rows || '');
    const requestedRows = rowsParam
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => Number.isFinite(n) && n !== 0); // 음수 row = 캘린더 orphan (allow)
    if (requestedRows.length === 0) {
      res.status(400).json({ error: 'Missing rows param' });
      return;
    }

    const allItems = await fetchItems();
    const byRow = new Map<number, typeof allItems[number]>();
    for (const it of allItems) byRow.set(it.row, it);

    const statuses: Record<number, PipelineStatus> = {};
    for (const row of requestedRows) {
      const item = byRow.get(row);
      if (!item) {
        statuses[row] = 'empty';
        continue;
      }
      const date = item.date || '';
      const imagesDir = path.join(projectRoot, 'public', 'images', date);
      const outputDir = path.join(projectRoot, 'output', date);
      statuses[row] = determineStatus(item, {
        imagesExist: date ? dirHasFiles(imagesDir) : false,
        pngExist: date ? dirHasFiles(outputDir) : false,
      });
    }
    res.json({ statuses });
  } catch (err) {
    console.error('pipeline-status error:', err);
    res.status(500).json({ error: String(err) });
  }
}
