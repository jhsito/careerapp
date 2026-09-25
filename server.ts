import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import mcpHandler from './api/mcp.js';
// @ts-ignore
import jobsHandler from './api/jobs.js';
// @ts-ignore
import jobHandler from './api/job.js';
// @ts-ignore
import companyHandler from './api/company.js';
// @ts-ignore
import similarHandler from './api/similar.js';
// @ts-ignore
import filtersHandler from './api/filters.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Register MCP Handler on both POST and GET
  app.post('/api/mcp', mcpHandler);
  app.get('/api/mcp', mcpHandler);

  // Register REST API data routes
  app.all('/api/jobs', jobsHandler);
  app.all('/api/job', jobHandler);
  app.all('/api/company', companyHandler);
  app.all('/api/similar', similarHandler);
  app.all('/api/filters', filtersHandler);

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Navigator server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
