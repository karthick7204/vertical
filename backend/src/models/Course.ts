import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  organizationId?: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  category: String,
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICourse>('Course', CourseSchema);
