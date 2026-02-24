'use client';

import { KpiTile } from '@/components/KpiTile';
import { ChartCard } from '@/components/ChartCard';

const supplierOTData = [
    { month: 'Jan', ot: 88, lt_var: 3.2, ppm: 450 },
    { month: 'Feb', ot: 91, lt_var: 2.8, ppm: 380 },
    { month: 'Mar', ot: 85, lt_var: 4.1, ppm: 520 },
    { month: 'Apr', ot: 93, lt_var: 1.9, ppm: 290 },
    { month: 'May', ot: 89, lt_var: 3.5, ppm: 410 },
    { month: 'Jun', ot: 87, lt_var: 3.8, ppm: 480 },
];

const supplierTable = [
    { name: 'Alpha Parts Co', ot: '82%', lt: '+5.2 days', ppm: '680', tier: 'Tier-1', spend: '$1.2M', status: 'red' },
    { name: 'Gamma Electronics', ot: '91%', lt: '+1.8 days', ppm: '210', tier: 'Tier-1', spend: '$890K', status: 'yellow' },
    { name: 'Delta Metals', ot: '96%', lt: '-0.5 days', ppm: '85', tier: 'Tier-2', spend: '$650K', status: 'green' },
    { name: 'Eta Precision', ot: '93%', lt: '+2.1 days', ppm: '320', tier: 'Tier-1', spend: '$1.5M', status: 'yellow' },
    { name: 'Kappa Coatings', ot: '97%', lt: '+0.3 days', ppm: '45', tier: 'Tier-2', spend: '$420K', status: 'green' },
];

export default function SourcePage() {
    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>Source — Procurement</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        Supplier performance, lead times, and quality
                    </p>
                </div>
                <div className="filters">
                    <select className="filter-select">
                        <option>Last 6 Months</option>
                        <option>Last Quarter</option>
                        <option>YTD</option>
                    </select>
                    <select className="filter-select">
                        <option>All Suppliers</option>
                        <option>Tier-1 Only</option>
                        <option>Tier-2 Only</option>
                    </select>
                </div>
            </div>

            <div className="kpi-grid">
                <KpiTile label="Supplier OT %" value="88.5" unit="%" delta={1.2} target={95} status="red" />
                <KpiTile label="Avg Lead Time Variance" value="+3.2" unit="days" delta={-0.8} status="yellow" />
                <KpiTile label="Supplier Quality (PPM)" value="385" delta={-12.3} status="yellow" />
                <KpiTile label="Open POs" value="1,240" delta={5.1} status="yellow" />
            </div>

            <div className="chart-grid">
                <ChartCard
                    title="Supplier On-Time % Trend"
                    type="line"
                    data={supplierOTData}
                    xKey="month"
                    dataKeys={[{ key: 'ot', color: '#3b82f6', name: 'Supplier OT %' }]}
                />
                <ChartCard
                    title="Lead Time Variance Trend"
                    type="bar"
                    data={supplierOTData}
                    xKey="month"
                    dataKeys={[{ key: 'lt_var', color: '#f59e0b', name: 'LT Variance (days)' }]}
                />
            </div>

            {/* Supplier Table */}
            <div className="card" style={{ marginTop: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Supplier Scorecard</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Supplier</th>
                            <th>On-Time %</th>
                            <th>LT Variance</th>
                            <th>Quality PPM</th>
                            <th>Tier</th>
                            <th>Spend</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supplierTable.map((s) => (
                            <tr key={s.name}>
                                <td style={{ fontWeight: 500 }}>{s.name}</td>
                                <td>{s.ot}</td>
                                <td>{s.lt}</td>
                                <td>{s.ppm}</td>
                                <td>{s.tier}</td>
                                <td>{s.spend}</td>
                                <td><span className={`badge badge-${s.status}`}>{s.status.toUpperCase()}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
