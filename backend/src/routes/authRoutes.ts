import express from 'express';
import { 
  registerUser, 
  loginUser, 
  refreshToken, 
  logoutUser,
  inviteUser,
  activateUser
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh_token', refreshToken);
router.post('/logout', protect, logoutUser);

// Invitation routes
router.post('/invite', protect, admin, inviteUser);
router.post('/activate', activateUser);

export default router;
