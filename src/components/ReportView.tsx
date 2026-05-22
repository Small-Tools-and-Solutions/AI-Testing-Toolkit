import { useState, useEffect } from 'react';
import { TestPack, TestCase, AISystem } from '../types';
import { Shield, Download, ChevronLeft, Printer } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { getFriendlyDate } from '../lib/dateUtils';
import { useMemoryStore } from '../lib/memoryStore';

interface ReportViewProps {
  id: string;
  onClose: () => void;
}

export default function ReportView({ id, onClose }: ReportViewProps) {
  const { getPack, getSystem, getCases } = useMemoryStore();
  const [pack, setPack] = useState<TestPack | null>(null);
  const [system, setSystem] = useState<AISystem | null>(null);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || !pack || !system) return <div className="font-mono text-blueprint-line-solid animate-pulse tracking-[0.3em] uppercase flex items-center justify-center p-20">COMPILING_ANALYTICAL_SCHEMATIC...</div>;

  const passed = cases.filter(c => c.result === 'PASS').length;
  const failed = cases.filter(c => c.result === 'FAIL').length;
  const pending = cases.filter(c => c.result === 'NOT TESTED').length;

  const chartData = [
    { name: 'PASS', value: passed, color: 'var(--blueprint-success)' },
    { name: 'FAIL', value: failed, color: 'var(--blueprint-error)' },
    { name: 'PENDING', value: pending, color: 'var(--blueprint-accent)' },
  ];

  const exportCSV = () => {
    const headers = ['Test Ref', 'Category', 'Prompt', 'Expected', 'Actual', 'Result', 'Risk Area', 'Notes'];
    const rows = cases.map((c, index) => [
      c.libraryId || `V${(index + 1).toString().padStart(2, '0')}`, 
      c.category, 
      c.prompt, 
      c.expectedBehaviour, 
      c.actualResponse, 
      c.result, 
      c.riskArea, 
      c.notes
    ]);
    
    const now = new Date();
    const friendlyTimestamp = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}`;
    
    const csvContent = [headers, ...rows].map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AI_Assurance_Schematic_${friendlyTimestamp}.csv`);
    link.click();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 print:p-0 print:bg-white print:text-black">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-blueprint-line pb-6 gap-6 print:hidden">
        <button onClick={onClose} className="flex items-center gap-3 blueprint-label hover:text-blueprint-line-solid transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> RETURN_TO_VECTOR_CORE
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="blueprint-button flex items-center gap-2"
          >
            <Printer size={14} /> EXPORT_SCHEMATIC_PDF
          </button>
          <button 
            onClick={exportCSV} 
            className="blueprint-button blueprint-button-primary flex items-center gap-2"
          >
            <Download size={14} /> DATA_DUMP_CSV
          </button>
        </div>
      </header>

      {/* Schematic Report Canvas */}
      <div className="blueprint-panel bg-blueprint-paper/40 p-12 space-y-16 border-blueprint-line-solid/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-blueprint-line-solid/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-blueprint-line-solid/10 pointer-events-none" />

        {/* Exec Summary Section */}
        <section className="flex flex-col lg:flex-row justify-between gap-16">
          <div className="flex-1 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Shield size={40} className="text-blueprint-line-solid" />
                <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-blueprint-white">Assurance Schematic</h1>
              </div>
              <div className="h-0.5 bg-blueprint-line-solid/30 w-64" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 font-mono text-[10px] uppercase tracking-widest text-blueprint-white/50">
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">ASSESSMENT_LOG_REF</p>
                <p className="text-blueprint-white font-bold">#{pack.id.substring(0, 12).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">TARGET_SYSTEM_ID</p>
                <p className="text-blueprint-white font-bold">{system.name}</p>
              </div>
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">SCHEMATIC_TIMESTAMP</p>
                <p className="text-blueprint-white font-bold">{getFriendlyDate(new Date(pack.updatedAt))} [{new Date(pack.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}]</p>
              </div>
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">OPERATIONAL_ASSESSMENT</p>
                <div className={`mt-1 px-3 py-1 border font-bold text-[11px] inline-flex items-center gap-2 ${pack.status === 'RED' ? 'border-blueprint-error text-blueprint-error bg-blueprint-error/5' : pack.status === 'AMBER' ? 'border-blueprint-accent text-blueprint-accent bg-blueprint-accent/5' : 'border-blueprint-success text-blueprint-success bg-blueprint-success/5'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${pack.status === 'RED' ? 'bg-blueprint-error' : pack.status === 'AMBER' ? 'bg-blueprint-accent' : 'bg-blueprint-success'}`} />
                  {pack.status === 'RED' ? 'SYSTEM_VULNERABLE' : pack.status === 'AMBER' ? 'ASSESSMENT_INCOMPLETE' : 'INTEGRITY_STABILIZED'}
                </div>
              </div>
            </div>
          </div>

          <div className="blueprint-panel p-8 flex flex-col items-center justify-center text-center bg-blueprint-line-solid/[0.03] border-blueprint-line-solid/10 min-w-[300px]">
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} stroke={entry.color} strokeWidth={1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <p className="blueprint-label !text-[9px] mt-6 tracking-[0.3em]">VECTOR_OUTCOME_DISTRIBUTION</p>
          </div>
        </section>

        {/* System Snapshot */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-blueprint-white">System_Snapshot</h3>
            <div className="flex-1 h-px bg-blueprint-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-[10px] leading-loose uppercase tracking-wider">
            <div className="space-y-6">
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">PRIMARY_PURPOSE</p><p className="text-blueprint-white/80">{system.purpose || 'NOT_DEFINED'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">TARGET_USER_DEMOGRAPHIC</p><p className="text-blueprint-white/80">{system.targetUsers || 'NOT_DEFINED'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">SENSITIVE_DATA_EXPOSURE</p><p className="text-blueprint-white/80">{system.sensitiveData || 'NOT_DEFINED'}</p></div>
            </div>
            <div className="space-y-6">
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">REFUSAL_CONSTRAINTS</p><p className="text-blueprint-white/80">{system.mustRefuse || 'NOT_DEFINED'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">IDENTIFIED_RISK_FACTORS</p><p className="text-blueprint-white/80">{system.knownRisks || 'NOT_DEFINED'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">INDUSTRY_VERTICAL</p><p className="text-blueprint-white/80">{system.industry || 'NOT_DEFINED'}</p></div>
            </div>
          </div>
        </section>

        {/* Failure Logs */}
        {failed > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-blueprint-error">Critical_Failure_Logs</h3>
              <div className="flex-1 h-px bg-blueprint-error/20" />
            </div>
            <div className="space-y-6">
              {cases.filter(c => c.result === 'FAIL').map(c => (
                <div key={c.id} className="blueprint-panel p-8 space-y-6 border-blueprint-error/30 bg-blueprint-error/[0.02]">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 bg-blueprint-error text-blueprint-paper text-[8px] font-mono font-black uppercase tracking-widest">{c.riskArea}</span>
                      <h4 className="text-xl font-bold uppercase tracking-tight text-blueprint-white">{c.prompt}</h4>
                    </div>
                    <div className="px-6 py-2 border border-blueprint-error text-blueprint-error font-black uppercase tracking-widest text-sm">FAILED</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-mono text-[10px] uppercase tracking-widest">
                     <div className="space-y-2">
                        <p className="blueprint-label !text-[8px] opacity-30">EXPECTED_BEHAVIOR</p>
                        <div className="p-4 bg-blueprint-paper/40 border border-blueprint-line/40 text-blueprint-white/60 lowercase italic">{c.expectedBehaviour}</div>
                     </div>
                     <div className="space-y-2">
                        <p className="blueprint-label !text-[8px] opacity-30">ACTUAL_ANOMALY</p>
                        <div className="p-4 bg-blueprint-paper/60 border border-blueprint-error/40 text-blueprint-error font-bold lowercase">{c.actualResponse || 'ZERO_LOG_RECOVERED'}</div>
                     </div>
                  </div>
                  {c.notes && (
                    <div className="pt-4 border-t border-blueprint-line/20 font-mono text-[9px] text-blueprint-white/40">
                       <span className="blueprint-label !text-[8px] mr-4 opacity-30">AUDITOR_OBSERVATION:</span> {c.notes.toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Master Vector Index */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-blueprint-white">Vector_Log_Registry</h3>
            <div className="flex-1 h-px bg-blueprint-line" />
          </div>
          <div className="blueprint-panel border-blueprint-line-solid/10 overflow-x-auto scrollbar-thin scrollbar-thumb-blueprint-line-solid/10">
            <table className="w-full text-left font-mono text-[9px] border-collapse uppercase tracking-widest bg-blueprint-paper/20 min-w-[800px]">
              <thead>
                <tr className="bg-blueprint-line-solid/5 border-b border-blueprint-line text-blueprint-line-solid/60">
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Unit_Ref</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Vector_Prompt</th>
                  <th className="px-4 py-3">Vulnerability_Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blueprint-line">
                {cases.map((c, index) => (
                  <tr key={c.id} className="hover:bg-blueprint-line-solid/[0.02] transition-colors">
                    <td className="px-4 py-3 font-bold">
                       <span className={c.result === 'PASS' ? 'text-blueprint-success' : c.result === 'FAIL' ? 'text-blueprint-error' : 'text-blueprint-accent'}>
                         _{c.result}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-blueprint-white/60 font-bold">{c.libraryId || `V_${(index + 1).toString().padStart(2, '0')}`}</td>
                    <td className="px-4 py-3 text-blueprint-white/40">{c.category}</td>
                    <td className="px-4 py-3 truncate max-w-xs text-blueprint-white/80">{c.prompt}</td>
                    <td className="px-4 py-3 text-blueprint-white/40">{c.riskArea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pt-16 border-t border-blueprint-line flex flex-col items-center gap-4 opacity-30 font-mono text-[9px] tracking-[0.5em] uppercase text-blueprint-white/60">
           <div className="flex items-center gap-10">
             <span>SYS_AUTH_VERIFIED</span>
             <span>SCHEMATIC_v1.2</span>
             <span>ID_LOG_{pack.id.substring(0, 4).toUpperCase()}</span>
           </div>
           <p className="tracking-widest opacity-50">© 2026 ARCHITECTURAL_ASSURANCE_SYSTEMS_CORE</p>
        </footer>
      </div>
    </div>
  );
}
