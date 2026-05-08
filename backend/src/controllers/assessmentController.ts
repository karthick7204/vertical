import { type Request, type Response } from 'express';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const createAssessment = async (req: Request, res: Response) => {
  const { courseId, title, type, questions } = req.body;

  try {
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
    }

    const assessment = await Assessment.create({
      courseId,
      title,
      type,
      questions,
    });

    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assessments by course
// @route   GET /api/assessments/course/:courseId
// @access  Private
export const getAssessmentsByCourse = async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;

  try {
    const assessments = await Assessment.find({ courseId });
    res.json(assessments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
export const getAssessmentById = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const updateAssessment = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { title, questions } = req.body;

  try {
    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    assessment.title = title || assessment.title;
    assessment.questions = questions || assessment.questions;

    const updatedAssessment = await assessment.save();
    res.json(updatedAssessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (HR_ADMIN, SUPER_ADMIN)
export const deleteAssessment = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    await assessment.deleteOne();
    res.json({ message: 'Assessment deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
