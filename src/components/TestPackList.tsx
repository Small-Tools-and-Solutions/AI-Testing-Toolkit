import { useState } from 'react';
import { Plus, Eye, Play, Search, FileBarChart, Trash2, X, AlertTriangle, LayoutGrid } from 'lucide-react';
import { getFriendlyDate } from '../lib/dateUtils';
import { useMemoryStore } from '../lib/memoryStore';
import { motion, AnimatePresence } from 'motion/react';
import { ASSESSMENT_TEMPLATES, AssessmentTemplate } from '../lib/templates';
import { SECURITY_BANK } from '../lib/testLibraryData';
import { AISystem, TestPack, TestCase } from '../types';

interface TestPackListProps {
  onSelectPack: (id: string, mode?: 'edit' | 'run' | 'report') => void;
}

export default function TestPackList({ onSelectPack }: TestPackListProps) {
  const { testPacks, updatePack, updateSystem, updateCases, deletePack, getSystem } = useMemoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [packToDelete, setPackToDelete] = useState<string | string[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const useTemplate = (template: AssessmentTemplate) => {
    const systemId = crypto.randomUUID();
    const packId = crypto.randomUUID();
    
    const newSystem: AISystem = {
      id: systemId,
      name: `${template.system.name || 'NEW SYSTEM'}`,
      purpose: template.system.purpose || '',
      targetUsers: template.system.targetUsers || '',
      dataSources: template.system.dataSources || '',
      connectedTools: template.system.connectedTools || '',
      allowedActions: template.system.allowedActions || '',
      mustRefuse: template.system.mustRefuse || '',
      sensitiveData: template.system.sensitiveData || '',
      industry: template.system.industry || '',
      knownRisks: template.system.knownRisks || ''
    };

    const newPack: TestPack = {
      id: packId,
      systemId: systemId,
      status: 'AMBER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true
    };

    // Construct initial test cases from the library bank
    const initialCases: TestCase[] = template.initialTestIds
      .map(tid => SECURITY_BANK.find(t => t.id === tid))
      .filter((t): t is any => !!t)
      .map(t => ({
        id: crypto.randomUUID(),
        testPackId: packId,
        libraryId: t.id,
        category: t.category,
        prompt: t.prompt,
        expectedBehaviour: t.expected,
        actualResponse: '',
        result: 'NOT TESTED',
        riskArea: t.owaspArea,
        priority: 'MEDIUM',
        notes: '',
        hint: t.hint,
        tags: t.tags
      }));

    updateSystem(newSystem);
    updatePack(newPack);
    updateCases(packId, initialCases);
    onSelectPack(packId, 'edit');
  };

  const createNewPack = () => {
    const systemId = crypto.randomUUID();
    const packId = crypto.randomUUID();
    
    // Default system definition
    const newSystem: AISystem = {
      id: systemId,
      name: 'NEW AI SYSTEM',
      purpose: '',
      targetUsers: '',
      dataSources: '',
      connectedTools: '',
      allowedActions: '',
      mustRefuse: '',
      sensitiveData: '',
      industry: '',
      knownRisks: ''
    };

    const newPack: TestPack = {
      id: packId,
      systemId: systemId,
      status: 'AMBER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true
    };

    updateSystem(newSystem);
    updatePack(newPack);
    onSelectPack(packId, 'edit');
  };

  const handleDeleteConfirm = () => {
    if (packToDelete) {
      if (Array.isArray(packToDelete)) {
        packToDelete.forEach(id => deletePack(id));
        setSelectedIds([]);
      } else {
        deletePack(packToDelete);
        setSelectedIds(prev => prev.filter(id => id !== packToDelete));
      }
      setPackToDelete(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredPacks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPacks.map(p => p.id));
    }
  };

  const filteredPacks = testPacks.filter(p => {
    const system = getSystem(p.systemId);
    const searchString = `${p.id} ${system?.name || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-blueprint-line pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-blueprint-white">Assessment Registry</h1>
          <p className="blueprint-label">Directory of current assessments and security reviews</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGallery(!showGallery)}
            className={`blueprint-button flex items-center gap-3 py-3 px-6 transition-all ${showGallery ? 'bg-blueprint-line-solid/10 border-blueprint-line-solid text-blueprint-line-solid' : 'text-blueprint-line-solid/60 border-blueprint-line-solid/20'}`}
          >
            <LayoutGrid size={18} /> {showGallery ? 'HIDE GALLERY' : 'TEMPLATE GALLERY'}
          </button>
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setPackToDelete(selectedIds)}
                className="blueprint-button bg-blueprint-error/20 text-blueprint-error border-blueprint-error/40 hover:bg-blueprint-error hover:text-blueprint-paper flex items-center gap-2 group/bulk"
              >
                <Trash2 size={16} className="transition-transform group-hover/bulk:scale-110" />
                Delete Selected [{selectedIds.length}]
              </motion.button>
            )}
          </AnimatePresence>
          <button onClick={createNewPack} className="blueprint-button blueprint-button-primary flex items-center gap-3 py-3 px-8 group">
            <Plus size={18} className="transition-transform group-hover:rotate-90" /> New Assessment
          </button>
        </div>
      </header>

      {/* Template Gallery Section */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-blueprint-line-solid/[0.03] border border-blueprint-line-solid/10 mb-8">
              {ASSESSMENT_TEMPLATES.map((tmpl) => (
                <div 
                  key={tmpl.id} 
                  className="blueprint-panel p-6 flex flex-col gap-4 border-blueprint-line-solid/20 bg-blueprint-paper/40 hover:border-blueprint-line-solid/40 transition-all group/card"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-blueprint-line-solid uppercase tracking-[0.15em]">{tmpl.name}</h4>
                    <p className="text-[10px] text-blueprint-white/40 uppercase tracking-tighter line-clamp-2">{tmpl.description}</p>
                  </div>
                  <div className="mt-auto">
                    <button 
                      onClick={() => useTemplate(tmpl)}
                      className="w-full py-2 border border-blueprint-line-solid/30 text-[10px] font-bold text-blueprint-line-solid/80 uppercase tracking-widest hover:bg-blueprint-line-solid hover:text-blueprint-paper transition-all"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <Search className="text-blueprint-line-solid/40 group-focus-within:text-blueprint-line-solid transition-colors" size={16} />
          <span className="text-xs font-mono text-blueprint-line-solid/20 hidden sm:inline">Search:</span>
        </div>
        <input 
          type="text" 
          placeholder="Filter by ID or target system..." 
          className="blueprint-input w-full pl-32 h-14 uppercase text-xs tracking-widest"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Schematic List Grid */}
      <div className="blueprint-panel border-blueprint-line-solid/20 overflow-hidden">
        <table className="w-full text-left font-mono text-xs border-collapse bg-blueprint-paper/30">
          <thead>
            <tr className="bg-blueprint-line-solid/5 text-blueprint-line-solid font-bold uppercase tracking-[0.2em] border-b border-blueprint-line">
              <th className="px-6 py-4 w-12 border-r border-blueprint-line">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="blueprint-checkbox"
                    checked={filteredPacks.length > 0 && selectedIds.length === filteredPacks.length}
                    onChange={toggleAll}
                  />
                </div>
              </th>
              <th className="px-6 py-4 border-r border-blueprint-line w-16">No.</th>
              <th className="px-6 py-4 border-r border-blueprint-line">Security Assessment</th>
              <th className="px-6 py-4 border-r border-blueprint-line">Assessment ID</th>
              <th className="px-6 py-4 border-r border-blueprint-line">Completion Timestamp</th>
              <th className="px-6 py-4 border-r border-blueprint-line">Target System</th>
              <th className="px-6 py-4 flex-1">Actions</th>
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blueprint-line">
            {filteredPacks.map((pack, index) => (
              <tr key={pack.id} className={`transition-colors group ${selectedIds.includes(pack.id) ? 'bg-blueprint-line-solid/10' : 'hover:bg-blueprint-line-solid/5'}`}>
                <td className="px-6 py-5 border-r border-blueprint-line">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="blueprint-checkbox"
                      checked={selectedIds.includes(pack.id)}
                      onChange={() => toggleSelect(pack.id)}
                    />
                  </div>
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line text-blueprint-white whitespace-nowrap">
                  {(index + 1).toString().padStart(4, '0')}
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]
                      ${pack.status === 'RED' ? 'bg-blueprint-error' : 
                        pack.status === 'AMBER' ? 'bg-blueprint-accent' : 
                        'bg-blueprint-success'}
                    `} />
                    <span className={`text-[10px] font-bold ${pack.status === 'RED' ? 'text-blueprint-error' : pack.status === 'AMBER' ? 'text-blueprint-accent' : 'text-blueprint-success'}`}>
                      {pack.status === 'RED' ? 'CRITICAL' : pack.status === 'AMBER' ? 'PENDING' : 'STABILIZED'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line font-bold text-blueprint-white tracking-widest">
                  #{pack.id.substring(0, 12).toUpperCase()}
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line text-blueprint-white tracking-widest uppercase whitespace-nowrap">
                  {getFriendlyDate(new Date(pack.createdAt))}
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line font-mono text-blueprint-accent hover:text-blueprint-accent/80 transition-colors italic tracking-tighter bg-blueprint-line-solid/[0.02]">
                   {getSystem(pack.systemId)?.name || 'UNKNOWN SYSTEM'}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onSelectPack(pack.id, 'edit')}
                      className="px-3 py-1.5 border border-blueprint-line-solid/20 text-blueprint-line-solid/60 flex items-center gap-2 hover:bg-blueprint-line-solid/10 hover:text-blueprint-line-solid hover:border-blueprint-line-solid transition-all uppercase font-bold tracking-widest"
                      title="Setup"
                    >
                      <Eye size={12} /> SETUP
                    </button>
                    <button 
                      onClick={() => onSelectPack(pack.id, 'report')}
                      className="px-3 py-1.5 border border-blueprint-success bg-transparent text-blueprint-success flex items-center gap-2 hover:bg-blueprint-success hover:text-blueprint-paper transition-all uppercase font-bold tracking-widest"
                      title="Report View"
                    >
                      <FileBarChart size={12} /> REPORT
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => setPackToDelete(pack.id)}
                    className="p-1.5 text-blueprint-error/40 hover:text-blueprint-error hover:bg-blueprint-error/10 transition-all rounded-xs"
                    title="Purge Schematic"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPacks.length === 0 && (
              <tr>
                <td colSpan={8} className="p-20 text-center blueprint-label opacity-30 italic">
                  NO ACTIVE ASSESSMENTS DISCOVERED OR REGISTERED
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {packToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPackToDelete(null)}
              className="absolute inset-0 bg-blueprint-paper/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-blueprint-paper border border-blueprint-error/30 p-8 shadow-[0_0_50px_rgba(255,70,70,0.15)] mx-4"
            >
              <div className="flex items-start gap-6 mb-8">
                <div className="p-4 bg-blueprint-error/10 border border-blueprint-error/20 shrink-0">
                  <AlertTriangle className="text-blueprint-error" size={28} />
                </div>
                <div className="space-y-3 overflow-hidden">
                  <h3 className="text-xl font-bold uppercase tracking-[0.1em] text-blueprint-white whitespace-nowrap">Confirm Deletion</h3>
                  <p className="font-mono text-xs text-blueprint-white/50 leading-relaxed uppercase tracking-widest">
                    {Array.isArray(packToDelete) 
                      ? `You are about to permanently delete [ ${packToDelete.length} ] assessments. This action is irreversible.`
                      : <>You are about to permanently delete the assessment <span className="text-blueprint-error">#{packToDelete.substring(0, 12).toUpperCase()}</span>. This action is irreversible.</>
                    }
                    {' '}All associated reports and test logs will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setPackToDelete(null)}
                  className="flex-1 blueprint-button border-blueprint-line-solid/20 text-blueprint-line-solid/40 hover:text-blueprint-line-solid"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 blueprint-button bg-blueprint-error text-blueprint-paper border-blueprint-error hover:bg-blueprint-error/80"
                >
                  Confirm Deletion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
