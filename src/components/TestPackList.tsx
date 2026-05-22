import { useState } from 'react';
import { TestPack, AISystem } from '../types';
import { Plus, Eye, Play, Search, FileBarChart } from 'lucide-react';
import { getFriendlyDate } from '../lib/dateUtils';
import { useMemoryStore } from '../lib/memoryStore';

interface TestPackListProps {
  onSelectPack: (id: string, mode?: 'edit' | 'run' | 'report') => void;
}

export default function TestPackList({ onSelectPack }: TestPackListProps) {
  const { testPacks, updatePack, updateSystem } = useMemoryStore();
  const [searchTerm, setSearchTerm] = useState('');

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
      updatedAt: new Date().toISOString()
    };

    updateSystem(newSystem);
    updatePack(newPack);
    onSelectPack(packId, 'edit');
  };

  const filteredPacks = testPacks.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-blueprint-line pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-blueprint-white">Operation Registry</h1>
          <p className="blueprint-label">Master Directory of Ongoing Mission Schematics & Neural Probes</p>
        </div>
        <button onClick={createNewPack} className="blueprint-button blueprint-button-primary flex items-center gap-3 py-3 px-8 group">
          <Plus size={18} className="transition-transform group-hover:rotate-90" /> COMMENCE_NEW_MISSION
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <Search className="text-blueprint-line-solid/40 group-focus-within:text-blueprint-line-solid transition-colors" size={16} />
          <span className="text-[10px] font-mono text-blueprint-line-solid/20 hidden sm:inline">FIND_MISSION:</span>
        </div>
        <input 
          type="text" 
          placeholder="ENTER_MISSION_REF_OR_TARGET_IDENTIFIER..." 
          className="blueprint-input w-full pl-32 h-12 uppercase text-[11px] tracking-widest"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Schematic List Grid */}
      <div className="blueprint-panel border-blueprint-line-solid/20 overflow-hidden">
        <table className="w-full text-left font-mono text-[10px] border-collapse bg-blueprint-paper/30">
          <thead>
            <tr className="bg-blueprint-line-solid/5 text-blueprint-line-solid uppercase tracking-[0.2em] border-b border-blueprint-line">
              <th className="px-6 py-4 border-r border-blueprint-line font-bold">Status</th>
              <th className="px-6 py-4 border-r border-blueprint-line font-bold">Mission_Ref</th>
              <th className="px-6 py-4 border-r border-blueprint-line font-bold">Temporal_Stamp</th>
              <th className="px-6 py-4 border-r border-blueprint-line font-bold">Target_Signature</th>
              <th className="px-6 py-4 font-bold">Tactical_Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blueprint-line">
            {filteredPacks.map((pack) => (
              <tr key={pack.id} className="hover:bg-blueprint-line-solid/5 transition-colors group">
                <td className="px-6 py-5 border-r border-blueprint-line">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]
                      ${pack.status === 'RED' ? 'bg-blueprint-error' : 
                        pack.status === 'AMBER' ? 'bg-blueprint-accent' : 
                        'bg-blueprint-success'}
                    `} />
                    <span className={`text-[8px] font-bold ${pack.status === 'RED' ? 'text-blueprint-error' : pack.status === 'AMBER' ? 'text-blueprint-accent' : 'text-blueprint-success'}`}>
                      {pack.status === 'RED' ? 'CRITICAL' : pack.status === 'AMBER' ? 'PENDING' : 'STABILIZED'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line font-bold text-blueprint-white tracking-widest">
                  #{pack.id.substring(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line text-blueprint-white/50 tracking-tighter uppercase whitespace-nowrap">
                  {getFriendlyDate(new Date(pack.createdAt))}
                </td>
                <td className="px-6 py-5 border-r border-blueprint-line font-mono text-blueprint-accent/60 italic tracking-tighter">
                  SIGNATURE_{pack.systemId.substring(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onSelectPack(pack.id, 'edit')}
                      className="px-3 py-1.5 border border-blueprint-line-solid/20 text-blueprint-line-solid/60 flex items-center gap-2 hover:bg-blueprint-line-solid/10 hover:text-blueprint-line-solid hover:border-blueprint-line-solid transition-all uppercase font-bold tracking-widest"
                      title="Configuration"
                    >
                      <Eye size={12} /> CONFIGURE
                    </button>
                    <button 
                      onClick={() => onSelectPack(pack.id, 'run')}
                      className="px-3 py-1.5 border border-blueprint-line-solid bg-transparent text-blueprint-line-solid flex items-center gap-2 hover:bg-blueprint-line-solid hover:text-blueprint-paper transition-all uppercase font-bold tracking-widest"
                      title="Probe Execution"
                    >
                      <Play size={10} fill="currentColor" /> PROBE
                    </button>
                    <button 
                      onClick={() => onSelectPack(pack.id, 'report')}
                      className="px-3 py-1.5 border border-blueprint-success bg-transparent text-blueprint-success flex items-center gap-2 hover:bg-blueprint-success hover:text-blueprint-paper transition-all uppercase font-bold tracking-widest"
                      title="Analysis Summary"
                    >
                      <FileBarChart size={12} /> ANALYZE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPacks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center blueprint-label opacity-30 italic">
                  NO ACTIVE PROBES DISCOVERED OR REGISTERED
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
