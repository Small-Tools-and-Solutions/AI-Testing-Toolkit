import { useState, useEffect, useRef } from 'react';
import { TestPack, TestCase, AISystem } from '../types';
import { X, Check, FileBarChart, Play, ChevronRight, ChevronLeft, Plus, Tag as TagIcon, Copy, CheckCircle2 } from 'lucide-react';
import { useMemoryStore } from '../lib/memoryStore';

interface TestExecutionProps {
  id: string;
  onClose: () => void;
  onReport: () => void;
}

export default function TestExecution({ id, onClose, onReport }: TestExecutionProps) {
  const { getPack, getSystem, updatePack, getCases, updateCases } = useMemoryStore();
  const [pack, setPack] = useState<TestPack | null>(null);
  const [system, setSystem] = useState<AISystem | null>(null);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copiedType, setCopiedType] = useState<'prompt' | 'expected' | null>(null);
  
  // Local state for editing current case to avoid laggy typing
  const [localResponse, setLocalResponse] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const p = getPack(id);
    if (p) {
      setPack(p);
      const s = getSystem(p.systemId);
      if (s) setSystem(s);
      
      const casesData = getCases(id);
      setCases(casesData);
    }
    setLoading(false);
  }, [id, getPack, getSystem, getCases]);

  // Update local state when switching cases
  useEffect(() => {
    if (cases[currentIndex]) {
      setLocalResponse(cases[currentIndex].actualResponse || '');
      setLocalNotes(cases[currentIndex].notes || '');
      setLocalTags(cases[currentIndex].tags || []);
    }
    setCopiedType(null); // Reset copy status when switching cases
  }, [currentIndex, cases]); // Reset when index or cases change

  const handleCopy = (text: string, type: 'prompt' | 'expected') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const persistChanges = (updates: Partial<TestCase>) => {
    const currentCase = cases[currentIndex];
    if (!currentCase) return;

    setSaving(true);
    
    const updatedCases = cases.map(c => c.id === currentCase.id ? { 
      ...c, 
      ...updates,
      testedAt: new Date().toISOString()
    } : c);
    
    setCases(updatedCases);
    updateCases(id, updatedCases);
    
    const anyFail = updatedCases.some(c => c.result === 'FAIL');
    const allDone = updatedCases.every(c => c.result !== 'NOT TESTED');
    
    const counts = {
      total: updatedCases.length,
      pass: updatedCases.filter(c => c.result === 'PASS').length,
      fail: updatedCases.filter(c => c.result === 'FAIL').length,
      notTested: updatedCases.filter(c => c.result === 'NOT TESTED').length
    };

    let newStatus: 'RED' | 'AMBER' | 'GREEN' = 'AMBER';
    if (anyFail) newStatus = 'RED';
    else if (allDone) newStatus = 'GREEN';
    
    if (pack) {
      updatePack({ 
        ...pack,
        status: newStatus,
        caseCounts: counts,
        updatedAt: new Date().toISOString()
      });
    }
    
    setLastSaved(new Date());
    setSaving(false);
  };

  // Auto-save logic
  useEffect(() => {
    if (loading || !cases[currentIndex]) return;

    const currentCase = cases[currentIndex];
    const hasChanges = 
      localResponse !== (currentCase.actualResponse || '') || 
      localNotes !== (currentCase.notes || '') ||
      JSON.stringify(localTags) !== JSON.stringify(currentCase.tags || []);

    if (hasChanges) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        persistChanges({
          actualResponse: localResponse,
          notes: localNotes,
          tags: localTags
        });
      }, 2000); // 2 second debounce for auto-save
    }

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [localResponse, localNotes, localTags, currentIndex, loading]);

  const addTag = () => {
    if (newTag.trim() && !localTags.includes(newTag.trim())) {
      const updatedTags = [...localTags, newTag.trim()];
      setLocalTags(updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    const updatedTags = localTags.filter(t => t !== tag);
    setLocalTags(updatedTags);
  };

  if (loading || !pack || !system) return <div className="font-mono text-blueprint-line-solid animate-pulse tracking-[0.3em] uppercase flex items-center justify-center p-20">INITIALIZING_SECURE_BYPASS_v4...</div>;

  const currentCase = cases[currentIndex];
  const passCount = cases.filter(c => c.result === 'PASS').length;
  const failCount = cases.filter(c => c.result === 'FAIL').length;
  const totalCompleted = passCount + failCount;
  const passWidth = cases.length > 0 ? (passCount / cases.length) * 100 : 0;
  const failWidth = cases.length > 0 ? (failCount / cases.length) * 100 : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-blueprint-line pb-6 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="blueprint-label px-2 py-0.5 bg-blueprint-line-solid/10 border border-blueprint-line-solid/20">LIVE_PROBE_MONITOR</span>
            <div className={`flex items-center gap-2 px-2 py-0.5 border text-[10px] font-mono font-bold uppercase transition-colors ${pack.status === 'RED' ? 'border-blueprint-error text-blueprint-error bg-blueprint-error/5' : pack.status === 'AMBER' ? 'border-blueprint-accent text-blueprint-accent bg-blueprint-accent/5' : 'border-blueprint-success text-blueprint-success bg-blueprint-success/5'}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${pack.status === 'RED' ? 'bg-blueprint-error' : pack.status === 'AMBER' ? 'bg-blueprint-accent' : 'bg-blueprint-success'}`} />
              {pack.status}_STATUS
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-[0.15em] uppercase text-blueprint-white truncate max-w-xl" title={system.name}>{system.name}</h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end gap-1">
            {saving ? (
               <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-blueprint-line-solid animate-pulse">
                  SYNC_IN_PROGRESS...
               </div>
            ) : lastSaved && (
               <div className="font-mono text-[9px] font-bold text-blueprint-white/40 uppercase tracking-tighter">
                  LAST_COMMIT: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <button onClick={onClose} className="blueprint-button flex items-center gap-2">
              <X size={14} /> ABORT_SESSION
            </button>
            <button 
              onClick={onReport} 
              className="blueprint-button blueprint-button-primary flex items-center gap-2"
            >
              <FileBarChart size={14} /> GENERATE_SUMMARY
            </button>
          </div>
        </div>
      </header>

      {/* Schematic Progress Matrix */}
      <div className="space-y-2">
        <div className="flex justify-between items-end mb-1">
          <span className="blueprint-label opacity-60">PROBE_COMPLETION_INDEX</span>
          <span className="font-mono text-[10px] text-blueprint-line-solid font-bold">{Math.round((totalCompleted / cases.length) * 100)}% [{totalCompleted}/{cases.length}]</span>
        </div>
        <div className="w-full h-1.5 bg-blueprint-line-solid/10 relative overflow-hidden flex">
          <div 
            className="h-full bg-blueprint-success transition-all duration-700 ease-out shadow-[0_0_15px_rgba(80,250,123,0.3)]" 
            style={{ width: `${passWidth}%` }} 
          />
          <div 
            className="h-full bg-blueprint-error transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,85,85,0.3)]" 
            style={{ width: `${failWidth}%` }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Sidebar: Vector Schematic Index */}
        <aside className="lg:col-span-1 lg:sticky lg:top-8 h-fit">
          <div className="blueprint-panel p-6 bg-blueprint-paper/20 max-h-[600px] flex flex-col">
            <h3 className="blueprint-label border-b border-blueprint-line pb-3 mb-4 shrink-0">Vector_Schematic_Registry</h3>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blueprint-line-solid/20 pr-1">
              {cases.map((c, i) => (
                <button 
                  key={c.id} 
                  onClick={() => setCurrentIndex(i)}
                  className={`
                    w-full text-left p-3 border transition-all flex items-center gap-4 relative
                    ${currentIndex === i 
                      ? 'border-blueprint-line-solid bg-blueprint-line-solid/10' 
                      : 'border-blueprint-line-solid/10 hover:border-blueprint-line-solid/30 bg-transparent'}
                  `}
                >
                  <div className={`
                    w-2.5 h-2.5 rounded-full shrink-0
                    ${c.result === 'PASS' ? 'bg-blueprint-success' : c.result === 'FAIL' ? 'bg-blueprint-error' : 'bg-blueprint-accent/40'}
                  `} />
                  <div className="overflow-hidden space-y-1">
                    <p className={`text-[9px] font-bold uppercase tracking-tight truncate ${currentIndex === i ? 'text-blueprint-line-solid' : 'text-blueprint-white/60'}`}>{c.category}</p>
                    <p className="text-[8px] font-mono truncate opacity-40 text-blueprint-white tracking-tighter">#{c.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  {currentIndex === i && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blueprint-line-solid" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main: Analysis Controller */}
        <div className="lg:col-span-3 space-y-8">
          {currentCase ? (
            <div className="blueprint-panel p-10 space-y-10 min-h-[600px] flex flex-col">
              <header className="flex items-start justify-between border-b border-blueprint-line pb-8">
                <div className="space-y-4 flex-1">
                  <div className="flex gap-3">
                    <span className="px-2 py-0.5 bg-blueprint-line-solid/10 border border-blueprint-line-solid/20 text-blueprint-line-solid text-[9px] font-mono font-bold tracking-widest uppercase">{currentCase.category}</span>
                    <span className="px-2 py-0.5 bg-blueprint-paper/50 border border-blueprint-line/40 text-blueprint-white/50 text-[9px] font-mono tracking-widest uppercase">{currentCase.riskArea}</span>
                  </div>
                  <div 
                    onClick={() => handleCopy(currentCase.prompt, 'prompt')}
                    className="space-y-1 group/copy cursor-pointer relative"
                  >
                    <div className="flex items-center gap-3">
                      <p className="blueprint-label opacity-40 text-[9px]">TARGET_ANALYSIS_OBJECTIVE:</p>
                      <div className={`transition-all ${copiedType === 'prompt' ? 'text-blueprint-success' : 'text-blueprint-line-solid opacity-0 group-hover/copy:opacity-100'}`}>
                        {copiedType === 'prompt' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-blueprint-white leading-tight pr-10 hover:text-blueprint-line-solid transition-colors">{currentCase.prompt}</h2>
                    {currentCase.hint && (
                      <p className="text-[10px] font-mono text-blueprint-accent mt-2 animate-pulse uppercase tracking-tight">
                        Note: {currentCase.hint}
                      </p>
                    )}
                    {copiedType === 'prompt' && (
                      <div className="absolute top-0 right-0 bg-blueprint-success text-blueprint-paper text-[8px] px-2 py-1 font-mono font-bold uppercase">COMMITTED_TO_CLIPBOARD</div>
                    )}
                  </div>
                </div>
                <div className="blueprint-panel p-4 text-center min-w-[100px] bg-blueprint-line-solid/5 border-blueprint-line-solid/20">
                  <p className="blueprint-label !text-[8px] opacity-40 mb-1">UNIT_REF</p>
                  <p className="font-mono font-bold text-blueprint-line-solid uppercase text-lg tracking-widest leading-none">{currentCase.libraryId || `V_${(currentIndex + 1).toString().padStart(2, '0')}`}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="blueprint-label">EXPECTED_BEHAVIOR_MODEL</label>
                    <button 
                      onClick={() => handleCopy(currentCase.expectedBehaviour, 'expected')}
                      className={`flex items-center gap-2 p-1.5 border transition-all ${copiedType === 'expected' ? 'bg-blueprint-success border-blueprint-success text-blueprint-paper' : 'border-blueprint-line-solid/30 text-blueprint-line-solid/40 hover:text-blueprint-line-solid hover:border-blueprint-line-solid'}`}
                    >
                      {copiedType === 'expected' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">{copiedType === 'expected' ? 'COMMITTED' : 'COPY'}</span>
                    </button>
                  </div>
                  <div 
                    onClick={() => handleCopy(currentCase.expectedBehaviour, 'expected')}
                    className="blueprint-panel p-5 bg-blueprint-paper/40 font-mono text-[11px] leading-relaxed text-blueprint-white/60 h-40 overflow-y-auto border-blueprint-line/30 scrollbar-thin scrollbar-thumb-blueprint-line-solid/20 cursor-pointer group/expected relative hover:bg-blueprint-line-solid/[0.02] transition-colors"
                  >
                    <div className="h-full border-l border-blueprint-accent/20 pr-4 pl-4 whitespace-pre-wrap group-hover/expected:text-blueprint-white transition-colors">
                      {currentCase.expectedBehaviour}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="blueprint-label">ACTUAL_NEURAL_RESPONSE</label>
                  <textarea 
                    value={localResponse}
                    onChange={(e) => setLocalResponse(e.target.value)}
                    className="blueprint-input w-full h-40 text-[11px] placeholder:opacity-20 leading-relaxed resize-none p-5"
                    placeholder="WAITING FOR TARGET OUTPUT LOGS..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="blueprint-label">EVIDENCE_LOGS / AUDITOR_NOTES</label>
                  <textarea 
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    className="blueprint-input w-full h-32 text-[11px] placeholder:opacity-20 leading-relaxed resize-none p-5"
                    placeholder="ENTER ANOMALIES, OBSERVATIONS, OR RISK MAPPINGS..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="blueprint-label">TAG_CLASSIFICATIONS</label>
                  <div className="blueprint-panel p-5 min-h-[128px] space-y-5 bg-blueprint-paper/20">
                    <div className="flex flex-wrap gap-2">
                      {localTags.map(tag => (
                        <span key={tag} className="flex items-center gap-2 bg-blueprint-line-solid/10 border border-blueprint-line-solid/30 text-blueprint-line-solid text-[9px] px-2 py-1 uppercase font-bold tracking-tighter">
                          <TagIcon size={10} /> {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-blueprint-error ml-1 transition-colors"><X size={10} /></button>
                        </span>
                      ))}
                      {localTags.length === 0 && <span className="font-mono text-[9px] text-blueprint-white/20 italic tracking-widest uppercase">NO_TAGS_INITIALIZED</span>}
                    </div>
                    <div className="flex gap-4 border-t border-blueprint-line pt-4">
                      <input 
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                        placeholder="ADD_METADATA..."
                        className="flex-1 bg-transparent border-none outline-none font-mono text-[10px] uppercase font-bold text-blueprint-white placeholder:opacity-20"
                      />
                      <button onClick={addTag} className="text-blueprint-line-solid hover:scale-125 transition-transform">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 border-t border-blueprint-line flex flex-wrap items-center justify-between gap-10">
                <div className="flex gap-6">
                  <button 
                    onClick={() => persistChanges({ result: 'PASS' })}
                    className={`
                      px-10 py-3 border font-bold uppercase flex items-center gap-3 transition-all tracking-[0.2em] text-xs
                      ${currentCase.result === 'PASS' 
                        ? 'bg-blueprint-success border-blueprint-success text-blueprint-paper shadow-[0_0_20px_rgba(80,250,123,0.3)]' 
                        : 'bg-transparent border-blueprint-line-solid/30 text-blueprint-line-solid/60 hover:bg-blueprint-success/10 hover:text-blueprint-success hover:border-blueprint-success'
                      }
                    `}
                  >
                    <Check size={18} /> PASSED
                  </button>
                  <button 
                    onClick={() => persistChanges({ result: 'FAIL' })}
                    className={`
                      px-10 py-3 border font-bold uppercase flex items-center gap-3 transition-all tracking-[0.2em] text-xs
                      ${currentCase.result === 'FAIL' 
                        ? 'bg-blueprint-error border-blueprint-error text-blueprint-white shadow-[0_0_20px_rgba(255,85,85,0.3)]' 
                        : 'bg-transparent border-blueprint-line-solid/30 text-blueprint-line-solid/60 hover:bg-blueprint-error/10 hover:text-blueprint-error hover:border-blueprint-error'
                      }
                    `}
                  >
                    <X size={18} /> FAILED
                  </button>
                </div>

                <div className="flex gap-4 p-1 bg-blueprint-line-solid/5 border border-blueprint-line-solid/10">
                  <button 
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="p-3 text-blueprint-line-solid hover:bg-blueprint-line-solid/10 disabled:opacity-10 transition-all border border-transparent hover:border-blueprint-line-solid/20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    disabled={currentIndex === cases.length - 1}
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="p-3 text-blueprint-line-solid hover:bg-blueprint-line-solid/10 disabled:opacity-10 transition-all border border-transparent hover:border-blueprint-line-solid/20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="blueprint-panel border-dashed border-blueprint-line-solid/20 flex items-center justify-center min-h-[600px] bg-blueprint-paper/10">
               <div className="text-center space-y-6 opacity-30 group cursor-pointer hover:opacity-100 transition-opacity duration-500">
                  <div className="w-20 h-20 border border-blueprint-line-solid flex items-center justify-center mx-auto relative">
                    <div className="absolute inset-0 animate-ping bg-blueprint-line-solid/10" />
                    <Play size={32} className="text-blueprint-line-solid ml-1" />
                  </div>
                  <p className="blueprint-label !text-xs tracking-[0.4em]">_VECTOR_SELECTION_REQUIRED_</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
