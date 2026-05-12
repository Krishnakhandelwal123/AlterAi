import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, NotFoundError } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = Number(process.env.PORT || 3001);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use(logger);

app.use('/api', rateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

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
