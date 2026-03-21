import express from 'express';
import { adminLogin } from '../controllers/authController';

const router = express.Router();

// Path: /api/v1/auth/admin-login
router.post('/admin-login', adminLogin);

export default router;