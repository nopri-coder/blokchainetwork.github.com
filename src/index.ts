// ISP Billing API - Cloudflare Worker Entry Point
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders } from './middleware/securityHeaders';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { appRouter } from './routes';
import { loggerService } from './services/logger';

const app = new Hono({
  strict: true,
});

// Middleware Stack
app.use(logger());
app.use(requestId);
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['X-Request-ID'],
}));
app.use(securityHeaders);
app.use(rateLimiter);

// Health Check
app.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    message: 'Service is running',
  });
});

// Version
app.get('/version', (c) => {
  return c.json({
    success: true,
    data: {
      version: '1.0.0',
      environment: process.env.ENVIRONMENT || 'development',
    },
  });
});

// Root Endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      name: 'ISP Billing API',
      version: '1.0.0',
      documentation: 'https://api.botwagenone.com/docs',
    },
    message: 'Welcome to ISP Billing API',
  });
});

// Mount Routes
app.route('/api/v1', appRouter);

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'NOT_FOUND',
      message: `Endpoint ${c.req.path} not found`,
      timestamp: new Date().toISOString(),
      requestId: c.get('requestId'),
    },
    404
  );
});

// Global Error Handler
app.onError(errorHandler);

export default app;
