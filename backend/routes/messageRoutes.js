import express from 'express';
import { sendMessage, getChatHistory, getInbox } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/inbox', protect, getInbox);
router.get('/:productId/:userId', protect, getChatHistory);

export default router;
