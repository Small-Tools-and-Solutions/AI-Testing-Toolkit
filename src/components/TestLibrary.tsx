import { useState, useMemo, useEffect } from 'react';
import { BASELINE_TESTS } from '../lib/testLibraryData';
import { Search, Filter, ShieldCheck, Database, Zap, Lock, BookOpen, Clock, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { getFriendlyDate } from '../lib/dateUtils';

export default function TestLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Hardcoded version info for the intelligence library
  const libraryVersion = "v2.4.1";
  const lastUpdated = new Date('2026-05-21T17:22:00Z'); // Represents 6:22 PM BST

  const categories = useMemo(() => {
    return ['ALL', ...new Set(BASELINE_TESTS.map(t => t.category))].sort();
  }, []);

  const filteredTests = useMemo(() => {
    return BASELINE_TESTS.filter(t => {
      const matchesSearch = t.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.owaspArea.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory]);

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filterCategory]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <BookOpen size={36} className="text-blueprint-line-solid" />
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-blueprint-white">System Library</h1>
              <div className="h-0.5 bg-blueprint-line-solid/20 w-32" />
            </div>
          </div>
          <p className="blueprint-label">Vulnerability Vector Schematic Database</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          {/* Metadata Block */}
          <div className="blueprint-panel p-4 flex items-center gap-8 bg-blueprint-line-solid/5 border-blueprint-line-solid/20">
            <div className="flex items-center gap-2">
              <Tag size={12} className="text-blueprint-accent" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-blueprint-white/70">VER: {libraryVersion}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-blueprint-line-solid" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-blueprint-white/70">SCHEM_SYNC: {getFriendlyDate(lastUpdated)}</span>
            </div>
          </div>

          {/* Pagination Navigation */}
          <div className="flex items-center gap-3">
            <span className="blueprint-label opacity-40">VECTOR_PAGES:</span>
            <div className="flex items-center border border-blueprint-line-solid/30 bg-blueprint-paper/50">
              <button 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="p-2 text-blueprint-line-solid hover:bg-blueprint-line-solid/10 disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="px-4 py-2 border-x border-blueprint-line-solid/30 font-mono text-[10px] text-blueprint-line-solid font-bold tracking-widest">
                {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </div>
              <button 
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="p-2 text-blueprint-line-solid hover:bg-blueprint-line-solid/10 disabled:opacity-20 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Matrices */}
      <div className="py-6 border-y border-blueprint-line">
        <div className="space-y-4">
          <span className="blueprint-label">Classification_Matrix:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`
                  blueprint-button px-3 py-1.5
                  ${filterCategory === c 
                    ? 'blueprint-button-primary' 
                    : ''}
                `}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blueprint-line-solid/40 group-focus-within:text-blueprint-line-solid transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="ENTER SEARCH PARAMETERS [REF, CLASSIFICATION, RISK_AREA]..." 
          className="blueprint-input w-full pl-16 pr-6 h-14 tracking-widest uppercase text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-blueprint-line-solid" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-blueprint-line-solid" />
      </div>

      {/* Data Schematic Table */}
      <div className="blueprint-panel border-blueprint-line-solid/20 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blueprint-line-solid/10 text-blueprint-line-solid/80 uppercase text-[9px] tracking-[0.2em] text-left font-mono">
              <th className="px-6 py-4 border-r border-blueprint-line">Ref</th>
              <th className="px-6 py-4 border-r border-blueprint-line">Class</th>
              <th className="px-6 py-4 border-r border-blueprint-line">Vulnerability_Area (OWASP)</th>
              <th className="px-6 py-4">Vector_Schematic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blueprint-line">
            {paginatedTests.map((test) => (
              <tr key={test.id} className="hover:bg-blueprint-line-solid/5 transition-colors group">
                <td className="px-6 py-4 border-r border-blueprint-line font-mono font-black text-blueprint-line-solid/80 group-hover:text-blueprint-line-solid text-xs">
                  {test.id}
                </td>
                <td className="px-6 py-4 border-r border-blueprint-line">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-blueprint-white uppercase tracking-tight">
                      <Zap size={12} className="text-blueprint-accent" />
                      {test.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-blueprint-line">
                  <RiskBadge area={test.owaspArea} />
                </td>
                <td className="p-0 align-top">
                  <CopyCell prompt={test.prompt} hint={test.hint} />
                </td>
              </tr>
            ))}
            {paginatedTests.length === 0 && (
              <tr>
                <td colSpan={4} className="p-20 text-center blueprint-label opacity-30 italic">
                  NO VECTORS REGISTERED FOR THE CURRENT QUERY
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskBadge({ area }: { area: string }) {
  const isOwasp = area.startsWith('LLM');
  return (
    <div className={`
      inline-block text-[10px] font-mono font-bold px-3 py-1 border uppercase tracking-wider
      ${isOwasp 
        ? 'border-blueprint-accent/40 text-blueprint-accent bg-blueprint-accent/5' 
        : 'border-blueprint-line-solid/40 text-blueprint-line-solid/80 bg-blueprint-line-solid/5'}
    `}>
      {area}
    </div>
  );
}

function CopyCell({ prompt, hint }: { prompt: string; hint?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="p-6 h-full cursor-pointer group/copy relative hover:bg-blueprint-line-solid/[0.02] transition-colors"
    >
      <div className="flex justify-between gap-6 items-start pb-3">
        <span className="font-mono text-[11px] leading-relaxed text-blueprint-white group-hover/copy:text-blueprint-accent transition-colors">
          {prompt}
        </span>
        <div className={`
          p-1.5 border transition-all shrink-0
          ${copied 
            ? 'bg-blueprint-success border-blueprint-success text-blueprint-paper' 
            : 'bg-blueprint-line-solid/5 border-blueprint-line-solid/30 text-blueprint-line-solid opacity-60 group-hover/copy:opacity-100 group-hover/copy:border-blueprint-line-solid'}
        `}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </div>
      </div>
      
      {hint && (
        <div className="flex items-start gap-2 mt-2">
          <div className="h-px bg-blueprint-accent/30 w-4 mt-2" />
          <span className="text-[9px] font-mono font-medium text-blueprint-accent/70 uppercase leading-normal tracking-tighter italic">
            {hint}
          </span>
        </div>
      )}

      {copied && (
        <div className="absolute top-2 right-14 bg-blueprint-line-solid text-blueprint-paper text-[8px] px-2 py-1 font-mono font-bold uppercase animate-in fade-in slide-in-from-right-1">
          Copied to Clipboard
        </div>
      )}
    </div>
  );
}
