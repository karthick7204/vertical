'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, 
  Layers, 
  Users, 
  Mail, 
  Settings, 
  LogOut, 
  Send, 
  Shield, 
  UserPlus, 
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/apiClient';

export default function HRInvitationsPage() {
  const { user, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('LEARNER');
  const [password, setPassword] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');

    try {
      await apiClient.post('/hr/invite', {
        name,
        email: email.trim().toLowerCase(),
        role,
        password
      });

      setSent(true);
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch invitation.');
    } finally {
      setIsSending(false);
    }
  };

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
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-semibold text-xs shadow-xs transition-all">
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Personnel Provisioning</h1>
              <p className="text-xs text-slate-400 font-medium">Org: {user?.organizationId || 'Unset'}</p>
            </div>
            <Shield className="w-6 h-6 text-slate-300" />
          </header>

          <div className="p-8 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Invitation Form */}
              <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs relative">
                <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Direct Provisioning</h2>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs rounded-xl text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Role</label>
                    <select 
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs cursor-pointer focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="LEARNER">Learner Access</option>
                      <option value="HR_ADMIN">HR Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Access Key (Password)</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isSending}
                      className="btn-yellow w-full py-3.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-2 active:translate-y-0.5 disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Provisioning...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Provision Account
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <AnimatePresence>
                  {sent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2 text-emerald-800 font-semibold text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Personnel Provisioned Successfully
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Info / Instructions */}
              <div className="space-y-6 py-2">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Provisioning Protocol</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Direct provisioning creates an active account immediately. 
                    The user will be able to log in using the email and 
                    initial password provided here.
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6">
                  <h4 className="text-xs font-semibold text-slate-700 mb-3">Security Checkpoint</h4>
                  <ul className="space-y-2.5">
                    {[
                      'Email verification is mandatory',
                      'Role-based access is locked at provisioning',
                      'Encrypted credentials protocol enabled'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
