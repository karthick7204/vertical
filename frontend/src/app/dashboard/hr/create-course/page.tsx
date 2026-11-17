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
  Plus, 
  Trash2, 
  Save, 
  Video, 
  FileText, 
  FileIcon, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { courseService } from '@/services/courseService';

type ResourceType = 'video' | 'text' | 'pdf' | 'document';

interface SubModuleInput {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  estimatedTime?: number;
}

interface ModuleInput {
  id: string;
  title: string;
  type: ResourceType;
  content: string;
  skillsCovered: string;
  isExpanded: boolean;
  subModules: SubModuleInput[];
}

export default function CreateCoursePage() {
  const { logout } = useAuth();

  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  
  const [modules, setModules] = useState<ModuleInput[]>([
    {
      id: '1',
      title: 'Foundation Systems',
      type: 'video',
      content: '',
      skillsCovered: 'Architecture, Systems',
      isExpanded: true,
      subModules: []
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const addModule = () => {
    const newModule: ModuleInput = {
      id: Date.now().toString(),
      title: `Module 0${modules.length + 1} Architecture`,
      type: 'text',
      content: '',
      skillsCovered: '',
      isExpanded: true,
      subModules: []
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const toggleExpand = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  const updateModule = (id: string, updates: Partial<ModuleInput>) => {
    setModules(modules.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // Sub-modules handlers
  const addSubModule = (moduleId: string) => {
    const newSub: SubModuleInput = {
      id: Date.now().toString(),
      title: 'New Sub-Topic',
      content: ''
    };
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          subModules: [...m.subModules, newSub]
        };
      }
      return m;
    }));
  };

  const removeSubModule = (moduleId: string, subId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          subModules: m.subModules.filter(sm => sm.id !== subId)
        };
      }
      return m;
    }));
  };

  const updateSubModule = (moduleId: string, subId: string, updates: Partial<SubModuleInput>) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          subModules: m.subModules.map(sm => sm.id === subId ? { ...sm, ...updates } : sm)
        };
      }
      return m;
    }));
  };

  const handleSave = async () => {
    if (!courseTitle) {
      alert('Internal Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: courseTitle,
        description,
        category,
        modules: modules.map(m => ({
          title: m.title,
          content: m.content,
          type: m.type,
          videoUrl: m.type === 'video' ? m.content : undefined,
          skillsCovered: m.skillsCovered.split(',').map(s => s.trim()).filter(Boolean),
          subModules: m.subModules.map(sm => ({
            title: sm.title,
            content: sm.content,
            videoUrl: sm.videoUrl,
            estimatedTime: sm.estimatedTime
          }))
        }))
      };

      await courseService.createCourse(payload);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Error creating course');
    } finally {
      setIsSaving(false);
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
            <Link href="/dashboard/hr/create-course" className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-semibold text-xs shadow-xs transition-all">
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
            <Link href="/dashboard/hr/invitations" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-xs">
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
          <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/hr/courses" className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Course Architect</h1>
                <p className="text-xs text-slate-400 font-medium">Design and deploy structured learning roadmaps</p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving || isSuccess}
              className="btn-yellow px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
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

          <div className="p-8 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sidebar Config */}
              <div className="lg:col-span-1 space-y-6">
                <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100">Core Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Internal Title</label>
                      <input 
                        type="text" 
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="e.g. Systems Architecture 101"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category Segment</label>
                      <select 
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs cursor-pointer focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Summary</label>
                      <textarea 
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-xs h-28 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="Define the strategic objectives of this curriculum..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 text-indigo-900 text-xs font-normal leading-relaxed">
                  "Architecture is the art of structuring complexity. Curriculum is the craft of making it accessible."
                </div>
              </div>

              {/* Module Builder */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Module Composition 
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold">{modules.length} Segments</span>
                  </h2>
                  <button 
                    onClick={addModule}
                    className="border border-slate-200 bg-white text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Segment
                  </button>
                </div>

                <div className="space-y-4">
                  {modules.map((mod, index) => (
                    <motion.div 
                      key={mod.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
                    >
                      <div 
                        className={`p-4 flex items-center justify-between cursor-pointer border-b border-slate-100 ${mod.isExpanded ? 'bg-slate-50/50' : ''}`}
                        onClick={() => toggleExpand(mod.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                            0{index + 1}
                          </span>
                          <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none font-semibold text-xs text-slate-900 focus:outline-none px-2 py-1 min-w-0"
                            value={mod.title}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeModule(mod.id); }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {mod.isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {mod.isExpanded && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="p-6 space-y-5 bg-white"
                          >
                            <div className="flex gap-2 p-1 border border-slate-200 rounded-xl w-fit bg-slate-50/50">
                              {[
                                { type: 'video', icon: Video },
                                { type: 'text', icon: FileText },
                                { type: 'pdf', icon: FileIcon },
                                { type: 'document', icon: FileIcon },
                              ].map((item) => (
                                <button
                                  key={item.type}
                                  onClick={() => updateModule(mod.id, { type: item.type as ResourceType })}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    mod.type === item.type 
                                      ? 'bg-indigo-600 text-white shadow-xs' 
                                      : 'text-slate-600 hover:bg-slate-200/60'
                                  }`}
                                >
                                  <item.icon className="w-3 h-3" /> {item.type}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-700">Content Source / Raw Text</label>
                              <textarea 
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-normal text-xs h-28 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                placeholder={mod.type === 'video' ? 'Paste Video URL...' : 'Enter module content...'}
                                value={mod.content}
                                onChange={(e) => updateModule(mod.id, { content: e.target.value })}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-700">Skills Covered (Comma Separated)</label>
                              <input 
                                type="text" 
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-normal text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                placeholder="e.g. React, TypeScript, State Management"
                                value={mod.skillsCovered}
                                onChange={(e) => updateModule(mod.id, { skillsCovered: e.target.value })}
                              />
                            </div>

                            {/* Sub-Modules Section */}
                            <div className="pt-5 border-t border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                  Sub-Modules <span className="text-slate-400 font-normal">// Optional</span>
                                </h4>
                                <button 
                                  onClick={() => addSubModule(mod.id)}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 bg-indigo-50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Sub-Module
                                </button>
                              </div>

                              <div className="space-y-3">
                                {mod.subModules.map((sm) => (
                                  <div key={sm.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3 relative group">
                                    <button 
                                      onClick={() => removeSubModule(mod.id, sm.id)}
                                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <div className="flex gap-4">
                                      <div className="flex-1">
                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Sub-Module Title</label>
                                        <input 
                                          type="text" 
                                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-xs text-slate-800"
                                          value={sm.title}
                                          onChange={(e) => updateSubModule(mod.id, sm.id, { title: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Sub-Module Content</label>
                                      <textarea 
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-normal text-xs text-slate-800 h-20"
                                        placeholder="Specific details for this sub-module..."
                                        value={sm.content}
                                        onChange={(e) => updateSubModule(mod.id, sm.id, { content: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
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
