'use client';

import { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { exportToCsv, exportToPdf } from '@/lib/export';

interface Column {
    key: string;
    label: string;
}

interface DrillDownDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any[];
    columns: Column[];
}

export function DrillDownDrawer({ isOpen, onClose, title, data, columns }: DrillDownDrawerProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-[600px] max-w-full bg-[#111827] border-l border-[#2d3748] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.08)]">
                    <h2 className="text-xl font-semibold m-0">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Action Bar */}
                <div className="px-6 py-4 flex gap-3 border-b border-[rgba(255,255,255,0.05)] bg-[#1a2035]">
                    <button
                        onClick={() => exportToCsv(title.toLowerCase().replace(/\s+/g, '_'), data, columns)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1f2847] hover:bg-[#2d3748] border border-[#2d3748] rounded text-sm font-medium transition-colors"
                    >
                        <Download size={14} /> CSV
                    </button>
                    <button
                        onClick={() => exportToPdf(title, title.toLowerCase().replace(/\s+/g, '_'), data, columns)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1f2847] hover:bg-[#2d3748] border border-[#2d3748] rounded text-sm font-medium transition-colors"
                    >
                        <Download size={14} /> PDF
                    </button>
                    <div className="ml-auto text-sm text-gray-400 flex items-center">
                        {data.length} records
                    </div>
                </div>

                {/* Content Tabbed Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <table className="data-table w-full">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {row[col.key] !== null && row[col.key] !== undefined
                                                ? (typeof row[col.key] === 'number' && row[col.key] > 1000 ? row[col.key].toLocaleString() : String(row[col.key]))
                                                : '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                        No detailed data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
