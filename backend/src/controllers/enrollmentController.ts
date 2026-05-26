import { type Response } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import PersonalizedPath from '../models/PersonalizedPath.js';
import ProgressTracking from '../models/ProgressTracking.js';
import Module from '../models/Module.js';


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

    const populated = await Enrollment.findById(enrollment._id).populate('courseId');
    broadcastProgressUpdate({
      type: 'ENROLLMENT_CREATED',
      userId: req.user._id.toString(),
      enrollment: populated
    });

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to recalculate enrollment progress based on actual completed modules/lessons
export const recalculateEnrollmentProgress = async (userId: any, courseId: any) => {
  try {
    if (!userId || !courseId) return null;
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) return null;

    const pathDoc = await PersonalizedPath.findOne({ userId, courseId });
    let overallProgress = 0;

    if (pathDoc && pathDoc.recommendedOrder.length > 0) {
      const allProgress = await ProgressTracking.find({
        userId,
        courseId,
        moduleId: { $in: pathDoc.recommendedOrder }
      });

      const totalPathModules = pathDoc.recommendedOrder.length;
      let sum = 0;
      allProgress.forEach(p => {
        sum += p.completionPercentage || 0;
      });
      overallProgress = Math.round(sum / totalPathModules);
    } else {
      // Fallback: use all modules in the course
      const allModules = await Module.find({ courseId });
      const totalModules = allModules.length;
      if (totalModules > 0) {
        const moduleIds = allModules.map(m => m._id);
        const allProgress = await ProgressTracking.find({
          userId,
          courseId,
          moduleId: { $in: moduleIds }
        });
        let sum = 0;
        allProgress.forEach(p => {
          sum += p.completionPercentage || 0;
        });
        overallProgress = Math.round(sum / totalModules);
      }
    }

    overallProgress = Math.min(100, Math.max(0, overallProgress));

    // Determine correct status
    let status = enrollment.status;
    let completedAt = enrollment.completedAt;

    if (overallProgress === 100) {
      status = 'completed';
      completedAt = completedAt || new Date();
    } else if (overallProgress > 0) {
      status = 'in-progress';
      completedAt = undefined;
    } else {
      status = 'enrolled';
      completedAt = undefined;
    }

    if (enrollment.progress !== overallProgress || enrollment.status !== status) {
      enrollment.progress = overallProgress;
      enrollment.status = status as any;
      enrollment.completedAt = completedAt as any;
      await enrollment.save();

      // Broadcast progress update in real-time
      broadcastProgressUpdate({
        type: 'PROGRESS_UPDATE',
        userId: userId.toString(),
        courseId: courseId.toString(),
        progress: enrollment.progress,
        status: enrollment.status,
        score: enrollment.score,
        totalQuestions: enrollment.totalQuestions,
        completedAt: enrollment.completedAt
      });
    }

    return enrollment;
  } catch (error) {
    console.error('Error in recalculateEnrollmentProgress:', error);
    return null;
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

    // Recalculate progress for each enrollment to self-heal
    await Promise.all(
      enrollments.map((e) => {
        const cId = e.courseId?._id || e.courseId;
        if (cId) {
          return recalculateEnrollmentProgress(req.user._id, cId);
        }
        return Promise.resolve(null);
      })
    );

    // Fetch the updated enrollments to return to frontend
    const updatedEnrollments = await Enrollment.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    res.json(updatedEnrollments);
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

    const { userId, courseId } = enrollment;

    // Delete associated PersonalizedPath
    await PersonalizedPath.deleteOne({ userId, courseId });

    // Delete associated ProgressTracking records
    await ProgressTracking.deleteMany({ userId, courseId });

    // Clear personalized path and focus suggestions from user profile
    const userObj = await User.findById(userId);
    if (userObj) {
      userObj.personalizedPath = [];
      userObj.focusSuggestions = '';
      await userObj.save();
    }

    await enrollment.deleteOne();
    
    broadcastProgressUpdate({
      type: 'ENROLLMENT_CANCELLED',
      userId: req.user._id.toString(),
      enrollmentId: req.params.id
    });

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

    // Recalculate progress for all retrieved learner enrollments to self-heal reports
    await Promise.all(
      enrollments.map((e) => recalculateEnrollmentProgress(e.userId, (e.courseId as any)?._id || e.courseId))
    );

    // Fetch fresh populated enrollments
    const freshEnrollments = await Enrollment.find({ userId: { $in: learnerIds } })
      .populate('courseId', 'title category')
      .sort({ enrolledAt: -1 });

    const report = learners.map(learner => {
      const learnerEnrollments = freshEnrollments.filter(e => e.userId.toString() === learner._id.toString());
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

// --- Real-time SSE Progress Stream ---

interface SSEClient {
  id: string;
  userId: string;
  res: Response;
}

let sseClients: SSEClient[] = [];

export const progressStreamHandler = (req: AuthRequest, res: Response) => {
  const userId = req.user?._id?.toString();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  const newClient: SSEClient = {
    id: clientId,
    userId,
    res
  };

  sseClients.push(newClient);

  res.write(': keep-alive\n\n');

  const keepAliveInterval = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
};

export const broadcastProgressUpdate = (eventData: any) => {
  const dataString = JSON.stringify(eventData);
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${dataString}\n\n`);
    } catch (err) {
      console.error('Failed to write to SSE client:', err);
    }
  });
};


