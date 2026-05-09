import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: 'enrolled' | 'in-progress' | 'completed';
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
}

const EnrollmentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['enrolled', 'in-progress', 'completed'], default: 'enrolled' },
  progress: { type: Number, default: 0 },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Ensure a user can only enroll in a course once
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
