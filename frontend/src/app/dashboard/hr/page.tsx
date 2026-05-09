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
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HRDashboard() {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Total Learners', value: '1,284', change: '+12%', icon: <Users /> },
    { label: 'Avg. Skill Level', value: 'B2', change: '+5%', icon: <Target /> },
    { label: 'Courses Completed', value: '456', change: '+24%', icon: <Award /> },
    { label: 'Engagement Rate', value: '89%', change: '+2%', icon: <TrendingUp /> },
  ];

  const learners = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Frontend Engineer', progress: 75, status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'UI Designer', progress: 42, status: 'Active' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Backend Lead', progress: 91, status: 'Completed' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Data Analyst', progress: 12, status: 'In Review' },
  ];

  return (
    <ProtectedRoute allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-zinc-50 flex text-black">
        {/* Sidebar */}
        <aside className="w-64 border-r-4 border-black bg-white flex flex-col">
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
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 p-3 bg-brand-primary border-2 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000]">
              <Layers className="w-4 h-4" />
              Courses
            </Link>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Users className="w-4 h-4" />
              Learners
            </button>
            <Link href="/dashboard/hr/create-course" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Mail className="w-4 h-4" />
              Invitations
            </Link>
            <Link href="/dashboard/hr/settings" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Settings className="w-4 h-4" />
              Settings
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
              <h1 className="text-2xl font-black uppercase tracking-tight">HR Console // Analytics</h1>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Org: {user?.organizationId || 'Acme Corp'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="SEARCH SYSTEM..." 
                  className="pl-10 pr-4 py-2 border-2 border-black bg-zinc-50 font-bold text-xs uppercase tracking-widest focus:outline-none focus:bg-white"
                />
              </div>
              <button className="bg-brand-primary border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="p-10 space-y-10">
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
                    <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 border border-green-600">{stat.change}</span>
                  </div>
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                  <p className="text-3xl font-black">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Learners Table Container */}
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000000]">
              <div className="p-6 border-b-4 border-black flex items-center justify-between">
                <h2 className="text-xl font-black uppercase italic">Active Training Personnel</h2>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 border-black px-4 py-2 hover:bg-zinc-100">
                  <Filter className="w-4 h-4" />
                  Filter System
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b-2 border-black">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Identity</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Function</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Readiness</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {learners.map((learner) => (
                      <tr key={learner.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border-2 border-black bg-zinc-200 flex items-center justify-center font-black">
                              {learner.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase">{learner.name}</p>
                              <p className="text-xs text-zinc-500 font-bold">{learner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-xs font-black uppercase text-zinc-600">{learner.role}</td>
                        <td className="p-6">
                          <div className="w-full max-w-[120px] h-3 border-2 border-black bg-zinc-100">
                            <div 
                              className="h-full bg-brand-primary" 
                              style={{ width: `${learner.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black mt-1 block">{learner.progress}%</span>
                        </td>
                        <td className="p-6">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 border-black ${
                            learner.status === 'Completed' ? 'bg-green-100' : 'bg-brand-primary/20'
                          }`}>
                            {learner.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button className="p-1 hover:bg-zinc-200 border-2 border-transparent hover:border-black transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-zinc-50 flex items-center justify-between border-t-4 border-black">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Showing 4 of 1,284 personnel</p>
                <div className="flex gap-2">
                  <button className="p-2 border-2 border-black bg-white hover:bg-brand-primary font-black text-xs px-4">PREV</button>
                  <button className="p-2 border-2 border-black bg-white hover:bg-brand-primary font-black text-xs px-4">NEXT</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
