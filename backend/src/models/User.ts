import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'LEARNER';
  organizationId?: mongoose.Types.ObjectId;
  isActivated: boolean;
  activationToken?: string;
  refreshToken?: string;
  profileImage?: string;
  department?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'HR_ADMIN', 'LEARNER'], 
    default: 'LEARNER' 
  },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  isActivated: { type: Boolean, default: false },
  activationToken: String,
  refreshToken: String,
  profileImage: String,
  department: String,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model<IUser>('User', UserSchema);
