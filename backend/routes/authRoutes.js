import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  demoLogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.post('/demo', demoLogin);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile); // Map /me to getUserProfile
router.route('/profile').get(protect, getUserProfile);

export default router;
