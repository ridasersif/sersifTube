import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "primary" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 overflow-hidden transform transition-all scale-100">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-violet-500/10 text-violet-500'}`}>
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-400 font-bold hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        variant={variant}
                        className="px-8"
                    >
                        {confirmText}
                    </Button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
