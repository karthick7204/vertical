'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Sparkles, Zap, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center shadow-xs">
              <Sparkles className="text-indigo-600 w-5 h-5" />
            </div>
            <span className="text-xl font-display font-extrabold tracking-tight text-slate-900">VERTICLE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-indigo-600 hover:bg-slate-100/60 px-3 py-1.5 rounded-lg transition-colors">Platform</Link>
            <Link href="#solutions" className="hover:text-indigo-600 hover:bg-slate-100/60 px-3 py-1.5 rounded-lg transition-colors">Solutions</Link>
            <Link href="#enterprise" className="hover:text-indigo-600 hover:bg-slate-100/60 px-3 py-1.5 rounded-lg transition-colors">Enterprise</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 transition-colors">Sign In</Link>
            <Link 
              href="/signup" 
              className="btn-yellow px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-44 pb-28 overflow-hidden border-b border-slate-200/60 bg-gradient-to-b from-indigo-50/30 via-white to-slate-50/50">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center mb-20">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-indigo-200 bg-indigo-50/80 text-indigo-700 text-xs font-semibold rounded-full mb-8 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                Adaptive Neural Learning Core
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl sm:text-7xl lg:text-8xl font-display font-black text-slate-900 leading-[1.05] mb-8 tracking-tight"
              >
                Forge Your Learning <br />
                <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">Path with Precision.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 leading-relaxed mb-14 max-w-2xl mx-auto font-normal"
              >
                Verticle utilizes precision AI diagnostics to map enterprise skill gaps 
                and architect automated, high-fidelity personalized learning roadmaps.
              </motion.p>

              {/* Role Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16"
              >
                <Link href="/login?role=learner" className="group">
                  <div className="card-industrial h-full p-8 md:p-10 text-left bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                    <div className="w-14 h-14 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Learner Portal</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal mb-8">
                      Access personalized AI roadmaps, self-paced modules, and skill diagnostics.
                    </p>
                    <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-all">
                      Continue Learning <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/signup?role=hr" className="group">
                  <div className="card-industrial h-full p-8 md:p-10 text-left bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                    <div className="w-14 h-14 rounded-xl border border-sky-100 bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Admin & HR Console</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal mb-8">
                      Enterprise-wide talent analytics, curriculum dispatch, and training orchestration.
                    </p>
                    <div className="flex items-center text-xs font-semibold text-sky-600 group-hover:text-sky-700 transition-all">
                      Provision Console <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Schematic Hero Image */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xl shadow-slate-200/80">
                <div className="h-11 border-b border-slate-200 bg-slate-50/80 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="ml-4 h-5 px-4 bg-white rounded-md border border-slate-200/80 text-[10px] text-slate-400 flex items-center">
                    app.verticle.ai/dashboard
                  </div>
                </div>
                <div className="relative aspect-[16/9] w-full bg-slate-50">
                  <Image 
                    src="/verticle_pro_hero.png" 
                    alt="Verticle Modern Dashboard" 
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase mb-2 block">Enterprise Features</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
              Engineered for Seamless Competency Growth
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gap Analysis",
                desc: "High-fidelity diagnostics to isolate and quantify skill deficiencies across teams.",
                tint: "bg-indigo-50 border-indigo-100 text-indigo-600"
              },
              {
                title: "Dynamic Routing",
                desc: "Real-time curriculum adjustment and personalized sequencing based on assessment performance.",
                tint: "bg-sky-50 border-sky-100 text-sky-600"
              },
              {
                title: "Enterprise Core",
                desc: "Compliant data siloing, organizational scoping, and role-based access orchestration.",
                tint: "bg-emerald-50 border-emerald-100 text-emerald-600"
              }
            ].map((feature, i) => (
              <div key={i} className="card-industrial p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300">
                <div className="h-1.5 w-10 rounded-full bg-indigo-600 mb-6" />
                <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-normal">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-16 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center">
              <Sparkles className="text-indigo-600 w-4 h-4" />
            </div>
            <span className="font-display font-bold text-slate-900 tracking-tight text-base">VERTICLE</span>
          </div>
          <div className="text-xs font-medium text-slate-400">
            © 2026 Verticle Systems Inc. All rights reserved.
          </div>
          <div className="flex gap-8 text-xs font-medium text-slate-500">
            <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
