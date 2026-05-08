import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonalizedPath extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  recommendedOrder: mongoose.Types.ObjectId[];
  skippedModules: mongoose.Types.ObjectId[];
  additionalRecommendations: string[];
  generatedAt: Date;
}

const PersonalizedPathSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  recommendedOrder: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  skippedModules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  additionalRecommendations: [String],
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPersonalizedPath>('PersonalizedPath', PersonalizedPathSchema);
