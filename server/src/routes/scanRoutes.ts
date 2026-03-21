import { Router } from 'express';
import { 
  startScan, 
  getScanStatus, 
  getScanHistory, 
  deleteScan 
} from '../controllers/scanController';
import { protectAdmin } from '../middleware/auth'; 

const router = Router();

// 🚨 ADMIN ROUTES (Top par rakhein)
router.get('/history', protectAdmin, getScanHistory);

// 🚨 USER ROUTES
router.post('/start', startScan);

// 🚨 DYNAMIC ROUTES (End mein rakhein)
router.get('/:id', getScanStatus);
router.delete('/:id', protectAdmin, deleteScan);

export default router;