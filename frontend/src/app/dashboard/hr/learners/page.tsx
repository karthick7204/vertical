'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Users, 
  BarChart3, 
  Layers,
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  TrendingUp, 
  Target, 
  Award,
  Mail,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { learnerService } from '@/services/learnerService';

interface CourseEnrollment {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  status: 'enrolled' | 'in-progress' | 'completed';
  progress: number;
  score?: number;
  totalQuestions?: number;
  enrolledAt: string;
  completedAt?: string;
}

interface LearnerReportItem {
  _id: string;
  name: string;
  email: string;
  department: string;
  skills: Record<string, number>;
  createdAt: string;
  enrollments: CourseEnrollment[];
}

export default function LearnersProgressPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [learnersData, setLearnersData] = useState<LearnerReportItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedLearnerId, setExpandedLearnerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const report = await learnerService.getLearnersProgressReport();
        setLearnersData(report);
      } catch (error) {
        console.error('Failed to fetch learners report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  // Compute stats
  const totalLearners = learnersData.length;
  const totalEnrollments = learnersData.reduce((acc, curr) => acc + curr.enrollments.length, 0);
  const completedCourses = learnersData.reduce(
    (acc, curr) => acc + curr.enrollments.filter(e => e.status === 'completed').length, 
    0
  );
  
  const averageProgress = (() => {
    if (totalEnrollments === 0) return 0;
    const totalProgSum = learnersData.reduce(
      (acc, curr) => acc + curr.enrollments.reduce((sum, e) => sum + e.progress, 0),
      0
    );
    return Math.round(totalProgSum / totalEnrollments);
  })();

  const stats = [
    { label: 'Personnel Tracked', value: totalLearners, icon: <Users /> },
    { label: 'Total Course Enrollments', value: totalEnrollments, icon: <BookOpen /> },
    { label: 'Completed Trajectories', value: completedCourses, icon: <Award /> },
    { label: 'Mean Class Readiness', value: `${averageProgress}%`, icon: <TrendingUp /> },
  ];

  // Unique departments for filter
  const departments = ['ALL', ...Array.from(new Set(learnersData.map(l => l.department).filter(Boolean)))];

  // Filtering logic
  const filteredLearners = learnersData.filter(learner => {
    const matchesSearch = 
      learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || learner.department === selectedDept;

    const matchesStatus = selectedStatus === 'ALL' || (
      selectedStatus === 'NONE' ? learner.enrollments.length === 0 :
      selectedStatus === 'ACTIVE' ? learner.enrollments.some(e => e.status === 'in-progress' || e.status === 'enrolled') :
      selectedStatus === 'COMPLETED' ? learner.enrollments.some(e => e.status === 'completed') : true
    );

    return matchesSearch && matchesDept && matchesStatus;
  });

  const toggleExpandLearner = (learnerId: string) => {
    if (expandedLearnerId === learnerId) {
      setExpandedLearnerId(null);
    } else {
      setExpandedLearnerId(learnerId);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-zinc-50 flex text-black">
        {/* Sidebar */}
        <aside className="w-64 border-r-4 border-black bg-white flex flex-col shrink-0">
          <div className="p-8 border-b-4 border-black">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-brand-primary" />
              <span className="font-display font-black tracking-tighter text-xl">VERTICLE</span>
            </div>
          </div>

          <nav className="flex-1 p-6 space-y-4">
            <Link href="/dashboard/hr" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Layers className="w-4 h-4" />
              Courses
            </Link>
            <Link href="/dashboard/hr/learners" className="w-full flex items-center gap-3 p-3 bg-brand-primary border-2 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000]">
              <Users className="w-4 h-4" />
              Learners
            </Link>
            <Link href="/dashboard/hr/create-course" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Mail className="w-4 h-4" />
              Invitations
            </Link>
          </nav>

          <div className="p-6 border-t-4 border-black">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 p-3 hover:bg-black hover:text-brand-primary transition-all font-black uppercase text-xs tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              Terminate Session
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="h-24 border-b-4 border-black bg-white flex items-center justify-between px-10">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">HR Console // Learners Progress</h1>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Org: {user?.organizationId || 'Acme Corp'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH SYSTEM..." 
                  className="pl-10 pr-4 py-2 border-2 border-black bg-zinc-50 font-bold text-xs uppercase tracking-widest focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </header>

          <div className="p-10 space-y-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                <span className="text-xs font-black uppercase tracking-widest text-black">Decrypting learner parameters...</span>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-8">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 border-2 border-black bg-zinc-50">{stat.icon}</div>
                      </div>
                      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                      <p className="text-3xl font-black">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-4 items-end bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
                  <div className="flex items-center gap-2 pb-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Filters:</span>
                  </div>

                  <div className="flex-1 min-w-[200px] flex flex-col">
                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-1">Search Learners</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="NAME, EMAIL, OR DEPT..."
                        className="w-full pl-10 pr-10 py-2 border-2 border-black bg-zinc-50 font-bold text-xs uppercase tracking-widest focus:outline-none focus:bg-white transition-colors"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black bg-black text-white px-2 py-0.5"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-1">Department</label>
                    <select 
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="p-2 border-2 border-black font-bold text-xs uppercase tracking-widest bg-zinc-50 focus:outline-none min-w-[120px]"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-1">Course Status</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="p-2 border-2 border-black font-bold text-xs uppercase tracking-widest bg-zinc-50 focus:outline-none min-w-[150px]"
                    >
                      <option value="ALL">ALL STATUSES</option>
                      <option value="ACTIVE">ACTIVE STUDYING</option>
                      <option value="COMPLETED">PASSED COURSES</option>
                      <option value="NONE">NO COURSE OPTED</option>
                    </select>
                  </div>

                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pb-2 ml-auto">
                    Showing {filteredLearners.length} of {totalLearners} Personnel
                  </div>
                </div>

                {/* Learners List */}
                <div className="space-y-6">
                  {filteredLearners.length > 0 ? (
                    filteredLearners.map((learner) => {
                      const isExpanded = expandedLearnerId === learner._id;
                      const activeEnrollmentsCount = learner.enrollments.filter(e => e.status !== 'completed').length;
                      const completedCount = learner.enrollments.filter(e => e.status === 'completed').length;

                      return (
                        <div 
                          key={learner._id}
                          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden"
                        >
                          {/* Row Header */}
                          <div 
                            onClick={() => toggleExpandLearner(learner._id)}
                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 select-none transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 border-4 border-black bg-brand-primary flex items-center justify-center font-black text-lg">
                                {learner.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-black uppercase text-base tracking-tight">{learner.name}</h3>
                                <p className="text-xs text-zinc-500 font-bold">{learner.email}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-8 items-center">
                              <div>
                                <span className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Department</span>
                                <span className="text-xs font-black uppercase bg-zinc-100 px-2 py-0.5 border border-black/10">
                                  {learner.department}
                                </span>
                              </div>

                              <div className="text-center">
                                <span className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Opted / Completed</span>
                                <span className="text-sm font-black italic">{learner.enrollments.length} / {completedCount}</span>
                              </div>

                              <div className="text-center">
                                <span className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Skills Acquired</span>
                                <span className="text-sm font-black italic">{Object.keys(learner.skills || {}).length}</span>
                              </div>

                              <button className="p-1 border-2 border-black hover:bg-black hover:text-brand-primary transition-all">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden border-t-4 border-black bg-zinc-50/50"
                              >
                                <div className="p-6 space-y-6">
                                  {/* Course Progress Breakdown */}
                                  <div>
                                    <h4 className="text-xs font-black uppercase italic tracking-widest mb-4 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-brand-primary fill-brand-primary" />
                                      Curriculum Progress Breakdown
                                    </h4>

                                    {learner.enrollments.length > 0 ? (
                                      <div className="grid gap-4 md:grid-cols-2">
                                        {learner.enrollments.map((enrollment) => (
                                          <div 
                                            key={enrollment.enrollmentId} 
                                            className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
                                          >
                                            <div>
                                              <div className="flex justify-between items-start mb-2 gap-2">
                                                <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-wider italic">
                                                  {enrollment.courseCategory}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 border border-black ${
                                                  enrollment.status === 'completed' 
                                                    ? 'bg-green-500 text-black' 
                                                    : enrollment.status === 'in-progress'
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'bg-zinc-100 text-zinc-500'
                                                }`}>
                                                  {enrollment.status}
                                                </span>
                                              </div>
                                              <h5 className="font-black uppercase text-sm tracking-tight leading-snug mb-3">
                                                {enrollment.courseTitle}
                                              </h5>
                                            </div>

                                            <div>
                                              {/* Progress Bar */}
                                              <div className="flex justify-between mb-1.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Completion</span>
                                                <span className="text-[10px] font-black italic">{enrollment.progress}%</span>
                                              </div>
                                              <div className="h-3 border-2 border-black bg-zinc-100 overflow-hidden mb-3">
                                                <div 
                                                  className="h-full bg-brand-primary"
                                                  style={{ width: `${enrollment.progress}%` }}
                                                />
                                              </div>

                                              {/* Enrollment Details */}
                                              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest pt-2 border-t border-zinc-100">
                                                <span className="flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" />
                                                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                </span>
                                                {enrollment.status === 'completed' && (
                                                  <span className="bg-green-100 border border-green-300 text-green-700 px-1.5 py-0.5 font-black flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-green-700" />
                                                    Score: {enrollment.score}/{enrollment.totalQuestions}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="border-2 border-dashed border-zinc-300 p-8 text-center text-zinc-400 uppercase tracking-widest text-xs font-black">
                                        No course trajectories active or completed yet.
                                      </div>
                                    )}
                                  </div>

                                  {/* Learner Skills Index */}
                                  <div>
                                    <h4 className="text-xs font-black uppercase italic tracking-widest mb-4 flex items-center gap-2">
                                      <Target className="w-4 h-4 text-brand-primary fill-brand-primary" />
                                      Verified Skill Levels
                                    </h4>

                                    {Object.keys(learner.skills || {}).length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(learner.skills).map(([skill, val]) => (
                                          <div 
                                            key={skill}
                                            className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000]"
                                          >
                                            <span>{skill.replace(/_/g, '.')}</span>
                                            <span className="bg-black text-brand-primary w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-black">
                                              +{val}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="border-2 border-dashed border-zinc-300 p-8 text-center text-zinc-400 uppercase tracking-widest text-xs font-black">
                                        No skill levels verified on current evaluations.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="border-4 border-dashed border-zinc-300 p-20 flex flex-col items-center justify-center text-center">
                      <Users className="w-12 h-12 text-zinc-300 mb-4" />
                      <h3 className="font-black uppercase italic text-zinc-400">No personnel matches found</h3>
                      <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest">Adjust search query or filter tags</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
