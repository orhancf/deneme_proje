'use client';

import { KpiTile } from '@/components/KpiTile';
import { ChartCard } from '@/components/ChartCard';
import { useState } from 'react';
import { DrillDownDrawer } from '@/components/DrillDownDrawer';
import { exportToCsv } from '@/lib/export';

const inventoryTrend = [
    { month: 'Jan', doh: 42, turns: 8.5, value: 12500000, stockout: 3.2 },
    { month: 'Feb', doh: 38, turns: 9.1, value: 11800000, stockout: 2.8 },
    { month: 'Mar', doh: 44, turns: 7.9, value: 13200000, stockout: 4.1 },
    { month: 'Apr', doh: 35, turns: 10.2, value: 10500000, stockout: 2.1 },
    { month: 'May', doh: 41, turns: 8.8, value: 12100000, stockout: 3.5 },
    { month: 'Jun', doh: 37, turns: 9.5, value: 11200000, stockout: 2.4 },
];

const agingData = [
    { bucket: '0-30 days', qty: 45000, value: 3200000, pct: 52 },
    { bucket: '31-60 days', qty: 22000, value: 1800000, pct: 25 },
    { bucket: '61-90 days', qty: 12000, value: 1100000, pct: 14 },
    { bucket: '90+ days', qty: 8000, value: 900000, pct: 9 },
];

const siteData = [
    { site: 'East Coast DC', doh: 35, onhand: 18500, stockout: '2.1%', excess: '$180K', status: 'green' },
    { site: 'West Coast DC', doh: 48, onhand: 22300, stockout: '4.5%', excess: '$420K', status: 'red' },
    { site: 'Central EU DC', doh: 32, onhand: 15800, stockout: '1.8%', excess: '$120K', status: 'green' },
    { site: 'East EU DC', doh: 41, onhand: 12100, stockout: '3.2%', excess: '$280K', status: 'yellow' },
];

export default function InventoryPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drillData, setDrillData] = useState({ title: '', data: [] as any[], columns: [] as { key: string, label: string }[] });

    const handleExportSummary = () => {
        const summaryData = [
            { metric: 'Days on Hand', value: '39 days', target: '30' },
            { metric: 'Inventory Turns', value: '9.2x', target: '12' },
            { metric: 'Stockout Rate', value: '2.9%', target: '2%' },
            { metric: 'E&O Value', value: '$900K', target: '-' },
            { metric: 'Total Inventory Value', value: '$11.2M', target: '-' },
            { metric: 'Safety Stock Coverage', value: '87%', target: '95%' }
        ];
        exportToCsv('inventory_summary', summaryData);
    };

    const handleDrillDown = (title: string) => {
        const mockDetails = Array.from({ length: 15 }).map((_, i) => ({
            sku: `SKU-${200 + i}`,
            location: ['East Coast DC', 'West Coast DC', 'Central EU DC'][i % 3],
            onHand: Math.floor(Math.random() * 5000),
            status: ['Healthy', 'Excess', 'Out of Stock'][i % 3],
            value: `$${(Math.random() * 100).toFixed(2)}K`
        }));

        setDrillData({
            title: `${title} - Detail View`,
            data: mockDetails,
            columns: [
                { key: 'sku', label: 'SKU' },
                { key: 'location', label: 'Location' },
                { key: 'onHand', label: 'On Hand Qty' },
                { key: 'status', label: 'Status' },
                { key: 'value', label: 'Inventory Value' }
            ]
        });
        setDrawerOpen(true);
    };

    return (
        <div className="animate-in">
            <DrillDownDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={drillData.title}
                data={drillData.data}
                columns={drillData.columns}
            />
            <div className="top-bar">
                <div>
                    <h2>Inventory</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        On-hand, aging, safety stock coverage, and excess & obsolete
                    </p>
                </div>
                <div className="filters">
                    <select className="filter-select">
                        <option>Last 6 Months</option>
                        <option>Last Quarter</option>
                    </select>
                    <select className="filter-select">
                        <option>All Sites</option>
                        <option>East Coast DC</option>
                        <option>West Coast DC</option>
                    </select>
                    <button className="btn btn-secondary" onClick={handleExportSummary}>
                        ⬇ Export Summary
                    </button>
                </div>
            </div>

            <div className="kpi-grid">
                <KpiTile label="Days on Hand" value="39" unit="days" delta={-3.1} target={30} status="yellow" onClick={() => handleDrillDown('Days on Hand')} />
                <KpiTile label="Inventory Turns" value="9.2" unit="x" delta={5.7} target={12} status="yellow" onClick={() => handleDrillDown('Inventory Turns')} />
                <KpiTile label="Stockout Rate" value="2.9" unit="%" delta={-12.1} target={2} status="yellow" onClick={() => handleDrillDown('Stockout Rate')} />
                <KpiTile label="E&O Value" value="$900K" delta={-8.3} status="yellow" onClick={() => handleDrillDown('E&O Value')} />
                <KpiTile label="Total Inventory Value" value="$11.2M" delta={-10.4} status="green" onClick={() => handleDrillDown('Total Inventory Value')} />
                <KpiTile label="Safety Stock Coverage" value="87" unit="%" delta={2.1} target={95} status="yellow" onClick={() => handleDrillDown('Safety Stock Coverage')} />
            </div>

            <div className="chart-grid">
                <ChartCard
                    title="Days on Hand Trend"
                    type="line"
                    data={inventoryTrend}
                    xKey="month"
                    dataKeys={[{ key: 'doh', color: '#8b5cf6', name: 'DOH' }]}
                />
                <ChartCard
                    title="Aging Breakdown"
                    type="bar"
                    data={agingData}
                    xKey="bucket"
                    dataKeys={[{ key: 'qty', color: '#06b6d4', name: 'Qty' }]}
                />
            </div>

            <div className="card" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Inventory by Site</h3>
                    <button className="btn btn-secondary" onClick={() => exportToCsv('inventory_by_site', siteData)}>
                        ⬇ Export Table
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr><th>Site</th><th>DOH</th><th>On-Hand Qty</th><th>Stockout Rate</th><th>E&O Value</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {siteData.map((s) => (
                            <tr key={s.site}>
                                <td style={{ fontWeight: 500 }}>{s.site}</td>
                                <td>{s.doh} days</td>
                                <td>{s.onhand.toLocaleString()}</td>
                                <td>{s.stockout}</td>
                                <td>{s.excess}</td>
                                <td><span className={`badge badge-${s.status}`}>{s.status.toUpperCase()}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
