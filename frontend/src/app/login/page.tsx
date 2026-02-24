'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const users = [
        { email: 'admin@scct.dev', name: 'Admin', role: 'ADMIN', color: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' },
        { email: 'director@scct.dev', name: 'Director', role: 'EXEC', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30' },
        { email: 'analyst@scct.dev', name: 'Analyst', role: 'ANALYST', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' },
        { email: 'viewer@scct.dev', name: 'Viewer', role: 'VIEWER', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]">
            <div className="w-full max-w-md p-8 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl backdrop-blur-md">

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Control Tower</h1>
                    <p className="text-gray-400 text-sm">Select a demo persona to continue</p>
                </div>

                <div className="space-y-3">
                    {users.map((u) => (
                        <button
                            key={u.email}
                            onClick={() => signIn('credentials', { email: u.email, password: 'password', callbackUrl: '/' })}
                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group ${u.color}`}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">{u.name}</span>
                                <span className="text-xs opacity-70 mt-1 font-mono">{u.email}</span>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-black/20 uppercase tracking-wider">
                                {u.role}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 text-center text-xs text-gray-500">
                    Authentication is mocked for demonstration purposes.<br />
                    In production, this would integrate with Okta or Azure AD.
                </div>
            </div>
        </div>
    );
}
