import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { exportPages } from './server/export.js';
import { handlePipelineStatus } from './server/pipeline-status.js';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyXsGfrsPPipRDhQqbFA2yvIafTytO6sVSu2fwNxnIE4TOUHaQXbjPiiYxjYwlM3ZJN/exec';

async function fetchAppsScriptItems() {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list_scripts`);
  if (!res.ok) throw new Error(`Apps Script list_scripts failed: ${res.statusText}`);
  const body = (await res.json()) as { items?: Array<Record<string, unknown>> };
  return (body.items ?? []).map(raw => {
    const pagesCount = Number(raw.pages_count ?? 0);
    return {
      row: Number(raw.row),
      date: String(raw.date ?? ''),
      pages: Array(pagesCount).fill(null) as unknown[], // length 만 의미 있음
      calendar_status: String(raw.calendar_status ?? ''),
      drive_url: String(raw.drive_url ?? ''),
    };
  });
}

function createApiApp() {
  const app = express();
  const projectRoot = path.resolve(__dirname);

  // PNG Export (Puppeteer) — 유일한 서버사이드 라우트.
  // 스크립트 데이터 read/write 는 Apps Script 웹앱으로 이관됨.
  app.post('/api/export', express.json({ limit: '50mb' }), async (req, res) => {
    const { filename, htmlPages, thumbHtml } = req.body as {
      filename: string;
      htmlPages: { index: number; component: string; html: string }[];
      thumbHtml?: string;
    };
    if (!filename || !Array.isArray(htmlPages)) {
      res.status(400).json({ error: 'Missing filename or htmlPages' });
      return;
    }
    try {
      const dateStr = filename.replace(/\.json$/, '');
      const outputDir = await exportPages(dateStr, htmlPages, thumbHtml);
      res.json({ ok: true, outputDir, count: htmlPages.length, thumb: Boolean(thumbHtml) });
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.get('/api/pipeline/status', (req, res) => {
    handlePipelineStatus(req, res, projectRoot, fetchAppsScriptItems);
  });

  return app;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(createApiApp());
      },
    },
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
});
