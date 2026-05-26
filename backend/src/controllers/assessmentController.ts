import { type Request, type Response } from 'express';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import LearnerScore from '../models/LearnerScore.js';
import Module from '../models/Module.js';
import PersonalizedPath from '../models/PersonalizedPath.js';
import ProgressTracking from '../models/ProgressTracking.js';
import { generatePersonalizedPath } from '../utils/aiGenerator.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import { broadcastProgressUpdate } from './enrollmentController.js';

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
  const { courseId, score, totalQuestions, correctQuestionIndices, userAnswers } = req.body;

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
    enrollment.status = 'enrolled';
    enrollment.progress = 0;
    await enrollment.save();

    broadcastProgressUpdate({
      type: 'PROGRESS_UPDATE',
      userId: req.user._id.toString(),
      courseId: courseId.toString(),
      progress: 0,
      status: 'enrolled',
      score: score,
      totalQuestions: totalQuestions,
      completedAt: undefined
    });

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

      // --- Compute detailed metrics for each question and module ---
      const courseModules = await Module.find({ courseId }).sort({ order: 1 });

      const findRelatedModule = (questionSkillTags: string[], qIdx: number, allModules: any[]) => {
        let bestModule = null;
        let maxOverlap = 0;

        for (const mod of allModules) {
          const overlap = (mod.skillsCovered || []).filter((skill: string) =>
            (questionSkillTags || []).some(qSkill => qSkill.toLowerCase().trim() === skill.toLowerCase().trim())
          ).length;

          if (overlap > maxOverlap) {
            maxOverlap = overlap;
            bestModule = mod;
          }
        }

        // Sequential fallback (default 3 questions per module)
        if (!bestModule && allModules.length > 0) {
          const sequentialIdx = Math.floor(qIdx / 3);
          bestModule = allModules[sequentialIdx] || allModules[allModules.length - 1];
        }

        return bestModule;
      };

      const answers = userAnswers || assessment.questions.map((q, idx) => {
        const isCorrect = correctQuestionIndices && correctQuestionIndices.includes(idx);
        return {
          questionIndex: idx,
          chosenOption: isCorrect ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length,
          isCorrect
        };
      });

      let totalCorrect = 0;
      let totalIncorrect = 0;
      const moduleStats = new Map<string, { correct: number; total: number; moduleId?: string }>();

      const questionsPerformance = answers.map((ans: any) => {
        const qIdx = ans.questionIndex;
        const question = assessment.questions[qIdx];
        
        const relatedModule = findRelatedModule(question?.skillTags || [], qIdx, courseModules);
        const moduleTitle = relatedModule ? relatedModule.title : 'General';
        const moduleId = relatedModule ? relatedModule._id : undefined;
        
        if (ans.isCorrect) {
          totalCorrect++;
        } else {
          totalIncorrect++;
        }
        
        const stats = moduleStats.get(moduleTitle) || { correct: 0, total: 0, moduleId: moduleId?.toString() };
        stats.total++;
        if (ans.isCorrect) {
          stats.correct++;
        }
        moduleStats.set(moduleTitle, stats);
        
        return {
          questionText: question?.question || `Question #${qIdx + 1}`,
          chosenOption: ans.chosenOption,
          correctAnswer: question?.correctAnswer || 0,
          isCorrect: ans.isCorrect,
          relatedModuleId: moduleId,
          relatedModuleTitle: moduleTitle
        };
      });

      const scorePercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const moduleAccuracy = new Map<string, number>();
      const strongTopics: string[] = [];
      const weakTopics: string[] = [];

      moduleStats.forEach((stats, title) => {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        moduleAccuracy.set(title, accuracy);
        
        if (accuracy >= 70) {
          strongTopics.push(title);
        } else {
          weakTopics.push(title);
        }
      });

      // Mark untested course modules as weak by default
      courseModules.forEach(m => {
        if (!moduleStats.has(m.title)) {
          weakTopics.push(m.title);
          moduleAccuracy.set(m.title, 0);
        }
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
        },
        questionsPerformance,
        moduleAccuracy,
        totalCorrect,
        totalIncorrect,
        scorePercentage,
        weakTopics,
        strongTopics
      });

      // Generate and Save Personalized Path
      try {
        const course = await Course.findById(courseId);
        
        const result = await generatePersonalizedPath(
          course?.title || "Specialized Curriculum",
          courseModules,
          {
            scorePercentage,
            totalCorrect,
            totalIncorrect,
            strongTopics,
            weakTopics,
            moduleAccuracy: Object.fromEntries(moduleAccuracy)
          }
        );
        
        // Map recommended module titles back to their ObjectIds, maintaining the order returned by the LLM
        const recommendedOrder: any[] = [];
        const skippedModules: any[] = [];

        const moduleMap = new Map<string, any>();
        courseModules.forEach(m => {
          moduleMap.set(m.title.toLowerCase().trim(), m);
        });

        const recommendedTitlesSet = new Set<string>();
        result.path.forEach((title: string) => {
          const key = title.toLowerCase().trim();
          const matchedModule = moduleMap.get(key);
          if (matchedModule) {
            recommendedOrder.push(matchedModule._id);
            recommendedTitlesSet.add(key);
          }
        });

        courseModules.forEach(m => {
          const key = m.title.toLowerCase().trim();
          if (!recommendedTitlesSet.has(key)) {
            skippedModules.push(m._id);
          }
        });

        // Save to PersonalizedPath collection
        await PersonalizedPath.findOneAndUpdate(
          { userId: req.user._id, courseId },
          {
            userId: req.user._id,
            courseId,
            recommendedOrder,
            skippedModules,
            additionalRecommendations: result.suggestions ? [result.suggestions] : []
          },
          { upsert: true, new: true }
        );

        // Initialize or verify ProgressTracking entries for the recommended modules to preserve progression flow
        await Promise.all(
          recommendedOrder.map((moduleId) =>
            ProgressTracking.findOneAndUpdate(
              { userId: req.user._id, courseId, moduleId },
              {
                $setOnInsert: {
                  userId: req.user._id,
                  courseId,
                  moduleId,
                  status: 'NOT_STARTED',
                  completionPercentage: 0,
                  lastAccessed: new Date()
                }
              },
              { upsert: true, new: true }
            )
          )
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

// @desc    Get personalized path for a course
// @route   GET /api/assessments/course/:courseId/path
// @access  Private
export const getPersonalizedPathForCourse = async (req: AuthRequest, res: Response) => {
  const courseId = req.params.courseId as string;

  try {
    const pathDoc = await PersonalizedPath.findOne({ userId: req.user._id, courseId })
      .populate('recommendedOrder')
      .populate('skippedModules');

    if (!pathDoc) {
      return res.status(200).json(null);
    }

    res.json(pathDoc);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
