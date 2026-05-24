'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'LEARNER' | 'HR_ADMIN' | 'SUPER_ADMIN';
  organizationId?: string;
  personalizedPath?: string[];
  focusSuggestions?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setIsSessionExpired(true);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('verticle_user');
    const token = localStorage.getItem('verticle_token');

    if (storedUser && token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('verticle_token');
            localStorage.removeItem('verticle_user');
            setUser(null);
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              setIsSessionExpired(true);
            }
          } else {
            setUser(JSON.parse(storedUser));
          }
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('verticle_token', token);
    localStorage.setItem('verticle_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('verticle_token');
    localStorage.removeItem('verticle_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}

      {/* Custom Session Expired Modal */}
      <AnimatePresence>
        {isSessionExpired && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000000] text-black relative"
            >
              <button 
                onClick={() => setIsSessionExpired(false)}
                className="absolute top-4 right-4 text-black hover:bg-zinc-100 border-2 border-black p-1 transition-all"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border-2 border-black bg-brand-primary flex items-center justify-center font-black">
                  <Lock className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Session Expired</h3>
              </div>

              <p className="text-xs font-bold text-zinc-700 leading-relaxed mb-8 uppercase tracking-widest bg-zinc-50 p-4 border-2 border-dashed border-black">
                Your secure connection has timed out. Please log in again to resume your learning trajectory.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setIsSessionExpired(false);
                    router.push('/login?expired=true');
                  }}
                  className="flex-1 bg-brand-primary text-black border-4 border-black py-4 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  Login Again
                </button>
                
                <button
                  onClick={() => setIsSessionExpired(false)}
                  className="flex-1 bg-white text-black border-4 border-black py-4 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
