import express from 'express';
import { 
  createCourse, 
  getCourses, 
  addModule, 
  getCourseModules, 
  reorderModules,
  deleteCourse,
  getCourseProgress,
  updateModuleProgress,
  getCourseById
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), createCourse)
  .get(protect, getCourses);

router.route('/:id')
  .get(protect, getCourseById)
  .delete(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), deleteCourse);

router.route('/:courseId/modules')
  .post(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), addModule)
  .get(protect, getCourseModules);

router.route('/:courseId/modules/reorder')
  .put(protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), reorderModules);

router.route('/:courseId/progress')
  .get(protect, getCourseProgress);

router.route('/:courseId/progress/module/:moduleId')
  .put(protect, updateModuleProgress);

export default router;
