import { Router } from 'express';
import { registerUser, getProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateUserRegistration } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, validateUserRegistration, registerUser);
router.get('/profile', authenticate, getProfile);

export default router;