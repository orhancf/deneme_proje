'use client';

import { KpiTile } from '@/components/KpiTile';
import { ChartCard } from '@/components/ChartCard';

const forecastData = [
    { week: 'W1', accuracy: 78, bias: 12 },
    { week: 'W2', accuracy: 82, bias: 8 },
    { week: 'W3', accuracy: 75, bias: 15 },
    { week: 'W4', accuracy: 85, bias: 5 },
    { week: 'W5', accuracy: 80, bias: 10 },
    { week: 'W6', accuracy: 83, bias: 7 },
    { week: 'W7', accuracy: 79, bias: 11 },
    { week: 'W8', accuracy: 87, bias: 3 },
    { week: 'W9', accuracy: 84, bias: 6 },
    { week: 'W10', accuracy: 81, bias: 9 },
];

const backlogTrend = [
    { week: 'W1', qty: 12500, value: 985000 },
    { week: 'W2', qty: 11200, value: 880000 },
    { week: 'W3', qty: 13800, value: 1120000 },
    { week: 'W4', qty: 10500, value: 820000 },
    { week: 'W5', qty: 9800, value: 760000 },
    { week: 'W6', qty: 11600, value: 910000 },
    { week: 'W7', qty: 10200, value: 790000 },
    { week: 'W8', qty: 8960, value: 695000 },
];

export default function PlanPage() {
    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>Plan — Demand & Forecast</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        Forecast accuracy, bias, and backlog monitoring
                    </p>
                </div>
                <div className="filters">
                    <select className="filter-select">
                        <option>Last 12 Weeks</option>
                        <option>Last Quarter</option>
                        <option>YTD</option>
                    </select>
                    <select className="filter-select">
                        <option>All Product Families</option>
                        <option>Electronics</option>
                        <option>Mechanical</option>
                        <option>Chemical</option>
                    </select>
                </div>
            </div>

            <div className="kpi-grid">
                <KpiTile label="Forecast Accuracy (WAPE)" value="82.3" unit="%" delta={2.1} target={80} status="green" />
                <KpiTile label="Forecast Bias" value="+7.8" unit="%" delta={-3.2} status="yellow" />
                <KpiTile label="Open Backlog (Qty)" value="8,960" delta={-12.5} status="green" />
                <KpiTile label="Backlog Value" value="$695K" delta={-9.8} status="green" />
            </div>

            <div className="chart-grid">
                <ChartCard
                    title="Forecast Accuracy & Bias Trend"
                    type="line"
                    data={forecastData}
                    xKey="week"
                    dataKeys={[
                        { key: 'accuracy', color: '#3b82f6', name: 'Accuracy %' },
                        { key: 'bias', color: '#f59e0b', name: 'Bias %' },
                    ]}
                />
                <ChartCard
                    title="Backlog Trend"
                    type="area"
                    data={backlogTrend}
                    xKey="week"
                    dataKeys={[
                        { key: 'qty', color: '#8b5cf6', name: 'Backlog Qty' },
                    ]}
                />
            </div>
        </div>
    );
}
