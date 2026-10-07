import express from 'express';
import { updateProfile, toggleWishlist, getWishlist, changePassword, getPublicProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/wishlist', protect, getWishlist);
router.put('/wishlist', protect, toggleWishlist);
router.put('/change-password', protect, changePassword);
router.get('/:id', getPublicProfile);

export default router;
