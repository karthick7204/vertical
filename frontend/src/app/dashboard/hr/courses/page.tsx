'use client';

import React from 'react';
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
  MoreVertical,
  BookOpen,
  Target,
  ExternalLink,
  Edit3,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HRCoursesPage() {
  const { logout } = useAuth();

  const courses = [
    { 
      id: '1', 
      title: 'Advanced React Architecture', 
      category: 'Engineering', 
      difficulty: 'Advanced', 
      modules: 12, 
      enrolled: 84, 
      completion: 65,
      lastUpdated: '2 days ago'
    },
    { 
      id: '2', 
      title: 'Neural Networks Fundamentals', 
      category: 'Data Science', 
      difficulty: 'Intermediate', 
      modules: 8, 
      enrolled: 156, 
      completion: 42,
      lastUpdated: '1 week ago'
    },
    { 
      id: '3', 
      title: 'UI Design Systems', 
      category: 'Design', 
      difficulty: 'Beginner', 
      modules: 10, 
      enrolled: 42, 
      completion: 89,
      lastUpdated: '3 hours ago'
    },
    { 
      id: '4', 
      title: 'Backend Scalability Patterns', 
      category: 'Engineering', 
      difficulty: 'Expert', 
      modules: 15, 
      enrolled: 31, 
      completion: 20,
      lastUpdated: '5 days ago'
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
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
            <Link href="/dashboard/hr" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-semibold text-xs shadow-xs transition-all">
              <Layers className="w-4 h-4" />
              Courses
            </Link>
            <Link href="/dashboard/hr/learners" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Course Registry</h1>
              <p className="text-xs text-slate-400 font-medium">Manage and organize enterprise curricula</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search curricula..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <Link 
                href="/dashboard/hr/create-course"
                className="btn-yellow px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                New Course
              </Link>
            </div>
          </header>

          <div className="p-8 max-w-7xl">
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
              <button className="flex items-center gap-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 shadow-xs">
                <Filter className="w-3.5 h-3.5" />
                All Courses
              </button>
              {['Engineering', 'Data Science', 'Design'].map((cat) => (
                <button key={cat} className="text-xs font-medium border border-slate-200 bg-white text-slate-600 rounded-xl px-4 py-2 hover:bg-slate-50 transition-all shadow-xs">
                  {cat}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {courses.map((course, i) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-block mb-2">
                        {course.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{course.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Updated {course.lastUpdated}</p>
                    </div>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 border-y border-slate-100 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Modules</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900">{course.modules}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Enrolled</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900">{course.enrolled}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Target className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Difficulty</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-block w-fit">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-500">Completion Velocity</span>
                      <span className="font-bold text-slate-800">{course.completion}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Curriculum
                    </button>
                    <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-xs">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
