'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Loader2,
  Award,
  Zap,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { assessmentService, Assessment, Question } from '@/services/assessmentService';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await assessmentService.getAssessmentByCourseId(courseId);
        setAssessment(data);
      } catch (error) {
        console.error('Failed to fetch assessment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [courseId]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedOption === assessment?.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!assessment) return;

    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      // Submit score to backend
      try {
        await assessmentService.submitScore(courseId, score, assessment.questions.length);
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-10 text-center">
        <XCircle className="w-16 h-16 text-zinc-300 mb-6" />
        <h1 className="text-3xl font-black uppercase italic mb-4">Assessment Not Found</h1>
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-10">This curriculum does not have an active evaluation layer yet.</p>
        <Link href="/dashboard/learner" className="bg-black text-white px-10 py-4 font-black uppercase text-xs tracking-widest border-4 border-black hover:bg-brand-primary transition-all">
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  if (isFinished) {
    const finalScorePercent = Math.round((score / assessment.questions.length) * 100);
    const isPassed = finalScorePercent >= 70;

    return (
      <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 md:p-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full bg-white border-4 border-black p-12 shadow-[16px_16px_0px_0px_#000000] text-center"
          >
            <div className={`w-24 h-24 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 ${isPassed ? 'bg-brand-primary' : 'bg-red-500'}`}>
              <Award className="w-12 h-12 text-black" />
            </div>
            
            <h1 className="text-4xl font-black uppercase tracking-tight italic mb-2">Evaluation Complete</h1>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-10">Curriculum: {assessment.title}</p>
            
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-zinc-50 border-4 border-black p-6">
                <span className="block text-[10px] font-black uppercase tracking-widest mb-2">Final Score</span>
                <span className="text-4xl font-black italic">{finalScorePercent}%</span>
              </div>
              <div className="bg-zinc-50 border-4 border-black p-6">
                <span className="block text-[10px] font-black uppercase tracking-widest mb-2">Status</span>
                <span className={`text-4xl font-black italic ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/dashboard/learner" className="flex-1 bg-black text-white px-8 py-5 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_#facc15] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Back to Roadmap
              </Link>
              {!isPassed && (
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-white border-4 border-black px-8 py-5 font-black uppercase text-xs tracking-widest hover:bg-zinc-100 transition-all"
                >
                  Retry Assessment
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-zinc-50 flex flex-col text-black">
        <header className="h-24 border-b-4 border-black bg-white flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/learner" className="p-2 border-2 border-black hover:bg-zinc-100 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight italic">Technical Evaluation</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{assessment.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[10px] font-black uppercase text-zinc-500">Progress</span>
              <span className="text-lg font-black italic">{currentQuestionIndex + 1} / {assessment.questions.length}</span>
            </div>
            <div className="w-16 h-2 border-2 border-black bg-zinc-100 hidden md:block">
              <div 
                className="h-full bg-brand-primary" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
          <div className="max-w-4xl w-full">
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-black text-white px-3 py-1 text-[10px] font-black italic uppercase tracking-widest">
                  Question {currentQuestionIndex + 1}
                </span>
                <div className="flex gap-1">
                  {currentQuestion.skillTags.map((tag, i) => (
                    <span key={i} className="bg-brand-primary/20 border border-black/10 px-2 py-0.5 text-[8px] font-black uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-10">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  className={`
                    p-6 border-4 border-black text-left transition-all flex items-center justify-between
                    ${selectedOption === idx ? 'bg-black text-white scale-[1.02]' : 'bg-white hover:bg-zinc-50'}
                    ${isAnswered && idx === currentQuestion.correctAnswer ? '!bg-green-500 !text-black shadow-[4px_4px_0px_0px_#000000]' : ''}
                    ${isAnswered && selectedOption === idx && idx !== currentQuestion.correctAnswer ? '!bg-red-500 !text-black' : ''}
                    ${!isAnswered && 'shadow-[4px_4px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none'}
                  `}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black italic opacity-30">0{idx + 1}</span>
                    <span className="font-bold">{option}</span>
                  </div>
                  {isAnswered && idx === currentQuestion.correctAnswer && <CheckCircle2 className="w-6 h-6" />}
                  {isAnswered && selectedOption === idx && idx !== currentQuestion.correctAnswer && <XCircle className="w-6 h-6" />}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {isAnswered && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-brand-primary/10 border-4 border-black p-8 mb-10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-5 h-5" />
                    <h4 className="font-black uppercase text-sm tracking-widest italic">AI Rationale</h4>
                  </div>
                  <p className="text-sm font-bold text-zinc-800 leading-relaxed italic">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end sticky bottom-10">
              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="bg-black text-white px-12 py-5 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_#facc15] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none flex items-center gap-3"
                >
                  Confirm Choice
                  <Zap className="w-4 h-4 fill-brand-primary" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-brand-primary border-4 border-black px-12 py-5 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3"
                >
                  {currentQuestionIndex === assessment.questions.length - 1 ? 'Finalize Evaluation' : 'Next Question'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
