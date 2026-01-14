import React from 'react';
import { X, Maximize, Volume2, Play, Pause } from 'lucide-react';

export function VideoPlayer({ video, onClose }) {
    if (!video) return null;

    // Stream URL via server API
    const videoUrl = `http://localhost:5000/api/stream?path=${encodeURIComponent(video.result?.path)}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                {/* Header Controls */}
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent">
                    <h3 className="font-bold text-lg truncate pr-12">{video.title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Video Tag */}
                <video
                    controls
                    className="w-full h-full"
                    autoPlay
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Overlay Message for empty paths or errors */}
                {!video.result?.path && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        File path not found.
                    </div>
                )}
            </div>
        </div>
    );
}
