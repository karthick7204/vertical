import express from 'express';
import { enrollInCourse, getMyEnrollments, cancelEnrollment, getLearnersProgressReport } from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', enrollInCourse);
router.get('/report', authorize('HR_ADMIN', 'SUPER_ADMIN'), getLearnersProgressReport);
router.get('/', getMyEnrollments);
router.delete('/:id', cancelEnrollment);

export default router;
