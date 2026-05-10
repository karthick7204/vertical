import mongoose, { Schema, Document } from 'mongoose';

export interface ISubModule {
  title: string;
  content?: string;
  videoUrl?: string;
}

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
  skillsCovered: string[];
  estimatedTime?: number;
  subModules: ISubModule[];
}

const ModuleSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: String,
  videoUrl: String,
  order: { type: Number, required: true },
  skillsCovered: [String],
  estimatedTime: Number,
  subModules: [{
    title: { type: String, required: true },
    content: String,
    videoUrl: String
  }]
});

export default mongoose.model<IModule>('Module', ModuleSchema);
