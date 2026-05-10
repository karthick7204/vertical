import { type Request, type Response } from 'express';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import LearnerScore from '../models/LearnerScore.js';
import Module from '../models/Module.js';
import { generatePersonalizedPath } from '../utils/aiGenerator.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';

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
    const assessment = await Assessment.findOne({ courseId });
    res.json(assessment);
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

// @desc    Submit assessment score & update skills
// @route   POST /api/assessments/score
// @access  Private
const sanitizeSkill = (skill: string) => skill.replace(/\./g, '_');

export const submitScore = async (req: AuthRequest, res: Response) => {
  const { courseId, score, totalQuestions, correctQuestionIndices } = req.body;

  try {
    const [enrollment, assessment, user] = await Promise.all([
      Enrollment.findOne({ userId: req.user._id, courseId }),
      Assessment.findOne({ courseId }),
      User.findById(req.user._id)
    ]);

    if (!enrollment) return res.status(404).json({ message: 'Enrollment record not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update Enrollment
    enrollment.score = score;
    enrollment.totalQuestions = totalQuestions;
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    enrollment.progress = 100;
    await enrollment.save();

    // Update User Skills if questions are provided
    if (assessment) {
      const assessmentSkillScores = new Map<string, number>();
      const totalPossiblePerSkill = new Map<string, number>();
      
      // Initialize total possible points per skill from ALL questions in the assessment
      assessment.questions.forEach((q: any) => {
        if (q.skillTags) {
          q.skillTags.forEach((skill: string) => {
            const sanitized = sanitizeSkill(skill);
            totalPossiblePerSkill.set(sanitized, (totalPossiblePerSkill.get(sanitized) || 0) + 1);
          });
        }
      });

      const userSkillsMap = user.skills || new Map();
      
      if (correctQuestionIndices && Array.isArray(correctQuestionIndices)) {
        correctQuestionIndices.forEach((index: number) => {
          const question = assessment.questions[index];
          if (question && question.skillTags) {
            question.skillTags.forEach((skill: string) => {
              const sanitized = sanitizeSkill(skill);
              // Points for this assessment
              assessmentSkillScores.set(sanitized, (assessmentSkillScores.get(sanitized) || 0) + 1);
              
              // Points for the user profile (cumulative)
              const currentLevel = userSkillsMap.get(sanitized) || 0;
              userSkillsMap.set(sanitized, currentLevel + 1);
            });
          }
        });
      }

      user.skills = userSkillsMap;
      await user.save();

      // Analyze strengths and weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      totalPossiblePerSkill.forEach((total, skill) => {
        const earned = assessmentSkillScores.get(skill) || 0;
        const proficiency = earned / total;
        if (proficiency >= 0.7) strengths.push(skill);
        else if (proficiency < 0.4) weaknesses.push(skill);
      });

      // Create LearnerScore record
      await LearnerScore.create({
        userId: req.user._id,
        assessmentId: assessment._id,
        score: score,
        skillScores: assessmentSkillScores,
        skillAnalysis: {
          strengths,
          weaknesses,
          aiSummary: `Learner showed ${strengths.length > 0 ? 'proficiency in ' + strengths.join(', ') : 'moderate understanding'} and might need improvement in ${weaknesses.length > 0 ? weaknesses.join(', ') : 'none'}.`
        }
      });

      // Generate and Save Personalized Path
      try {
        const modules = await Module.find({ courseId });
        const course = await Course.findById(courseId);
        
        const result = await generatePersonalizedPath(
          course?.title || "Specialized Curriculum",
          modules,
          { strengths, weaknesses }
        );
        
        user.personalizedPath = result.path;
        user.focusSuggestions = result.suggestions;
        await user.save();
      } catch (pathError) {
        console.error("[AI] Failed to generate personalized path:", pathError);
      }
    }

    res.json({ 
      message: 'Score, skills, and personalized path updated successfully', 
      enrollment, 
      skills: user.skills,
      personalizedPath: user.personalizedPath,
      focusSuggestions: user.focusSuggestions
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
