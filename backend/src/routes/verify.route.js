import { Router } from 'express';
import { verifyCredential, verifyCredentialByFields } from '../controllers/verify.controller.js';
import { uploadCertificate } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', uploadCertificate, verifyCredential);
router.post('/fields', verifyCredentialByFields);

export default router;
