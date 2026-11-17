'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Lock, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function OnboardingInitializeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('submitting');
    
    // Simulation of account activation API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight text-slate-900">VERTICLE</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Set Your Password</h2>
        <p className="mt-2 text-sm text-slate-500">Secure Account Activation Protocol</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
      >
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Activation Complete</h3>
              <p className="text-sm text-slate-500 mb-8 font-normal">Your secure password has been set. Redirecting to login...</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-600 shadow-xs">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
              <p className="text-sm text-slate-500 mb-8 font-normal">{errorMessage}</p>
              <Link href="/" className="btn-yellow block py-3 text-sm font-semibold text-center rounded-xl">
                Return to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <p className="text-xs font-semibold text-indigo-950 mb-1">Final Step</p>
                <p className="text-xs text-indigo-800 leading-relaxed font-normal">
                  To complete your organization onboarding, please establish a secure password for your account.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-3 pl-11 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 pl-11 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-yellow w-full py-3.5 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Password...
                      </>
                    ) : (
                      <>
                        Complete Activation
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingInitializePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    }>
      <OnboardingInitializeContent />
    </Suspense>
  );
}
