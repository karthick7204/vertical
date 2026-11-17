'use client';

import React from 'react';
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
  MoreVertical,
  Mail,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HRDashboard() {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Total Learners', value: '1,284', change: '+12%', icon: Users, tint: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Avg. Skill Level', value: 'B2', change: '+5%', icon: Target, tint: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Courses Completed', value: '456', change: '+24%', icon: Award, tint: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Engagement Rate', value: '89%', change: '+2%', icon: TrendingUp, tint: 'bg-violet-50 text-violet-600 border-violet-100' },
  ];

  const learners = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Frontend Engineer', progress: 75, status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'UI Designer', progress: 42, status: 'Active' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Backend Lead', progress: 91, status: 'Completed' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Data Analyst', progress: 12, status: 'In Review' },
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
            <Link href="/dashboard/hr" className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-semibold text-xs shadow-xs transition-all">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">HR Analytics Console</h1>
              <p className="text-xs text-slate-400 font-medium">Org: {user?.organizationId || 'Acme Corp'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search personnel..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <Link 
                href="/dashboard/hr/create-course"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-xs transition-all"
                title="Create Course"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-7xl">
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
                    <div className={`p-2.5 rounded-xl border ${stat.tint}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{stat.change}</span>
                  </div>
                  <h3 className="text-xs font-medium text-slate-500 mb-1">{stat.label}</h3>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Learners Table Container */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active Training Personnel</h2>
                  <p className="text-xs text-slate-400 font-normal">Real-time completion tracking across teams</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-3.5 py-2 hover:bg-slate-50 transition-all shadow-xs">
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/70 border-b border-slate-100">
                    <tr>
                      <th className="p-5 text-xs font-semibold text-slate-500">Identity</th>
                      <th className="p-5 text-xs font-semibold text-slate-500">Function</th>
                      <th className="p-5 text-xs font-semibold text-slate-500">Readiness</th>
                      <th className="p-5 text-xs font-semibold text-slate-500">Status</th>
                      <th className="p-5 text-xs font-semibold text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {learners.map((learner) => (
                      <tr key={learner.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-xs">
                              {learner.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{learner.name}</p>
                              <p className="text-xs text-slate-400">{learner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-xs font-medium text-slate-600">{learner.role}</td>
                        <td className="p-5">
                          <div className="w-full max-w-[120px] h-2 rounded-full bg-slate-100 overflow-hidden mb-1">
                            <div 
                              className="h-full bg-indigo-600 rounded-full" 
                              style={{ width: `${learner.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">{learner.progress}%</span>
                        </td>
                        <td className="p-5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            learner.status === 'Completed' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {learner.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500">Showing 4 of 1,284 personnel</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-semibold text-xs text-slate-600 transition-all shadow-xs">Previous</button>
                  <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-semibold text-xs text-slate-600 transition-all shadow-xs">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
