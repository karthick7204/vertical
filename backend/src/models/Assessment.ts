import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  courseId?: mongoose.Types.ObjectId;
  title: string;
  type: 'ONBOARDING' | 'MODULE_QUIZ';
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    skillTags: string[];
  }[];
}

const AssessmentSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  title: String,
  type: { type: String, enum: ['ONBOARDING', 'MODULE_QUIZ'], required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
    skillTags: [String]
  }]
});

export default mongoose.model<IAssessment>('Assessment', AssessmentSchema);
