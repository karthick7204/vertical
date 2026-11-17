'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  BookOpen, 
  Search, 
  Award, 
  Clock, 
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  LogOut,
  Zap,
  Trash2,
  Info,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { courseService } from '@/services/courseService';
import { learnerService, Enrollment } from '@/services/learnerService';
import { assessmentService } from '@/services/assessmentService';

export default function LearnerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courses, enrollments] = await Promise.all([
          courseService.getAllCourses(),
          learnerService.getMyEnrollments()
        ]);
        
        // Filter out courses the user is already enrolled in
        const enrolledCourseIds = new Set(enrollments.map(e => e.courseId._id));
        const filteredAvailable = courses.filter((c: any) => !enrolledCourseIds.has(c._id));
        
        setAvailableCourses(filteredAvailable);
        setMyEnrollments(enrollments);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const token = typeof window !== 'undefined' ? localStorage.getItem('verticle_token') : null;
    let eventSource: EventSource | null = null;

    if (token) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      eventSource = new EventSource(`${API_BASE}/enrollments/progress-stream?token=${token}`);

      eventSource.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          
          if (update.userId === user?.id) {
            if (update.type === 'PROGRESS_UPDATE') {
              setMyEnrollments((prevEnrollments) => {
                return prevEnrollments.map((e) => {
                  if (e.courseId._id === update.courseId) {
                    return {
                      ...e,
                      progress: update.progress,
                      status: update.status,
                      score: update.score,
                      totalQuestions: update.totalQuestions
                    };
                  }
                  return e;
                });
              });
            } else if (update.type === 'ENROLLMENT_CREATED') {
              setMyEnrollments((prev) => {
                const exists = prev.some(e => e._id === update.enrollment._id);
                if (exists) return prev;
                return [update.enrollment, ...prev];
              });
              setAvailableCourses((prev) => prev.filter(c => c._id !== update.enrollment.courseId._id));
            } else if (update.type === 'ENROLLMENT_CANCELLED') {
              setMyEnrollments((prev) => prev.filter(e => e._id !== update.enrollmentId));
              fetchData();
            }
          }
        } catch (err) {
          console.error('Error parsing SSE in learner page:', err);
        }
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user?.id]);

  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<any | null>(null);
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState(false);

  const promptEnroll = (course: any) => {
    setSelectedCourseForEnroll(course);
    setShowAssessmentPrompt(true);
  };

  const handleConfirmAssessment = async () => {
    if (!selectedCourseForEnroll) return;
    const courseId = selectedCourseForEnroll._id;
    try {
      setLoading(true);
      setShowAssessmentPrompt(false);
      await learnerService.enroll(courseId);
      router.push(`/dashboard/learner/courses/${courseId}/assessment`);
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll in the curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAssessment = async () => {
    if (!selectedCourseForEnroll) return;
    const courseId = selectedCourseForEnroll._id;
    try {
      setLoading(true);
      setShowAssessmentPrompt(false);
      await learnerService.enroll(courseId);
      // Refresh data
      const [courses, enrollments] = await Promise.all([
        courseService.getAllCourses(),
        learnerService.getMyEnrollments()
      ]);
      const enrolledCourseIds = new Set(enrollments.map(e => e.courseId._id));
      setAvailableCourses(courses.filter((c: any) => !enrolledCourseIds.has(c._id)));
      setMyEnrollments(enrollments);
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll in the curriculum.');
    } finally {
      setLoading(false);
      setSelectedCourseForEnroll(null);
    }
  };

  const handleCancelEnroll = () => {
    setShowAssessmentPrompt(false);
    setSelectedCourseForEnroll(null);
  };

  const [enrollmentIdToCancel, setEnrollmentIdToCancel] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const promptCancelEnrollment = (enrollmentId: string) => {
    setEnrollmentIdToCancel(enrollmentId);
    setShowCancelConfirmation(true);
  };

  const confirmCancelEnrollment = async () => {
    if (!enrollmentIdToCancel) return;
    try {
      setLoading(true);
      setShowCancelConfirmation(false);
      await learnerService.cancelEnrollment(enrollmentIdToCancel);
      // Refresh data
      const [courses, enrollments] = await Promise.all([
        courseService.getAllCourses(),
        learnerService.getMyEnrollments()
      ]);
      const enrolledCourseIds = new Set(enrollments.map(e => e.courseId._id));
      setAvailableCourses(courses.filter((c: any) => !enrolledCourseIds.has(c._id)));
      setMyEnrollments(enrollments);
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel enrollment.');
    } finally {
      setLoading(false);
      setEnrollmentIdToCancel(null);
    }
  };

  const closeCancelConfirmation = () => {
    setShowCancelConfirmation(false);
    setEnrollmentIdToCancel(null);
  };

  const [selectedCourseForPath, setSelectedCourseForPath] = useState<any | null>(null);
  const [personalizedPathData, setPersonalizedPathData] = useState<any | null>(null);
  const [loadingPath, setLoadingPath] = useState(false);

  const handleViewPersonalizedPath = async (course: any) => {
    setSelectedCourseForPath(course);
    setLoadingPath(true);
    try {
      const data = await assessmentService.getPersonalizedPath(course._id);
      setPersonalizedPathData(data);
    } catch (error) {
      console.error('Failed to fetch personalized path:', error);
      setPersonalizedPathData({
        recommendedOrder: [],
        suggestions: "No personalized path generated yet. Please take the initial assessment."
      });
    } finally {
      setLoadingPath(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-50/60 flex text-slate-900">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col fixed h-full z-20">
          <div className="p-6 border-b border-slate-200 bg-white">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <span className="font-display font-bold tracking-tight text-xl text-slate-900">VERTICLE</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1.5">
            <Link href="/dashboard/learner" className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-semibold text-xs shadow-xs transition-all">
              <LayoutDashboard className="w-4 h-4" />
              My Roadmap
            </Link>
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <Search className="w-4 h-4" />
              Catalog
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <Award className="w-4 h-4" />
              Credentials
            </button>
          </nav>

          <div className="p-4 border-t border-slate-200">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium text-xs"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 overflow-y-auto">
          <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Mission Control</h1>
              <p className="text-xs text-slate-400 font-medium">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Global Rank</span>
                <span className="text-sm font-bold text-indigo-600">Top 4%</span>
              </div>
              <div className="w-10 h-10 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>

          <div className="p-8 max-w-6xl">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: 'Active Curricula', val: myEnrollments.length, icon: BookOpen, tint: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
                { label: 'Certifications', val: '02', icon: Award, tint: 'bg-sky-50 border-sky-100 text-sky-600' },
                { label: 'Learning Velocity', val: '94%', icon: TrendingUp, tint: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl border ${stat.tint}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* My Active Courses */}
            <section className="mb-14">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-indigo-600" />
                Active Learning Roadmap
              </h2>
              
              {/* AI Personalized Path */}
              {user?.personalizedPath && user.personalizedPath.length > 0 && (
                <div className="mb-10 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50 border border-indigo-100 rounded-2xl p-7 shadow-xs relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-indigo-100/90 text-indigo-700 px-3 py-1 text-xs font-semibold rounded-full">
                    AI Architected Path
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-slate-900 text-base font-bold mb-5 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      Optimized Trajectory
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {user.personalizedPath.map((moduleName: string, i: number) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white/80 border border-indigo-100 px-3.5 py-2 rounded-xl shadow-xs">
                          <div className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs">
                            {i + 1}
                          </div>
                          <span className="text-slate-800 text-xs font-semibold">{moduleName}</span>
                          {i < (user.personalizedPath?.length || 0) - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 ml-1" />
                          )}
                        </div>
                      ))}
                    </div>

                    {user?.focusSuggestions && (
                      <div className="mt-6 pt-5 border-t border-indigo-100/80">
                        <h4 className="text-indigo-900 text-xs font-semibold mb-2 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-indigo-600" />
                          AI Success Directives
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-normal bg-white/60 p-3 rounded-xl border border-indigo-100/60">
                          "{user.focusSuggestions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myEnrollments.length > 0 ? (
                  myEnrollments.map((enrollment) => (
                    <motion.div 
                      key={enrollment._id}
                      whileHover={{ y: -2 }}
                      onClick={() => handleViewPersonalizedPath(enrollment.courseId)}
                      className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col cursor-pointer overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-100 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-lg">
                            {enrollment.courseId.category}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                          {enrollment.courseId.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                          {enrollment.courseId.description}
                        </p>
                        {enrollment.score !== undefined && enrollment.score !== null && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-semibold rounded-lg w-fit mt-3">
                            <Award className="w-3.5 h-3.5" />
                            Assessed: {Math.round((enrollment.score / enrollment.totalQuestions!) * 100)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex-1 mr-6">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs font-medium text-slate-500">Progress</span>
                            <span className="text-xs font-bold text-slate-700">{enrollment.progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              promptCancelEnrollment(enrollment._id);
                            }}
                            className="bg-white border border-slate-200 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-xs"
                            title="Cancel Enrollment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                           {enrollment.status === 'completed' ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold">
                                <Award className="w-3.5 h-3.5" />
                                Passed: {Math.round((enrollment.score! / enrollment.totalQuestions!) * 100)}%
                              </div>
                              <Link 
                                href={`/dashboard/learner/courses/${enrollment.courseId._id}/assessment`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-medium text-indigo-600 hover:underline"
                              >
                                Review Results
                              </Link>
                            </div>
                          ) : enrollment.progress > 0 ? (
                            <Link 
                              href={`/dashboard/learner/courses/${enrollment.courseId._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition-all"
                            >
                              Resume
                            </Link>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPersonalizedPath(enrollment.courseId);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition-all"
                            >
                              Launch
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 border border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-white">
                    <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
                    <h3 className="font-bold text-slate-600">No active curricula detected</h3>
                    <p className="text-xs text-slate-400 mt-1">Enroll in a course from the catalog below to begin</p>
                  </div>
                )}
              </div>
            </section>

            {/* Organization Directives */}
            {availableCourses.some(c => (c.organizationId?._id || c.organizationId) === user?.organizationId) && (
              <section className="mb-14">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Directives from {availableCourses.find(c => (c.organizationId?._id || c.organizationId) === user?.organizationId)?.organizationId?.name || 'Your Organization'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableCourses
                    .filter(c => (c.organizationId?._id || c.organizationId) === user?.organizationId)
                    .map((course) => (
                      <div key={course._id} className="bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 border border-indigo-100 rounded-2xl p-7 shadow-xs relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-indigo-100/90 text-indigo-700 px-3 py-1 text-xs font-semibold rounded-full">
                          Internal Deployment
                        </div>
                        <div className="relative z-10">
                          <span className="text-xs font-medium text-slate-500 block mb-2">
                            {course.category}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-3 mb-6 max-w-lg leading-relaxed">
                            {course.description}
                          </p>
                          <button 
                            onClick={() => promptEnroll(course)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
                          >
                            Initialize Training
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Award className="w-32 h-32 text-indigo-600" />
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Recommended/Available Catalog */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <Search className="w-5 h-5 text-indigo-600" />
                Global Intelligence Catalog
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableCourses
                  .filter(c => (c.organizationId?._id || c.organizationId) !== user?.organizationId)
                  .map((course) => (
                    <div key={course._id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col hover:border-slate-300 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-lg inline-block mb-3">
                          {course.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => promptEnroll(course)}
                        className="w-full border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        Enroll Now
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </main>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showAssessmentPrompt && selectedCourseForEnroll && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-900/10 text-slate-900 relative"
              >
                <button 
                  onClick={handleCancelEnroll}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-all"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Initiate Training</h3>
                </div>

                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Curriculum: {selectedCourseForEnroll.title}
                </p>
                
                <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  This training includes a personalized skill assessment layer. Would you like to take the assessment now to customize your learning path?
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleConfirmAssessment}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    Yes, Take Assessment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleSkipAssessment}
                    className="w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    No, Just Enroll
                  </button>
                  
                  <button
                    onClick={handleCancelEnroll}
                    className="w-full text-slate-400 hover:text-slate-600 py-2 font-medium text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirmation && enrollmentIdToCancel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-900/10 text-slate-900 relative"
              >
                <button 
                  onClick={closeCancelConfirmation}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-all"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl border border-rose-100 bg-rose-50 flex items-center justify-center text-rose-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Cancel Enrollment</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  Are you sure you want to cancel this enrollment? This will remove the curriculum from your active roadmap and reset all progress.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={confirmCancelEnrollment}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    Remove
                  </button>
                  
                  <button
                    onClick={closeCancelConfirmation}
                    className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    Keep
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Personalized Path Modal */}
        <AnimatePresence>
          {selectedCourseForPath && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-900/10 text-slate-900 relative"
              >
                <button 
                  onClick={() => {
                    setSelectedCourseForPath(null);
                    setPersonalizedPathData(null);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-all"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Personalized Roadmap</h3>
                </div>

                <p className="text-xs font-semibold text-slate-500 mb-6">
                  Curriculum: {selectedCourseForPath.title}
                </p>

                {loadingPath ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                    <span className="text-xs font-semibold text-slate-500">Loading Optimized Trajectory...</span>
                  </div>
                ) : personalizedPathData && personalizedPathData.recommendedOrder && personalizedPathData.recommendedOrder.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-left border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        Sequence of Study
                      </h5>
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                        {personalizedPathData.recommendedOrder.map((mod: any, index: number) => (
                          <div key={mod._id} className="flex gap-3.5 items-start bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                            <div className="bg-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-lg shrink-0 flex items-center justify-center">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h6 className="font-semibold text-sm text-slate-900">{mod.title}</h6>
                              {mod.content && (
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">{mod.content}</p>
                              )}
                              {mod.skillsCovered && mod.skillsCovered.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {mod.skillsCovered.map((skill: string, i: number) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
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

                    {personalizedPathData.additionalRecommendations && personalizedPathData.additionalRecommendations.length > 0 && (
                      <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium leading-relaxed">
                        <span className="font-bold">Focus Suggestions:</span> "{personalizedPathData.additionalRecommendations.join(' ')}"
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setSelectedCourseForPath(null);
                          setPersonalizedPathData(null);
                          router.push(`/dashboard/learner/courses/${selectedCourseForPath._id}`);
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        Start Course
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourseForPath(null);
                          setPersonalizedPathData(null);
                        }}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold text-xs shadow-xs transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center flex flex-col items-center justify-center bg-slate-50/50">
                      <Zap className="w-10 h-10 text-slate-300 mb-3" />
                      <h5 className="font-bold text-slate-700">No active pathway detected</h5>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        You can take the initial assessment to customize your learning path, or start with the default curriculum order.
                      </p>
                    </div>
                    <div className="pt-2">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setSelectedCourseForPath(null);
                            setPersonalizedPathData(null);
                            router.push(`/dashboard/learner/courses/${selectedCourseForPath._id}/assessment`);
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                        >
                          Start Assessment
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseForPath(null);
                            setPersonalizedPathData(null);
                            router.push(`/dashboard/learner/courses/${selectedCourseForPath._id}`);
                          }}
                          className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                        >
                          Start Course (Default)
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseForPath(null);
                            setPersonalizedPathData(null);
                          }}
                          className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold text-xs shadow-xs transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
