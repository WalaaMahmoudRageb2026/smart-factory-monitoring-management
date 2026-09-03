import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';
import { rateLimiter, securityHeaders } from './server/middleware/security';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middleware
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(securityHeaders);
  app.use(rateLimiter(300, 60 * 1000)); // 300 requests per min general rate limit

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      system: 'Smart Factory Monitoring & Management System',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Main REST API Router
  app.use('/api', apiRouter);

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Factory] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Smart Factory] Fatal server startup error:', err);
});
