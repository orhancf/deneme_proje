'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
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

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>⚡ Control Tower</h1>
                <p>Supply Chain Analytics</p>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-title">Dashboards</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className={isActive ? 'active' : ''}>
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="sidebar-section-title">System</div>
                {systemItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className={isActive ? 'active' : ''}>
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            {session?.user && (
                <div className="mt-auto p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#111827]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <UserCircle size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{session.user.name}</div>
                            <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
}
