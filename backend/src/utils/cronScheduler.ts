import cron from 'node-cron';
import EmailJob from '../models/EmailJob.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import LearnerScore from '../models/LearnerScore.js';
import PersonalizedPath from '../models/PersonalizedPath.js';
import Assessment from '../models/Assessment.js';
import EmailLog from '../models/EmailLog.js';
import Module from '../models/Module.js'; // Ensure Module schema is registered for populate
import sendEmail from './sendEmail.js';

export const processPendingEmailJobs = async () => {
  // Find all pending email jobs that are scheduled for now or in the past
  const jobs = await EmailJob.find({
    status: 'PENDING',
    scheduledAt: { $lte: new Date() }
  });

  if (jobs.length === 0) {
    return;
  }

  console.log(`[Cron] Found ${jobs.length} pending email jobs to process.`);

  for (const job of jobs) {
    try {
      job.attempts += 1;
      
      const user = await User.findById(job.userId);
      const course = await Course.findById(job.courseId);

      if (!user) {
        throw new Error(`User with ID ${job.userId} not found`);
      }
      if (!course) {
        throw new Error(`Course with ID ${job.courseId} not found`);
      }

      // Find assessment associated with the course
      const assessment = await Assessment.findOne({ courseId: course._id });
      if (!assessment) {
        throw new Error(`Assessment for course ${course.title} not found`);
      }

      // Find latest learner score for this assessment
      const scoreRecord = await LearnerScore.findOne({ 
        userId: user._id, 
        assessmentId: assessment._id 
      }).sort({ takenAt: -1 });

      if (!scoreRecord) {
        throw new Error(`LearnerScore record not found for user ${user.name} and assessment ${assessment.title}`);
      }

      // Find personalized path
      const pathDoc = await PersonalizedPath.findOne({ 
        userId: user._id, 
        courseId: course._id 
      }).populate('recommendedOrder').populate('skippedModules');

      if (!pathDoc) {
        throw new Error(`PersonalizedPath record not found for user ${user.name} and course ${course.title}`);
      }

      // Extract details
      const scorePercentage = scoreRecord.scorePercentage;
      const totalQuestions = scoreRecord.totalCorrect + scoreRecord.totalIncorrect;
      const correctQuestions = scoreRecord.totalCorrect;
      
      // Dynamic rendering of weak modules / skill gaps
      const weakTopicsList = scoreRecord.weakTopics || [];
      
      // Dynamic rendering of strong areas mastered
      const strongTopicsList = scoreRecord.strongTopics || [];

      // Modules the learner still needs to study
      const recommendedModules = (pathDoc.recommendedOrder || []) as any[];

      // Construct HTML
      const weakTopicsHTML = weakTopicsList.length > 0 
        ? weakTopicsList.map(topic => `<span class="topic-tag-weak">${topic}</span>`).join('') 
        : '<span style="font-size: 12px; color: #71717a; font-style: italic; font-weight: bold; text-transform: uppercase;">No weak areas identified!</span>';

      const strongTopicsHTML = strongTopicsList.length > 0 
        ? strongTopicsList.map(topic => `<span class="topic-tag-strong">${topic}</span>`).join('') 
        : '<span style="font-size: 12px; color: #71717a; font-style: italic; font-weight: bold; text-transform: uppercase;">No modules mastered yet.</span>';

      const modulesHTML = recommendedModules.length > 0 
        ? recommendedModules.map((mod, idx) => `
            <div class="module-item">
              <div style="display: flex; align-items: start;">
                <span class="module-number">${idx + 1}</span>
                <div style="flex: 1;">
                  <span class="module-title">${mod.title}</span>
                  ${mod.content ? `<p class="module-desc">${mod.content}</p>` : ''}
                  ${mod.skillsCovered && mod.skillsCovered.length > 0 ? `
                    <div class="module-skills">
                      ${mod.skillsCovered.map((skill: string) => `<span class="module-skill-badge">${skill}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')
        : '<p style="font-size: 12px; color: #71717a; font-style: italic; font-weight: bold; text-transform: uppercase;">You have successfully mastered all course modules! No additional study needed.</p>';

      const ctaUrl = `http://localhost:3000/dashboard/learner/courses/${course._id}`;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Personalized Learning Roadmap</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f5;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
      -ms-text-size-adjust: none;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border: 4px solid #000000;
      box-shadow: 10px 10px 0px #000000;
      padding: 0;
    }
    .header-banner {
      background-color: #facc15;
      border-bottom: 4px solid #000000;
      padding: 30px;
      text-align: center;
    }
    .header-title {
      font-family: 'Outfit', 'Arial Black', sans-serif;
      font-size: 26px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -1px;
      margin: 0;
      font-style: italic;
      color: #000000;
    }
    .header-subtitle {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 5px;
      margin-bottom: 0;
      color: #000000;
    }
    .content-area {
      padding: 30px;
      color: #000000;
    }
    .greeting {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 15px;
    }
    .intro-text {
      font-size: 13px;
      line-height: 1.6;
      color: #18181b;
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      border-bottom: 2px solid #000000;
      padding-bottom: 5px;
      margin-top: 30px;
      margin-bottom: 15px;
      letter-spacing: 1px;
    }
    .summary-card {
      background-color: #ffffff;
      border: 3px solid #000000;
      padding: 20px;
      margin-bottom: 25px;
      box-shadow: 4px 4px 0px #000000;
    }
    .badge-yellow {
      background-color: #facc15;
      color: #000000;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 3px 8px;
      border: 1px solid #000000;
      display: inline-block;
    }
    .score-large {
      font-size: 32px;
      font-weight: 900;
      font-style: italic;
      margin: 10px 0;
    }
    .topic-container {
      margin-top: 10px;
    }
    .topic-tag-weak {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1.5px solid #000000;
      padding: 4px 8px;
      margin: 3px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      display: inline-block;
    }
    .topic-tag-strong {
      background-color: #dcfce7;
      color: #166534;
      border: 1.5px solid #000000;
      padding: 4px 8px;
      margin: 3px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      display: inline-block;
    }
    .module-item {
      border-bottom: 2px solid #000000;
      padding: 15px 0;
    }
    .module-item:last-child {
      border-bottom: none;
    }
    .module-number {
      background-color: #000000;
      color: #facc15;
      font-size: 11px;
      font-weight: 900;
      font-style: italic;
      width: 22px;
      height: 22px;
      text-align: center;
      line-height: 22px;
      display: inline-block;
      margin-right: 12px;
      border: 1.5px solid #000000;
    }
    .module-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      display: inline-block;
    }
    .module-desc {
      font-size: 11px;
      color: #4b5563;
      margin: 5px 0 0 34px;
      line-height: 1.5;
    }
    .module-skills {
      margin: 8px 0 0 34px;
    }
    .module-skill-badge {
      background-color: #f4f4f5;
      color: #000000;
      border: 1px solid #000000;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 5px;
      margin-right: 4px;
      margin-bottom: 4px;
      display: inline-block;
    }
    .cta-area {
      text-align: center;
      margin-top: 35px;
      margin-bottom: 10px;
    }
    .cta-button {
      background-color: #facc15;
      color: #000000;
      border: 3px solid #000000;
      box-shadow: 4px 4px 0px #000000;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 14px 28px;
      text-decoration: none;
      display: inline-block;
    }
    .footer {
      background-color: #000000;
      color: #a1a1aa;
      padding: 25px;
      text-align: center;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-top: 4px solid #000000;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <h1 class="header-title">Personalized Roadmap</h1>
      <p class="header-subtitle">Vertical Intelligent Learning System</p>
    </div>
    
    <div class="content-area">
      <div class="greeting">Hey ${user.name},</div>
      <p class="intro-text">
        Great work completing the initial technical assessment for <strong>${course.title}</strong>! 
        Our AI has analyzed your skills, identified gaps, and generated an optimized path just for you. 
        Here is your personalized report.
      </p>
      
      <div class="section-title">Assessment Summary</div>
      <div class="summary-card">
        <span class="badge-yellow">Overall Score</span>
        <div class="score-large">${scorePercentage}%</div>
        <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #52525b;">
          Correct Responses: ${correctQuestions} / ${totalQuestions}
        </p>
      </div>

      <div class="section-title">Skills Mastered</div>
      <div class="topic-container" style="margin-bottom: 25px;">
        ${strongTopicsHTML}
      </div>

      <div class="section-title">Identified Skill Gaps</div>
      <div class="topic-container" style="margin-bottom: 25px;">
        ${weakTopicsHTML}
      </div>
      
      <div class="section-title">Your AI-Curated Learning Path</div>
      <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #71717a; margin-bottom: 15px;">
        The following modules are recommended in order to close your skill gaps:
      </p>
      <div style="border: 3px solid #000000; padding: 15px; background-color: #ffffff; box-shadow: 4px 4px 0px #000000; margin-bottom: 30px;">
        ${modulesHTML}
      </div>

      ${pathDoc.additionalRecommendations && pathDoc.additionalRecommendations.length > 0 ? `
        <div class="section-title">AI Focus Suggestions</div>
        <div style="background-color: #f4f4f5; border: 2.5px solid #000000; padding: 15px; font-size: 12px; line-height: 1.6; margin-bottom: 20px; font-style: italic;">
          "${pathDoc.additionalRecommendations.join(' ')}"
        </div>
      ` : ''}

      <div class="cta-area">
        <a href="${ctaUrl}" class="cta-button">Launch Your Course</a>
      </div>
    </div>
    
    <div class="footer">
      &copy; ${new Date().getFullYear()} Vertical Inc. | All rights reserved.
    </div>
  </div>
</body>
</html>
      `;

      // Log Email details in Mongoose EmailLog before sending
      await EmailLog.create({
        userId: user._id,
        recipientEmail: user.email,
        type: 'PROGRESS_REPORT',
        status: 'SENT',
        aiContentPreview: `Roadmap email sent for course ${course.title} with score ${scorePercentage}%`
      });

      // Send actual email
      await sendEmail({
        email: user.email,
        subject: `[Roadmap Generated] ${course.title} Personalized Learning Path`,
        message: `Hi ${user.name},\n\nYour personalized learning path for the course "${course.title}" has been successfully generated!\n\nScore: ${scorePercentage}%\nModules to study: ${recommendedModules.map(m => m.title).join(', ')}\n\nLink to start: ${ctaUrl}`,
        html: emailHtml
      });

      // Mark job as SENT
      job.status = 'SENT';
      await job.save();
      console.log(`[Cron] Email successfully processed and sent to ${user.email} for course ${course.title}.`);

    } catch (error: any) {
      console.error(`[Cron] Error processing email job ${job._id}:`, error.message);
      job.status = 'FAILED';
      job.errorMessage = error.message;
      await job.save();
      
      // Also log failure in EmailLog
      try {
        await EmailLog.create({
          userId: job.userId,
          recipientEmail: 'unknown',
          type: 'PROGRESS_REPORT',
          status: 'FAILED',
          aiContentPreview: `Failed to send roadmap email: ${error.message}`
        });
      } catch (logErr) {
        console.error('[Cron] Failed to log email error to DB:', logErr);
      }
    }
  }
};

// Register the cron job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('[Cron] Checking for pending email jobs...');
  try {
    await processPendingEmailJobs();
  } catch (err: any) {
    console.error('[Cron] Error running cron scheduler tick:', err.message);
  }
});

console.log('[Cron] Scheduler initialized. Running checked tasks every minute.');
