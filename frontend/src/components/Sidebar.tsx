'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Package,
    Factory,
    Truck,
    Boxes,
    ShieldCheck,
    BookOpen,
    Activity,
    LogOut,
    UserCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { label: 'Command Center', href: '/', icon: LayoutDashboard },
    { label: 'Plan', href: '/plan', icon: TrendingUp },
    { label: 'Source', href: '/source', icon: Package },
    { label: 'Make', href: '/make', icon: Factory },
    { label: 'Deliver', href: '/deliver', icon: Truck },
    { label: 'Inventory', href: '/inventory', icon: Boxes },
];

const systemItems = [
    { label: 'Data Quality', href: '/data-quality', icon: ShieldCheck },
    { label: 'KPI Catalog', href: '/kpi-catalog', icon: BookOpen },
    { label: 'Audit Log', href: '/audit', icon: Activity },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <span style={{ fontSize: 22, flexShrink: 0 }}>⚡</span>
                {!collapsed && (
                    <div>
                        <h1>Control Tower</h1>
                        <p>Supply Chain Analytics</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-title">
                    {collapsed ? '•••' : 'Dashboards'}
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={isActive ? 'active' : ''}
                            title={collapsed ? item.label : undefined}
                            style={collapsed ? { justifyContent: 'center', padding: 'var(--space-2)' } : undefined}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            {!collapsed && item.label}
                        </Link>
                    );
                })}

                <div className="sidebar-section-title">
                    {collapsed ? '•••' : 'System'}
                </div>
                {systemItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={isActive ? 'active' : ''}
                            title={collapsed ? item.label : undefined}
                            style={collapsed ? { justifyContent: 'center', padding: 'var(--space-2)' } : undefined}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            {!collapsed && item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed((c) => !c)}
                className="btn btn-ghost"
                style={{
                    margin: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    justifyContent: 'center',
                }}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                {!collapsed && <span style={{ fontSize: 'var(--text-sm)' }}>Collapse</span>}
            </button>

            {/* User Profile */}
            {session?.user && (
                <div
                    style={{
                        padding: collapsed ? 'var(--space-3)' : 'var(--space-4)',
                        borderTop: '1px solid var(--border-default)',
                        background: 'var(--bg-secondary)',
                    }}
                >
                    {!collapsed && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                marginBottom: 'var(--space-3)',
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-primary)',
                                    flexShrink: 0,
                                }}
                            >
                                <UserCircle size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {session.user.name}
                                </div>
                                <div style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--text-tertiary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {session.user.email}
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="btn btn-danger"
                        style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            padding: 'var(--space-2)',
                            justifyContent: 'center',
                        }}
                    >
                        <LogOut size={14} />
                        {!collapsed && 'Sign Out'}
                    </button>
                </div>
            )}
        </aside>
    );
}
