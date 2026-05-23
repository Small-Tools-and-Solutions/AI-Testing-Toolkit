import { Shield, Target, Play, FileText, CheckCircle } from 'lucide-react';

export default function Guide() {
  const steps = [
    {
      title: "Setup Assessment",
      icon: <Target className="text-blueprint-accent" />,
      desc: "Go to the Assessments page and click 'New Assessment'. Fill in the profile details: the System Name is a mandatory required field."
    },
    {
      title: "Configure Content",
      icon: <Shield className="text-blueprint-line-solid" />,
      desc: "Click 'Setup' on your assessment row. Use the library to import security tests or add your own custom prompts that you want to test."
    },
    {
      title: "Run Protocols",
      icon: <Play className="text-blueprint-success" />,
      desc: "Select 'Run' to start testing. Execute the prompts against your AI system and record the responses to check for vulnerabilities."
    },
    {
      title: "Audit Findings",
      icon: <CheckCircle className="text-blueprint-error" />,
      desc: "Review the results and verify the system's behavior. Mark each test as Pass or Fail to update the overall security posture."
    },
    {
      title: "View Report",
      icon: <FileText className="text-blueprint-line-solid" />,
      desc: "Select 'Report' to generate the executive summary. Access professional visualizations, charts, and detailed data logs of your audit."
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 relative">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-5xl font-bold tracking-[0.2em] uppercase text-blueprint-white">Get Started</h1>
        <div className="h-0.5 bg-blueprint-line-solid/30 w-48" />
        <p className="text-lg font-mono text-blueprint-line-solid/70 leading-relaxed">
          Ensure AI system resilience through systematic testing, behavior validation, and vulnerability mapping.
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
              <span className="text-xs font-mono text-blueprint-line-solid/50">0{i + 1}.</span> {step.title}
            </h3>
            
            <p className="text-sm font-mono leading-relaxed text-blueprint-white/60 group-hover:text-blueprint-white/80 transition-colors">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="blueprint-panel p-10 bg-blueprint-line-solid/5 border-blueprint-line-solid/40 relative">
        <div className="absolute -top-3 left-10 px-4 bg-blueprint-paper border border-blueprint-line-solid/40 font-mono text-xs text-blueprint-accent uppercase tracking-[0.3em] font-bold">
          Platform Methodology
        </div>
        
        <div className="space-y-6">
          <h3 className="text-2xl font-bold uppercase text-blueprint-white tracking-[0.1em] flex items-center gap-4">
            <Shield className="text-blueprint-accent" size={24} /> Professional Security Framework
          </h3>
          <p className="font-mono text-xs leading-loose text-blueprint-white/70 uppercase tracking-widest">
            This framework provides a repeatable methodology for testing AI systems and RAG implementations. We prioritize structural security, retrieval fidelity, and operational safety through systematic professional evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
