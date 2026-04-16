import express from 'express';
import fs from 'fs';
import path from 'path';
import type { ViteDevServer } from 'vite';
import { exportPages } from './export.js';

const DATA_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'data');

export function createApiRouter() {
  const router = express.Router();

  // GET /api/files — list JSON files in data/
  router.get('/files', (_req, res) => {
    if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); }
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort();
    res.json(files);
  });

  // GET /api/files/:filename — read a JSON file
  router.get('/files/:filename', (req, res) => {
    const filePath = path.join(DATA_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) { res.status(404).json({ error: 'File not found' }); return; }
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(content));
  });

  // PUT /api/files/:filename — save (overwrite) a JSON file
  router.put('/files/:filename', express.json({ limit: '10mb' }), (req, res) => {
    const filePath = path.join(DATA_DIR, req.params.filename);
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  });

  // POST /api/export — Puppeteer PNG export
  router.post('/export', express.json({ limit: '50mb' }), async (req, res) => {
    const { filename, htmlPages } = req.body as {
      filename: string;
      htmlPages: { index: number; component: string; html: string }[];
    };
    if (!filename || !Array.isArray(htmlPages)) {
      res.status(400).json({ error: 'Missing filename or htmlPages' });
      return;
    }
    try {
      const dateStr = filename.replace(/\.json$/, '');
      const outputDir = await exportPages(dateStr, htmlPages);
      res.json({ ok: true, outputDir, count: htmlPages.length });
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
}

// configureServer mounts the API into Vite's dev server.
// We use a full express() app (not Router) because Vite's connect-based
// middleware stack doesn't inject Express's res.json / res.status augmentations.
export function configureServer(server: ViteDevServer) {
  const app = express();
  app.use('/api', createApiRouter());
  server.middlewares.use(app);
}
