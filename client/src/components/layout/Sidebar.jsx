import React from 'react';
import {
    LayoutDashboard,
    Folders,
    Settings,
    Menu,
    X,
    Zap,
    Youtube,
    Shield
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'library', icon: Folders, label: 'Library' },
        { id: 'downloads', icon: Zap, label: 'Downloads' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 z-50
                transition-transform duration-300 md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-12 px-2">
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/10">
                            <Youtube className="text-white" size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-white">
                            sersif<span className="text-violet-400">Tube</span>
                        </h1>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (window.innerWidth < 768) setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${activeTab === item.id
                                        ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                                `}
                            >
                                <item.icon size={20} />
                                <span className="font-semibold text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Footer Stats/Settings */}
                    <div className="mt-auto space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
                                <Shield size={12} />
                                System Protected
                            </div>
                            <p className="text-slate-500 text-[10px] leading-relaxed">
                                End-to-end encrypted connection to yt-dlp core.
                            </p>
                        </div>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                            <Settings size={20} />
                            <span className="font-semibold text-sm">Settings</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export function Navbar({ toggleSidebar }) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 z-30 md:left-64">
            <div className="h-full flex items-center justify-between px-6 lg:px-8">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-400 hover:text-white md:hidden"
                >
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest ml-auto md:ml-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Server Status: Optimal
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-white">Sersif pc</span>
                        <span className="text-[10px] text-slate-500">Premium User</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white/10">
                        S
                    </div>
                </div>
            </div>
        </header>
    );
}
