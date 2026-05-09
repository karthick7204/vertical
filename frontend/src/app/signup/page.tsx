'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building2, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    orgName: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'HR_ADMIN',
        organizationName: formData.orgName
      });

      login(data.accessToken, {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        organizationId: formData.orgName
      });
      
      router.push('/dashboard/hr');

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        <h2 className="text-5xl font-display font-black text-black tracking-tighter uppercase leading-none">Initialize<br/>Console</h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white p-10 border-4 border-black shadow-[12px_12px_0px_0px_#000000]">
          <div className="mb-10 p-6 bg-brand-primary border-2 border-black">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">Security Notice</p>
            <p className="text-xs text-black leading-relaxed font-bold">
              Organization creation is restricted to verified administrators. Learner provisioning must be executed via the dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 text-red-600 font-black text-xs uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                placeholder="ADMINISTRATOR IDENTITY"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                Organization
              </label>
              <input
                type="text"
                name="orgName"
                required
                value={formData.orgName}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                placeholder="COMPANY NAME"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                placeholder="EMAIL@DOMAIN.COM"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-black mb-4">
                Master Key
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-white border-2 border-black rounded-none text-black placeholder-zinc-400 focus:outline-none focus:bg-brand-primary/10 transition-all text-sm font-bold uppercase tracking-widest"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-yellow w-full py-6 flex justify-center items-center gap-4 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    PROVISIONING...
                  </>
                ) : (
                  <>
                    PROVISION SYSTEM
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center pt-8 border-t-2 border-black">
            <Link href="/login" className="text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-brand-primary px-2 transition-colors">
              Return to Login Core
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
