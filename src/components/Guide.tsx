import { Shield, Target, Play, FileText, CheckCircle } from 'lucide-react';

export default function Guide() {
  const steps = [
    {
      title: "Define Target",
      icon: <Target className="text-blueprint-accent" />,
      desc: "Create a new Test Pack and describe your AI agent or RAG assistant in detail. Specify its purpose, constraints, and data sources."
    },
    {
      title: "Seed Scenarios",
      icon: <Shield className="text-blueprint-line-solid" />,
      desc: "Select mandatory baseline tests from our core library and use the AI Neural Engine to generate scenario-specific edge cases tailored to your agent."
    },
    {
      title: "Execute Probe",
      icon: <Play className="text-blueprint-success" />,
      desc: "Run each prompt through your target AI. Record the actual responses and compare them against expected behavior."
    },
    {
      title: "Validate & Audit",
      icon: <CheckCircle className="text-blueprint-error" />,
      desc: "Mark results as PASS or FAIL based on your findings. Attach evidence and notes for compliance and governance review."
    },
    {
      title: "Generate Intelligence",
      icon: <FileText className="text-blueprint-line-solid" />,
      desc: "Export an executive audit report mapping failures to OWASP risk areas. Share findings with stakeholders for remediation."
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 relative">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-5xl font-bold tracking-[0.2em] uppercase text-blueprint-white">Operational Protocol</h1>
        <div className="h-0.5 bg-blueprint-line-solid/30 w-48" />
        <p className="text-lg font-mono text-blueprint-line-solid/70 leading-relaxed italic">
          “Execution of the assurance cycle requires comprehensive vector validation, response logging, and vulnerability mapping across the model schematic.”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div 
            key={i} 
            className="blueprint-panel p-8 group hover:bg-blueprint-line-solid/[0.03] transition-all duration-500 relative"
          >
            <div className="absolute top-2 right-4 technical-marker">PROC_STEP_0{i + 1}</div>
            
            <div className="w-12 h-12 border border-blueprint-line-solid/40 bg-blueprint-line-solid/5 flex items-center justify-center mb-8 relative">
              <div className="absolute -top-1 -left-1 w-1 h-1 bg-blueprint-line-solid" />
              {step.icon}
            </div>
            
            <h3 className="text-xl font-bold uppercase mb-4 text-blueprint-white tracking-widest flex items-center gap-2">
              <span className="text-[10px] font-mono text-blueprint-line-solid/50">0{i + 1}.</span> {step.title}
            </h3>
            
            <p className="text-[11px] font-mono leading-relaxed text-blueprint-white/60 group-hover:text-blueprint-white/80 transition-colors">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="blueprint-panel p-10 bg-blueprint-line-solid/5 border-blueprint-line-solid/40 relative">
        <div className="absolute -top-3 left-10 px-4 bg-blueprint-paper border border-blueprint-line-solid/40 font-mono text-[10px] text-blueprint-accent uppercase tracking-[0.3em] font-bold">
          MISSION_CORE_PHILOSOPHY
        </div>
        
        <div className="space-y-6">
          <h3 className="text-2xl font-bold uppercase text-blueprint-white tracking-[0.1em] flex items-center gap-4">
            <Shield className="text-blueprint-accent" size={24} /> Schematic Framework Integrity
          </h3>
          <p className="font-mono text-xs leading-loose text-blueprint-white/70 uppercase tracking-widest">
            This schematic framework provides a repeatable methodology for probing LLM agents and RAG implementations. We prioritize structural security, retrieval fidelity, and operational boundary enforcement through systematic red-teaming.
          </p>
        </div>
      </div>
    </div>
  );
}
