import { useState, useEffect } from 'react';
import { AISystem, TestPack, TestCase } from '../types';
import { BASELINE_TESTS } from '../lib/testLibraryData';
import { Save, Wand2, X, AlertCircle, CheckCircle2, ListPlus, ShieldCheck } from 'lucide-react';
import { useMemoryStore } from '../lib/memoryStore';

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
  const [generating, setGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState<any[]>([]);

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

  const handleSaveAndExecute = () => {
    if (!system || !pack) return;
    setSaving(true);
    
    // Save system changes
    updateSystem(system);
    
    // Check if we already have test cases. If not, add baseline tests at minimum.
    const cases = getCases(id);
    if (cases.length === 0) {
      addBaselineTests();
    }
    
    setSaving(false);
    onExecute();
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

  const generateScenarios = async () => {
    if (!system) return;
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemDescription: system })
      });
      const data = await response.json();
      setGeneratedTests(data);
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

  const handleAbort = async () => {
    const cases = getCases(id);
    // Only auto-delete if it's a default-named mission with NO test cases (never committed/probed)
    if (system?.name === 'NEW AI SYSTEM' && cases.length === 0) {
      deletePack(id);
    }
    onClose();
  };

  if (loading || !pack || !system) return <div className="font-mono text-blueprint-line-solid animate-pulse tracking-[0.3em] uppercase flex items-center justify-center p-20">DECRYPTING_TARGET_SCHEMATIC...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      <header className="flex items-center justify-between border-b border-blueprint-line pb-6 gap-6">
        <div>
          <div className="blueprint-label px-2 py-0.5 bg-blueprint-line-solid/10 border border-blueprint-line-solid/20 mb-2">MISSION_PROFILE_SPECIFICATION</div>
          <h1 className="text-3xl font-bold tracking-[0.15em] uppercase text-blueprint-white truncate max-w-xl" title={system.name}>{system.name}</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAbort} className="blueprint-button flex items-center gap-2">
            <X size={14} /> ABORT_MISSION
          </button>
          <button 
            disabled={saving}
            onClick={handleSaveAndExecute} 
            className="blueprint-button blueprint-button-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? 'COMMITTING...' : <><Save size={14} /> COMMIT & PROBE</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Target Profile */}
        <div className="lg:col-span-2 space-y-10">
          <section className="blueprint-panel p-8 relative">
            <div className="absolute top-2 right-4 technical-marker">NODE_ARCH_01</div>
            <h3 className="text-lg font-bold uppercase mb-8 flex items-center gap-3 text-blueprint-white tracking-[0.2em] border-b border-blueprint-line pb-4">
              <AlertCircle size={18} className="text-blueprint-line-solid" /> Target Schematic
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="blueprint-label">SYSTEM_IDENTIFIER</label>
                <input name="name" value={system.name} onChange={handleSystemChange} className="blueprint-input w-full" placeholder="E.G. NEURAL_CONCORD_v4" />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">VERTICAL_DOMAIN</label>
                <input name="industry" value={system.industry} onChange={handleSystemChange} className="blueprint-input w-full" placeholder="E.G. FIN_SERVICES / LOGISTICS" />
              </div>
              <div className="md:col-span-2 space-y-2 pt-4">
                <label className="blueprint-label">STRATEGIC_MISSION_OBJECTIVE</label>
                <textarea name="purpose" value={system.purpose} onChange={handleSystemChange} className="blueprint-input w-full h-24 italic" placeholder="DEFINE THE CORE INTENT AND FUNCTIONAL CAPACITY..." />
              </div>
            </div>
          </section>

          <section className="blueprint-panel p-8 relative">
            <div className="absolute top-2 right-4 technical-marker">NODE_BOUND_02</div>
            <h3 className="text-lg font-bold uppercase mb-8 flex items-center gap-3 text-blueprint-white tracking-[0.2em] border-b border-blueprint-line pb-4">
              <ShieldCheck size={18} className="text-blueprint-accent" /> Operational Constraints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="blueprint-label">MANDATORY_REFUSAL_LIMITS</label>
                <textarea name="mustRefuse" value={system.mustRefuse} onChange={handleSystemChange} className="blueprint-input w-full h-24" placeholder="E.G. PII_LEAKAGE, MALICIOUS_CODE_EXECUTION..." />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">AUTHORIZED_SCOPE_ACTIONS</label>
                <textarea name="allowedActions" value={system.allowedActions} onChange={handleSystemChange} className="blueprint-input w-full h-24" placeholder="E.G. READ_ONLY_DOC_ANALYSIS, API_DATA_FETCHING..." />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">SENSITIVE_CONTEXT_MAPPING</label>
                <textarea name="sensitiveData" value={system.sensitiveData} onChange={handleSystemChange} className="blueprint-input w-full h-24" placeholder="DEFINE DATA_TYPES_IN_SCOPE..." />
              </div>
              <div className="space-y-2">
                <label className="blueprint-label">THREAT_INTELLIGENCE_LOGS</label>
                <textarea name="knownRisks" value={system.knownRisks} onChange={handleSystemChange} className="blueprint-input w-full h-24 border-blueprint-error/20 focus:border-blueprint-error/50" placeholder="IDENTIFY PRE-EXISTING VULNERABILITIES..." />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: AI Recon Engine */}
        <div className="space-y-8">
          <div className="blueprint-panel p-8 bg-blueprint-line-solid/[0.03] border-blueprint-line-solid/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-blueprint-line-solid/30 tracking-[0.3em] font-bold">RECON_SUBSYSTEM_ACTIVE</div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold uppercase flex items-center gap-3 text-blueprint-white tracking-[0.2em]">
                <Wand2 size={24} className="text-blueprint-line-solid animate-pulse" /> AI_Assurance_Engine
              </h3>
            </div>
            <p className="font-mono text-[10px] mb-8 text-blueprint-white/50 leading-relaxed uppercase tracking-wider">
              DERIVE ADVERSARIAL ATTACK VECTORS BASED ON TARGET SYSTEM ARCHITECTURE AND CONSTRAINTS.
            </p>
            
            <button 
              disabled={generating}
              onClick={generateScenarios}
              className="w-full blueprint-button blueprint-button-primary py-4 text-xs tracking-[0.3em] flex items-center justify-center gap-3 group-hover:shadow-[0_0_20px_rgba(100,255,218,0.2)] transition-all duration-500"
            >
              <div className={generating ? 'animate-spin' : ''}><Wand2 size={16} /></div>
              {generating ? 'ANALYZING_TOPOLOGY...' : 'EXECUTE_THREAT_MODELING'}
            </button>

            {generatedTests.length > 0 && (
              <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-blueprint-line pb-2">
                  <span className="font-mono text-[9px] font-bold text-blueprint-line-solid tracking-widest">{generatedTests.length}_THREATS_IDENTIFIED</span>
                  <button onClick={() => setGeneratedTests([])} className="text-[8px] font-bold text-blueprint-error hover:underline tracking-tighter uppercase">_DISCARD</button>
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
                  <ListPlus size={16} /> COMMIT_TO_MISSION_CORE
                </button>
              </div>
            )}
          </div>

          <div className="blueprint-panel p-8 bg-blueprint-paper/20">
            <h3 className="blueprint-label mb-4 opacity-100">Native_Assurance_Library</h3>
            <p className="font-mono text-[9px] text-blueprint-white/40 mb-6 uppercase tracking-widest leading-relaxed">
              STANDARD SECURITY VECTORS ARE AUTO-INITIALIZED UPON MISSION START IF NO CUSTOM VECTORS ARE DEFINED.
            </p>
            <div className="flex items-center gap-4 bg-blueprint-line-solid/[0.05] p-4 border border-blueprint-line-solid/20 group hover:border-blueprint-success/30 transition-colors">
              <CheckCircle2 className="text-blueprint-success/60 group-hover:text-blueprint-success transition-colors" size={20} />
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] font-bold text-blueprint-white/80 block">15_CORE_VECTORS_LOADED</span>
                <span className="font-mono text-[8px] text-blueprint-white/30 uppercase">_LIBRARY_v4.2.1_STABILIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
