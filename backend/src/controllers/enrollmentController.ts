import { type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

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
