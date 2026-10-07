import express from 'express';
import { createRequest, getSellerRequests, getBuyerRequests, acceptRequest } from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/seller', protect, getSellerRequests);
router.get('/buyer', protect, getBuyerRequests);
router.put('/:id/accept', protect, acceptRequest);

export default router;
