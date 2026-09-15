import { cn } from "@/lib/utils";

const stageConfig: Record<string, { label: string; className: string }> = {
  proposed:   { label: "Proposed",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  training:   { label: "Training",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  evaluating: { label: "Evaluating", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  governing:  { label: "Governing",  className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  approved:   { label: "Approved",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  rejected:   { label: "Rejected",   className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800" },
  deployed:   { label: "Deployed",   className: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border-sky-200 dark:border-sky-800" },
};

export default function StageBadge({ stage, className }: { stage: string; className?: string }) {
  const config = stageConfig[stage] ?? { label: stage, className: "bg-muted text-muted-foreground border-border" };
  return (
    <span
      data-testid={`badge-stage-${stage}`}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-mono",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export const severityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800" },
  high:     { label: "High",     className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  medium:   { label: "Medium",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  low:      { label: "Low",      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
};

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const config = severityConfig[severity] ?? { label: severity, className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", config.className, className)}>
      {config.label}
    </span>
  );
}
