import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Vertical API is running');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI!, {
  family: 4,
  serverSelectionTimeoutMS: 15000,
  heartbeatFrequencyMS: 2000,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
