import express from 'express';
import { 
  createCourse, 
  getCourses, 
  addModule, 
  getCourseModules, 
  reorderModules,
  deleteCourse 
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), createCourse)
  .get(protect, getCourses);

router.route('/:id')
  .delete(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), deleteCourse);

router.route('/:courseId/modules')
  .post(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), addModule)
  .get(protect, getCourseModules);

router.route('/:courseId/modules/reorder')
  .put(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), reorderModules);

export default router;
