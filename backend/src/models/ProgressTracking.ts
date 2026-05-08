import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressTracking extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completionPercentage: number;
  lastAccessed: Date;
}

const ProgressTrackingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], 
    default: 'NOT_STARTED' 
  },
  completionPercentage: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
});

export default mongoose.model<IProgressTracking>('ProgressTracking', ProgressTrackingSchema);
