'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Lock, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingInitializePage() {
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
      // After success, redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-3 mb-12">
          <div className="w-10 h-10 border-2 border-black bg-brand-primary flex items-center justify-center">
            <Sparkles className="text-black w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-display font-black tracking-tighter text-black uppercase">Verticle</span>
        </div>
        <h2 className="text-5xl font-display font-black text-black tracking-tighter uppercase leading-none">Initialize<br/>Access</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Secure Account Activation Protocol</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white p-10 border-4 border-black shadow-[12px_12px_0px_0px_#000000]">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 border-4 border-green-600 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">Activation Complete</h3>
              <p className="text-sm font-bold text-zinc-500 mb-8">Your secure access key has been established. Redirecting to login console...</p>
              <div className="w-full h-2 bg-zinc-100 border-2 border-black">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-brand-primary"
                />
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 border-4 border-red-600 flex items-center justify-center mx-auto mb-8">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">Access Denied</h3>
              <p className="text-sm font-bold text-zinc-500 mb-8">{errorMessage}</p>
              <Link href="/" className="btn-yellow block py-4 text-xs font-black uppercase tracking-widest text-center">
                Return to Landing
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10 p-6 bg-zinc-100 border-2 border-black">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">Final Step</p>
                <p className="text-xs text-black leading-relaxed font-bold">
                  To complete your organization joining process, please establish a secure master password.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 text-red-600 font-black text-xs uppercase tracking-widest">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                    New Master Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-4 pl-12 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                    Confirm Master Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-4 pl-12 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-yellow w-full py-6 flex justify-center items-center gap-4 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        ESTABLISHING ACCESS...
                      </>
                    ) : (
                      <>
                        FINALIZE INITIALIZATION
                        <ArrowRight className="w-6 h-6" />
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
