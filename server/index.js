import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize env vars before importing routes
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import trainingRoutes from './routes/training.js';
import cloneRoutes from './routes/clone.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';
import shareRoutes from './routes/share.js';
import billingRoutes, { billingWebhook } from './routes/billing.js';
import voiceRoutes from './routes/voice.js';
import notificationRoutes from './routes/notifications.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, NotFoundError } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import { startSubscriptionReminderJob } from './jobs/subscriptionReminders.js';
import { validateProductionEnv } from './config/env.js';

validateProductionEnv();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WIDGET_FILE = path.resolve(__dirname, '../client/public/widget.js');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = Number(process.env.PORT || 3001);

const isMultipart = (req) => (req.headers['content-type'] || '').toLowerCase().includes('multipart/form-data');

const jsonBodyParser = express.json({ limit: '2mb' });

/** Multer routes must not use express.json; all other API routes need JSON bodies parsed. */
const skipJsonBodyParser = (req) => {
  if (isMultipart(req)) return true;
  const path = req.originalUrl.split('?')[0];
  if (req.method === 'POST' && path === '/api/training/file') return true;
  if (req.method === 'POST' && path === '/api/voice/clone') return true;
  return false;
};

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.post('/api/billing/webhook', express.raw({ type: 'application/json', limit: '1mb' }), billingWebhook);

app.use(morgan('dev'));
app.use(logger);

app.get('/widget.js', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('application/javascript');
  res.sendFile(WIDGET_FILE, (err) => {
    if (err) res.status(404).send('// Alter AI widget not found. Deploy client/public/widget.js with your frontend.');
  });
});

app.use('/api', rateLimiter);

// Parse JSON before routes that expect req.body (skip only multer upload endpoints)
app.use('/api', (req, res, next) => {
  if (skipJsonBodyParser(req)) return next();
  return jsonBodyParser(req, res, next);
});

app.use('/api/voice', voiceRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/clone', cloneRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res, next) => {
  if (req.path === '/health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
  return next(new NotFoundError('Route not found'));
});

app.use(errorHandler);

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on ${PORT}`);
  });

  startSubscriptionReminderJob();

  process.on('SIGTERM', () => {
    if (server) {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}

export default app;
