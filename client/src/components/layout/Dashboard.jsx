import React from 'react';
import { UrlInput } from '../UrlInput';
import { Activity, HardDrive, Zap, PlaySquare } from 'lucide-react';

export function Dashboard({ stats, ...props }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 to-indigo-900/20 border border-white/5 p-8 md:p-12 shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Zap size={10} className="fill-violet-400" />
                        Next Gen Engine
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Powerfully simple <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">media extraction.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                        Paste any link from YouTube, Facebook, Instagram, or TikTok. Support for 4K video and high-quality audio extraction.
                    </p>

                    <div className="bg-[#030712] p-2 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5">
                        <UrlInput {...props} />
                    </div>
                </div>

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={Activity}
                    label="Active Tasks"
                    value={stats.active}
                    color="text-violet-400"
                    bg="bg-violet-500/10"
                />
                <StatCard
                    icon={HardDrive}
                    label="Library Size"
                    value={stats.completed}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    icon={PlaySquare}
                    label="In-App Player"
                    value="Ready"
                    color="text-amber-400"
                    bg="bg-amber-500/10"
                />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all hover:-translate-y-1 duration-300">
            <div className={`p-3.5 rounded-xl ${bg}`}>
                <Icon className={color} size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-white mt-1">{value}</p>
            </div>
        </div>
    );
}
