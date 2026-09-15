export default function Architecture() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Architecture</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          A governed AI system for designing, training, testing, and promoting child models
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-lg p-6 overflow-x-auto">
        <ArchDiagram />
      </div>

      {/* Bottom annotations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Why this is safer</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No single module has total control. Design, testing, memory, and veto power are separated into distinct subsystems with independent authority.
          </p>
        </div>
        <div className="bg-card border border-amber-200 dark:border-amber-800/60 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Main risk</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The system may learn to produce children that score well on tests while hiding flaws the tests fail to catch. Weak evals mean the wrong traits get selected.
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Closest real-world precursors</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>AutoML (Google Cloud)</li>
            <li>Neural architecture search</li>
            <li>AI eval pipelines (OpenAI)</li>
            <li>Constitutional AI layers (Anthropic)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div className="relative min-w-[560px]" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Top row: Human Goals + Constitution */}
      <div className="flex gap-4 mb-0">
        <div className="flex-1">
          <Box
            title="Human Goals / Policy / Budget"
            color="border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
            titleColor="text-slate-700 dark:text-slate-200"
          >
            <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
              <li>• Mission scope</li>
              <li>• Risk tolerance</li>
              <li>• Compute and cost limits</li>
            </ul>
          </Box>
        </div>
        <div className="flex-1">
          <Box
            title="Constitution / Rules"
            color="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
            titleColor="text-orange-700 dark:text-orange-400"
          >
            <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
              <li>• Non-negotiable constraints</li>
              <li>• No unsandboxed self-modification</li>
              <li>• No unchecked deployment</li>
            </ul>
          </Box>
        </div>
      </div>

      {/* Convergence arrows from top row → stack */}
      <div className="flex justify-center items-start h-8 relative">
        <svg width="100%" height="32" viewBox="0 0 600 32" preserveAspectRatio="none">
          {/* Left arrow from Human Goals */}
          <path d="M 150 0 L 150 12 L 300 12 L 300 28" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
          {/* Right arrow from Constitution */}
          <path d="M 450 0 L 450 12 L 300 12" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
          <polygon points="295,24 305,24 300,30" fill="hsl(var(--muted-foreground))" fillOpacity="0.5" />
        </svg>
      </div>

      {/* Pipeline stack with feedback loop */}
      <div className="relative flex gap-0">
        {/* Main pipeline */}
        <div className="flex-1 space-y-0">
          {/* 1 Architect */}
          <PipelineStage
            number="1"
            title="Architect Module"
            color="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
            titleColor="text-blue-700 dark:text-blue-400"
            dotColor="bg-blue-500"
            label="Proposes child-model blueprints"
            bullets={["architectures", "tool access", "memory setup", "training recipes"]}
          />
          <DownArrow />
          {/* 2 Build + Train */}
          <PipelineStage
            number="2"
            title="Build + Train Module"
            color="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
            titleColor="text-amber-700 dark:text-amber-400"
            dotColor="bg-amber-500"
            label="Creates candidate systems"
            bullets={["launches jobs", "fine-tunes", "distills", "applies compute caps"]}
          />
          <DownArrow />
          {/* 3 Evaluator */}
          <PipelineStage
            number="3"
            title="Evaluator Module"
            color="border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20"
            titleColor="text-purple-700 dark:text-purple-400"
            dotColor="bg-purple-500"
            label="Scores each candidate on"
            bullets={["capability", "reliability", "hallucination rate", "speed / cost", "robustness", "policy compliance"]}
          />
          <DownArrow />
          {/* 4 Governor */}
          <PipelineStage
            number="4"
            title="Governor / Safety Gate"
            color="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
            titleColor="text-red-700 dark:text-red-400"
            dotColor="bg-red-500"
            label="Rejects unsafe candidates"
            bullets={["blocks privilege escalation", "blocks hidden persistence", "vetoes rule-breaking designs"]}
          />
          <DownArrow />
          {/* 5 Lineage */}
          <PipelineStage
            number="5"
            title="Lineage Memory"
            color="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
            titleColor="text-emerald-700 dark:text-emerald-400"
            dotColor="bg-emerald-500"
            label="Stores inheritance history"
            bullets={["parent→child links", "training inputs", "eval results", "regressions", "incidents"]}
          />
          <DownArrow />
          {/* 6 Promotion Gate */}
          <PipelineStage
            number="6"
            title="Promotion Gate"
            color="border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/20"
            titleColor="text-sky-700 dark:text-sky-400"
            dotColor="bg-sky-500"
            label="Graduation ladder"
            bullets={["simulation only", "closed sandbox", "internal pilot", "limited deployment"]}
          />
        </div>

        {/* Feedback loop on the right */}
        <div className="w-20 relative flex-shrink-0">
          <svg
            className="absolute top-0 right-0 h-full"
            width="72"
            viewBox="0 0 72 700"
            preserveAspectRatio="none"
          >
            {/* Vertical line going up */}
            <line x1="36" y1="660" x2="36" y2="40" stroke="hsl(var(--primary))" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="5 3" />
            {/* Arrow at top pointing left (back to Architect) */}
            <polygon points="12,36 36,28 36,44" fill="hsl(var(--primary))" fillOpacity="0.7" />
            {/* Bottom hook from Promotion Gate */}
            <line x1="0" y1="660" x2="36" y2="660" stroke="hsl(var(--primary))" strokeWidth="2" strokeOpacity="0.6" />
          </svg>
          {/* Label */}
          <div
            className="absolute text-xs text-primary/60 font-medium"
            style={{ top: "50%", right: 2, transform: "translateY(-50%) rotate(90deg)", whiteSpace: "nowrap", transformOrigin: "center center" }}
          >
            feedback loop
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-px bg-muted-foreground/50" />
          <span>data / control flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-primary/60" style={{ borderTop: "2px dashed" }} />
          <span>feedback loop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Governor veto</span>
        </div>
      </div>
    </div>
  );
}

function Box({ title, color, titleColor, children }: {
  title: string; color: string; titleColor: string; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className={`text-sm font-semibold ${titleColor}`}>{title}</div>
      {children}
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex justify-center py-0.5">
      <svg width="24" height="20" viewBox="0 0 24 20">
        <line x1="12" y1="0" x2="12" y2="14" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeOpacity="0.5" />
        <polygon points="6,12 18,12 12,20" fill="hsl(var(--muted-foreground))" fillOpacity="0.5" />
      </svg>
    </div>
  );
}

function PipelineStage({ number, title, color, titleColor, dotColor, label, bullets }: {
  number: string; title: string; color: string; titleColor: string;
  dotColor: string; label: string; bullets: string[];
}) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-5 h-5 rounded-full ${dotColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {number}
        </div>
        <div className={`text-sm font-semibold ${titleColor}`}>{title}</div>
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">{label}:</span>{" "}
        {bullets.map((b, i) => (
          <span key={b}>
            {b}{i < bullets.length - 1 ? " • " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
