/**
 * Inline API client — no @workspace/* dependencies.
 * All hooks use TanStack Query + native fetch against /api/*.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadStatus =
  | "nouveau"
  | "contacte"
  | "qualifie"
  | "proposition"
  | "gagne"
  | "perdu";

export type Lead = {
  id: string;
  nom: string;
  entreprise?: string | null;
  courriel: string;
  telephone: string;
  service: string;
  message?: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadInput = {
  nom: string;
  entreprise?: string;
  courriel: string;
  telephone: string;
  service: string;
  message?: string;
};

export type VisitStats = {
  last24h: {
    count: number;
    avgDurationSeconds: number;
    converted: number;
    conversionRate: number;
  };
  last7d: {
    count: number;
    avgDurationSeconds: number;
    converted: number;
    conversionRate: number;
  };
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const LEADS_KEY = ["leads"] as const;
export const VISIT_STATS_KEY = ["visit-stats"] as const;

export function getListLeadsQueryKey() {
  return LEADS_KEY;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { headers?: Record<string, string> }
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Public hooks ─────────────────────────────────────────────────────────────

/** Submit the lead form (step 6). */
export function useCreateLead() {
  return useMutation({
    mutationFn: (input: CreateLeadInput) =>
      apiFetch<Lead>("/leads", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

/** Track a new page visit session. */
export function useCreateVisit() {
  return useMutation({
    mutationFn: (input: { sessionId: string }) =>
      apiFetch<unknown>("/visits", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

/** Heartbeat — update duration / mark converted. */
export function useUpdateVisit() {
  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: { durationSeconds?: number; converted?: boolean };
    }) =>
      apiFetch<unknown>(`/visits/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

type AdminOpts = {
  request: { headers: { "X-Admin-Password": string } };
};

/** Fetch all leads (admin only). */
export function useListLeads(
  opts: AdminOpts & { query?: Partial<UseQueryOptions<Lead[]>> }
) {
  const password = opts.request.headers["X-Admin-Password"];
  return useQuery<Lead[]>({
    queryKey: [...LEADS_KEY, password],
    queryFn: () =>
      apiFetch<Lead[]>("/leads", {
        headers: { "X-Admin-Password": password },
      }),
    enabled: true,
    ...opts.query,
  });
}

/** Update a lead's status (admin only). */
export function useUpdateLead(
  opts: AdminOpts & { mutation?: { onSuccess?: () => void; onError?: () => void } }
) {
  const queryClient = useQueryClient();
  const password = opts.request.headers["X-Admin-Password"];
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: LeadStatus };
    }) =>
      apiFetch<Lead>(`/leads/${id}`, {
        method: "PATCH",
        headers: { "X-Admin-Password": password },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      opts.mutation?.onSuccess?.();
    },
    onError: () => opts.mutation?.onError?.(),
  });
}

/** Delete a lead (admin only). */
export function useDeleteLead(
  opts: AdminOpts & { mutation?: { onSuccess?: () => void; onError?: () => void } }
) {
  const queryClient = useQueryClient();
  const password = opts.request.headers["X-Admin-Password"];
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch<undefined>(`/leads/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Password": password },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      opts.mutation?.onSuccess?.();
    },
    onError: () => opts.mutation?.onError?.(),
  });
}

/** Visit stats for the admin dashboard. */
export function useGetVisitStats(opts: AdminOpts) {
  const password = opts.request.headers["X-Admin-Password"];
  return useQuery<VisitStats>({
    queryKey: [...VISIT_STATS_KEY, password],
    queryFn: () =>
      apiFetch<VisitStats>("/visits/stats", {
        headers: { "X-Admin-Password": password },
      }),
  });
}
