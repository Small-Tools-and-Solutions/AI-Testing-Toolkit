/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Guide from './components/Guide';
import TestPackList from './components/TestPackList';
import TestPackEditor from './components/TestPackEditor';
import TestExecution from './components/TestExecution';
import TestLibrary from './components/TestLibrary';
import ReportView from './components/ReportView';
import { BookOpen, ClipboardList, Library, ShieldCheck, Pin, PinOff, Sun, Moon } from 'lucide-react';
import { MemoryStoreProvider } from './lib/memoryStore';

type View = 'guide' | 'missions' | 'library';

export default function App() {
  return (
    <MemoryStoreProvider>
      <AppContent />
    </MemoryStoreProvider>
  );
}

function AppContent() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [currentView, setCurrentView] = useState<View>('missions');
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve intelligence access logs:", e);
    }
  }, []);

  const navigateToPack = (id: string, mode: 'edit' | 'run' | 'report' = 'run') => {
    // Update recently viewed
    try {
      const updated = [id, ...recentlyViewed.filter(pid => pid !== id)].slice(0, 5);
      setRecentlyViewed(updated);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to commit access log to local storage:", e);
    }

    setActivePackId(id);
    if (mode === 'edit') {
      setIsEditing(true);
      setIsExecuting(false);
      setIsReporting(false);
    } else if (mode === 'run') {
      setIsEditing(false);
      setIsExecuting(true);
      setIsReporting(false);
    } else {
      setIsEditing(false);
      setIsExecuting(false);
      setIsReporting(true);
    }
  };

  const resetViews = () => {
    setIsEditing(false);
    setIsExecuting(false);
    setIsReporting(false);
    setActivePackId(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-blueprint-paper font-sans selection:bg-blueprint-line-solid/30">
      {/* Dynamic Sidebar Navigation */}
      <aside className={`
        w-full lg:bg-blueprint-paper border-b border-blueprint-line lg:border-b-0 lg:border-r border-blueprint-line flex flex-col gap-10 z-20 group transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden
        ${isSidebarPinned ? 'lg:w-64' : 'lg:w-20 lg:hover:w-64'}
      `}>
        <div className="flex items-center justify-between p-6 pb-0 overflow-hidden">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blueprint-line-solid shrink-0" size={28} />
            <div className={`flex flex-col transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <span className="font-bold text-lg uppercase tracking-widest text-blueprint-white">Audit Suite</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarPinned(!isSidebarPinned)}
            className={`
              hidden lg:flex p-1.5 border border-blueprint-line-solid/20 rounded-xs transition-all
              ${isSidebarPinned ? 'bg-blueprint-line-solid text-blueprint-paper border-blueprint-line-solid' : 'text-blueprint-line-solid/40 hover:text-blueprint-line-solid hover:border-blueprint-line-solid/60 opacity-0 group-hover:opacity-100'}
            `}
          >
            {isSidebarPinned ? <Pin size={12} /> : <PinOff size={12} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          <NavButton 
            active={currentView === 'guide'} 
            isSidebarPinned={isSidebarPinned}
            onClick={() => { setCurrentView('guide'); resetViews(); }} 
            icon={<BookOpen size={20} />} 
            label="GUIDE" 
          />
          <NavButton 
            active={currentView === 'library'} 
            isSidebarPinned={isSidebarPinned}
            onClick={() => { setCurrentView('library'); resetViews(); }} 
            icon={<Library size={20} />} 
            label="LIBRARY" 
          />
          <NavButton 
            active={currentView === 'missions' && !activePackId} 
            isSidebarPinned={isSidebarPinned}
            onClick={() => { setCurrentView('missions'); resetViews(); }} 
            icon={<ClipboardList size={20} />} 
            label="ASSESSMENTS" 
          />
        </nav>

        <div className="mt-auto px-4 pb-10">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`
              w-full p-4 flex items-center gap-6 transition-all relative group/theme transition-colors
              text-blueprint-line-solid/40 hover:text-blueprint-line-solid hover:bg-blueprint-line-solid/5
            `}
          >
            <div className="shrink-0">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <span className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Schematic Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto space-y-10">
          {isEditing && activePackId && (
            <TestPackEditor 
              id={activePackId} 
              onClose={() => resetViews()} 
              onExecute={() => navigateToPack(activePackId)} 
            />
          )}
          {isExecuting && activePackId && (
            <TestExecution 
              id={activePackId} 
              onClose={() => resetViews()} 
              onReport={() => navigateToPack(activePackId, 'report')}
            />
          )}
          {isReporting && activePackId && (
            <ReportView 
              id={activePackId} 
              onClose={() => resetViews()} 
            />
          )}

          {!activePackId && (
            <>
              {currentView === 'guide' && <Guide />}
              {currentView === 'missions' && <TestPackList onSelectPack={navigateToPack} />}
              {currentView === 'library' && <TestLibrary />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isSidebarPinned }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isSidebarPinned?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full p-4 flex items-center gap-6 transition-all relative group/btn overflow-hidden
        ${active 
          ? 'text-blueprint-line-solid bg-blueprint-line-solid/5' 
          : 'text-blueprint-line-solid text-opacity-60 hover:text-opacity-100 hover:bg-blueprint-line-solid/5'
        }
      `}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blueprint-line-solid" />
      )}
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform shrink-0`}>
        {icon}
      </div>
      <span className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {label}
      </span>
      
      {active && (
        <span className={`ml-auto animate-pulse ${isSidebarPinned ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>_</span>
      )}
    </button>
  );
}
