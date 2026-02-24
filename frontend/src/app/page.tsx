'use client';

import { KpiTile } from '@/components/KpiTile';
import { ChartCard } from '@/components/ChartCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { DrillDownDrawer } from '@/components/DrillDownDrawer';
import { exportToCsv } from '@/lib/export';

// Demo data for charts
const otifTrend = [
  { week: 'W1', otif: 93.2, otd: 94.1, fill: 96.5 },
  { week: 'W2', otif: 91.8, otd: 93.5, fill: 95.8 },
  { week: 'W3', otif: 94.5, otd: 95.2, fill: 97.1 },
  { week: 'W4', otif: 92.1, otd: 93.8, fill: 96.2 },
  { week: 'W5', otif: 95.3, otd: 96.1, fill: 97.8 },
  { week: 'W6', otif: 93.7, otd: 94.9, fill: 96.9 },
  { week: 'W7', otif: 91.4, otd: 92.8, fill: 95.4 },
  { week: 'W8', otif: 94.8, otd: 95.6, fill: 97.3 },
  { week: 'W9', otif: 96.1, otd: 96.8, fill: 98.2 },
  { week: 'W10', otif: 94.2, otd: 95.1, fill: 97.0 },
  { week: 'W11', otif: 93.5, otd: 94.3, fill: 96.7 },
  { week: 'W12', otif: 95.0, otd: 95.8, fill: 97.5 },
];

const backlogByOrg = [
  { org: 'Chicago', backlog: 2450, value: 185000 },
  { org: 'Dallas', backlog: 1830, value: 142000 },
  { org: 'Munich', backlog: 3120, value: 268000 },
  { org: 'Warsaw', backlog: 1560, value: 119000 },
];

const inventoryTrend = [
  { month: 'Jan', doh: 42, turns: 8.5, stockout: 3.2 },
  { month: 'Feb', doh: 38, turns: 9.1, stockout: 2.8 },
  { month: 'Mar', doh: 44, turns: 7.9, stockout: 4.1 },
  { month: 'Apr', doh: 35, turns: 10.2, stockout: 2.1 },
  { month: 'May', doh: 41, turns: 8.8, stockout: 3.5 },
  { month: 'Jun', doh: 37, turns: 9.5, stockout: 2.4 },
];

const exceptions = [
  { severity: 'red', message: 'OTIF dropped below 90% at Munich Plant — Electronics segment', time: '2h ago' },
  { severity: 'red', message: 'Supplier Alpha Parts Co lead time +8 days vs SLA', time: '3h ago' },
  { severity: 'yellow', message: 'Inventory DOH exceeds 60 days for 12 SKUs at DC-02', time: '5h ago' },
  { severity: 'yellow', message: 'Carrier FastFreight OT% at 82% (below 85% threshold)', time: '6h ago' },
  { severity: 'red', message: 'Stockout on SKU-0023 at East Coast DC — 15 open orders affected', time: '7h ago' },
  { severity: 'yellow', message: 'Forecast bias +18% for Mechanical family — consistent over-forecast', time: '8h ago' },
];

