'use client';

import { KpiTile } from '@/components/KpiTile';
import { ChartCard } from '@/components/ChartCard';

const logisticsData = [
    { week: 'W1', carrier_ot: 91, freight: 8.2, transit_var: 1.5 },
    { week: 'W2', carrier_ot: 88, freight: 9.1, transit_var: 2.3 },
    { week: 'W3', carrier_ot: 93, freight: 7.8, transit_var: 0.9 },
    { week: 'W4', carrier_ot: 86, freight: 10.2, transit_var: 3.1 },
    { week: 'W5', carrier_ot: 90, freight: 8.5, transit_var: 1.8 },
    { week: 'W6', carrier_ot: 92, freight: 7.9, transit_var: 1.2 },
    { week: 'W7', carrier_ot: 87, freight: 9.5, transit_var: 2.7 },
    { week: 'W8', carrier_ot: 94, freight: 7.5, transit_var: 0.8 },
];

const carrierData = [
    { carrier: 'FastFreight', ot: '82%', cost: '$9.20', transit: '+2.1d', mode: 'ROAD', status: 'red' },
    { carrier: 'GlobalShip', ot: '95%', cost: '$5.80', transit: '+0.5d', mode: 'SEA', status: 'green' },
    { carrier: 'AirCargo Express', ot: '97%', cost: '$18.50', transit: '-0.2d', mode: 'AIR', status: 'green' },
    { carrier: 'RailConnect', ot: '91%', cost: '$4.20', transit: '+1.3d', mode: 'RAIL', status: 'yellow' },
    { carrier: 'OceanLine', ot: '89%', cost: '$3.90', transit: '+1.8d', mode: 'SEA', status: 'yellow' },
];

export default function DeliverPage() {
    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>Deliver — Logistics</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        Shipment performance, freight costs, and carrier analytics
                    </p>
                </div>
                <div className="filters">
                    <select className="filter-select">
                        <option>Last 8 Weeks</option>
                        <option>Last Quarter</option>
                    </select>
                    <select className="filter-select">
                        <option>All Carriers</option>
                        <option>ROAD</option>
                        <option>SEA</option>
                        <option>AIR</option>
                    </select>
                </div>
            </div>

            <div className="kpi-grid">
                <KpiTile label="Carrier OT %" value="90.1" unit="%" delta={1.8} target={95} status="yellow" />
                <KpiTile label="Freight Cost/Unit" value="$8.42" delta={-4.1} status="green" />
                <KpiTile label="Transit Time Variance" value="+1.8" unit="days" delta={-0.5} status="yellow" />
                <KpiTile label="Active Shipments" value="342" delta={8.2} status="green" />
            </div>

            <div className="chart-grid">
                <ChartCard
                    title="Carrier On-Time % Trend"
                    type="line"
                    data={logisticsData}
                    xKey="week"
                    dataKeys={[
                        { key: 'carrier_ot', color: '#3b82f6', name: 'Carrier OT %' },
                    ]}
                />
                <ChartCard
                    title="Freight Cost per Unit Trend"
                    type="area"
                    data={logisticsData}
                    xKey="week"
                    dataKeys={[
                        { key: 'freight', color: '#f59e0b', name: 'Freight $/Unit' },
                    ]}
                />
            </div>

            <div className="card" style={{ marginTop: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Carrier Performance</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Carrier</th><th>Mode</th><th>On-Time %</th><th>Avg Cost/Unit</th><th>Transit Variance</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {carrierData.map((c) => (
                            <tr key={c.carrier}>
                                <td style={{ fontWeight: 500 }}>{c.carrier}</td>
                                <td><span className="badge badge-green" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>{c.mode}</span></td>
                                <td>{c.ot}</td>
                                <td>{c.cost}</td>
                                <td>{c.transit}</td>
                                <td><span className={`badge badge-${c.status}`}>{c.status.toUpperCase()}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
