'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { exportToCsv } from '@/lib/export';

export default function DataQualityPage() {
    const { data: freshness, isLoading: loadingFresh } = useQuery({
        queryKey: ['freshness'],
        queryFn: api.getFreshness,
        retry: false,
    });

    const { data: qualityChecks, isLoading: loadingQuality } = useQuery({
        queryKey: ['qualityChecks'],
        queryFn: api.getQualityChecks,
        retry: false,
    });

    // Fallback demo data
    const freshnessData = freshness || [
        { table_name: 'fact_orders', last_load: '2025-12-15T06:00:00Z', row_count: 52400, sla_status: 'GREEN' as const, hours_since_load: 2.3 },
        { table_name: 'fact_shipments', last_load: '2025-12-15T06:00:00Z', row_count: 36200, sla_status: 'GREEN' as const, hours_since_load: 2.3 },
        { table_name: 'fact_inventory_snapshot', last_load: '2025-12-15T05:30:00Z', row_count: 83200, sla_status: 'GREEN' as const, hours_since_load: 2.8 },
        { table_name: 'fact_production', last_load: '2025-12-14T06:00:00Z', row_count: 28600, sla_status: 'YELLOW' as const, hours_since_load: 26.3 },
        { table_name: 'fact_purchase_orders', last_load: '2025-12-15T06:00:00Z', row_count: 18900, sla_status: 'GREEN' as const, hours_since_load: 2.3 },
        { table_name: 'fact_forecast', last_load: '2025-12-12T06:00:00Z', row_count: 15600, sla_status: 'RED' as const, hours_since_load: 74.3 },
    ];

    const completenessChecks = [
        { check: 'Orders: null customer_id', table: 'fact_orders', status: 'PASS', value: '0.0%', threshold: '< 1%' },
        { check: 'Orders: null product_id', table: 'fact_orders', status: 'PASS', value: '0.0%', threshold: '< 1%' },
        { check: 'Shipments: null carrier_id', table: 'fact_shipments', status: 'WARN', value: '2.3%', threshold: '< 1%' },
        { check: 'Inventory: negative on_hand', table: 'fact_inventory_snapshot', status: 'PASS', value: '0 rows', threshold: '0' },
        { check: 'Production: schedule_adherence > 1', table: 'fact_production', status: 'WARN', value: '1.2%', threshold: '< 0.5%' },
        { check: 'Forecast: null actual_qty', table: 'fact_forecast', status: 'PASS', value: '5.1%', threshold: '< 10%' },
    ];

    const reconciliationChecks = [
        { check: 'Orders shipped_qty ≤ ordered_qty', status: 'PASS', delta: '0 violations' },
        { check: 'Shipment counts vs Order shipped count', status: 'PASS', delta: '±0.8%' },
        { check: 'Inventory snapshot daily continuity', status: 'WARN', delta: '2 gaps found' },
        { check: 'PO received_qty ≤ ordered_qty', status: 'PASS', delta: '0 violations' },
    ];

    const actualCompleteness = qualityChecks ? qualityChecks.filter((q: any) => q.check_type === 'COMPLETENESS') : completenessChecks;
    const actualReconciliation = qualityChecks ? qualityChecks.filter((q: any) => q.check_type === 'RECONCILIATION') : reconciliationChecks;

    const handleExportReport = () => {
        const reportData = [
            ...freshnessData.map((f: any) => ({ category: 'Freshness', check: f.table_name, status: f.sla_status, detail: `${f.hours_since_load.toFixed(1)}h ago` })),
            ...actualCompleteness.map((c: any) => ({ category: 'Completeness', check: c.check_name || c.check, status: c.status, detail: c.metric_value || c.value })),
            ...actualReconciliation.map((r: any) => ({ category: 'Reconciliation', check: r.check_name || r.check, status: r.status, detail: r.details?.fail_count ? `${r.details.fail_count} violations` : r.delta }))
        ];
        exportToCsv('data_quality_report', reportData, [
            { key: 'category', label: 'Category' },
            { key: 'check', label: 'Check Description' },
            { key: 'status', label: 'Status' },
            { key: 'detail', label: 'Details' }
        ]);
    };

    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>Data Quality & Lineage</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        Freshness SLA, completeness checks, and reconciliation
                    </p>
                </div>
                <div className="filters">
                    <button className="btn btn-secondary" onClick={handleExportReport}>
                        ⬇ Export Report
                    </button>
                </div>
            </div>

            {/* Freshness */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>📡 Data Freshness</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Table</th><th>Last Load</th><th>Row Count</th><th>Hours Since Load</th><th>SLA Status</th></tr>
                    </thead>
                    <tbody>
                        {freshnessData.map((f) => (
                            <tr key={f.table_name}>
                                <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{f.table_name}</td>
                                <td>{new Date(f.last_load).toLocaleString()}</td>
                                <td>{f.row_count.toLocaleString()}</td>
                                <td>{f.hours_since_load.toFixed(1)}h</td>
                                <td><span className={`badge badge-${f.sla_status.toLowerCase()}`}>{f.sla_status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Completeness */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>✅ Completeness Checks</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Check</th><th>Target Table</th><th>Result</th><th>Threshold</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {actualCompleteness.map((c: any, i: number) => (
                            <tr key={i}>
                                <td>{c.check_name || c.check}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.target_table || c.table}</td>
                                <td>{c.metric_value !== undefined ? `${c.metric_value}%` : c.value}</td>
                                <td>{c.threshold !== undefined ? `< ${c.threshold}%` : c.threshold}</td>
                                <td><span className={`badge badge-${c.status === 'PASS' ? 'green' : c.status === 'WARN' ? 'yellow' : 'red'}`}>{c.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reconciliation */}
            <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>🔄 Reconciliation</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Check</th><th>Delta / Result</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {actualReconciliation.map((r: any, i: number) => (
                            <tr key={i}>
                                <td>{r.check_name || r.check}</td>
                                <td>{r.details?.fail_count !== undefined ? `${r.details.fail_count} violations` : r.delta}</td>
                                <td><span className={`badge badge-${r.status === 'PASS' ? 'green' : 'yellow'}`}>{r.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
