import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionPerformance {
  questionText: string;
  chosenOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  relatedModuleId?: mongoose.Types.ObjectId;
  relatedModuleTitle: string;
}

export interface ILearnerScore extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  score: number;
  skillAnalysis: {
    strengths: string[];
    weaknesses: string[];
    aiSummary?: string;
  };
  skillScores: Map<string, number>;
  takenAt: Date;
  
  questionsPerformance: IQuestionPerformance[];
  moduleAccuracy: Map<string, number>;
  totalCorrect: number;
  totalIncorrect: number;
  scorePercentage: number;
  weakTopics: string[];
  strongTopics: string[];
}

const LearnerScoreSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  score: { type: Number, required: true },
  skillAnalysis: {
    strengths: [String],
    weaknesses: [String],
    aiSummary: String
  },
  skillScores: {
    type: Map,
    of: Number,
    default: {}
  },
  questionsPerformance: [{
    questionText: { type: String, required: true },
    chosenOption: { type: Number, required: true },
    correctAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    relatedModuleId: { type: Schema.Types.ObjectId, ref: 'Module' },
    relatedModuleTitle: { type: String, required: true }
  }],
  moduleAccuracy: {
    type: Map,
    of: Number,
    default: {}
  },
  totalCorrect: { type: Number, required: true },
  totalIncorrect: { type: Number, required: true },
  scorePercentage: { type: Number, required: true },
  weakTopics: [String],
  strongTopics: [String],
  takenAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILearnerScore>('LearnerScore', LearnerScoreSchema);
