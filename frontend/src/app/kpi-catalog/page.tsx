'use client';

import { useQuery } from '@tanstack/react-query';
import { api, KpiDefinition } from '@/lib/api';
import { useState } from 'react';

// Fallback demo KPI catalog
const demoKpis: KpiDefinition[] = [
    { kpi_id: 'OTIF_001', name: 'OTIF %', description: 'On-Time In-Full delivery percentage', owner: 'SC Director', business_question: 'Are we delivering the right product on time and in full?', formula_business: 'Delivered On-Time AND In-Full / Total Delivered', unit: '%', grain: 'order_line / week / org', dimensions: ['org', 'customer', 'product', 'date'], refresh_sla: 'Daily 06:00', source_tables: ['fact_orders', 'fact_shipments'], thresholds: { green: 0.95, yellow: 0.9, red: 0 }, is_active: true },
    { kpi_id: 'OTD_002', name: 'OTD %', description: 'On-Time Delivery percentage', owner: 'SC Director', business_question: 'What percentage of deliveries arrive on time?', formula_business: 'Delivered On-Time / Total Delivered', unit: '%', grain: 'order_line / week / org', dimensions: ['org', 'customer', 'date'], refresh_sla: 'Daily 06:00', source_tables: ['fact_orders'], thresholds: { green: 0.95, yellow: 0.9, red: 0 }, is_active: true },
    { kpi_id: 'FILL_003', name: 'Fill Rate %', description: 'Order fill rate', owner: 'SC Director', business_question: 'How complete are our deliveries?', formula_business: 'Delivered Qty / Ordered Qty', unit: '%', grain: 'order_line / week / org', dimensions: ['org', 'customer', 'product', 'date'], refresh_sla: 'Daily 06:00', source_tables: ['fact_orders'], thresholds: { green: 0.98, yellow: 0.92, red: 0 }, is_active: true },
    { kpi_id: 'DOH_005', name: 'Days on Hand', description: 'Average days of inventory on hand', owner: 'Inventory Mgr', business_question: 'How many days of inventory do we have?', formula_business: 'On-Hand Qty / Avg Daily Consumption', unit: 'days', grain: 'product-location / day', dimensions: ['org', 'product', 'date'], refresh_sla: 'Daily 06:00', source_tables: ['fact_inventory_snapshot'], thresholds: { green: 30, yellow: 60, red: 90 }, is_active: true },
    { kpi_id: 'TURNS_006', name: 'Inventory Turns', description: 'Annualized inventory turnover', owner: 'Inventory Mgr', business_question: 'How efficiently are we turning inventory?', formula_business: 'COGS / Avg Inventory Value', unit: 'x', grain: 'product-location / month', dimensions: ['org', 'product', 'date'], refresh_sla: 'Weekly', source_tables: ['fact_inventory_snapshot'], thresholds: { green: 12, yellow: 6, red: 3 }, is_active: true },
    { kpi_id: 'FCACC_009', name: 'Forecast Accuracy (WAPE)', description: 'Weighted Absolute Percentage Error', owner: 'Demand Planning', business_question: 'How accurate are our forecasts?', formula_business: '1 - SUM(|actual - forecast|) / SUM(actual)', unit: '%', grain: 'product / week / org', dimensions: ['org', 'product', 'date'], refresh_sla: 'Weekly', source_tables: ['fact_forecast'], thresholds: { green: 0.80, yellow: 0.60, red: 0 }, is_active: true },
    { kpi_id: 'SCHEDADH_011', name: 'Schedule Adherence %', description: 'Production schedule adherence', owner: 'Production Mgr', business_question: 'How well do we adhere to the production schedule?', formula_business: 'Actual Qty / Planned Qty', unit: '%', grain: 'product-workcenter / day / org', dimensions: ['org', 'product', 'date'], refresh_sla: 'Daily 06:00', source_tables: ['fact_production'], thresholds: { green: 0.95, yellow: 0.85, red: 0 }, is_active: true },
    { kpi_id: 'SUPOT_013', name: 'Supplier On-Time %', description: 'Supplier on-time delivery rate', owner: 'Procurement', business_question: 'Are suppliers delivering on time?', formula_business: 'PO Lines On-Time / Total PO Lines', unit: '%', grain: 'PO line / week / supplier', dimensions: ['org', 'supplier', 'product', 'date'], refresh_sla: 'Daily 06:00', source_tables: ['fact_purchase_orders'], thresholds: { green: 0.95, yellow: 0.85, red: 0 }, is_active: true },
    { kpi_id: 'FRCOST_016', name: 'Freight Cost / Unit', description: 'Average freight cost per shipped unit', owner: 'Logistics', business_question: 'What does it cost to ship one unit?', formula_business: 'SUM(freight_cost) / SUM(shipped_qty)', unit: '$', grain: 'shipment / week / lane', dimensions: ['org', 'carrier', 'lane', 'date'], refresh_sla: 'Weekly', source_tables: ['fact_shipments'], thresholds: { green: 5, yellow: 10, red: 20 }, is_active: true },
    { kpi_id: 'C2C_019', name: 'Cash-to-Cash Cycle', description: 'Days for cash to cycle through the supply chain', owner: 'Finance', business_question: 'How long does cash take to cycle?', formula_business: 'DIO + DSO - DPO', unit: 'days', grain: 'org / month', dimensions: ['org', 'date'], refresh_sla: 'Monthly', source_tables: ['fact_orders', 'fact_purchase_orders', 'fact_inventory_snapshot'], thresholds: { green: 30, yellow: 60, red: 90 }, is_active: true },
];

