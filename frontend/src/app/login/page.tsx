'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function LoginPage() {
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
      const data = await authService.login({ email, password });
      
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
    <div className="min-h-screen bg-zinc-50 text-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-12">
          <div className="w-10 h-10 border-2 border-black bg-brand-primary flex items-center justify-center">
            <Sparkles className="text-black w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-display font-black tracking-tighter text-black uppercase">Verticle</span>
        </Link>
        <h2 className="text-5xl font-display font-black text-black tracking-tighter uppercase">
          {role === 'learner' ? 'Learner Portal' : 'Access Console'}
        </h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white p-10 border-4 border-black shadow-[12px_12px_0px_0px_#000000]">
          {role === 'learner' && (
            <div className="mb-10 p-6 bg-zinc-100 border-2 border-black flex gap-4">
              <Terminal className="w-6 h-6 text-black shrink-0" />
              <p className="text-xs text-black leading-relaxed font-bold">
                Enter the credentials provided in your invitation packet. Access is restricted to provisioned learners only.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 text-red-600 font-black text-xs uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                User Identity
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-4 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                placeholder="USER@DOMAIN.COM"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-black">
                  Master Key
                </label>
                <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary px-1 transition-colors">
                  Reset Key
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-4 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-yellow w-full py-6 flex justify-center items-center gap-4 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    EXECUTE LOGIN
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>

          {role !== 'learner' && (
            <div className="mt-12 text-center pt-8 border-t-2 border-black">
              <Link href="/signup" className="text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-brand-primary px-2 transition-colors">
                Initialize New Organization
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
