import { useListLineageEvents, useListCandidates } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { GitBranch, ExternalLink } from "lucide-react";

const eventConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  proposed:            { label: "Proposed",            color: "text-blue-600 dark:text-blue-400",    dotColor: "bg-blue-500" },
  training_started:    { label: "Training Started",    color: "text-amber-600 dark:text-amber-400",  dotColor: "bg-amber-500" },
  training_complete:   { label: "Training Complete",   color: "text-amber-500 dark:text-amber-300",  dotColor: "bg-amber-400" },
  evaluation_complete: { label: "Evaluation Complete", color: "text-purple-600 dark:text-purple-400", dotColor: "bg-purple-500" },
  governance_passed:   { label: "Governance Passed",   color: "text-emerald-600 dark:text-emerald-400", dotColor: "bg-emerald-500" },
  governance_failed:   { label: "Governance Failed",   color: "text-red-600 dark:text-red-400",      dotColor: "bg-red-500" },
  promoted:            { label: "Promoted",            color: "text-sky-600 dark:text-sky-400",      dotColor: "bg-sky-500" },
  deployed:            { label: "Deployed",            color: "text-sky-600 dark:text-sky-400",      dotColor: "bg-sky-500" },
  retired:             { label: "Retired",             color: "text-muted-foreground",               dotColor: "bg-muted-foreground" },
};

export default function Lineage() {
  const [, setLocation] = useLocation();
  const [candidateFilter, setCandidateFilter] = useState<number | null>(null);

  const { data: events, isLoading } = useListLineageEvents(
    candidateFilter ? { candidateId: candidateFilter, limit: 200 } : { limit: 200 }
  );
  const { data: candidates } = useListCandidates({});

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Lineage Memory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Full history of all pipeline events — the system's long-term memory</p>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded">
          {isLoading ? "—" : `${events?.length ?? 0} events`}
        </div>
      </div>

      {/* Filter by candidate */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setCandidateFilter(null)}
          data-testid="filter-candidate-all"
          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
            candidateFilter === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
          }`}
        >
          All Candidates
        </button>
        {(candidates ?? []).map(c => (
          <button
            key={c.id}
            onClick={() => setCandidateFilter(c.id)}
            data-testid={`filter-candidate-${c.id}`}
            className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
              candidateFilter === c.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-card border border-card-border rounded-lg p-5">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-muted mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-2.5 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (events ?? []).length === 0 ? (
          <div className="text-center py-10">
            <GitBranch className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-5">
              {(events ?? []).map((event, i) => {
                const cfg = eventConfig[event.eventType] ?? { label: event.eventType, color: "text-foreground", dotColor: "bg-muted-foreground" };
                return (
                  <div key={event.id} className="flex gap-4 pl-6 relative" data-testid={`lineage-event-${event.id}`}>
                    {/* Dot */}
                    <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${cfg.dotColor} ring-2 ring-card flex-shrink-0`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                            <button
                              onClick={() => setLocation(`/candidates/${event.candidateId}`)}
                              className="text-xs font-mono text-primary hover:underline flex items-center gap-0.5"
                              data-testid={`link-candidate-${event.candidateId}`}
                            >
                              {event.candidateName}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{event.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-muted-foreground/60">
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                          </div>
                          <div className="text-xs text-muted-foreground/40 font-mono">
                            {format(new Date(event.createdAt), "HH:mm")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
