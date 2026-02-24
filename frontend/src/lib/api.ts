import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const session = await getSession();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
    };

    if (session?.user) {
        headers['X-User-Id'] = session.user.id;
        headers['X-User-Role'] = session.user.role;
    }

    const res = await fetch(`${API_BASE}/api${path}`, {
        ...options,
        headers,
    });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
}

// ── Metrics ──
export interface KpiDefinition {
    kpi_id: string;
    name: string;
    description: string;
    owner: string;
    business_question: string;
    formula_business: string;
    unit: string;
    grain: string;
    dimensions: string[];
    refresh_sla: string;
    source_tables: string[];
    thresholds: { green: number; yellow: number; red: number };
    is_active: boolean;
}

export interface MetricQueryParams {
    kpiId: string;
    timeRange?: { start: string; end: string };
    filters?: Record<string, string | string[]>;
    limit?: number;
}

export interface MetricQueryResult {
    series: any[];
    summary: { count: number; avg?: number; min?: number; max?: number };
}

export const api = {
    // Metrics
    getMetricsCatalog: () => fetchApi<KpiDefinition[]>('/metrics'),
    getMetric: (kpiId: string) => fetchApi<KpiDefinition>(`/metrics/${kpiId}`),
    queryMetric: (params: MetricQueryParams) =>
        fetchApi<MetricQueryResult>('/metrics/query', {
            method: 'POST',
            body: JSON.stringify(params),
        }),

    // Dimensions
    getDimensionNames: () => fetchApi<string[]>('/dimensions'),
    getDimensionMembers: (dim: string, search?: string) =>
        fetchApi<any[]>(`/dimensions/${dim}${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    // Health
    ping: () => fetchApi<{ status: string; timestamp: string }>('/health'),
    getFreshness: () =>
        fetchApi<Array<{
            table_name: string;
            last_load: string;
            row_count: number;
            sla_status: 'GREEN' | 'YELLOW' | 'RED';
            hours_since_load: number;
        }>>('/health/freshness'),
    getQualityChecks: () => fetchApi<any[]>('/health/quality'),

    getAuditLogs: (limit?: number) => fetchApi<any[]>(`/audit${limit ? `?limit=${limit}` : ''}`),
    logAudit: (data: { action: string; resource: string; details?: any }) =>
        fetchApi<void>('/audit', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
