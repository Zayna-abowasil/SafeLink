import { Router } from 'express';
import { createReport, getAllReports, updateReportStatus } from './report.controller.js';
import { authenticateJWT } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/', authenticateJWT, upload.single('screenshot'), createReport);
router.get('/', authenticateJWT, getAllReports);
router.patch('/:id/status', authenticateJWT, updateReportStatus);

export default router;