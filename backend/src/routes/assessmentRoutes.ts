import express from 'express';
import { 
  createAssessment, 
  getAssessmentsByCourse, 
  getAssessmentById, 
  updateAssessment, 
  deleteAssessment,
  submitScore
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), createAssessment);
router.post('/score', protect, submitScore);

router.get('/course/:courseId', protect, getAssessmentsByCourse);

router.route('/:id')
  .get(protect, getAssessmentById)
  .put(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), updateAssessment)
  .delete(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), deleteAssessment);

export default router;
