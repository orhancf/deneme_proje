'use client';

import { KpiTile } from '@/components/KpiTile';
import { ChartCard } from '@/components/ChartCard';

const productionData = [
    { week: 'W1', adherence: 92, utilization: 78, yield_rate: 97 },
    { week: 'W2', adherence: 88, utilization: 82, yield_rate: 96 },
    { week: 'W3', adherence: 95, utilization: 85, yield_rate: 98 },
    { week: 'W4', adherence: 90, utilization: 79, yield_rate: 97 },
    { week: 'W5', adherence: 93, utilization: 87, yield_rate: 98 },
    { week: 'W6', adherence: 91, utilization: 81, yield_rate: 96 },
    { week: 'W7', adherence: 89, utilization: 84, yield_rate: 97 },
    { week: 'W8', adherence: 94, utilization: 86, yield_rate: 98 },
];

const plantData = [
    { plant: 'Chicago', adherence: 93, utilization: 85, throughput: 12500 },
    { plant: 'Dallas', adherence: 91, utilization: 79, throughput: 9800 },
    { plant: 'Munich', adherence: 88, utilization: 87, throughput: 14200 },
    { plant: 'Warsaw', adherence: 95, utilization: 82, throughput: 8900 },
];

export default function MakePage() {
    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>Make — Production</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        Schedule adherence, capacity utilization, and yield
                    </p>
                </div>
                <div className="filters">
                    <select className="filter-select">
                        <option>Last 8 Weeks</option>
                        <option>Last Quarter</option>
                    </select>
                    <select className="filter-select">
                        <option>All Plants</option>
                        <option>Chicago Plant</option>
                        <option>Dallas Plant</option>
                        <option>Munich Plant</option>
                        <option>Warsaw Plant</option>
                    </select>
                </div>
            </div>

            <div className="kpi-grid">
                <KpiTile label="Schedule Adherence" value="91.8" unit="%" delta={-2.4} target={95} status="red" />
                <KpiTile label="Capacity Utilization" value="83.2" unit="%" delta={1.5} target={85} status="yellow" />
                <KpiTile label="Yield Rate" value="97.1" unit="%" delta={0.3} target={97} status="green" />
                <KpiTile label="Daily Throughput" value="11,350" unit="units" delta={4.2} status="green" />
            </div>

            <div className="chart-grid">
                <ChartCard
                    title="Schedule Adherence & Utilization Trend"
                    type="line"
                    data={productionData}
                    xKey="week"
                    dataKeys={[
                        { key: 'adherence', color: '#3b82f6', name: 'Schedule Adherence %' },
                        { key: 'utilization', color: '#06b6d4', name: 'Capacity Utilization %' },
                    ]}
                />
                <ChartCard
                    title="Throughput by Plant"
                    type="bar"
                    data={plantData}
                    xKey="plant"
                    dataKeys={[
                        { key: 'throughput', color: '#8b5cf6', name: 'Throughput (units)' },
                    ]}
                />
            </div>
        </div>
    );
}
