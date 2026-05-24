'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ArrowLeft, 
  Play, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Clock, 
  Loader2, 
  Zap,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { courseService } from '@/services/courseService';
import { assessmentService } from '@/services/assessmentService';
import { useAuth } from '@/context/AuthContext';

interface SubModule {
  title: string;
  content?: string;
  videoUrl?: string;
}

interface Module {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  skillsCovered: string[];
  estimatedTime?: number;
  subModules: SubModule[];
}

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.courseId as string;

  // State
  const [course, setCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { status: string; completionPercentage: number }>>({});
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [activeSubModuleIndex, setActiveSubModuleIndex] = useState<number>(-1); // -1 means viewing main module content
  const [completedSubModules, setCompletedSubModules] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isPathPersonalized, setIsPathPersonalized] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);

        // Fetch personalized path
        let pathModules: Module[] = [];
        let personalized = false;
        try {
          const pathData = await assessmentService.getPersonalizedPath(courseId);
          if (pathData && pathData.recommendedOrder && pathData.recommendedOrder.length > 0) {
            pathModules = pathData.recommendedOrder;
            personalized = true;
          }
        } catch (pathErr) {
          console.log('No personalized path found, loading all modules instead.');
        }

        // Fallback: If no personalized path, get all course modules
        if (pathModules.length === 0) {
          const defaultModules = await apiClientGetModules(courseId);
          pathModules = defaultModules;
        }

        setModules(pathModules);
        setIsPathPersonalized(personalized);

        // Fetch course progress
        const progressList = await courseService.getCourseProgress(courseId);
        const map: Record<string, { status: string; completionPercentage: number }> = {};
        progressList.forEach((p: any) => {
          map[p.moduleId] = {
            status: p.status,
            completionPercentage: p.completionPercentage
          };
        });
        setProgressMap(map);

        // Load submodule completion state from localStorage
        if (user?.id) {
          const storageKey = `vertical_completed_submodules_${user.id}_${courseId}`;
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            setCompletedSubModules(JSON.parse(savedData));
          }
        }

        // Set initial active module
        if (pathModules.length > 0) {
          // Find first incomplete module, or default to 0
          let firstIncomplete = 0;
          for (let i = 0; i < pathModules.length; i++) {
            const mId = pathModules[i]._id;
            if (!map[mId] || map[mId].status !== 'COMPLETED') {
              firstIncomplete = i;
              break;
            }
          }
          setActiveModuleIndex(firstIncomplete);
          // Set initial subModule index (-1 for main module content, or 0 if they have submodules)
          if (pathModules[firstIncomplete].subModules && pathModules[firstIncomplete].subModules.length > 0) {
            setActiveSubModuleIndex(0);
          } else {
            setActiveSubModuleIndex(-1);
          }

          // Expand the active module
          setExpandedModules({ [pathModules[firstIncomplete]._id]: true });
        }

      } catch (err: any) {
        console.error('Error fetching course play data:', err);
        setErrorMsg(err.message || 'Failed to load course contents.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, user?.id]);

  // Fallback to direct client API call for all modules
  const apiClientGetModules = async (cId: string): Promise<Module[]> => {
    // Dynamically retrieve all modules using apiClient wrapper
    const { apiClient } = await import('@/services/apiClient');
    return apiClient.get(`/courses/${cId}/modules`);
  };

  // Toggle submodule completion
  const handleToggleSubModule = async (moduleId: string, subModuleIndex: number) => {
    if (!user?.id) return;
    
    const key = `${moduleId}_${subModuleIndex}`;
    const newCompleted = { ...completedSubModules, [key]: !completedSubModules[key] };
    setCompletedSubModules(newCompleted);

    // Save to localStorage
    const storageKey = `vertical_completed_submodules_${user.id}_${courseId}`;
    localStorage.setItem(storageKey, JSON.stringify(newCompleted));

    // Find the module details
    const targetModule = modules.find(m => m._id === moduleId);
    if (!targetModule) return;

    const totalSub = targetModule.subModules?.length || 0;
    if (totalSub === 0) return;

    // Calculate percentage
    let completedCount = 0;
    for (let i = 0; i < totalSub; i++) {
      if (newCompleted[`${moduleId}_${i}`]) {
        completedCount++;
      }
    }
    const percent = Math.round((completedCount / totalSub) * 100);
    const status = percent === 100 ? 'COMPLETED' : percent > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    // Optimistically update local progress map
    setProgressMap(prev => ({
      ...prev,
      [moduleId]: { status, completionPercentage: percent }
    }));

    try {
      await courseService.updateModuleProgress(courseId, moduleId, status, percent);
    } catch (error) {
      console.error('Failed to sync progress to database:', error);
    }
  };

  // Toggle module main completion (if no submodules exist)
  const handleToggleMainModuleCompletion = async (moduleId: string) => {
    const isCompleted = progressMap[moduleId]?.status === 'COMPLETED';
    const percent = isCompleted ? 0 : 100;
    const status = isCompleted ? 'NOT_STARTED' : 'COMPLETED';

    setProgressMap(prev => ({
      ...prev,
      [moduleId]: { status, completionPercentage: percent }
    }));

    try {
      await courseService.updateModuleProgress(courseId, moduleId, status, percent);
    } catch (error) {
      console.error('Failed to sync progress to database:', error);
    }
  };

  // Toggle module accordion expansion
  const toggleExpandModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Calculate overall course progress
  const overallProgress = (() => {
    if (modules.length === 0) return 0;
    let sum = 0;
    modules.forEach(m => {
      sum += progressMap[m._id]?.completionPercentage || 0;
    });
    return Math.round(sum / modules.length);
  })();

  // Parse YouTube URL to embed
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    } catch (e) {
      console.error("Error parsing youtube url", e);
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  // Navigation handlers
  const handleNext = () => {
    const currentModule = modules[activeModuleIndex];
    const totalSubModules = currentModule?.subModules?.length || 0;

    if (activeSubModuleIndex < totalSubModules - 1) {
      // Go to next submodule in current module
      setActiveSubModuleIndex(activeSubModuleIndex + 1);
    } else if (activeModuleIndex < modules.length - 1) {
      // Go to next module
      const nextIndex = activeModuleIndex + 1;
      setActiveModuleIndex(nextIndex);
      // Auto expand next module
      setExpandedModules(prev => ({ ...prev, [modules[nextIndex]._id]: true }));
      // Set to first submodule if it has any, otherwise main module view
      if (modules[nextIndex].subModules && modules[nextIndex].subModules.length > 0) {
        setActiveSubModuleIndex(0);
      } else {
        setActiveSubModuleIndex(-1);
      }
    }
  };

  const handlePrev = () => {
    if (activeSubModuleIndex > 0) {
      // Go to previous submodule
      setActiveSubModuleIndex(activeSubModuleIndex - 1);
    } else if (activeSubModuleIndex === 0) {
      // Go to main module details
      setActiveSubModuleIndex(-1);
    } else if (activeModuleIndex > 0) {
      // Go to previous module
      const prevIndex = activeModuleIndex - 1;
      setActiveModuleIndex(prevIndex);
      const prevModule = modules[prevIndex];
      const prevTotalSub = prevModule.subModules?.length || 0;
      if (prevTotalSub > 0) {
        setActiveSubModuleIndex(prevTotalSub - 1);
      } else {
        setActiveSubModuleIndex(-1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
        <span className="text-xs font-black uppercase tracking-widest text-black">Decrypting course parameters...</span>
      </div>
    );
  }

  if (errorMsg || !course) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 border-4 border-black bg-red-100 flex items-center justify-center mb-6">
          <Info className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-black uppercase italic mb-4">Launch Failure</h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-8 max-w-md">
          {errorMsg || 'Course not found or database record missing.'}
        </p>
        <Link href="/dashboard/learner" className="bg-black text-white px-8 py-4 font-black uppercase text-xs tracking-widest border-4 border-black hover:bg-brand-primary hover:text-black transition-all shadow-[4px_4px_0px_0px_#000000]">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Active module & submodule references
  const currentModule = modules[activeModuleIndex];
  const isViewingSubmodule = activeSubModuleIndex >= 0 && currentModule?.subModules?.length > activeSubModuleIndex;
  const currentSubModule = isViewingSubmodule ? currentModule.subModules[activeSubModuleIndex] : null;

  // Active video & content
  const activeTitle = currentSubModule ? currentSubModule.title : currentModule?.title;
  const activeContent = currentSubModule ? currentSubModule.content : currentModule?.content;
  const activeVideo = currentSubModule ? currentSubModule.videoUrl : currentModule?.videoUrl;
  const embedUrl = getYouTubeEmbedUrl(activeVideo);

  // Status checkers for controls
  const isFirstItem = activeModuleIndex === 0 && activeSubModuleIndex <= -1;
  const isLastItem = activeModuleIndex === modules.length - 1 && 
    (activeSubModuleIndex === (currentModule?.subModules?.length || 0) - 1 || (currentModule?.subModules?.length || 0) === 0);

  return (
    <ProtectedRoute allowedRoles={['LEARNER', 'HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-zinc-50 flex flex-col text-black font-sans">
        
        {/* Header */}
        <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-6 md:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/learner" 
              className="p-2 border-2 border-black hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase italic tracking-widest">
                {course.category}
              </span>
              <h1 className="text-base md:text-lg font-black uppercase tracking-tight italic truncate max-w-[200px] sm:max-w-[400px]">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className="block text-[9px] font-black uppercase text-zinc-400">Course Progress</span>
              <span className="text-sm font-black italic">{overallProgress}% COMPLETE</span>
            </div>
            <div className="w-32 h-3 border-2 border-black bg-zinc-100 overflow-hidden relative">
              <div 
                className="h-full bg-brand-primary transition-all duration-500" 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            
            {overallProgress === 100 && (
              <div className="bg-green-500 text-black border-2 border-black px-3 py-1 text-[9px] font-black uppercase italic tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000]">
                <Award className="w-3. h-3" />
                Passed
              </div>
            )}
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-5rem)]">
          
          {/* Left Pane - Syllabus / Sidebar */}
          <aside className="w-full lg:w-96 border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-white flex flex-col overflow-y-auto shrink-0 z-10">
            <div className="p-4 border-b-2 border-black bg-zinc-50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Syllabus Sequence
              </span>
              {isPathPersonalized && (
                <span className="bg-brand-primary text-black border border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-[1px_1px_0px_0px_#000000]">
                  <Zap className="w-2.5 h-2.5 fill-black" />
                  AI Path
                </span>
              )}
            </div>

            <div className="flex-1 divide-y-2 divide-black">
              {modules.map((mod, modIdx) => {
                const isExpanded = !!expandedModules[mod._id];
                const modProgress = progressMap[mod._id] || { status: 'NOT_STARTED', completionPercentage: 0 };
                const hasSubmodules = mod.subModules && mod.subModules.length > 0;
                const isActiveModule = activeModuleIndex === modIdx;

                return (
                  <div key={mod._id} className={`transition-all ${isActiveModule ? 'bg-brand-primary/5' : ''}`}>
                    {/* Module Accordion Header */}
                    <div 
                      onClick={() => {
                        setActiveModuleIndex(modIdx);
                        setActiveSubModuleIndex(hasSubmodules ? 0 : -1);
                        toggleExpandModule(mod._id);
                      }}
                      className={`p-4 flex items-start gap-3 cursor-pointer select-none hover:bg-zinc-50 transition-all ${
                        isActiveModule ? 'border-l-4 border-black' : ''
                      }`}
                    >
                      <div className="bg-black text-brand-primary text-[10px] font-black italic w-6 h-6 shrink-0 flex items-center justify-center border border-black">
                        {modIdx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-black uppercase text-xs tracking-wider text-black leading-tight truncate">
                          {mod.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {mod.estimatedTime && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {mod.estimatedTime} Min
                            </span>
                          )}
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 border border-black/10 ${
                            modProgress.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-700' 
                              : modProgress.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {modProgress.status === 'COMPLETED' ? 'COMPLETED' : modProgress.status === 'IN_PROGRESS' ? `${modProgress.completionPercentage}%` : 'NOT STARTED'}
                          </span>
                        </div>
                      </div>

                      <button className="text-black p-0.5 border border-black/15 bg-white hover:bg-zinc-100">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Submodules list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && hasSubmodules && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-zinc-50/50 border-t border-black/10"
                        >
                          <div className="py-2">
                            {/* Main module info slide link */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModuleIndex(modIdx);
                                setActiveSubModuleIndex(-1);
                              }}
                              className={`px-6 py-2 flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider ${
                                isActiveModule && activeSubModuleIndex === -1 ? 'bg-black text-brand-primary' : 'text-zinc-600 hover:bg-zinc-100'
                              }`}
                            >
                              <Info className="w-3.5 h-3.5 shrink-0" />
                              Overview & Objectives
                            </div>

                            {/* Submodule items */}
                            {mod.subModules.map((sub, subIdx) => {
                              const isCompleted = !!completedSubModules[`${mod._id}_${subIdx}`];
                              const isActiveSub = isActiveModule && activeSubModuleIndex === subIdx;

                              return (
                                <div 
                                  key={subIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModuleIndex(modIdx);
                                    setActiveSubModuleIndex(subIdx);
                                  }}
                                  className={`pl-8 pr-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all border-l-2 ${
                                    isActiveSub 
                                      ? 'bg-brand-primary/10 border-black font-bold' 
                                      : 'border-transparent hover:bg-zinc-100'
                                  }`}
                                >
                                  {/* Custom Checkbox */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSubModule(mod._id, subIdx);
                                    }}
                                    className="text-black shrink-0 hover:scale-105 transition-transform"
                                  >
                                    {isCompleted ? (
                                      <CheckSquare className="w-4 h-4 fill-brand-primary text-black" />
                                    ) : (
                                      <Square className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </button>
                                  
                                  <span className={`text-[11px] uppercase tracking-wider leading-snug ${
                                    isCompleted ? 'line-through text-zinc-400' : 'text-black'
                                  } ${isActiveSub ? 'font-black text-black' : ''}`}>
                                    {sub.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Pane - Course Player display */}
          <main className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Active Info Banner */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    Module {activeModuleIndex + 1} // {activeSubModuleIndex === -1 ? 'OVERVIEW' : `LESSON ${activeSubModuleIndex + 1}`}
                  </span>
                  {currentModule?.skillsCovered && currentModule.skillsCovered.length > 0 && (
                    <div className="flex gap-1">
                      {currentModule.skillsCovered.map((skill, i) => (
                        <span key={i} className="bg-brand-primary/20 text-[8px] font-black uppercase px-2 py-0.5 border border-black/10 text-black">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000]">
                  <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tight mb-6">
                    {activeTitle}
                  </h2>

                  {/* Video Screen */}
                  <div className="mb-8 border-4 border-black bg-black aspect-video relative overflow-hidden group shadow-[4px_4px_0px_0px_#facc15]">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeTitle}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-zinc-950">
                        <div className="w-16 h-16 border-2 border-dashed border-zinc-700 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                          <Play className="w-6 h-6 text-zinc-600 fill-zinc-600" />
                        </div>
                        <h4 className="font-black uppercase text-xs tracking-widest text-white mb-1">Conceptual Guide</h4>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 max-w-xs">
                          No screen demo is associated. Study the syllabus documentation directives below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Text details content */}
                  {activeContent ? (
                    <div className="prose max-w-none text-zinc-800">
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-4">Study Directives</h4>
                      <p className="text-xs md:text-sm font-semibold uppercase tracking-wider leading-relaxed bg-zinc-50 p-4 border-2 border-dashed border-black/15 text-zinc-700 whitespace-pre-line">
                        {activeContent}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-zinc-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-black/10">
                      No additional study notes available for this section.
                    </div>
                  )}

                  {/* If no submodules, allow completing main module here */}
                  {currentModule && (!currentModule.subModules || currentModule.subModules.length === 0) && (
                    <div className="mt-8 pt-6 border-t-2 border-black flex justify-end">
                      <button
                        onClick={() => handleToggleMainModuleCompletion(currentModule._id)}
                        className={`flex items-center gap-2 px-6 py-3 font-black uppercase text-xs tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                          progressMap[currentModule._id]?.status === 'COMPLETED'
                            ? 'bg-green-500 text-black'
                            : 'bg-white text-black hover:bg-zinc-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {progressMap[currentModule._id]?.status === 'COMPLETED' ? 'Module Completed' : 'Mark Module Completed'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Player Bottom Navigation Control Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t-2 border-black/15">
                <button
                  onClick={handlePrev}
                  disabled={isFirstItem}
                  className="px-6 py-4 border-4 border-black bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000] disabled:opacity-30 disabled:pointer-events-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Previous
                </button>

                {isLastItem ? (
                  <button
                    onClick={() => router.push('/dashboard/learner')}
                    className="px-8 py-4 border-4 border-black bg-green-500 text-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000] hover:bg-green-600 transition-all flex items-center gap-2"
                  >
                    Finish Course
                    <Award className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // If in a submodule, mark it complete, then advance
                      if (isViewingSubmodule) {
                        const isCompleted = !!completedSubModules[`${currentModule._id}_${activeSubModuleIndex}`];
                        if (!isCompleted) {
                          handleToggleSubModule(currentModule._id, activeSubModuleIndex);
                        }
                      }
                      handleNext();
                    }}
                    className="px-8 py-4 border-4 border-black bg-brand-primary text-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000] hover:bg-yellow-500 transition-all flex items-center gap-2"
                  >
                    {isViewingSubmodule && !completedSubModules[`${currentModule._id}_${activeSubModuleIndex}`]
                      ? 'Complete & Continue'
                      : 'Next Lesson'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </main>

        </div>
      </div>
    </ProtectedRoute>
  );
}
