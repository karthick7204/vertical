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
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { courseService } from '@/services/courseService';
import { learnerService, Enrollment } from '@/services/learnerService';

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
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await learnerService.enroll(courseId);
      router.push(`/dashboard/learner/courses/${courseId}/assessment`);
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll in the curriculum.');
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this enrollment?')) return;
    
    try {
      await learnerService.cancelEnrollment(enrollmentId);
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
    }
  };

  return (
    <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-zinc-50 flex text-black">
        {/* Sidebar */}
        <aside className="w-64 border-r-4 border-black bg-white flex flex-col fixed h-full">
          <div className="p-8 border-b-4 border-black bg-brand-primary">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-white" />
              <span className="font-display font-black tracking-tighter text-xl">VERTICLE</span>
            </Link>
          </div>

          <nav className="flex-1 p-6 space-y-4">
            <Link href="/dashboard/learner" className="w-full flex items-center gap-3 p-3 bg-black text-brand-primary border-2 border-black transition-all font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#facc15]">
              <LayoutDashboard className="w-4 h-4" />
              My Roadmap
            </Link>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Search className="w-4 h-4" />
              Catalog
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Award className="w-4 h-4" />
              Credentials
            </button>
          </nav>

          <div className="p-6 border-t-4 border-black">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 p-3 hover:bg-black hover:text-brand-primary transition-all font-black uppercase text-xs tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 overflow-y-auto">
          <header className="h-24 border-b-4 border-black bg-white flex items-center justify-between px-10 sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight italic">Mission Control</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Welcome back, {user?.name} // Session active</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-zinc-500">Global Rank</span>
                <span className="text-lg font-black italic">TOP 4%</span>
              </div>
              <div className="w-12 h-12 border-4 border-black bg-brand-primary flex items-center justify-center font-black">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>

          <div className="p-10 max-w-6xl">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Active Curricula', val: myEnrollments.length, icon: BookOpen, color: 'bg-white' },
                { label: 'Certifications', val: '02', icon: Award, color: 'bg-brand-primary' },
                { label: 'Learning Velocity', val: '94%', icon: TrendingUp, color: 'bg-black text-white' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]`}>
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className="w-6 h-6" />
                    <span className="text-3xl font-black italic leading-none">{stat.val}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* My Active Courses */}
            <section className="mb-16">
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-8 flex items-center gap-3">
                <Zap className="w-5 h-5 fill-brand-primary" />
                Active Learning Roadmap
              </h2>
              
              {/* AI Personalized Path */}
              {user?.personalizedPath && user.personalizedPath.length > 0 && (
                <div className="mb-12 bg-black border-4 border-black p-8 shadow-[8px_8px_0px_0px_#facc15] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-brand-primary text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest italic">
                    AI ARCHITECTED PATH
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-brand-primary text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                      <Zap className="w-5 h-5 fill-brand-primary" />
                      Optimized Trajectory
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {user.personalizedPath.map((moduleName, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="bg-white text-black w-8 h-8 flex items-center justify-center font-black italic border-2 border-brand-primary">
                            {i + 1}
                          </div>
                          <span className="text-white text-xs font-bold uppercase tracking-widest">{moduleName}</span>
                          {i < user.personalizedPath.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-brand-primary" />
                          )}
                        </div>
                      ))}
                    </div>

                    {user?.focusSuggestions && (
                      <div className="mt-8 pt-8 border-t border-brand-primary/30">
                        <h4 className="text-brand-primary text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          AI Success Directives
                        </h4>
                        <p className="text-white/80 text-[10px] font-bold leading-relaxed uppercase tracking-widest italic">
                          "{user.focusSuggestions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myEnrollments.length > 0 ? (
                  myEnrollments.map((enrollment) => (
                    <motion.div 
                      key={enrollment._id}
                      whileHover={{ y: -4 }}
                      className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] flex flex-col"
                    >
                      <div className="p-6 border-b-4 border-black flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-black text-white px-3 py-1 text-[10px] font-black italic uppercase tracking-widest">
                            {enrollment.courseId.category}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ENROLLED {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-black uppercase leading-tight mb-2 tracking-tight">
                          {enrollment.courseId.title}
                        </h3>
                        <p className="text-xs font-bold text-zinc-600 line-clamp-2">
                          {enrollment.courseId.description}
                        </p>
                      </div>
                      
                      <div className="p-6 bg-zinc-50 flex items-center justify-between">
                        <div className="flex-1 mr-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{enrollment.progress}%</span>
                          </div>
                          <div className="h-3 border-2 border-black bg-white overflow-hidden">
                            <div 
                              className="h-full bg-brand-primary border-r-2 border-black transition-all duration-1000"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          <button 
                            onClick={() => handleCancelEnrollment(enrollment._id)}
                            className="bg-white border-2 border-black p-3 hover:bg-red-50 transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            title="Cancel Enrollment"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>

                          {enrollment.status === 'completed' ? (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2 bg-green-500 text-black px-3 py-1 text-[10px] font-black uppercase italic">
                                <Award className="w-3 h-3" />
                                PASSED: {Math.round((enrollment.score! / enrollment.totalQuestions!) * 100)}%
                              </div>
                              <Link 
                                href={`/dashboard/learner/courses/${enrollment.courseId._id}/assessment`}
                                className="text-[10px] font-black uppercase underline hover:text-brand-primary"
                              >
                                Review Results
                              </Link>
                            </div>
                          ) : (
                            <Link 
                              href={`/dashboard/learner/courses/${enrollment.courseId._id}/assessment`}
                              className="bg-black text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#facc15] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                              Launch
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 border-4 border-dashed border-zinc-300 p-20 flex flex-col items-center justify-center text-center">
                    <BookOpen className="w-12 h-12 text-zinc-300 mb-4" />
                    <h3 className="font-black uppercase italic text-zinc-400">No active curricula detected</h3>
                    <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest">Enroll in a course from the catalog to begin</p>
                  </div>
                )}
              </div>
            </section>

            {/* Organization Directives */}
            {availableCourses.some(c => (c.organizationId?._id || c.organizationId) === user?.organizationId) && (
              <section className="mb-16">
                <h2 className="text-xl font-black uppercase tracking-tight italic mb-8 flex items-center gap-3">
                  <Award className="w-5 h-5 text-brand-primary fill-brand-primary" />
                  Directives from {availableCourses.find(c => (c.organizationId?._id || c.organizationId) === user?.organizationId)?.organizationId?.name || 'Your Organization'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {availableCourses
                    .filter(c => (c.organizationId?._id || c.organizationId) === user?.organizationId)
                    .map((course) => (
                      <div key={course._id} className="bg-brand-primary/10 border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-black text-brand-primary px-4 py-1 text-[10px] font-black uppercase tracking-widest italic">
                          INTERNAL DEPLOYMENT
                        </div>
                        <div className="relative z-10">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-4 border-b-2 border-black w-fit">
                            {course.category}
                          </span>
                          <h3 className="text-2xl font-black uppercase mb-4 leading-tight tracking-tight">
                            {course.title}
                          </h3>
                          <p className="text-xs font-bold text-zinc-600 line-clamp-3 mb-8 max-w-lg">
                            {course.description}
                          </p>
                          <button 
                            onClick={() => handleEnroll(course._id)}
                            className="bg-black text-white px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_#facc15]"
                          >
                            Initialize Training
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Award className="w-40 h-40" />
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Recommended/Available Catalog */}
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-8 flex items-center gap-3">
                <Search className="w-5 h-5" />
                Global Intelligence Catalog
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableCourses
                  .filter(c => (c.organizationId?._id || c.organizationId) !== user?.organizationId)
                  .map((course) => (
                    <div key={course._id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000] flex flex-col">
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-4 border-b-2 border-black w-fit">
                          {course.category}
                        </span>
                        <h3 className="text-lg font-black uppercase mb-3 leading-tight tracking-tight">
                          {course.title}
                        </h3>
                        <p className="text-xs font-bold text-zinc-600 line-clamp-3 mb-6">
                          {course.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleEnroll(course._id)}
                        className="w-full border-4 border-black py-4 font-black uppercase text-xs tracking-widest hover:bg-brand-primary transition-all flex items-center justify-center gap-3"
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
      </div>
    </ProtectedRoute>
  );
}
