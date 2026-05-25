import { type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Enroll a user in a course
// @route   POST /api/enrollments
// @access  Private
export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existingEnrollment = await Enrollment.findOne({ 
      userId: req.user._id, 
      courseId 
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user._id,
      courseId,
    });

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments
// @access  Private
export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ enrolledAt: -1 });
    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private
export const cancelEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Check if it belongs to the user
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await enrollment.deleteOne();
    res.json({ message: 'Enrollment cancelled' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all learners and their course progress for admin
// @route   GET /api/enrollments/report
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const getLearnersProgressReport = async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser || (adminUser.role !== 'HR_ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ message: 'Forbidden: Access restricted to administrators' });
    }

    let userQuery: any = { role: 'LEARNER' };
    if (adminUser.role === 'HR_ADMIN') {
      userQuery.organizationId = adminUser.organizationId;
    }

    const learners = await User.find(userQuery).select('name email department skills createdAt');
    const learnerIds = learners.map(l => l._id);

    const enrollments = await Enrollment.find({ userId: { $in: learnerIds } })
      .populate('courseId', 'title category')
      .sort({ enrolledAt: -1 });

    const report = learners.map(learner => {
      const learnerEnrollments = enrollments.filter(e => e.userId.toString() === learner._id.toString());
      return {
        _id: learner._id,
        name: learner.name,
        email: learner.email,
        department: learner.department || 'N/A',
        skills: Object.fromEntries(learner.skills || new Map()),
        createdAt: learner.createdAt,
        enrollments: learnerEnrollments.map(e => ({
          enrollmentId: e._id,
          courseId: (e.courseId as any)?._id,
          courseTitle: (e.courseId as any)?.title || 'Unknown Course',
          courseCategory: (e.courseId as any)?.category || 'General',
          status: e.status,
          progress: e.progress,
          score: e.score,
          totalQuestions: e.totalQuestions,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt
        }))
      };
    });

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

