import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

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
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, NotFoundError } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = Number(process.env.PORT || 3001);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.post('/api/billing/webhook', express.raw({ type: 'application/json', limit: '1mb' }), billingWebhook);
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use(logger);

app.use('/api', rateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/clone', cloneRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/billing', billingRoutes);

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

  process.on('SIGTERM', () => {
    if (server) {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}

export default app;
