'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, 
  Layers, 
  Users, 
  Mail, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { learnerService, LearnerSummary } from '@/services/learnerService';

export default function HRLearnersPage() {
  const { user, logout } = useAuth();

  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLearnerId, setExpandedLearnerId] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    async function loadLearners() {
      try {
        setLoading(true);
        const data = await learnerService.getAllLearnersProgress();
        setLearners(data);
      } catch (err) {
        console.error('Failed to load learners', err);
      } finally {
        setLoading(false);
      }
    }
    loadLearners();
  }, []);

  const toggleExpandLearner = (id: string) => {
    setExpandedLearnerId(prev => (prev === id ? null : id));
  };

  // Derive available departments
  const departments = ['ALL', ...Array.from(new Set(learners.map(l => l.department || 'General').filter(Boolean)))];

  // Filter learners
  const filteredLearners = learners.filter(l => {
    // Search query filter
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.department && l.department.toLowerCase().includes(searchQuery.toLowerCase()));

    // Dept filter
    const matchesDept = selectedDept === 'ALL' || (l.department || 'General') === selectedDept;

    // Status filter
    let matchesStatus = true;
    if (selectedStatus === 'COMPLETED') {
      matchesStatus = l.enrollments.some(e => e.status === 'completed');
    } else if (selectedStatus === 'ACTIVE') {
      matchesStatus = l.enrollments.some(e => e.status !== 'completed');
    } else if (selectedStatus === 'NONE') {
      matchesStatus = l.enrollments.length === 0;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Dynamic statistics
  const totalLearners = learners.length;
  const totalEnrollments = learners.reduce((acc, curr) => acc + curr.enrollments.length, 0);
  const totalCompletedCourses = learners.reduce((acc, curr) => 
    acc + curr.enrollments.filter(e => e.status === 'completed').length, 0
  );
  const avgCompletionRate = totalEnrollments > 0 
    ? Math.round((totalCompletedCourses / totalEnrollments) * 100) 
    : 0;

  const stats = [
    { label: 'Total Personnel', value: totalLearners, icon: <Users className="w-5 h-5 text-indigo-600" /> },
    { label: 'Active Curricula', value: totalEnrollments, icon: <BookOpen className="w-5 h-5 text-sky-600" /> },
    { label: 'Courses Completed', value: totalCompletedCourses, icon: <Award className="w-5 h-5 text-emerald-600" /> },
    { label: 'Completion Rate', value: `${avgCompletionRate}%`, icon: <Target className="w-5 h-5 text-violet-600" /> },
  ];

  return (
    <ProtectedRoute allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-50/60 flex text-slate-900">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 fixed h-full z-20">
          <div className="p-6 border-b border-slate-200 bg-white">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <span className="font-display font-bold tracking-tight text-xl text-slate-900">VERTICLE</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1.5">
            <Link href="/dashboard/hr" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <Layers className="w-4 h-4" />
              Courses
            </Link>
            <Link href="/dashboard/hr/learners" className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-semibold text-xs shadow-xs transition-all">
              <Users className="w-4 h-4" />
              Learners
            </Link>
            <Link href="/dashboard/hr/create-course" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <Mail className="w-4 h-4" />
              Invitations
            </Link>
            <Link href="/dashboard/hr/settings" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
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
          {/* Header */}
          <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Learner Tracking</h1>
              <p className="text-xs text-slate-400 font-medium">Org: {user?.organizationId || 'Acme Corp'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search personnel..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </header>

          <div className="p-8 space-y-6 max-w-7xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                <span className="text-xs font-semibold text-slate-500">Loading learner records...</span>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">{stat.icon}</div>
                      </div>
                      <h3 className="text-xs font-medium text-slate-500 mb-1">{stat.label}</h3>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-4 items-end bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 pb-1.5">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">Filters:</span>
                  </div>

                  <div className="flex-1 min-w-[200px] flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1">Search Learners</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Name, email, or dept..." 
                        className="w-full pl-9 pr-8 py-2 border border-slate-200 bg-slate-50/50 rounded-xl font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1">Department</label>
                    <select 
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl font-medium text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 min-w-[130px] cursor-pointer"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1">Status</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl font-medium text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 min-w-[140px] cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Actively Studying</option>
                      <option value="COMPLETED">Passed Courses</option>
                      <option value="NONE">No Course Opted</option>
                    </select>
                  </div>

                  <div className="text-xs font-medium text-slate-400 pb-2 ml-auto">
                    Showing {filteredLearners.length} of {totalLearners} personnel
                  </div>
                </div>

                {/* Learners List */}
                <div className="space-y-4">
                  {filteredLearners.length > 0 ? (
                    filteredLearners.map((learner) => {
                      const isExpanded = expandedLearnerId === learner._id;
                      const activeEnrollmentsCount = learner.enrollments.filter(e => e.status !== 'completed').length;
                      const completedCount = learner.enrollments.filter(e => e.status === 'completed').length;

                      return (
                        <div 
                          key={learner._id}
                          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
                        >
                          {/* Row Header */}
                          <div 
                            onClick={() => toggleExpandLearner(learner._id)}
                            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 select-none transition-colors"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-xs">
                                {learner.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm text-slate-900">{learner.name}</h3>
                                <p className="text-xs text-slate-400">{learner.email}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-6 items-center">
                              <div>
                                <span className="block text-[10px] font-medium text-slate-400">Department</span>
                                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                  {learner.department}
                                </span>
                              </div>

                              <div className="text-center">
                                <span className="block text-[10px] font-medium text-slate-400">Opted / Completed</span>
                                <span className="text-xs font-bold text-slate-800">{learner.enrollments.length} / {completedCount}</span>
                              </div>

                              <div className="text-center">
                                <span className="block text-[10px] font-medium text-slate-400">Skills Acquired</span>
                                <span className="text-xs font-bold text-indigo-600">{Object.keys(learner.skills || {}).length}</span>
                              </div>

                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
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
                                className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                              >
                                <div className="p-6 space-y-6">
                                  {/* Course Progress Breakdown */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-indigo-600" />
                                      Curriculum Progress Breakdown
                                    </h4>

                                    {learner.enrollments.length > 0 ? (
                                      <div className="grid gap-4 md:grid-cols-2">
                                        {learner.enrollments.map((enrollment) => (
                                          <div 
                                            key={enrollment.enrollmentId} 
                                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
                                          >
                                            <div>
                                              <div className="flex justify-between items-start mb-2 gap-2">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold rounded">
                                                  {enrollment.courseCategory}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                                  enrollment.status === 'completed' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : enrollment.status === 'in-progress'
                                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                  {enrollment.status}
                                                </span>
                                              </div>
                                              <h5 className="font-semibold text-sm text-slate-900 leading-snug mb-3">
                                                {enrollment.courseTitle}
                                              </h5>
                                            </div>

                                            <div>
                                              {/* Progress Bar */}
                                              <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-medium text-slate-400">Completion</span>
                                                <span className="text-[10px] font-bold text-slate-700">{enrollment.progress}%</span>
                                              </div>
                                              <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                                                <div 
                                                  className="h-full bg-indigo-600 rounded-full"
                                                  style={{ width: `${enrollment.progress}%` }}
                                                />
                                              </div>

                                              {/* Enrollment Details */}
                                              <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                                                <span className="flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" />
                                                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                </span>
                                                {enrollment.status === 'completed' && (
                                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-emerald-600" />
                                                    Score: {enrollment.score}/{enrollment.totalQuestions}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs font-medium bg-white">
                                        No course trajectories active or completed yet.
                                      </div>
                                    )}
                                  </div>

                                  {/* Learner Skills Index */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                      <Target className="w-4 h-4 text-indigo-600" />
                                      Verified Skill Levels
                                    </h4>

                                    {Object.keys(learner.skills || {}).length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(learner.skills).map(([skill, val]) => (
                                          <div 
                                            key={skill}
                                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2 shadow-xs"
                                          >
                                            <span>{skill.replace(/_/g, '.')}</span>
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                              +{val}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs font-medium bg-white">
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
                    <div className="border border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-white">
                      <Users className="w-10 h-10 text-slate-300 mb-3" />
                      <h3 className="font-bold text-slate-600">No personnel matches found</h3>
                      <p className="text-xs text-slate-400 mt-1">Adjust search query or filter tags</p>
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
