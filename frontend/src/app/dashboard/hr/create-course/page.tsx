'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Video, 
  FileText, 
  File as FileIcon, 
  ChevronDown, 
  ChevronUp,
  Save,
  Loader2,
  CheckCircle2,
  Layers,
  BarChart3,
  Users,
  Mail,
  Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { courseService } from '@/services/courseService';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type ResourceType = 'video' | 'pdf' | 'document' | 'text';

interface Module {
  id: string;
  title: string;
  type: ResourceType;
  content: string;
  isExpanded: boolean;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [modules, setModules] = useState<Module[]>([
    { id: '1', title: 'Introduction to Core Concepts', type: 'video', content: '', isExpanded: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module Architecture',
      type: 'text',
      content: '',
      isExpanded: true
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    if (modules.length > 1) {
      setModules(modules.filter(m => m.id !== id));
    }
  };

  const updateModule = (id: string, updates: Partial<Module>) => {
    setModules(modules.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const toggleExpand = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  const handleSave = async () => {
    if (!courseTitle) return;
    
    setIsSaving(true);
    
    try {
      const courseData = {
        title: courseTitle,
        description,
        category,
        isPublic: true,
        modules: modules.map((m, index) => ({
          title: m.title,
          content: m.content,
          type: m.type,
          order: index
        }))
      };

      await courseService.createCourse(courseData);
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/hr/courses');
      }, 2000);

    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to deploy course architecture. Check system logs.');
    } finally {
      setIsSaving(false);
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
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all font-black uppercase text-xs tracking-widest">
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
          <header className="h-24 border-b-4 border-black bg-white flex items-center justify-between px-10 sticky top-0 z-10">
            <div className="flex items-center gap-6">
              <Link href="/dashboard/hr/courses" className="p-2 border-2 border-black hover:bg-zinc-100 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight italic">Course Architect</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deploying curriculum // prototype v1.0</p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving || isSuccess}
              className="bg-brand-primary border-4 border-black px-10 py-3 font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all flex items-center gap-3"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transmitting...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Deployed
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Deploy Course
                </>
              )}
            </button>
          </header>

          <div className="p-10 max-w-5xl">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Sidebar Config */}
              <div className="lg:col-span-1 space-y-10">
                <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000]">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-6 pb-2 border-b-2 border-black italic">Core Configuration</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Internal Title</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border-2 border-black bg-zinc-50 font-bold uppercase text-xs focus:bg-white focus:outline-none transition-all"
                        placeholder="e.g. SYSTEMS ARCHITECTURE 101"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Category Segment</label>
                      <select 
                        className="w-full p-3 border-2 border-black bg-zinc-50 font-black text-xs uppercase appearance-none cursor-pointer focus:bg-brand-primary/20 transition-all"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option>Engineering</option>
                        <option>Product Design</option>
                        <option>Data Intelligence</option>
                        <option>Operational Growth</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Executive Summary</label>
                      <textarea 
                        className="w-full p-3 border-2 border-black bg-zinc-50 font-bold text-xs h-32 focus:bg-white focus:outline-none transition-all"
                        placeholder="Define the strategic objectives of this curriculum..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <div className="bg-black text-brand-primary p-6 border-4 border-black italic font-black text-xs uppercase leading-relaxed tracking-wider">
                  "Architecture is the art of how to waste space. Curriculum is the art of how to fill it."
                </div>
              </div>

              {/* Module Builder */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3 text-black">
                    Module Composition 
                    <span className="text-xs bg-black text-white px-3 py-1 font-black italic">{modules.length} Segments</span>
                  </h2>
                  <button 
                    onClick={addModule}
                    className="border-2 border-black bg-white px-4 py-2 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <Plus className="w-3 h-3" /> Add Segment
                  </button>
                </div>

                <div className="space-y-6">
                  {modules.map((mod, index) => (
                    <motion.div 
                      key={mod.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden"
                    >
                      <div 
                        className={`p-4 flex items-center justify-between cursor-pointer border-b-2 border-black ${mod.isExpanded ? 'bg-zinc-50' : ''}`}
                        onClick={() => toggleExpand(mod.id)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="text-[10px] font-black bg-black text-white w-6 h-6 flex items-center justify-center shrink-0 italic">
                            0{index + 1}
                          </span>
                          <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none font-black uppercase text-xs focus:outline-none focus:bg-brand-primary/10 px-2 py-1 min-w-0"
                            value={mod.title}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeModule(mod.id); }}
                            className="p-1 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {mod.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {mod.isExpanded && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="p-6 space-y-6 bg-white"
                          >
                            <div className="flex gap-4 p-1 border-2 border-black w-fit bg-zinc-50">
                              {[
                                { type: 'video', icon: Video },
                                { type: 'text', icon: FileText },
                                { type: 'pdf', icon: FileIcon },
                                { type: 'document', icon: FileIcon },
                              ].map((item) => (
                                <button
                                  key={item.type}
                                  onClick={() => updateModule(mod.id, { type: item.type as ResourceType })}
                                  className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    mod.type === item.type ? 'bg-black text-white shadow-[2px_2px_0px_0px_#facc15]' : 'hover:bg-zinc-200'
                                  }`}
                                >
                                  <item.icon className="w-3 h-3" /> {item.type}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-4">
                              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Content Source / Raw Text</label>
                              <textarea 
                                className="w-full p-4 border-2 border-black bg-zinc-50 font-bold text-xs h-32 focus:bg-white focus:outline-none transition-all"
                                placeholder={mod.type === 'video' ? 'Paste Video URL...' : 'Enter module content...'}
                                value={mod.content}
                                onChange={(e) => updateModule(mod.id, { content: e.target.value })}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
