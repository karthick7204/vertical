import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailJob extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'SENT' | 'FAILED';
  scheduledAt: Date;
  attempts: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailJobSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'SENT', 'FAILED'], 
    default: 'PENDING' 
  },
  scheduledAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  errorMessage: String
}, {
  timestamps: true
});

export default mongoose.model<IEmailJob>('EmailJob', EmailJobSchema);
