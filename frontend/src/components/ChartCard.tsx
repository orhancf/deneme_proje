'use client';

import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

interface ChartCardProps {
    title: string;
    type: 'line' | 'bar' | 'area';
    data: any[];
    dataKeys: { key: string; color: string; name?: string }[];
    xKey?: string;
    height?: number;
}

const customTooltipStyle = {
    backgroundColor: '#1a2035',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f0f4f8',
    fontSize: '13px',
};

export function ChartCard({ title, type, data, dataKeys, xKey = 'name', height = 280 }: ChartCardProps) {
    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 5, right: 20, left: 0, bottom: 5 },
        };

        const axisProps = {
            tick: { fill: '#94a3b8', fontSize: 11 },
            axisLine: { stroke: '#2d3748' },
            tickLine: false,
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        {dataKeys.map((dk) => (
                            <Line
                                key={dk.key}
                                type="monotone"
                                dataKey={dk.key}
                                stroke={dk.color}
                                name={dk.name || dk.key}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        {dataKeys.map((dk) => (
                            <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.name || dk.key} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        {dataKeys.map((dk) => (
                            <Area
                                key={dk.key}
                                type="monotone"
                                dataKey={dk.key}
                                stroke={dk.color}
                                fill={dk.color}
                                fillOpacity={0.15}
                                name={dk.name || dk.key}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                );
        }
    };

    return (
        <div className="chart-card">
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
