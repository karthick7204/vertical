import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  userId?: mongoose.Types.ObjectId;
  recipientEmail: string;
  type: 'WELCOME' | 'INVITATION' | 'PROGRESS_REPORT' | 'REMINDER';
  status: 'SENT' | 'FAILED';
  sentAt: Date;
  aiContentPreview?: string;
}

const EmailLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  recipientEmail: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['WELCOME', 'INVITATION', 'PROGRESS_REPORT', 'REMINDER'], 
    required: true 
  },
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
  sentAt: { type: Date, default: Date.now },
  aiContentPreview: String
});

export default mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
