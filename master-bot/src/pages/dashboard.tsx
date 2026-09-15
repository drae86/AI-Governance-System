import { useGetDashboardStats, useGetRecentActivity, useGetPipelineFlow } from "@workspace/api-client-react";
import { ArrowRight, Shield, Cpu, CheckCircle2, XCircle, Rocket, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const STAGE_ORDER = ["proposed", "training", "evaluating", "governing", "approved", "deployed", "rejected"] as const;
const STAGE_COLORS: Record<string, string> = {
  proposed:   "#3b82f6",
  training:   "#f59e0b",
  evaluating: "#a855f7",
  governing:  "#f97316",
  approved:   "#10b981",
  deployed:   "#0ea5e9",
  rejected:   "#ef4444",
};
const STAGE_LABELS: Record<string, string> = {
  proposed: "Proposed", training: "Training", evaluating: "Evaluating",
  governing: "Governing", approved: "Approved", deployed: "Deployed", rejected: "Rejected",
};

const eventIcons: Record<string, React.ReactNode> = {
  proposed:            <div className="w-2 h-2 rounded-full bg-blue-500" />,
  training_started:    <div className="w-2 h-2 rounded-full bg-amber-500" />,
  training_complete:   <div className="w-2 h-2 rounded-full bg-amber-400" />,
  evaluation_complete: <div className="w-2 h-2 rounded-full bg-purple-500" />,
  governance_passed:   <div className="w-2 h-2 rounded-full bg-emerald-500" />,
  governance_failed:   <div className="w-2 h-2 rounded-full bg-red-500" />,
  promoted:            <div className="w-2 h-2 rounded-full bg-sky-500" />,
  deployed:            <div className="w-2 h-2 rounded-full bg-sky-500" />,
  retired:             <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />,
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 15 });
  const { data: flow, isLoading: flowLoading } = useGetPipelineFlow();

  const flowData = STAGE_ORDER.map(stage => ({
    stage,
    label: STAGE_LABELS[stage],
    count: (flow as Record<string, number> | undefined)?.[stage] ?? 0,
    color: STAGE_COLORS[stage],
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Control Room</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live overview of the master-bot pipeline</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: statsLoading ? "—" : stats?.totalCandidates ?? 0, icon: Cpu, color: "text-primary" },
          { label: "Deployed", value: statsLoading ? "—" : stats?.deployedCandidates ?? 0, icon: Rocket, color: "text-sky-500" },
          { label: "Rejected", value: statsLoading ? "—" : stats?.rejectedCandidates ?? 0, icon: XCircle, color: "text-red-500" },
          { label: "Active Pipeline", value: statsLoading ? "—" : stats?.activePipeline ?? 0, icon: TrendingUp, color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-card-border rounded-lg p-4" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div className="text-2xl font-semibold text-foreground font-mono">{value}</div>
          </div>
        ))}
      </div>

      {/* Score row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Safety Score", value: statsLoading ? "—" : `${stats?.averageSafetyScore?.toFixed(1) ?? "—"}`, icon: Shield, color: "text-emerald-500" },
          { label: "Avg Capability", value: statsLoading ? "—" : `${stats?.averageCapabilityScore?.toFixed(1) ?? "—"}`, icon: CheckCircle2, color: "text-primary" },
          { label: "Generations", value: statsLoading ? "—" : stats?.totalGenerations ?? 0, icon: ArrowRight, color: "text-purple-500" },
          { label: "Rules Enforced", value: statsLoading ? "—" : stats?.rulesEnforced ?? 0, icon: Shield, color: "text-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-card-border rounded-lg p-4" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div className="text-2xl font-semibold text-foreground font-mono">{value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline flow + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pipeline flow chart */}
        <div className="lg:col-span-3 bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-foreground">Pipeline Stage Distribution</h2>
          </div>

          {/* Funnel visual */}
          <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
            {flowData.filter(d => d.stage !== "rejected").map((d, i) => (
              <div key={d.stage} className="flex items-center gap-1 flex-shrink-0">
                <div className="text-center">
                  <div
                    className="w-16 flex flex-col items-center justify-center rounded py-2 text-white font-mono text-lg font-semibold transition-all"
                    style={{ backgroundColor: d.color, minHeight: 56, opacity: flowLoading ? 0.4 : 1 }}
                    data-testid={`flow-stage-${d.stage}`}
                  >
                    {d.count}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono leading-tight">{d.label}</div>
                </div>
                {i < flowData.filter(d => d.stage !== "rejected").length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-[-18px]" />
                )}
              </div>
            ))}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-px h-8 bg-border mx-1 mt-[-18px]" />
              <div className="text-center">
                <div
                  className="w-16 flex flex-col items-center justify-center rounded py-2 text-white font-mono text-lg font-semibold"
                  style={{ backgroundColor: STAGE_COLORS.rejected, minHeight: 56, opacity: flowLoading ? 0.4 : 1 }}
                  data-testid="flow-stage-rejected"
                >
                  {flowData.find(d => d.stage === "rejected")?.count ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">Rejected</div>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-40">
            {flowLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {flowData.map((d) => (
                      <Cell key={d.stage} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3 overflow-y-auto max-h-80" data-testid="activity-feed">
            {activityLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-muted mt-1.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : activity?.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">No activity yet</div>
            ) : (
              activity?.map((item) => (
                <div key={item.id} className="flex gap-3" data-testid={`activity-item-${item.id}`}>
                  <div className="mt-1.5 flex-shrink-0">
                    {eventIcons[item.eventType] ?? <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