export default function KpiCatalogPage() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<KpiDefinition | null>(null);

    const { data: catalog } = useQuery({
        queryKey: ['kpiCatalog'],
        queryFn: api.getMetricsCatalog,
        retry: false,
    });

    const kpis = catalog || demoKpis;
    const filtered = kpis.filter(
        (k) =>
            k.name.toLowerCase().includes(search.toLowerCase()) ||
            k.kpi_id.toLowerCase().includes(search.toLowerCase()) ||
            k.owner.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>KPI Catalog</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        Single source of truth for all metric definitions
                    </p>
                </div>
                <div className="filters">
                    <input
                        type="text"
                        placeholder="Search KPIs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="filter-select"
                        style={{ minWidth: 240 }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
                {/* KPI List */}
                <div style={{ flex: 1 }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>ID</th><th>Name</th><th>Owner</th><th>Unit</th><th>Refresh</th><th>Grain</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map((k) => (
                                    <tr
                                        key={k.kpi_id}
                                        onClick={() => setSelected(k)}
                                        style={{ cursor: 'pointer', background: selected?.kpi_id === k.kpi_id ? 'rgba(59,130,246,0.1)' : undefined }}
                                    >
                                        <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--accent-cyan)' }}>{k.kpi_id}</td>
                                        <td style={{ fontWeight: 500 }}>{k.name}</td>
                                        <td>{k.owner}</td>
                                        <td>{k.unit}</td>
                                        <td>{k.refresh_sla}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k.grain}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* KPI Detail Panel */}
                {selected && (
                    <div style={{ width: 400, flexShrink: 0 }}>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selected.name}</h3>
                                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-cyan)' }}>{selected.kpi_id}</span>
                            </div>

                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                {selected.business_question}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <DetailRow label="Formula" value={selected.formula_business} />
                                <DetailRow label="Owner" value={selected.owner} />
                                <DetailRow label="Unit" value={selected.unit} />
                                <DetailRow label="Grain" value={selected.grain} />
                                <DetailRow label="Refresh SLA" value={selected.refresh_sla} />
                                <DetailRow label="Dimensions" value={selected.dimensions.join(', ')} />
                                <DetailRow label="Source Tables" value={selected.source_tables.join(', ')} />
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Thresholds</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className="badge badge-green">Green ≥ {selected.thresholds.green}</span>
                                        <span className="badge badge-yellow">Yellow ≥ {selected.thresholds.yellow}</span>
                                        <span className="badge badge-red">Red &lt; {selected.thresholds.yellow}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ fontSize: 13 }}>{value}</div>
        </div>
    );
}
