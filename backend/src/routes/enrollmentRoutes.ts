import express from 'express';
import { enrollInCourse, getMyEnrollments, cancelEnrollment } from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', enrollInCourse);
router.get('/', getMyEnrollments);
router.delete('/:id', cancelEnrollment);

export default router;
