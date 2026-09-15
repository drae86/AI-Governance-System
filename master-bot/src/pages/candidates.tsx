import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListCandidates, useCreateCandidate, useAdvanceCandidate,
  useRejectCandidate, useDeleteCandidate, getListCandidatesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronRight, ArrowUp, XCircle, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import StageBadge from "@/components/StageBadge";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const STAGES = ["all", "proposed", "training", "evaluating", "governing", "approved", "rejected", "deployed"] as const;
const ARCH_TYPES = ["Transformer", "Mixture-of-Experts", "Constitutional Transformer", "RLHF Transformer", "Distilled Transformer", "Multi-Modal Transformer", "Agentic Transformer", "Code Transformer"];

type CreateForm = { name: string; description: string; architectureType: string; datasets: string; hyperparameters: string };
type RejectForm = { reason: string };

export default function Candidates() {
  const [, setLocation] = useLocation();
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: candidates, isLoading } = useListCandidates(
    stageFilter !== "all" ? { status: stageFilter as "proposed" | "training" | "evaluating" | "governing" | "approved" | "rejected" | "deployed" } : {}
  );

  const createCandidate = useCreateCandidate({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        setShowCreate(false);
        createForm.reset();
        toast({ title: "Candidate proposed", description: "The Architect has submitted a new blueprint." });
      },
    },
  });

  const advanceCandidate = useAdvanceCandidate({
    mutation: {
      onSuccess: (candidate) => {
        qc.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        toast({ title: "Stage advanced", description: `${candidate.name} moved to ${candidate.stage}.` });
      },
    },
  });

  const rejectMutation = useRejectCandidate({
    mutation: {
      onSuccess: (candidate) => {
        qc.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        setRejectId(null);
        rejectForm.reset();
        toast({ title: "Candidate rejected", description: `Governor blocked ${candidate.name}.`, variant: "destructive" });
      },
    },
  });

  const deleteMutation = useDeleteCandidate({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        toast({ title: "Candidate deleted" });
      },
    },
  });

  const createForm = useForm<CreateForm>({
    defaultValues: { name: "", description: "", architectureType: "", datasets: "", hyperparameters: "" },
  });

  const rejectForm = useForm<RejectForm>({ defaultValues: { reason: "" } });

  const filtered = (candidates ?? []).filter(c =>
    search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.architectureType.toLowerCase().includes(search.toLowerCase())
  );

  const canAdvance = (stage: string) => !["deployed", "rejected", "approved"].includes(stage);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All AI model candidates in the pipeline</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" data-testid="button-create-candidate">
          <Plus className="w-4 h-4 mr-1.5" /> Propose Candidate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-candidates"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STAGES.map(s => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              data-testid={`filter-stage-${s}`}
              className={`px-3 py-1 rounded text-xs font-medium capitalize border transition-colors ${
                stageFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-card-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading candidates...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No candidates found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Architecture</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Gen</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/candidates/${c.id}`)}
                  data-testid={`row-candidate-${c.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground font-mono">{c.name}</div>
                    {c.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{c.architectureType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={c.stage} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">G{c.generation}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {canAdvance(c.stage) && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => advanceCandidate.mutate({ id: c.id })}
                          data-testid={`button-advance-${c.id}`}
                        >
                          <ArrowUp className="w-3 h-3 mr-1" /> Advance
                        </Button>
                      )}
                      {c.stage !== "rejected" && c.stage !== "deployed" && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setRejectId(c.id)}
                          data-testid={`button-reject-${c.id}`}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate({ id: c.id })}
                        data-testid={`button-delete-${c.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose New Candidate</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((d) => createCandidate.mutate({ data: d }))} className="space-y-4">
              <FormField control={createForm.control} name="name" rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Cygnus-3" {...field} data-testid="input-candidate-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={createForm.control} name="architectureType" rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Architecture Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-architecture-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ARCH_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={createForm.control} name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="What does this candidate aim to improve?" rows={2} {...field} data-testid="input-candidate-description" /></FormControl>
                  </FormItem>
                )}
              />
              <FormField control={createForm.control} name="datasets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datasets</FormLabel>
                    <FormControl><Input placeholder="e.g. CommonCrawl, BooksCorpus" {...field} data-testid="input-candidate-datasets" /></FormControl>
                  </FormItem>
                )}
              />
              <FormField control={createForm.control} name="hyperparameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hyperparameters</FormLabel>
                    <FormControl><Input placeholder="e.g. layers=32, lr=3e-4" {...field} data-testid="input-candidate-hyperparameters" /></FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={createCandidate.isPending} data-testid="button-submit-candidate">
                  {createCandidate.isPending ? "Proposing..." : "Propose"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectId !== null} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
          </DialogHeader>
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit((d) => rejectMutation.mutate({ id: rejectId!, data: d }))} className="space-y-4">
              <FormField control={rejectForm.control} name="reason" rules={{ required: "Reason required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea placeholder="State the governance violation or failure..." rows={3} {...field} data-testid="input-rejection-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
                <Button type="submit" variant="destructive" disabled={rejectMutation.isPending} data-testid="button-confirm-reject">
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
