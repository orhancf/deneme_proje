'use client';

import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Search, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';

const pathNames: Record<string, string> = {
    '/': 'Command Center',
    '/plan': 'Plan',
    '/source': 'Source',
    '/make': 'Make',
    '/deliver': 'Deliver',
    '/inventory': 'Inventory',
    '/data-quality': 'Data Quality',
    '/kpi-catalog': 'KPI Catalog',
    '/audit': 'Audit Log',
};

export function TopBar() {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const { data: session } = useSession();

    const currentPage = pathNames[pathname] || 'Dashboard';

    return (
        <header
            className="glass"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-6)',
                height: 'var(--topbar-height)',
                borderBottom: '1px solid var(--border-default)',
                borderRadius: 0,
                marginBottom: 'var(--space-6)',
            }}
        >
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>SCCT</span>
                <span style={{ color: 'var(--text-tertiary)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{currentPage}</span>
            </nav>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {/* Search */}
                <button
                    className="btn btn-ghost"
                    style={{ borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}
                    title="Search (Ctrl+K)"
                >
                    <Search size={16} />
                </button>

                {/* Notifications */}
                <button
                    className="btn btn-ghost"
                    style={{
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-2)',
                        position: 'relative',
                    }}
                    title="Notifications"
                >
                    <Bell size={16} />
                    <span
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--color-danger)',
                            boxShadow: '0 0 6px var(--color-danger)',
                        }}
                    />
                </button>

                {/* Theme Toggle */}
                <button
                    className="btn btn-ghost"
                    onClick={toggleTheme}
                    style={{ borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* User Avatar */}
                {session?.user && (
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--accent-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 700,
                            color: 'white',
                            marginLeft: 'var(--space-1)',
                            cursor: 'pointer',
                        }}
                        title={session.user.name || session.user.email || ''}
                    >
                        {(session.user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}
