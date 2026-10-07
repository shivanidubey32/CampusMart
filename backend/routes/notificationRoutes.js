import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

export default router;
