'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AuditPage() {
    const { data: logs } = useQuery({
        queryKey: ['audit'],
        queryFn: () => api.getAuditLogs(50),
        retry: false,
    });

    // Demo data fallback
    const auditLogs = logs || [
        { audit_id: 1, email: 'admin@scct.dev', display_name: 'Admin User', action: 'LOGIN', resource: null, created_at: '2025-12-15T08:30:00Z' },
        { audit_id: 2, email: 'director@scct.dev', display_name: 'SC Director', action: 'DASHBOARD_VIEW', resource: 'Command Center', created_at: '2025-12-15T08:32:00Z' },
        { audit_id: 3, email: 'director@scct.dev', display_name: 'SC Director', action: 'DASHBOARD_VIEW', resource: 'Inventory', created_at: '2025-12-15T08:35:00Z' },
        { audit_id: 4, email: 'analyst@scct.dev', display_name: 'Analyst User', action: 'EXPORT', resource: 'Inventory - CSV', created_at: '2025-12-15T09:10:00Z' },
        { audit_id: 5, email: 'analyst@scct.dev', display_name: 'Analyst User', action: 'QUERY', resource: 'OTIF_001', created_at: '2025-12-15T09:12:00Z' },
        { audit_id: 6, email: 'viewer@scct.dev', display_name: 'Viewer User', action: 'LOGIN', resource: null, created_at: '2025-12-15T09:30:00Z' },
        { audit_id: 7, email: 'viewer@scct.dev', display_name: 'Viewer User', action: 'DASHBOARD_VIEW', resource: 'Source', created_at: '2025-12-15T09:31:00Z' },
        { audit_id: 8, email: 'admin@scct.dev', display_name: 'Admin User', action: 'CONFIG_CHANGE', resource: 'User Role Update', created_at: '2025-12-15T10:00:00Z' },
    ];

    const actionColors: Record<string, string> = {
        LOGIN: 'green',
        LOGOUT: 'green',
        DASHBOARD_VIEW: 'yellow',
        EXPORT: 'yellow',
        QUERY: 'yellow',
        CONFIG_CHANGE: 'red',
    };

    return (
        <div className="animate-in">
            <div className="top-bar">
                <div>
                    <h2>Audit Log</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                        User activity trail — who saw what and when
                    </p>
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr><th>Timestamp</th><th>User</th><th>Email</th><th>Action</th><th>Resource</th></tr>
                    </thead>
                    <tbody>
                        {auditLogs.map((log: any) => (
                            <tr key={log.audit_id}>
                                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</td>
                                <td style={{ fontWeight: 500 }}>{log.display_name}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.email}</td>
                                <td><span className={`badge badge-${actionColors[log.action] || 'yellow'}`}>{log.action}</span></td>
                                <td>{log.resource || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
