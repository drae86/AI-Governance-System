import { useState } from "react";
import {
  useListGovernanceRules, useCreateGovernanceRule, useDeleteGovernanceRule,
  getListGovernanceRulesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ShieldAlert, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { SeverityBadge } from "@/components/StageBadge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["safety", "capability", "cost", "ethics", "replication", "privilege"] as const;
const SEVERITIES = ["critical", "high", "medium", "low"] as const;

const categoryIcons: Record<string, React.ReactNode> = {
  safety:      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />,
  ethics:      <Shield className="w-3.5 h-3.5 text-purple-500" />,
  replication: <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />,
  privilege:   <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />,
  cost:        <Shield className="w-3.5 h-3.5 text-blue-500" />,
  capability:  <Shield className="w-3.5 h-3.5 text-emerald-500" />,
};

type CreateForm = { name: string; category: string; description: string; severity: string };

export default function Governance() {
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: rules, isLoading } = useListGovernanceRules();

  const createRule = useCreateGovernanceRule({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListGovernanceRulesQueryKey() });
        setShowCreate(false);
        form.reset();
        toast({ title: "Rule added to Constitution" });
      },
    },
  });

  const deleteRule = useDeleteGovernanceRule({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListGovernanceRulesQueryKey() });
        toast({ title: "Rule removed" });
      },
    },
  });

  const form = useForm<CreateForm>({
    defaultValues: { name: "", category: "safety", description: "", severity: "high" },
  });

  const grouped = (rules ?? []).reduce<Record<string, typeof rules>>((acc, rule) => {
    if (!acc[rule!.category]) acc[rule!.category] = [];
    acc[rule!.category]!.push(rule);
    return acc;
  }, {});

  const filteredRules = categoryFilter === "all" ? (rules ?? []) : (grouped[categoryFilter] ?? []);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Constitution & Rules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Hard constraints enforced by the Governor on every candidate</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" data-testid="button-add-rule">
          <Plus className="w-4 h-4 mr-1.5" /> Add Rule
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 text-sm">
        {CATEGORIES.map(cat => (
          <div key={cat} className="text-center">
            <div className="text-lg font-semibold font-mono text-foreground">{grouped[cat]?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground capitalize">{cat}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            data-testid={`filter-category-${cat}`}
            className={`px-3 py-1 rounded text-xs font-medium capitalize border transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-lg p-4 animate-pulse h-20" />
          ))
        ) : filteredRules.length === 0 ? (
          <div className="bg-card border border-card-border rounded-lg p-10 text-center">
            <p className="text-sm text-muted-foreground">No rules in this category.</p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div key={rule!.id} className="bg-card border border-card-border rounded-lg p-4 flex items-start gap-4" data-testid={`rule-${rule!.id}`}>
              <div className="mt-0.5 flex-shrink-0">{categoryIcons[rule!.category]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">{rule!.name}</span>
                  <SeverityBadge severity={rule!.severity} />
                  <span className="text-xs text-muted-foreground capitalize border border-border px-1.5 py-0.5 rounded">{rule!.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rule!.description}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">{formatDistanceToNow(new Date(rule!.createdAt), { addSuffix: true })}</p>
              </div>
              <Button
                variant="ghost" size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => deleteRule.mutate({ id: rule!.id })}
                data-testid={`button-delete-rule-${rule!.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Governance Rule</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => createRule.mutate({ data: d }))} className="space-y-4">
              <FormField control={form.control} name="name" rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name</FormLabel>
                    <FormControl><Input placeholder="e.g. No external API access" {...field} data-testid="input-rule-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rule-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rule-severity">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEVERITIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={form.control} name="description" rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this rule enforces..." rows={3} {...field} data-testid="input-rule-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={createRule.isPending} data-testid="button-submit-rule">
                  {createRule.isPending ? "Adding..." : "Add Rule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
