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
  Clock,
  Target,
  ChevronRight,
  ExternalLink,
  Edit3
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
      <div className="min-h-screen bg-zinc-50 flex text-black">
        {/* Sidebar */}
        <aside className="w-64 border-r-4 border-black bg-white flex flex-col fixed h-full">
          <div className="p-8 border-b-4 border-black">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-brand-primary" />
              <span className="font-display font-black tracking-tighter text-xl">VERTICLE</span>
            </Link>
          </div>

          <nav className="flex-1 p-6 space-y-4">
            <Link href="/dashboard/hr" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 p-3 bg-brand-primary border-2 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000]">
              <Layers className="w-4 h-4" />
              Courses
            </Link>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Users className="w-4 h-4" />
              Learners
            </button>
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Mail className="w-4 h-4" />
              Invitations
            </Link>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Settings className="w-4 h-4" />
              Settings
            </button>
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
        <main className="flex-1 ml-64 overflow-y-auto">
          {/* Header */}
          <header className="h-24 border-b-4 border-black bg-white flex items-center justify-between px-10 sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight italic">Course Management</h1>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest underline decoration-brand-primary decoration-2 underline-offset-4">Registry Console // active curricula</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="SEARCH REGISTRY..." 
                  className="pl-10 pr-4 py-2 border-2 border-black bg-zinc-50 font-bold text-xs uppercase tracking-widest focus:outline-none focus:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                />
              </div>
              <Link 
                href="/dashboard/hr/create-course"
                className="bg-brand-primary border-2 border-black px-6 py-2 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Course
              </Link>
            </div>
          </header>

          <div className="p-10">
            {/* Filter Bar */}
            <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 border-black bg-black text-white px-6 py-2 shadow-[4px_4px_0px_0px_#facc15]">
                <Filter className="w-4 h-4" />
                All Courses
              </button>
              <button className="text-xs font-black uppercase tracking-widest border-2 border-black bg-white px-6 py-2 hover:bg-zinc-100 transition-all">
                Engineering
              </button>
              <button className="text-xs font-black uppercase tracking-widest border-2 border-black bg-white px-6 py-2 hover:bg-zinc-100 transition-all">
                Data Science
              </button>
              <button className="text-xs font-black uppercase tracking-widest border-2 border-black bg-white px-6 py-2 hover:bg-zinc-100 transition-all">
                Design
              </button>
            </div>

            {/* Courses Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {courses.map((course, i) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000000] group hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_#facc15] transition-all relative overflow-hidden"
                >
                  {/* Category Tag */}
                  <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 font-black text-[10px] uppercase tracking-[0.2em] italic">
                    {course.category}
                  </div>

                  <div className="flex justify-between items-start mb-6 pt-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase leading-tight group-hover:text-brand-primary transition-colors">{course.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Updated {course.lastUpdated}</p>
                    </div>
                    <button className="p-2 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-8 border-y-2 border-zinc-100 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <BookOpen className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Modules</span>
                      </div>
                      <span className="text-xl font-black">{course.modules}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enrolled</span>
                      </div>
                      <span className="text-xl font-black">{course.enrolled}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Target className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Difficulty</span>
                      </div>
                      <span className="text-xs font-black uppercase bg-zinc-100 px-2 py-1 inline-block w-fit">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Completion Velocity</span>
                      <span className="text-sm font-black">{course.completion}%</span>
                    </div>
                    <div className="h-4 border-2 border-black bg-zinc-100 relative">
                      <div 
                        className="h-full bg-brand-primary border-r-2 border-black transition-all duration-1000" 
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button className="flex-1 bg-black text-white py-3 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
                      <Edit3 className="w-4 h-4" />
                      Modify Architecture
                    </button>
                    <button className="w-14 border-2 border-black flex items-center justify-center hover:bg-zinc-100 transition-all">
                      <ExternalLink className="w-5 h-5" />
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
