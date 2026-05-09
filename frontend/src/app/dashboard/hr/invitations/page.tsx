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
  UserPlus,
  Shield,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/authService';

export default function HRInvitationsPage() {
  const { logout, user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('LEARNER');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    
    try {
      await authService.invite({
        name,
        email,
        password,
        role,
        organizationId: user?.organizationId
      });
      
      setSent(true);
      setEmail('');
      setName('');
      setPassword('');
      
      // Reset success state after 5 seconds
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      console.error('Failed to provision user:', err);
      setError(err.message || 'Transmission failure during provisioning.');
    } finally {
      setIsSending(false);
    }
  };

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
            <Link href="/dashboard/hr/courses" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Layers className="w-4 h-4" />
              Courses
            </Link>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
              <Users className="w-4 h-4" />
              Learners
            </button>
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 p-3 bg-brand-primary border-2 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000]">
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
              <h1 className="text-2xl font-black uppercase tracking-tight italic">Personnel Provisioning</h1>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">ORG IDENTITY // {user?.organizationId || 'UNSET'}</p>
            </div>
            <Shield className="w-8 h-8 text-zinc-200" />
          </header>

          <div className="p-10 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Invitation Form */}
              <section className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_#000000] relative">
                <div className="flex items-center gap-3 mb-10 border-b-2 border-black pb-4">
                  <UserPlus className="w-5 h-5" />
                  <h2 className="text-xl font-black uppercase tracking-tight">Direct Provisioning</h2>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 text-red-600 font-black text-[10px] uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleInvite} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Target Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. ROBERT OPPENHEIMER"
                      className="w-full p-4 border-2 border-black bg-zinc-50 font-bold uppercase text-xs focus:bg-white focus:outline-none transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Secure Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="NAME@DOMAIN.COM"
                      className="w-full p-4 border-2 border-black bg-zinc-50 font-bold uppercase text-xs focus:bg-white focus:outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Assigned Protocol / Role</label>
                    <select 
                      className="w-full p-4 border-2 border-black bg-zinc-50 font-black text-xs uppercase appearance-none cursor-pointer focus:bg-brand-primary/20 transition-all"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="LEARNER">LEARNER ACCESS</option>
                      <option value="HR_ADMIN">HR ADMINISTRATOR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Initial Access Key (Password)</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full p-4 border-2 border-black bg-zinc-50 font-bold uppercase text-xs focus:bg-white focus:outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSending}
                      className="btn-yellow w-full py-5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          TRANSMITTING...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          PROVISION ACCOUNT
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <AnimatePresence>
                  {sent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-x-0 -bottom-20 bg-green-100 border-2 border-green-600 p-4 flex items-center gap-3 text-green-700 font-black text-xs uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Personnel Provisioned Successfully
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Info / Instructions */}
              <div className="space-y-10 py-6">
                <div className="border-l-4 border-black pl-8">
                  <h3 className="text-xl font-black uppercase italic mb-4">Provisioning Protocol</h3>
                  <p className="text-sm text-zinc-500 font-bold leading-relaxed">
                    Direct provisioning creates an active account immediately. 
                    The user will be able to log in using the email and 
                    initial access key provided here.
                  </p>
                </div>

                <div className="bg-zinc-100 border-2 border-black p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-zinc-400">Security Checkpoint</h4>
                  <ul className="space-y-4">
                    {[
                      'Email verification is mandatory',
                      'Role-based access is locked at provisioning',
                      'IP-bound invitation links enabled'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-black uppercase italic">
                        <div className="w-1.5 h-1.5 bg-black" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
                    View Invitation Log <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
