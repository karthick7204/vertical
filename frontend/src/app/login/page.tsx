'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const role = searchParams.get('role');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = await authService.login({ email: email.trim().toLowerCase(), password });
      
      login(data.accessToken, {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        organizationId: data.organizationId
      });
      
      router.push(data.role === 'HR_ADMIN' ? '/dashboard/hr' : '/dashboard/learner');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or system error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight text-slate-900">VERTICLE</span>
        </Link>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          {role === 'learner' ? 'Learner Sign In' : 'Console Sign In'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {role === 'learner' 
            ? 'Sign in to access your assigned curricula and roadmap' 
            : 'Access enterprise training analytics and management'}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
      >
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {role === 'learner' && (
            <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex gap-3 text-indigo-900">
              <Terminal className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-normal">
                Enter the credentials provided in your invitation email. Access is reserved for enrolled learners.
              </p>
            </div>
          )}

          {searchParams.get('expired') === 'true' && (
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 font-medium text-xs rounded-xl text-center">
              Session expired. Please log in again.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-yellow w-full py-3.5 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {role !== 'learner' && (
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Need an organization account?{' '}
                <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Create Organization
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
