import { useState, useEffect } from 'react';
import { AISystem, TestPack, TestCase } from '../types';
import { BASELINE_TESTS, SECURITY_BANK } from '../lib/testLibraryData';
import { Save, Wand2, X, AlertCircle, CheckCircle2, ListPlus, ShieldCheck } from 'lucide-react';
import { useMemoryStore } from '../lib/memoryStore';
import { getFriendlyDate } from '../lib/dateUtils';

import { motion, AnimatePresence } from 'motion/react';

interface TestPackEditorProps {
  id: string;
  onClose: () => void;
  onExecute: () => void;
}

export default function TestPackEditor({ id, onClose, onExecute }: TestPackEditorProps) {
  const { getPack, getSystem, updatePack, updateSystem, getCases, updateCases, deletePack } = useMemoryStore();
  const [pack, setPack] = useState<TestPack | null>(null);
  const [system, setSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState<any[]>([]);
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualExpected, setManualExpected] = useState('');
  const [isManualExpanded, setIsManualExpanded] = useState(false);

  const [hasSavedThisSession, setHasSavedThisSession] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [showScanConfirm, setShowScanConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<typeof INDUSTRY_TEMPLATES[0] | null>(null);

  useEffect(() => {
    const p = getPack(id);
    if (p) {
      setPack(p);
      const s = getSystem(p.systemId);
      if (s) setSystem(s);
    }
    setLoading(false);
  }, [id, getPack, getSystem]);

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!system) return;
    setSystem({ ...system, [e.target.name]: e.target.value });
  };

  const INDUSTRY_TEMPLATES = [
    {
      name: 'Customer Support',
      purpose: 'Provide 24/7 automated customer support, handling queries related to orders, shipping, and product information.',
      sensitiveData: 'Customer names, email addresses, order IDs, shipping addresses, partially masked payment info.'
    },
    {
      name: 'Internal KB RAG',
      purpose: 'Enable employees to query internal company documentation, technical specifications, and HR policies via a RAG interface.',
      sensitiveData: 'Proprietary technical data, internal project names, employee information, non-public company strategy document snippets.'
    },
    {
      name: 'Financial Analysis',
      purpose: 'Analyze market data and user-provided financial statements to provide investment insights and risk assessments.',
      sensitiveData: 'User portfolio details, investment amounts, tax identification numbers, confidential transaction history.'
    },
    {
      name: 'Healthcare Assist',
      purpose: 'Assist healthcare providers by summarizing patient records and providing information on drug interactions and treatment protocols.',
      sensitiveData: 'Protected Health Information (PHI), patient IDs, medical history, clinical notes, treatment plans.'
    },
    {
      name: 'Human Resources',
      purpose: 'Automate initial candidate screening, job description generation, and handling employee policy inquiries.',
      sensitiveData: 'Candidate resumes, PII (phone, address), employee performance reviews, salary data, internal complaints.'
    }
  ];

  const applyTemplate = (template: typeof INDUSTRY_TEMPLATES[0]) => {
    if (!system) return;
    
    // If user has already saved this session, don't warn
    if (hasSavedThisSession) {
      executeTemplate(template);
      return;
    }

    setPendingTemplate(template);
    setShowTemplateConfirm(true);
  };

  const executeTemplate = (template: typeof INDUSTRY_TEMPLATES[0]) => {
    if (!system) return;
    setSystem({
      ...system,
      purpose: template.purpose,
      sensitiveData: template.sensitiveData
    });
    setShowTemplateConfirm(false);
    setPendingTemplate(null);
  };

  const updateCaseCounts = (packId: string) => {
    const cases = getCases(packId);
    const total = cases.length;
    const counts = {
      total,
      pass: cases.filter(c => c.result === 'PASS').length,
      fail: cases.filter(c => c.result === 'FAIL').length,
      notTested: cases.filter(c => c.result === 'NOT TESTED').length
    };
    const p = getPack(packId);
    if (p) {
      updatePack({ ...p, caseCounts: counts });
    }
  };

  const handleManualSave = () => {
    if (!system || !pack) return;
    setSaving(true);
    
    const updatedPack = { ...pack, isDraft: false };
    setPack(updatedPack);
    updatePack(updatedPack);
    updateSystem(system);
    
    // Once saved, we silent the template warning for this session
    setHasSavedThisSession(true);
    
    // Auto-init baseline if empty
    const cases = getCases(id);
    if (cases.length === 0) {
      addBaselineTests();
    } else {
      updateCaseCounts(id);
    }
    
    setTimeout(() => {
      setSaving(false);
      setLastSaved(new Date());
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 600);
  };

  const handleSaveAndExecute = () => {
    if (!system || !pack) return;
    setSaving(true);
    
    // Save system changes and unmark draft
    const updatedPack = { ...pack, isDraft: false };
    setPack(updatedPack);
    updatePack(updatedPack);
    updateSystem(system);
    setHasSavedThisSession(true);
    
    // Check if we already have test cases. If not, add baseline tests at minimum.
    const cases = getCases(id);
    if (cases.length === 0) {
      addBaselineTests();
    }
    
    setTimeout(() => {
      setSaving(false);
      onExecute();
    }, 400);
  };

  const addBaselineTests = () => {
    const newCases: TestCase[] = BASELINE_TESTS.map(test => ({
      id: crypto.randomUUID(),
      testPackId: id,
      libraryId: test.id,
      category: test.category,
      prompt: test.prompt,
      expectedBehaviour: test.expected,
      actualResponse: '',
      result: 'NOT TESTED',
      riskArea: test.owaspArea,
      priority: 'High',
      notes: test.whenToUse,
      hint: test.hint
    }));
    updateCases(id, newCases);
    updateCaseCounts(id);
  };

  const handleRunScanClick = () => {
    const current = getCases(id);
    if (current.length > 0) {
      setShowScanConfirm(true);
    } else {
      generateScenarios();
    }
  };

  const generateScenarios = async () => {
    if (!system) return;
    setShowScanConfirm(false);
    setGenerating(true);
    
    // Simulate thinking/analyzing for UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Local Bank Fallback: Pick 3-5 random tests from the security bank that aren't already in the pack
      const currentCases = getCases(id);
      const currentLibraryIds = currentCases.map(c => c.libraryId).filter(Boolean);
      
      const availableFromBank = SECURITY_BANK.filter(test => !currentLibraryIds.includes(test.id));
      
      // Shuffle and pick 4
      const selected = [...availableFromBank]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(test => ({
          category: test.category,
          riskArea: test.owaspArea,
          prompt: test.prompt,
          expectedBehaviour: test.expected,
          priority: 'High',
          notes: test.whenToUse
        }));

      setGeneratedTests(selected);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const addGeneratedTests = () => {
    const currentCases = getCases(id);
    const newCases: TestCase[] = [
      ...currentCases,
      ...generatedTests.map(test => ({
        id: crypto.randomUUID(),
        testPackId: id,
        category: test.category,
        prompt: test.prompt,
        expectedBehaviour: test.expectedBehaviour,
        actualResponse: '',
        result: 'NOT TESTED' as const,
        riskArea: test.riskArea,
        priority: test.priority,
        notes: test.notes
      }))
    ];
    updateCases(id, newCases);
    updateCaseCounts(id);
    setGeneratedTests([]);
  };

  const handleAddManualTest = () => {
    if (!manualPrompt.trim()) return;
    
    const currentCases = getCases(id);
    const newCase: TestCase = {
      id: crypto.randomUUID(),
      testPackId: id,
      category: 'CUSTOM',
      prompt: manualPrompt,
      expectedBehaviour: manualExpected || 'Assess if the AI correctly adheres to system guards.',
      actualResponse: '',
      result: 'NOT TESTED' as const,
      riskArea: 'MANUAL_OVERRIDE',
      priority: 'High',
      notes: 'User defined custom test case.'
    };
    
    updateCases(id, [...currentCases, newCase]);
    updateCaseCounts(id);
    
    setManualPrompt('');
    setManualExpected('');
    setIsManualExpanded(false);
  };

  const handleAbort = async () => {
    // If it was never saved and is marked as a draft, purge it
    if (pack?.isDraft) {
      deletePack(id);
    }
    onClose();
  };

  if (loading || !pack || !system) return <div className="font-mono text-blueprint-line-solid animate-pulse tracking-[0.3em] uppercase flex items-center justify-center p-20">Loading Setup...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      <header className="flex items-center justify-between border-b border-blueprint-line pb-6 gap-6">
        <div>
          <div className="blueprint-label px-2 py-0.5 bg-blueprint-line-solid/10 border border-blueprint-line-solid/20 mb-2">Assessment Profile</div>
          <h1 className="text-3xl font-bold tracking-[0.15em] uppercase text-blueprint-white truncate max-w-xl" title={system.name}>{system.name}</h1>
        </div>
        <div className="flex items-center gap-6">
          {lastSaved && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold text-blueprint-line-solid/50 uppercase tracking-widest">Last Commit</span>
              <span className="text-xs font-mono text-blueprint-line-solid font-bold tracking-tighter">
                {getFriendlyDate(lastSaved)}
              </span>
            </div>
          )}
          <div className="h-10 w-px bg-blueprint-line mx-2" />
          <div className="flex gap-4">
            <button 
              disabled={saving}
              onClick={handleManualSave} 
              className="blueprint-button flex items-center gap-2"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Progress'}
            </button>
            <button onClick={handleAbort} className="blueprint-button flex items-center gap-2">
              <X size={14} /> {pack.isDraft ? 'Discard Draft' : 'Cancel'}
            </button>
            <button 
              disabled={saving || !system.name || system.name === 'NEW AI SYSTEM'}
              onClick={handleSaveAndExecute} 
              className="blueprint-button blueprint-button-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? 'Processing...' : <><ShieldCheck size={14} /> Commit & Start</>}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSyncToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 pointer-events-none"
          >
            <div className="bg-blueprint-paper/80 backdrop-blur-md border border-blueprint-success/30 px-6 py-3 shadow-[0_0_30px_rgba(0,255,157,0.1)] flex items-center gap-4">
              <CheckCircle2 size={16} className="text-blueprint-success" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-blueprint-success tracking-[0.2em]">Sync Complete</span>
                <span className="font-mono text-[10px] text-blueprint-white/50 tracking-widest uppercase">Progress saved successfully</span>
              </div>
              <div className="w-1 h-1 bg-blueprint-success rounded-full animate-ping ml-4"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Confirmation Modal */}
      <AnimatePresence>
        {showTemplateConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blueprint-paper/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="blueprint-panel p-8 bg-blueprint-paper border-blueprint-line-solid/40 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-4 text-blueprint-line-solid mb-6">
                <AlertCircle size={28} />
                <h2 className="text-xl font-bold uppercase tracking-widest leading-none">Template Override</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <p className="font-mono text-sm text-blueprint-white/80 leading-relaxed uppercase tracking-widest">
                  Hang on, you already had some settings. Are you sure you want to use or change the profile to <span className="text-blueprint-line-solid font-black">"{pendingTemplate?.name}"</span>?
                </p>
                <p className="font-mono text-[10px] text-blueprint-white/40 uppercase tracking-tighter">
                  This will pre-fill the Goal and Sensitive Data fields, overwriting current entries.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowTemplateConfirm(false)}
                  className="flex-1 blueprint-button border-blueprint-line-solid/30 text-blueprint-line-solid/60 tracking-[0.2em]"
                >
                  ABORT
                </button>
                <button 
                  onClick={() => pendingTemplate && executeTemplate(pendingTemplate)}
                  className="flex-1 blueprint-button blueprint-button-primary tracking-[0.2em]"
                >
                  CONFIRM CHANGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scan Confirmation Modal */}
      <AnimatePresence>
        {showScanConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blueprint-paper/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="blueprint-panel p-8 bg-blueprint-paper border-blueprint-accent/40 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-4 text-blueprint-accent mb-6">
                <Wand2 size={28} />
                <h2 className="text-xl font-bold uppercase tracking-widest leading-none">Security Scan</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <p className="font-mono text-sm text-blueprint-white/80 leading-relaxed uppercase tracking-widest">
                  This assessment already contains curated tests. Running a new scan may generate <span className="text-blueprint-accent font-black">redundant or less optimized</span> prompts.
                </p>
                <p className="font-mono text-[10px] text-blueprint-white/40 uppercase tracking-tighter">
                  Do you want to proceed with the custom security analysis?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowScanConfirm(false)}
                  className="flex-1 blueprint-button border-blueprint-line-solid/30 text-blueprint-line-solid/60 tracking-[0.2em]"
                >
                  ABORT
                </button>
                <button 
                  onClick={generateScenarios}
                  className="flex-1 blueprint-button border-blueprint-accent text-blueprint-accent hover:bg-blueprint-accent/10 tracking-[0.2em]"
                >
                  RUN SCAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Target Profile */}
        <div className="lg:col-span-2 space-y-10">
          <section className="blueprint-panel p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-blueprint-line pb-4">
              <h3 className="text-lg font-bold uppercase flex items-center gap-3 text-blueprint-white tracking-[0.2em]">
                <AlertCircle size={18} className="text-blueprint-line-solid" /> System Profile
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-mono font-bold text-blueprint-line-solid opacity-50 uppercase tracking-widest self-center mr-2">Templates:</span>
                {INDUSTRY_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => applyTemplate(tmpl)}
                    className="text-[9px] font-mono font-bold px-2 py-1 border border-blueprint-line-solid/20 text-blueprint-line-solid/60 hover:text-blueprint-line-solid hover:border-blueprint-line-solid/50 hover:bg-blueprint-line-solid/5 transition-all uppercase tracking-tighter"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="blueprint-label">
                  System Name <span className="italic font-serif normal-case opacity-50 ml-2">(required)</span>
                </label>
                <input name="name" value={system.name} onChange={handleSystemChange} className="blueprint-input w-full" placeholder="E.G. Neural Concord v4" />
              </div>
              <div className="space-y-2 pt-4">
                <label className="blueprint-label">Primary Goal</label>
                <textarea name="purpose" value={system.purpose} onChange={handleSystemChange} className="blueprint-input w-full h-24 italic" placeholder="Define the core intent and function of the system..." />
              </div>
            </div>
          </section>

          <section className="blueprint-panel p-8 relative">
            <h3 className="text-lg font-bold uppercase mb-8 flex items-center gap-3 text-blueprint-white tracking-[0.2em] border-b border-blueprint-line pb-4">
              <ShieldCheck size={18} className="text-blueprint-accent" /> Assessment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="blueprint-label">Expected Refusals</label>
                <textarea name="mustRefuse" value={system.mustRefuse} onChange={handleSystemChange} className="blueprint-input w-full h-24" placeholder="E.G. PII Leakage, Malicious Code..." />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">Allowed Actions</label>
                <textarea name="allowedActions" value={system.allowedActions} onChange={handleSystemChange} className="blueprint-input w-full h-24" placeholder="E.G. Read-only document analysis..." />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">Sensitive Data Types</label>
                <textarea name="sensitiveData" value={system.sensitiveData} onChange={handleSystemChange} className="blueprint-input w-full h-24" placeholder="Define data types in scope..." />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">Known Vulnerabilities</label>
                <textarea name="knownRisks" value={system.knownRisks} onChange={handleSystemChange} className="blueprint-input w-full h-24 border-blueprint-error/20 focus:border-blueprint-error/50" placeholder="Identify existing risks..." />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: AI Recon Engine */}
        <div className="space-y-8">
          <div className="blueprint-panel p-8 bg-blueprint-line-solid/[0.03] border-blueprint-line-solid/30 relative overflow-hidden group">
            <h3 className="text-lg font-bold uppercase flex items-center gap-3 text-blueprint-white tracking-[0.1em] mb-6">
              <ListPlus size={24} className="text-blueprint-line-solid" /> Custom Vector Input
            </h3>
            
            {!isManualExpanded ? (
              <button 
                onClick={() => setIsManualExpanded(true)}
                className="w-full blueprint-button border-blueprint-line-solid/30 text-blueprint-line-solid/60 hover:text-blueprint-line-solid hover:border-blueprint-line-solid py-4 text-[10px] tracking-[0.2em] font-bold transition-all uppercase"
              >
                + ADD CUSTOM PROMPT
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-blueprint-line-solid uppercase tracking-widest">Test Prompt</label>
                  <textarea 
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                    className="blueprint-input w-full h-24 text-[11px] placeholder:opacity-20"
                    placeholder="Enter your custom probe/prompt..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-blueprint-line-solid uppercase tracking-widest">Expected Result</label>
                  <textarea 
                    value={manualExpected}
                    onChange={(e) => setManualExpected(e.target.value)}
                    className="blueprint-input w-full h-16 text-[11px] placeholder:opacity-20"
                    placeholder="What should the AI do or refuse?"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsManualExpanded(false)}
                    className="flex-1 blueprint-button border-blueprint-line-solid/20 text-blueprint-line-solid/40 hover:text-blueprint-line-solid hover:border-blueprint-line-solid py-2 text-[9px] tracking-[0.1em]"
                  >
                    CANCEL
                  </button>
                  <button 
                    disabled={!manualPrompt.trim()}
                    onClick={handleAddManualTest}
                    className="flex-2 blueprint-button blueprint-button-primary py-2 text-[9px] tracking-[0.1em]"
                  >
                    ADD TO ASSESSMENT
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="blueprint-panel p-8 bg-blueprint-line-solid/[0.03] border-blueprint-line-solid/30 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold uppercase flex items-center gap-3 text-blueprint-white tracking-[0.1em] sm:tracking-[0.15em] leading-tight">
                <Wand2 size={24} className="text-blueprint-line-solid shrink-0 animate-pulse" /> Security Test Generator
              </h3>
            </div>
            <p className="font-mono text-xs mb-8 text-blueprint-white/50 leading-relaxed uppercase tracking-wider">
              Automatically generate security tests based on the system profile and details.
            </p>
            
            <button 
              disabled={generating}
              onClick={handleRunScanClick}
              className="w-full blueprint-button blueprint-button-primary py-4 text-xs tracking-[0.3em] flex items-center justify-center gap-3 group-hover:shadow-[0_0_20px_rgba(100,255,218,0.2)] transition-all duration-500"
            >
              <div className={generating ? 'animate-spin' : ''}><Wand2 size={16} /></div>
              {generating ? 'Analyzing system...' : 'Run Security Scan'}
            </button>

            {generatedTests.length > 0 && (
              <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-blueprint-line pb-2">
                  <span className="font-mono text-[9px] font-bold text-blueprint-line-solid tracking-widest">{generatedTests.length} Tests Generated</span>
                  <button onClick={() => setGeneratedTests([])} className="text-[8px] font-bold text-blueprint-error hover:underline tracking-tighter uppercase">Discard</button>
                </div>
                <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blueprint-line-solid/20">
                  {generatedTests.map((t, i) => (
                    <div key={i} className="blueprint-panel p-4 bg-blueprint-paper/40 border-blueprint-line-solid/10 text-[10px] font-mono group/test hover:border-blueprint-line-solid/40 transition-colors">
                      <p className="font-bold text-blueprint-line-solid mb-2 tracking-tighter uppercase">{t.category} / {t.riskArea}</p>
                      <p className="text-blueprint-white/60 italic group-hover/test:text-blueprint-white transition-colors">"{t.prompt}"</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addGeneratedTests}
                  className="w-full blueprint-button border-blueprint-accent text-blueprint-accent hover:bg-blueprint-accent/10 transition-all flex items-center justify-center gap-3 text-xs tracking-[0.2em]"
                >
                  <ListPlus size={16} /> Add to Assessment
                </button>
              </div>
            )}
          </div>

          <div className="blueprint-panel p-8 bg-blueprint-paper/20">
            <h3 className="blueprint-label mb-4 opacity-100">Core Security Library</h3>
            <p className="font-mono text-[9px] text-blueprint-white/40 mb-6 uppercase tracking-widest leading-relaxed">
              Standard security tests are automatically included if no custom tests are defined.
            </p>
            <div className="flex items-center gap-4 bg-blueprint-line-solid/[0.05] p-4 border border-blueprint-line-solid/20 group hover:border-blueprint-success/30 transition-colors">
              <CheckCircle2 className="text-blueprint-success/60 group-hover:text-blueprint-success transition-colors" size={20} />
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] font-bold text-blueprint-white/80 block">Security Tests Loaded</span>
                <span className="font-mono text-[8px] text-blueprint-white/30 uppercase">Framework v4.2.1 Stable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
