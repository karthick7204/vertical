'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { assessmentService } from '@/services/assessmentService';
import { Assessment, Question } from '@/services/courseService';
import { learnerService } from '@/services/learnerService';
import { 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AssessmentPlayer() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [learnerAnswers, setLearnerAnswers] = useState<{ [key: number]: number }>({});
  const [personalizedPathData, setPersonalizedPathData] = useState<any>(null);
  const [fetchingPath, setFetchingPath] = useState(false);

  useEffect(() => {
    async function loadAssessment() {
      try {
        setLoading(true);
        const data = await assessmentService.getAssessmentByCourse(courseId);
        setAssessment(data);
      } catch (err) {
        console.error('Failed to load assessment', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [courseId]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !assessment) return;

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;

    setLearnerAnswers({
      ...learnerAnswers,
      [currentQuestionIndex]: selectedOption
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = async () => {
    if (!assessment) return;

    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished
      setIsFinished(true);
      try {
        // Record final score on server and trigger self-healing/recalculation
        await assessmentService.recordScore(courseId, score, assessment.questions.length);
      } catch (err) {
        console.error('Failed to save assessment score', err);
      }
    }
  };

  const fetchPathAndDisplay = async () => {
    try {
      setFetchingPath(true);
      const res = await learnerService.getPersonalizedPath(courseId);
      setPersonalizedPathData(res.data);
    } catch (err) {
      console.error('Failed to get path', err);
    } finally {
      setFetchingPath(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
          <XCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Assessment Not Found</h1>
        <p className="text-xs text-slate-500 mb-6 max-w-sm">This curriculum does not have an active evaluation layer yet.</p>
        <Link href="/dashboard/learner" className="btn-yellow px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs">
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  if (isFinished) {
    const finalScorePercent = Math.round((score / assessment.questions.length) * 100);

    return (
      <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
        <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-6 md:p-10">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full bg-white border border-slate-200/90 rounded-2xl p-8 md:p-12 shadow-xl shadow-slate-200/50 text-center"
          >
            <div className="w-16 h-16 rounded-2xl border border-indigo-100 bg-indigo-50 flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-xs">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Analysis Complete</h1>
            <p className="text-xs text-slate-500 mb-8">We have mapped your skill proficiency for: {assessment.title}</p>
            
            {personalizedPathData ? (
              <div className="text-left mb-8 border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  Your Optimized Learning Journey:
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {personalizedPathData.recommendedOrder.map((mod: any, index: number) => (
                    <div key={mod._id} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-lg shrink-0 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">{mod.title}</h4>
                        {mod.content && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{mod.content}</p>
                        )}
                        {mod.skillsCovered && mod.skillsCovered.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {mod.skillsCovered.map((skill: string, i: number) => (
                              <span key={i} className="bg-indigo-50 text-indigo-700 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-indigo-100">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-6 mb-8 text-center">
                <h3 className="text-base font-bold text-indigo-950 mb-2">Personalized Path Generated</h3>
                <p className="text-xs text-indigo-800 leading-relaxed font-normal max-w-md mx-auto">
                  Based on your responses, our AI has architected a bespoke learning trajectory to optimize your skill growth.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!personalizedPathData ? (
                <>
                  <button 
                    onClick={fetchPathAndDisplay}
                    disabled={fetchingPath}
                    className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 py-3.5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {fetchingPath ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        Analyzing Knowledge Base...
                      </>
                    ) : (
                      <>
                        View Personalized Path
                        <ChevronRight className="w-4 h-4 text-indigo-600" />
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => router.push(`/dashboard/learner/courses/${courseId}`)}
                    className="btn-yellow w-full py-3.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-2"
                  >
                    Launch Learning Path
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => router.push(`/dashboard/learner/courses/${courseId}`)}
                  className="btn-yellow w-full py-3.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-2"
                >
                  Launch Learning Path
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-3.5 rounded-xl font-semibold text-xs shadow-xs transition-all"
              >
                Re-take Assessment
              </button>
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-900">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/learner" className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Technical Evaluation</h1>
              <p className="text-xs text-slate-400 font-medium">{assessment.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="block text-[10px] font-medium text-slate-400">Progress</span>
              <span className="text-xs font-bold text-slate-800">{currentQuestionIndex + 1} of {assessment.questions.length}</span>
            </div>
            <div className="w-24 h-2 rounded-full bg-slate-200 hidden md:block overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
          <div className="max-w-3xl w-full">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold rounded-md">
                  Question {currentQuestionIndex + 1}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {currentQuestion.skillTags.map((tag, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3.5 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  className={`
                    p-5 rounded-2xl border text-left transition-all flex items-center justify-between
                    ${selectedOption === idx 
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs ring-1 ring-indigo-600' 
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      0{idx + 1}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end sticky bottom-8">
              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold text-xs shadow-xs transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  Lock Response
                  <Zap className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="btn-yellow px-8 py-3.5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
                >
                  {currentQuestionIndex === assessment.questions.length - 1 ? 'Generate Path' : 'Next Question'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
