import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

export default router;
