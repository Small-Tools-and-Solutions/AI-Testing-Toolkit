import React, { useState, useEffect } from 'react';
import { TestPack, TestCase, AISystem } from '../types';
import { Shield, Download, ChevronLeft, Printer, Filter, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { getFriendlyDate } from '../lib/dateUtils';
import { useMemoryStore } from '../lib/memoryStore';
import { motion, AnimatePresence } from 'motion/react';

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
  const [filter, setFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'NOT TESTED'>('ALL');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

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

  if (loading || !pack || !system) return <div className="font-mono text-blueprint-line-solid animate-pulse tracking-[0.3em] uppercase flex items-center justify-center p-20">Compiling Report...</div>;

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
    link.setAttribute('download', `Assessment_Report_${friendlyTimestamp}.csv`);
    link.click();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 print:p-0 print:bg-white print:text-black">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-blueprint-line pb-6 gap-6 print:hidden">
        <button onClick={onClose} className="flex items-center gap-3 blueprint-label hover:text-blueprint-line-solid transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Registry
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="blueprint-button flex items-center gap-2"
          >
            <Printer size={14} /> Export PDF
          </button>
          <button 
            onClick={exportCSV} 
            className="blueprint-button blueprint-button-primary flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
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
                <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-blueprint-white">Assessment Report</h1>
              </div>
              <div className="h-0.5 bg-blueprint-line-solid/30 w-64" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 font-mono text-[10px] uppercase tracking-widest text-blueprint-white/50">
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">Assessment ID</p>
                <p className="text-blueprint-white font-bold">#{pack.id.substring(0, 12).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">Target System</p>
                <p className="text-blueprint-white font-bold">{system.name}</p>
              </div>
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">Completion Timestamp</p>
                <p className="text-blueprint-white font-bold">{getFriendlyDate(new Date(pack.updatedAt))} [{new Date(pack.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}]</p>
              </div>
              <div className="space-y-1">
                <p className="blueprint-label !text-[8px] opacity-40">Security Assessment</p>
                <div className={`mt-1 px-3 py-1 border font-bold text-[11px] inline-flex items-center gap-2 ${pack.status === 'RED' ? 'border-blueprint-error text-blueprint-error bg-blueprint-error/5' : pack.status === 'AMBER' ? 'border-blueprint-accent text-blueprint-accent bg-blueprint-accent/5' : 'border-blueprint-success text-blueprint-success bg-blueprint-success/5'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${pack.status === 'RED' ? 'bg-blueprint-error' : pack.status === 'AMBER' ? 'bg-blueprint-accent' : 'bg-blueprint-success'}`} />
                  {pack.status === 'RED' ? 'System Vulnerable' : pack.status === 'AMBER' ? 'Assessment Incomplete' : 'Verified Secure'}
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
            <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-blueprint-white">System Profile</h3>
            <div className="flex-1 h-px bg-blueprint-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-[10px] leading-loose uppercase tracking-wider">
            <div className="space-y-6">
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">Primary Purpose</p><p className="text-blueprint-white/80">{system.purpose || 'Not Defined'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">Target Users</p><p className="text-blueprint-white/80">{system.targetUsers || 'Not Defined'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">Sensitive Data Context</p><p className="text-blueprint-white/80">{system.sensitiveData || 'Not Defined'}</p></div>
            </div>
            <div className="space-y-6">
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">Refusal Guidelines</p><p className="text-blueprint-white/80">{system.mustRefuse || 'Not Defined'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">Known Risk Factors</p><p className="text-blueprint-white/80">{system.knownRisks || 'Not Defined'}</p></div>
               <div className="space-y-1"><p className="blueprint-label !text-[8px] opacity-40">Vertical Domain</p><p className="text-blueprint-white/80">{system.industry || 'Not Defined'}</p></div>
            </div>
          </div>
        </section>

        {/* Master Vector Index */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-blueprint-white">Security Test Logs</h3>
              <div className="flex-1 h-px bg-blueprint-line" />
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-2 bg-blueprint-line-solid/5 p-1 border border-blueprint-line">
              <div className="px-2 text-[8px] font-mono text-blueprint-line-solid/80 flex items-center gap-1">
                <Filter size={10} /> Filter:
              </div>
              {(['ALL', 'PASS', 'FAIL', 'NOT TESTED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[8px] font-mono font-bold tracking-tighter transition-all ${
                    filter === f 
                      ? 'bg-blueprint-line-solid text-blueprint-paper shadow-[0_0_10px_rgba(100,255,218,0.3)]' 
                      : 'text-blueprint-white/40 hover:text-blueprint-white hover:bg-blueprint-line-solid/10'
                  }`}
                >
                  {f === 'NOT TESTED' ? 'PENDING' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="blueprint-panel border-blueprint-line-solid/10 overflow-x-auto scrollbar-thin scrollbar-thumb-blueprint-line-solid/10">
            <table className="w-full text-left font-mono text-[9px] border-collapse uppercase tracking-widest bg-blueprint-paper/20 min-w-[800px]">
              <thead>
                <tr className="bg-blueprint-line-solid/5 border-b border-blueprint-line text-blueprint-line-solid/60">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Test ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Test Prompt</th>
                  <th className="px-4 py-3">Risk Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blueprint-line">
                {cases
                  .filter(c => filter === 'ALL' || c.result === filter)
                  .map((c, index) => {
                    const isExpanded = expandedIds.includes(c.id);
                    return (
                      <React.Fragment key={c.id}>
                        <tr 
                          onClick={() => toggleExpand(c.id)}
                          className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blueprint-line-solid/5' : 'hover:bg-blueprint-line-solid/[0.04]'}`}
                        >
                          <td className="px-4 py-3 text-center">
                            {isExpanded ? <ChevronUp size={12} className="text-blueprint-line-solid" /> : <ChevronDown size={12} className="text-blueprint-white/20" />}
                          </td>
                          <td className="px-4 py-3 font-bold">
                             <span className={c.result === 'PASS' ? 'text-blueprint-success' : c.result === 'FAIL' ? 'text-blueprint-error' : 'text-blueprint-accent'}>
                               {c.result === 'NOT TESTED' ? 'PENDING' : c.result}
                             </span>
                          </td>
                          <td className="px-4 py-3 text-blueprint-white font-bold">{c.libraryId || `V_${(index + 1).toString().padStart(2, '0')}`}</td>
                          <td className="px-4 py-3 text-blueprint-white/70">{c.category}</td>
                          <td className="px-4 py-3 truncate max-w-xs text-blueprint-white/80">{c.prompt}</td>
                          <td className="px-4 py-3 text-blueprint-white/70">{c.riskArea}</td>
                        </tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="p-0 border-none">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-blueprint-line-solid/[0.02]"
                                >
                                  <div className="p-8 space-y-6 border-l-2 border-blueprint-line-solid/30 ml-4 mb-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex gap-4 items-start">
                                        <div className={`p-2 border ${c.result === 'PASS' ? 'border-blueprint-success bg-blueprint-success/5 text-blueprint-success' : c.result === 'FAIL' ? 'border-blueprint-error bg-blueprint-error/5 text-blueprint-error' : 'border-blueprint-accent bg-blueprint-accent/5 text-blueprint-accent'}`}>
                                          <span className="text-[12px] font-black">{c.libraryId || 'UNC_REF'}</span>
                                        </div>
                                        <div className="space-y-1">
                                          <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest ${c.result === 'PASS' ? 'bg-blueprint-success text-blueprint-paper' : c.result === 'FAIL' ? 'bg-blueprint-error text-blueprint-paper' : 'bg-blueprint-accent text-blueprint-paper'}`}>{c.riskArea}</span>
                                          <h4 className="text-lg font-bold uppercase tracking-tight text-blueprint-white">{c.prompt}</h4>
                                        </div>
                                      </div>
                                      <div className={`px-4 py-1.5 border font-black uppercase tracking-widest text-xs ${c.result === 'PASS' ? 'border-blueprint-success text-blueprint-success' : c.result === 'FAIL' ? 'border-blueprint-error text-blueprint-error' : 'border-blueprint-accent text-blueprint-accent'}`}>
                                        {c.result}
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-[10px] uppercase tracking-widest">
                                       <div className="space-y-2">
                                          <p className="blueprint-label !text-[8px] opacity-30">Expected Behavior</p>
                                          <div className="p-4 bg-blueprint-paper/40 border border-blueprint-line/20 text-blueprint-white/60 lowercase italic leading-relaxed">
                                            {c.expectedBehaviour}
                                          </div>
                                       </div>
                                       <div className="space-y-2">
                                          <p className="blueprint-label !text-[8px] opacity-30">Actual Response</p>
                                          <div className={`p-4 bg-blueprint-paper/60 border ${c.result === 'FAIL' ? 'border-blueprint-error/40 text-blueprint-error' : 'border-blueprint-line/40 text-blueprint-white/80'} font-bold lowercase leading-relaxed`}>
                                            {c.actualResponse || 'No response logs recovered'}
                                          </div>
                                       </div>
                                    </div>
                                    
                                    {c.notes && (
                                      <div className="pt-4 border-t border-blueprint-line/20 font-mono text-[9px] text-blueprint-white/40">
                                         <span className="blueprint-label !text-[8px] mr-4 opacity-30">Auditor Notes:</span> {c.notes}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pt-16 border-t border-blueprint-line flex flex-col items-center gap-4 opacity-30 font-mono text-[9px] tracking-[0.5em] uppercase text-blueprint-white/60">
           <div className="flex items-center gap-10">
             <span>Security Verified</span>
             <span>Framework v4.2.1 Stable</span>
             <span>Log #{pack.id.substring(0, 4).toUpperCase()}</span>
           </div>
           <p className="tracking-widest opacity-50">© 2026 CipherWatch Security Framework</p>
        </footer>
      </div>
    </div>
  );
}
