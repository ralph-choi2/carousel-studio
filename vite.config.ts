import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, 'data');

function createApiApp() {
  const app = express();

  app.get('/api/files', (_req, res) => {
    if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); }
    const files = fs.readdirSync(DATA_DIR).filter((f: string) => f.endsWith('.json')).sort();
    res.json(files);
  });

  app.get('/api/files/:filename', (req, res) => {
    const filePath = path.join(DATA_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) { res.status(404).json({ error: 'File not found' }); return; }
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(content));
  });

  app.put('/api/files/:filename', express.json({ limit: '10mb' }), (req, res) => {
    const filePath = path.join(DATA_DIR, req.params.filename);
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  });

  app.post('/api/export', express.json({ limit: '50mb' }), (_req, res) => {
    res.status(501).json({ error: 'Export not yet implemented' });
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
