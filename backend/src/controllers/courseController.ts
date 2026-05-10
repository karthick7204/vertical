import { type Request, type Response } from 'express';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Assessment from '../models/Assessment.js';
import { generateAIAssessment } from '../utils/aiGenerator.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const createCourse = async (req: AuthRequest, res: Response) => {
  const { title, description, thumbnail, category, isPublic, modules } = req.body;

  try {
    const course = await Course.create({
      title,
      description,
      thumbnail,
      category,
      isPublic,
      organizationId: req.user?.organizationId,
    });

    if (modules && Array.isArray(modules) && modules.length > 0) {
      const moduleData = modules.map((mod: any, index: number) => ({
        ...mod,
        courseId: course._id,
        order: mod.order || index,
      }));
      await Module.insertMany(moduleData);
    }

    // Trigger AI Assessment Generation (3 Questions per Module)
    const aiQuestions = await generateAIAssessment({
      title,
      description,
      modules: modules || []
    });

    await Assessment.create({
      courseId: course._id,
      title: `${title} - AI Evaluation`,
      type: 'MODULE_QUIZ',
      questions: aiQuestions
    });

    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses (filtered by org for HR)
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};
    
    // If HR, show only their org's courses. If learner, show public or assigned.
    if (req.user?.role === 'HR_ADMIN') {
      query.organizationId = req.user.organizationId;
    } else if (req.user?.role === 'LEARNER') {
      query = { $or: [{ isPublic: true }, { organizationId: req.user.organizationId }] };
    }

    const courses = await Course.find(query).populate('organizationId', 'name');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a module to a course
// @route   POST /api/courses/:courseId/modules
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const addModule = async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const { title, content, videoUrl, order, skillsCovered, estimatedTime, subModules } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const module = await Module.create({
      courseId,
      title,
      content,
      videoUrl,
      order,
      skillsCovered,
      estimatedTime,
      subModules
    });

    res.status(201).json(module);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all modules for a course
// @route   GET /api/courses/:courseId/modules
// @access  Private
export const getCourseModules = async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;

  try {
    const modules = await Module.find({ courseId }).sort({ order: 1 });
    res.json(modules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update module order
// @route   PUT /api/courses/:courseId/modules/reorder
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const reorderModules = async (req: Request, res: Response) => {
  const { modules } = req.body; // Expecting [{ _id: string, order: number }]

  try {
    const updatePromises = modules.map((mod: { _id: string; order: number }) =>
      Module.findByIdAndUpdate(mod._id, { order: mod.order })
    );
    await Promise.all(updatePromises);

    res.json({ message: 'Modules reordered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course and its modules
// @route   DELETE /api/courses/:id
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await Module.deleteMany({ courseId: course._id });
    await course.deleteOne();

    res.json({ message: 'Course and associated modules deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
