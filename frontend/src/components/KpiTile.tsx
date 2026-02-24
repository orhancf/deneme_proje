'use client';

interface KpiTileProps {
    label: string;
    value: string | number;
    unit?: string;
    delta?: number;
    target?: number;
    status?: 'green' | 'yellow' | 'red';
    onClick?: () => void;
}

export function KpiTile({ label, value, unit, delta, target, status = 'green', onClick }: KpiTileProps) {
    const formattedDelta = delta !== undefined ? (delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`) : null;

    return (
        <div className={`kpi-tile status-${status} animate-in`} onClick={onClick}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {unit && <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 }}>{unit}</span>}
            </div>
            {formattedDelta && (
                <span className={`kpi-delta ${delta! >= 0 ? 'positive' : 'negative'}`}>
                    {delta! >= 0 ? '↑' : '↓'} {formattedDelta}
                </span>
            )}
            {target !== undefined && (
                <div className="kpi-target">Target: {target}{unit === '%' ? '%' : ''}</div>
            )}
        </div>
    );
}
