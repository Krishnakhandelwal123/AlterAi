import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { getMe, logout, verifyToken } from '../controllers/authController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/verify', authRateLimiter, verifyToken);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
