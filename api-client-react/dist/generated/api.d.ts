import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityItem, Candidate, CandidateInput, CandidateUpdate, DashboardStats, Evaluation, EvaluationInput, GetRecentActivityParams, GovernanceRule, GovernanceRuleInput, HealthStatus, LineageEvent, ListCandidatesParams, ListEvaluationsParams, ListLineageEventsParams, PipelineFlow, RejectionInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCandidatesUrl: (params?: ListCandidatesParams) => string;
/**
 * @summary List all AI candidates
 */
export declare const listCandidates: (params?: ListCandidatesParams, options?: RequestInit) => Promise<Candidate[]>;
export declare const getListCandidatesQueryKey: (params?: ListCandidatesParams) => readonly ["/api/candidates", ...ListCandidatesParams[]];
export declare const getListCandidatesQueryOptions: <TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<unknown>>(params?: ListCandidatesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCandidatesQueryResult = NonNullable<Awaited<ReturnType<typeof listCandidates>>>;
export type ListCandidatesQueryError = ErrorType<unknown>;
/**
 * @summary List all AI candidates
 */
export declare function useListCandidates<TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<unknown>>(params?: ListCandidatesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCandidateUrl: () => string;
/**
 * @summary Create a new AI candidate (Architect proposes)
 */
export declare const createCandidate: (candidateInput: CandidateInput, options?: RequestInit) => Promise<Candidate>;
export declare const getCreateCandidateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCandidate>>, TError, {
        data: BodyType<CandidateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCandidate>>, TError, {
    data: BodyType<CandidateInput>;
}, TContext>;
export type CreateCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof createCandidate>>>;
export type CreateCandidateMutationBody = BodyType<CandidateInput>;
export type CreateCandidateMutationError = ErrorType<unknown>;
/**
* @summary Create a new AI candidate (Architect proposes)
*/
export declare const useCreateCandidate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCandidate>>, TError, {
        data: BodyType<CandidateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCandidate>>, TError, {
    data: BodyType<CandidateInput>;
}, TContext>;
export declare const getGetCandidateUrl: (id: number) => string;
/**
 * @summary Get a candidate by ID
 */
export declare const getCandidate: (id: number, options?: RequestInit) => Promise<Candidate>;
export declare const getGetCandidateQueryKey: (id: number) => readonly [`/api/candidates/${number}`];
export declare const getGetCandidateQueryOptions: <TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCandidateQueryResult = NonNullable<Awaited<ReturnType<typeof getCandidate>>>;
export type GetCandidateQueryError = ErrorType<void>;
/**
 * @summary Get a candidate by ID
 */
export declare function useGetCandidate<TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCandidateUrl: (id: number) => string;
/**
 * @summary Update candidate status or metadata
 */
export declare const updateCandidate: (id: number, candidateUpdate: CandidateUpdate, options?: RequestInit) => Promise<Candidate>;
export declare const getUpdateCandidateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCandidate>>, TError, {
        id: number;
        data: BodyType<CandidateUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCandidate>>, TError, {
    id: number;
    data: BodyType<CandidateUpdate>;
}, TContext>;
export type UpdateCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof updateCandidate>>>;
export type UpdateCandidateMutationBody = BodyType<CandidateUpdate>;
export type UpdateCandidateMutationError = ErrorType<unknown>;
/**
* @summary Update candidate status or metadata
*/
export declare const useUpdateCandidate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCandidate>>, TError, {
        id: number;
        data: BodyType<CandidateUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCandidate>>, TError, {
    id: number;
    data: BodyType<CandidateUpdate>;
}, TContext>;
export declare const getDeleteCandidateUrl: (id: number) => string;
/**
 * @summary Delete a candidate
 */
export declare const deleteCandidate: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCandidateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
    id: number;
}, TContext>;
export type DeleteCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCandidate>>>;
export type DeleteCandidateMutationError = ErrorType<unknown>;
/**
* @summary Delete a candidate
*/
export declare const useDeleteCandidate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
    id: number;
}, TContext>;
export declare const getAdvanceCandidateUrl: (id: number) => string;
/**
 * @summary Advance candidate to the next pipeline stage
 */
export declare const advanceCandidate: (id: number, options?: RequestInit) => Promise<Candidate>;
export declare const getAdvanceCandidateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof advanceCandidate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof advanceCandidate>>, TError, {
    id: number;
}, TContext>;
export type AdvanceCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof advanceCandidate>>>;
export type AdvanceCandidateMutationError = ErrorType<unknown>;
/**
* @summary Advance candidate to the next pipeline stage
*/
export declare const useAdvanceCandidate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof advanceCandidate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof advanceCandidate>>, TError, {
    id: number;
}, TContext>;
export declare const getRejectCandidateUrl: (id: number) => string;
/**
 * @summary Reject a candidate (Governor blocks it)
 */
export declare const rejectCandidate: (id: number, rejectionInput: RejectionInput, options?: RequestInit) => Promise<Candidate>;
export declare const getRejectCandidateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectCandidate>>, TError, {
        id: number;
        data: BodyType<RejectionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rejectCandidate>>, TError, {
    id: number;
    data: BodyType<RejectionInput>;
}, TContext>;
export type RejectCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof rejectCandidate>>>;
export type RejectCandidateMutationBody = BodyType<RejectionInput>;
export type RejectCandidateMutationError = ErrorType<unknown>;
/**
* @summary Reject a candidate (Governor blocks it)
*/
export declare const useRejectCandidate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectCandidate>>, TError, {
        id: number;
        data: BodyType<RejectionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rejectCandidate>>, TError, {
    id: number;
    data: BodyType<RejectionInput>;
}, TContext>;
export declare const getListEvaluationsUrl: (params?: ListEvaluationsParams) => string;
/**
 * @summary List evaluation results
 */
export declare const listEvaluations: (params?: ListEvaluationsParams, options?: RequestInit) => Promise<Evaluation[]>;
export declare const getListEvaluationsQueryKey: (params?: ListEvaluationsParams) => readonly ["/api/evaluations", ...ListEvaluationsParams[]];
export declare const getListEvaluationsQueryOptions: <TData = Awaited<ReturnType<typeof listEvaluations>>, TError = ErrorType<unknown>>(params?: ListEvaluationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEvaluations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEvaluations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEvaluationsQueryResult = NonNullable<Awaited<ReturnType<typeof listEvaluations>>>;
export type ListEvaluationsQueryError = ErrorType<unknown>;
/**
 * @summary List evaluation results
 */
export declare function useListEvaluations<TData = Awaited<ReturnType<typeof listEvaluations>>, TError = ErrorType<unknown>>(params?: ListEvaluationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEvaluations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEvaluationUrl: () => string;
/**
 * @summary Submit evaluation results for a candidate
 */
export declare const createEvaluation: (evaluationInput: EvaluationInput, options?: RequestInit) => Promise<Evaluation>;
export declare const getCreateEvaluationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvaluation>>, TError, {
        data: BodyType<EvaluationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEvaluation>>, TError, {
    data: BodyType<EvaluationInput>;
}, TContext>;
export type CreateEvaluationMutationResult = NonNullable<Awaited<ReturnType<typeof createEvaluation>>>;
export type CreateEvaluationMutationBody = BodyType<EvaluationInput>;
export type CreateEvaluationMutationError = ErrorType<unknown>;
/**
* @summary Submit evaluation results for a candidate
*/
export declare const useCreateEvaluation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvaluation>>, TError, {
        data: BodyType<EvaluationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEvaluation>>, TError, {
    data: BodyType<EvaluationInput>;
}, TContext>;
export declare const getListGovernanceRulesUrl: () => string;
/**
 * @summary List all governance rules (Constitution)
 */
export declare const listGovernanceRules: (options?: RequestInit) => Promise<GovernanceRule[]>;
export declare const getListGovernanceRulesQueryKey: () => readonly ["/api/governance/rules"];
export declare const getListGovernanceRulesQueryOptions: <TData = Awaited<ReturnType<typeof listGovernanceRules>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGovernanceRules>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGovernanceRules>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGovernanceRulesQueryResult = NonNullable<Awaited<ReturnType<typeof listGovernanceRules>>>;
export type ListGovernanceRulesQueryError = ErrorType<unknown>;
/**
 * @summary List all governance rules (Constitution)
 */
export declare function useListGovernanceRules<TData = Awaited<ReturnType<typeof listGovernanceRules>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGovernanceRules>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateGovernanceRuleUrl: () => string;
/**
 * @summary Create a governance rule
 */
export declare const createGovernanceRule: (governanceRuleInput: GovernanceRuleInput, options?: RequestInit) => Promise<GovernanceRule>;
export declare const getCreateGovernanceRuleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGovernanceRule>>, TError, {
        data: BodyType<GovernanceRuleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGovernanceRule>>, TError, {
    data: BodyType<GovernanceRuleInput>;
}, TContext>;
export type CreateGovernanceRuleMutationResult = NonNullable<Awaited<ReturnType<typeof createGovernanceRule>>>;
export type CreateGovernanceRuleMutationBody = BodyType<GovernanceRuleInput>;
export type CreateGovernanceRuleMutationError = ErrorType<unknown>;
/**
* @summary Create a governance rule
*/
export declare const useCreateGovernanceRule: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGovernanceRule>>, TError, {
        data: BodyType<GovernanceRuleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGovernanceRule>>, TError, {
    data: BodyType<GovernanceRuleInput>;
}, TContext>;
export declare const getDeleteGovernanceRuleUrl: (id: number) => string;
/**
 * @summary Delete a governance rule
 */
export declare const deleteGovernanceRule: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteGovernanceRuleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGovernanceRule>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteGovernanceRule>>, TError, {
    id: number;
}, TContext>;
export type DeleteGovernanceRuleMutationResult = NonNullable<Awaited<ReturnType<typeof deleteGovernanceRule>>>;
export type DeleteGovernanceRuleMutationError = ErrorType<unknown>;
/**
* @summary Delete a governance rule
*/
export declare const useDeleteGovernanceRule: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGovernanceRule>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteGovernanceRule>>, TError, {
    id: number;
}, TContext>;
export declare const getListLineageEventsUrl: (params?: ListLineageEventsParams) => string;
/**
 * @summary List all lineage/history events
 */
export declare const listLineageEvents: (params?: ListLineageEventsParams, options?: RequestInit) => Promise<LineageEvent[]>;
export declare const getListLineageEventsQueryKey: (params?: ListLineageEventsParams) => readonly ["/api/lineage", ...ListLineageEventsParams[]];
export declare const getListLineageEventsQueryOptions: <TData = Awaited<ReturnType<typeof listLineageEvents>>, TError = ErrorType<unknown>>(params?: ListLineageEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLineageEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLineageEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLineageEventsQueryResult = NonNullable<Awaited<ReturnType<typeof listLineageEvents>>>;
export type ListLineageEventsQueryError = ErrorType<unknown>;
/**
 * @summary List all lineage/history events
 */
export declare function useListLineageEvents<TData = Awaited<ReturnType<typeof listLineageEvents>>, TError = ErrorType<unknown>>(params?: ListLineageEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLineageEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardStatsUrl: () => string;
/**
 * @summary Get overall pipeline statistics
 */
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get overall pipeline statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRecentActivityUrl: (params?: GetRecentActivityParams) => string;
/**
 * @summary Get recent pipeline activity feed
 */
export declare const getRecentActivity: (params?: GetRecentActivityParams, options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetRecentActivityQueryKey: (params?: GetRecentActivityParams) => readonly ["/api/dashboard/activity", ...GetRecentActivityParams[]];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(params?: GetRecentActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent pipeline activity feed
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(params?: GetRecentActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPipelineFlowUrl: () => string;
/**
 * @summary Get live count of candidates at each pipeline stage
 */
export declare const getPipelineFlow: (options?: RequestInit) => Promise<PipelineFlow>;
export declare const getGetPipelineFlowQueryKey: () => readonly ["/api/dashboard/pipeline-flow"];
export declare const getGetPipelineFlowQueryOptions: <TData = Awaited<ReturnType<typeof getPipelineFlow>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPipelineFlow>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPipelineFlow>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPipelineFlowQueryResult = NonNullable<Awaited<ReturnType<typeof getPipelineFlow>>>;
export type GetPipelineFlowQueryError = ErrorType<unknown>;
/**
 * @summary Get live count of candidates at each pipeline stage
 */
export declare function useGetPipelineFlow<TData = Awaited<ReturnType<typeof getPipelineFlow>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPipelineFlow>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map