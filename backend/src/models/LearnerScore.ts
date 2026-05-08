import mongoose, { Schema, Document } from 'mongoose';

export interface ILearnerScore extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  score: number;
  skillAnalysis: {
    strengths: string[];
    weaknesses: string[];
    aiSummary?: string;
  };
  takenAt: Date;
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
  takenAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILearnerScore>('LearnerScore', LearnerScoreSchema);
