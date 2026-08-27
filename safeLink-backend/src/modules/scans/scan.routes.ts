import { Router } from 'express';
import { submitScan, getScanHistory, deleteScan } from './scan.controller.js';
import { authenticateJWT } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticateJWT, submitScan);
router.get('/history', authenticateJWT, getScanHistory);
router.delete('/:id', authenticateJWT, deleteScan);

export default router;