export default function CommandCenter() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drillData, setDrillData] = useState({ title: '', data: [] as any[], columns: [] as { key: string, label: string }[] });

  const { data: freshness } = useQuery({
    queryKey: ['freshness'],
    queryFn: api.getFreshness,
    retry: false,
  });

  const handleExportSummary = () => {
    const summaryData = [
      { metric: 'OTIF %', value: '94.2%', target: '95%' },
      { metric: 'OTD %', value: '95.1%', target: '95%' },
      { metric: 'Fill Rate %', value: '97.0%', target: '98%' },
      { metric: 'Open Backlog', value: '8,960 units', target: '-' },
      { metric: 'Days on Hand', value: '39 days', target: '30' },
      { metric: 'Schedule Adherence', value: '91.8%', target: '95%' },
      { metric: 'Supplier OT %', value: '88.5%', target: '95%' },
      { metric: 'Freight Cost/Unit', value: '$8.42', target: '-' },
    ];
    exportToCsv('command_center_summary', summaryData);
  };

  const handleDrillDown = (title: string) => {
    const mockDetails = Array.from({ length: 15 }).map((_, i) => ({
      id: `ORD-${1000 + i}`,
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      customer: ['Acme Corp', 'Globex', 'Soylent', 'Initech'][i % 4],
      product: `SKU-${100 + (i % 5)}`,
      value: Math.floor(Math.random() * 5000) + 500,
      status: ['Completed', 'Delayed', 'In Transit'][i % 3]
    }));

    setDrillData({
      title: `${title} - Detail View`,
      data: mockDetails,
      columns: [
        { key: 'id', label: 'Order ID' },
        { key: 'date', label: 'Date' },
        { key: 'customer', label: 'Customer' },
        { key: 'product', label: 'Product' },
        { key: 'value', label: 'Value ($)' },
        { key: 'status', label: 'Status' }
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

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-8)',
      }}>
        <div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Command Center
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-base)',
            margin: 'var(--space-1) 0 0',
          }}>
            Real-time supply chain performance overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <select className="filter-select">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last Quarter</option>
            <option>YTD</option>
          </select>
          <select className="filter-select">
            <option>All Companies</option>
            <option>Acme Global Corp</option>
            <option>EuroTech Industries</option>
          </select>
          <button className="btn btn-secondary" onClick={handleExportSummary}>
            ⬇ Export
          </button>
        </div>
      </div>

      {/* KPI Tiles — Staggered Animation */}
      <div className="kpi-grid stagger-in">
        <KpiTile label="OTIF %" value="94.2" unit="%" delta={1.3} target={95} status="yellow" onClick={() => handleDrillDown('OTIF %')} />
        <KpiTile label="OTD %" value="95.1" unit="%" delta={0.8} target={95} status="green" onClick={() => handleDrillDown('OTD %')} />
        <KpiTile label="Fill Rate %" value="97.0" unit="%" delta={0.5} target={98} status="yellow" onClick={() => handleDrillDown('Fill Rate %')} />
        <KpiTile label="Open Backlog" value="8,960" unit="units" delta={-5.2} status="green" onClick={() => handleDrillDown('Open Backlog')} />
        <KpiTile label="Days on Hand" value="39" unit="days" delta={-3.1} target={30} status="yellow" onClick={() => handleDrillDown('Days on Hand')} />
        <KpiTile label="Schedule Adherence" value="91.8" unit="%" delta={-2.4} target={95} status="red" onClick={() => handleDrillDown('Schedule Adherence')} />
        <KpiTile label="Supplier OT %" value="88.5" unit="%" delta={1.2} target={95} status="red" onClick={() => handleDrillDown('Supplier OT %')} />
        <KpiTile label="Freight Cost/Unit" value="$8.42" delta={-4.1} status="green" onClick={() => handleDrillDown('Freight Cost/Unit')} />
      </div>

      {/* Charts — Bento Grid */}
      <div className="bento-grid">
        <div className="col-span-7">
          <ChartCard
            title="OTIF / OTD / Fill Rate Trend"
            type="line"
            data={otifTrend}
            xKey="week"
            dataKeys={[
              { key: 'otif', color: 'var(--chart-1)', name: 'OTIF %' },
              { key: 'otd', color: 'var(--chart-2)', name: 'OTD %' },
              { key: 'fill', color: 'var(--chart-3)', name: 'Fill Rate %' },
            ]}
          />
        </div>
        <div className="col-span-5">
          <ChartCard
            title="Backlog by Organization"
            type="bar"
            data={backlogByOrg}
            xKey="org"
            dataKeys={[
              { key: 'backlog', color: 'var(--chart-5)', name: 'Backlog (qty)' },
            ]}
          />
        </div>
        <div className="col-span-6">
          <ChartCard
            title="Inventory Metrics Trend"
            type="area"
            data={inventoryTrend}
            xKey="month"
            dataKeys={[
              { key: 'doh', color: 'var(--chart-4)', name: 'Days on Hand' },
            ]}
          />
        </div>
        <div className="col-span-6">
          <ChartCard
            title="Stockout Rate Trend"
            type="line"
            data={inventoryTrend}
            xKey="month"
            dataKeys={[
              { key: 'stockout', color: 'var(--chart-1)', name: 'Stockout Rate %' },
            ]}
            height={280}
          />
        </div>
      </div>

      {/* Exception Feed + Data Freshness — Bento */}
      <div className="bento-grid">
        <div className="col-span-8">
          <div className="exception-feed">
            <h3 style={{
              fontSize: 'var(--text-md)',
              fontWeight: 600,
              margin: '0 0 var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-danger)',
                boxShadow: '0 0 8px var(--color-danger)',
                display: 'inline-block',
              }} />
              Exception Feed — Top Alerts
            </h3>
            {exceptions.map((ex, i) => (
              <div key={i} className="exception-item">
                <div className={`exception-dot ${ex.severity}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{ex.message}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>{ex.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4">
          {/* Data Freshness */}
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{
              fontSize: 'var(--text-md)',
              fontWeight: 600,
              margin: '0 0 var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              📡 Data Freshness
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {freshness ? freshness.map((f) => (
                <div key={f.table_name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                }}>
                  <span className={`status-pill ${f.sla_status.toLowerCase()}`}>{f.sla_status}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{f.table_name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {f.row_count.toLocaleString()} rows • {f.hours_since_load}h ago
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                  Waiting for data...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
