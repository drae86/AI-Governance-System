import { useRoute, useLocation } from "wouter";
import {
  useGetCandidate, getGetCandidateQueryKey,
  useListEvaluations, getListEvaluationsQueryKey,
  useListLineageEvents,
  useCreateEvaluation,
  useAdvanceCandidate, useRejectCandidate,
  getListCandidatesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, XCircle, Plus } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import StageBadge from "@/components/StageBadge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const eventDotColor: Record<string, string> = {
  proposed: "bg-blue-500", training_started: "bg-amber-500", training_complete: "bg-amber-400",
  evaluation_complete: "bg-purple-500", governance_passed: "bg-emerald-500",
  governance_failed: "bg-red-500", promoted: "bg-sky-500", deployed: "bg-sky-500", retired: "bg-muted-foreground",
};

type EvalForm = { capabilityScore: string; safetyScore: string; costScore: string; robustnessScore: string; latencyMs: string; notes: string };
type RejectForm = { reason: string };

export default function CandidateDetail() {
  const [, params] = useRoute("/candidates/:id");
  const [, setLocation] = useLocation();
  const id = params ? parseInt(params.id, 10) : 0;
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showEval, setShowEval] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const { data: candidate, isLoading } = useGetCandidate(id, {
    query: { enabled: !!id, queryKey: getGetCandidateQueryKey(id) },
  });
  const { data: evaluations } = useListEvaluations(
    { candidateId: id },
    { query: { enabled: !!id, queryKey: getListEvaluationsQueryKey({ candidateId: id }) } }
  );
  const { data: events } = useListLineageEvents({ candidateId: id, limit: 50 });

  const advance = useAdvanceCandidate({
    mutation: {
      onSuccess: (c) => {
        qc.invalidateQueries({ queryKey: getGetCandidateQueryKey(id) });
        qc.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        toast({ title: "Advanced", description: `${c.name} is now in ${c.stage}.` });
      },
    },
  });

  const reject = useRejectCandidate({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCandidateQueryKey(id) });
        qc.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        setShowReject(false);
        toast({ title: "Rejected by Governor", variant: "destructive" });
      },
    },
  });

  const createEval = useCreateEvaluation({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListEvaluationsQueryKey({ candidateId: id }) });
        setShowEval(false);
        evalForm.reset();
        toast({ title: "Evaluation recorded" });
      },
    },
  });

  const evalForm = useForm<EvalForm>({
    defaultValues: { capabilityScore: "", safetyScore: "", costScore: "", robustnessScore: "", latencyMs: "", notes: "" },
  });
  const rejectForm = useForm<RejectForm>({ defaultValues: { reason: "" } });

  const latestEval = evaluations?.[0];
  const radarData = latestEval ? [
    { metric: "Capability", value: latestEval.capabilityScore },
    { metric: "Safety", value: latestEval.safetyScore },
    { metric: "Cost", value: latestEval.costScore },
    { metric: "Robustness", value: latestEval.robustnessScore },
  ] : [];

  const canAdvance = candidate && !["deployed", "rejected", "approved"].includes(candidate.stage);
  const canReject = candidate && !["rejected", "deployed"].includes(candidate.stage);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Candidate not found.</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setLocation("/candidates")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/candidates")} className="mt-0.5 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold font-mono text-foreground">{candidate.name}</h1>
            <StageBadge stage={candidate.stage} />
            <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded">Gen {candidate.generation}</span>
          </div>
          {candidate.description && <p className="text-sm text-muted-foreground mt-1">{candidate.description}</p>}
        </div>
        <div className="flex gap-2">
          {canAdvance && (
            <Button size="sm" onClick={() => advance.mutate({ id })} disabled={advance.isPending} data-testid="button-detail-advance">
              <ArrowUp className="w-4 h-4 mr-1.5" /> Advance
            </Button>
          )}
          {canReject && (
            <Button variant="destructive" size="sm" onClick={() => setShowReject(true)} data-testid="button-detail-reject">
              <XCircle className="w-4 h-4 mr-1.5" /> Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Metadata */}
          <div className="bg-card border border-card-border rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blueprint</h2>
            <dl className="space-y-2">
              {[
                { label: "Architecture", value: candidate.architectureType },
                { label: "Datasets", value: candidate.datasets ?? "—" },
                { label: "Hyperparameters", value: candidate.hyperparameters ?? "—" },
                { label: "Parent ID", value: candidate.parentId ? `#${candidate.parentId}` : "—" },
                { label: "Created", value: formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true }) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-xs font-mono text-foreground mt-0.5 break-all">{value}</dd>
                </div>
              ))}
            </dl>
            {candidate.rejectionReason && (
              <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Rejection Reason</div>
                <p className="text-xs text-red-600 dark:text-red-300">{candidate.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Radar chart */}
          <div className="bg-card border border-card-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latest Evaluation</h2>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowEval(true)} data-testid="button-add-evaluation">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            {latestEval ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                      <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {radarData.map(d => (
                    <div key={d.metric} className="text-center">
                      <div className="text-sm font-semibold font-mono text-foreground">{d.value.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">{d.metric}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-center">
                  <div className="text-lg font-semibold font-mono text-primary">{latestEval.overallScore.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
                {latestEval.notes && <p className="text-xs text-muted-foreground mt-2 italic">{latestEval.notes}</p>}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">No evaluations yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: lineage */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Lineage History</h2>
          {(events ?? []).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-muted-foreground">No history recorded.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {(events ?? []).map((event) => (
                  <div key={event.id} className="flex gap-4 pl-6 relative" data-testid={`event-${event.id}`}>
                    <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${eventDotColor[event.eventType] ?? "bg-muted-foreground"} ring-2 ring-card`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-foreground leading-snug">{event.description}</p>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-muted-foreground/60">{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</div>
                          <div className="text-xs text-muted-foreground/40 font-mono">{format(new Date(event.createdAt), "HH:mm")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Eval dialog */}
      <Dialog open={showEval} onOpenChange={setShowEval}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Evaluation</DialogTitle></DialogHeader>
          <Form {...evalForm}>
            <form onSubmit={evalForm.handleSubmit((d) => createEval.mutate({
              data: {
                candidateId: id,
                capabilityScore: parseFloat(d.capabilityScore),
                safetyScore: parseFloat(d.safetyScore),
                costScore: parseFloat(d.costScore),
                robustnessScore: parseFloat(d.robustnessScore),
                latencyMs: d.latencyMs ? parseInt(d.latencyMs, 10) : undefined,
                notes: d.notes || undefined,
              }
            }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "capabilityScore" as const, label: "Capability (0–100)" },
                  { name: "safetyScore" as const, label: "Safety (0–100)" },
                  { name: "costScore" as const, label: "Cost (0–100)" },
                  { name: "robustnessScore" as const, label: "Robustness (0–100)" },
                ].map(({ name, label }) => (
                  <FormField key={name} control={evalForm.control} name={name} rules={{ required: "Required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl><Input type="number" min="0" max="100" {...field} data-testid={`input-eval-${name}`} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormField control={evalForm.control} name="latencyMs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latency (ms, optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 340" {...field} data-testid="input-eval-latency" /></FormControl>
                  </FormItem>
                )}
              />
              <FormField control={evalForm.control} name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea rows={2} placeholder="Any observations..." {...field} data-testid="input-eval-notes" /></FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEval(false)}>Cancel</Button>
                <Button type="submit" disabled={createEval.isPending} data-testid="button-submit-evaluation">
                  {createEval.isPending ? "Saving..." : "Record"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject by Governor</DialogTitle></DialogHeader>
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit((d) => reject.mutate({ id, data: d }))} className="space-y-4">
              <FormField control={rejectForm.control} name="reason" rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea placeholder="State the violation or failure..." rows={3} {...field} data-testid="input-detail-rejection-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
                <Button type="submit" variant="destructive" disabled={reject.isPending} data-testid="button-confirm-detail-reject">
                  {reject.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
