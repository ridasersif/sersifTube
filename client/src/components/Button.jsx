import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', loading = false, disabled = false, className = '', ...props }) => {
    const baseStyle = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-violet-500/30",
        secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
        </button>
    );
};
