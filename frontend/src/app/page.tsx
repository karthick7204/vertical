'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ArrowRight, Sparkles, Target, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden selection:bg-brand-primary selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b-2 border-black bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-black bg-brand-primary flex items-center justify-center">
              <Sparkles className="text-black w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-display font-black tracking-tighter text-black">VERTICLE</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-[0.2em]">
            <Link href="#features" className="hover:bg-brand-primary px-2 transition-colors">Platform</Link>
            <Link href="#solutions" className="hover:bg-brand-primary px-2 transition-colors">Solutions</Link>
            <Link href="#enterprise" className="hover:bg-brand-primary px-2 transition-colors">Enterprise</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-primary px-2 transition-colors">Sign In</Link>
            <Link 
              href="/signup" 
              className="btn-yellow px-8 py-3 rounded text-xs transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-48 pb-32 overflow-hidden border-b-2 border-black">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center mb-24">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-[4px_4px_0px_0px_#000000]"
              >
                <Zap className="w-4 h-4 fill-current" />
                Adaptive Neural Learning Core
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl lg:text-[10rem] font-display font-black text-black leading-[0.85] mb-12 tracking-tighter"
              >
                FORGE YOUR <br />
                <span className="bg-brand-primary px-4">PATH.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-black leading-relaxed mb-16 max-w-2xl mx-auto font-bold border-l-4 border-black pl-8 text-left"
              >
                Verticle utilizes precision AI diagnostics to map enterprise skill gaps 
                and architect automated, high-fidelity learning roadmaps.
              </motion.p>

              {/* Role Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20"
              >
                <Link href="/login?role=learner" className="group">
                  <div className="card-industrial h-full p-12 text-left">
                    <div className="w-16 h-16 border-2 border-black bg-zinc-100 flex items-center justify-center mb-10 group-hover:bg-brand-primary transition-all">
                      <GraduationCap className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-black mb-4 tracking-tight uppercase">Learner Core</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-bold">
                      Deploy personalized AI roadmaps and skill-specific assessments.
                    </p>
                    <div className="mt-12 flex items-center text-xs font-black tracking-widest text-black group-hover:bg-brand-primary inline-block pr-2 transition-all uppercase">
                      Execute Initialization <ChevronRight className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/signup?role=hr" className="group">
                  <div className="card-industrial h-full p-12 text-left">
                    <div className="w-16 h-16 border-2 border-black bg-zinc-100 flex items-center justify-center mb-10 group-hover:bg-brand-primary transition-all">
                      <Building2 className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-black mb-4 tracking-tight uppercase">Admin Console</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-bold">
                      Enterprise-wide talent analytics and training orchestration.
                    </p>
                    <div className="mt-12 flex items-center text-xs font-black tracking-widest text-black group-hover:bg-brand-primary inline-block pr-2 transition-all uppercase">
                      Provision System <ChevronRight className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Schematic Hero Image */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="relative border-2 border-black rounded overflow-hidden bg-white shadow-[16px_16px_0px_0px_#000000]">
                <div className="h-10 border-b-2 border-black bg-zinc-100 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-black bg-brand-primary" />
                  <div className="w-3 h-3 rounded-full border-2 border-black" />
                  <div className="w-3 h-3 rounded-full border-2 border-black" />
                </div>
                <div className="relative aspect-[16/9] w-full">
                  <Image 
                    src="/verticle_industrial_hero.png" 
                    alt="Verticle Industrial Light Dashboard" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-40">
          <div className="grid md:grid-cols-3 gap-24">
            {[
              {
                title: "Gap Analysis",
                desc: "High-fidelity diagnostics to isolate and quantify skill deficiencies."
              },
              {
                title: "Dynamic Routing",
                desc: "Real-time curriculum adjustment based on assessment throughput."
              },
              {
                title: "Security Core",
                desc: "FIPS-compliant data siloing and role-based access orchestration."
              }
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="h-2 w-24 bg-black group-hover:bg-brand-primary transition-all mb-10" />
                <h3 className="text-2xl font-black text-black mb-6 tracking-tight uppercase italic">{feature.title}</h3>
                <p className="text-black/70 leading-relaxed font-bold">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-black py-24 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-black bg-brand-primary flex items-center justify-center">
              <Sparkles className="text-black w-6 h-6 fill-current" />
            </div>
            <span className="font-display font-black text-black tracking-widest text-lg uppercase">VERTICLE SYSTEM</span>
          </div>
          <div className="text-xs font-black uppercase tracking-[0.4em] text-black/40">
            STRICTLY CONFIDENTIAL // © 2026
          </div>
          <div className="flex gap-12 text-xs font-black uppercase tracking-[0.2em]">
            <Link href="#" className="hover:bg-brand-primary transition-colors px-2">Privacy</Link>
            <Link href="#" className="hover:bg-brand-primary transition-colors px-2">Terms</Link>
            <Link href="#" className="hover:bg-brand-primary transition-colors px-2">Network</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
