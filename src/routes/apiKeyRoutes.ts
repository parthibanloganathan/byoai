import { Router } from 'express';
import {
  createApiKey,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  listApiKeys
} from '../controllers/apiKeyController';
import { authenticate } from '../middleware/auth';
import {
  validateApiKeyCreate,
  validateApiKeyUpdate,
  validateProvider
} from '../middleware/validation';
import { apiKeyAccessRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.get('/', listApiKeys);
router.post('/', validateApiKeyCreate, createApiKey);
router.get('/:provider', apiKeyAccessRateLimiter, validateProvider, getApiKey);
router.put('/:provider', validateApiKeyUpdate, updateApiKey);
router.delete('/:provider', validateProvider, deleteApiKey);

export default router;