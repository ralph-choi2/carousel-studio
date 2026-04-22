import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { exportPages } from './server/export.js';

function createApiApp() {
  const app = express();

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
