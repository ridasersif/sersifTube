import React from 'react';
import {
    Play,
    Pause,
    X,
    Trash2,
    Video,
    Music,
    Loader2,
    CheckCircle2,
    PlayCircle,
    AlertCircle
} from 'lucide-react';

export const VideoItem = ({ task, onCancel, onDelete, onPause, onResume, onPlay }) => {
    const isCompleted = task.status === 'completed';
    const isFailed = task.status === 'failed';
    const isDownloading = task.status === 'downloading' || task.status === 'starting';
    const isQueued = task.status === 'queued';
    const isPaused = task.status === 'paused';

    return (
        <div className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 transition-all hover:bg-slate-800/50 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 shadow-inner group-hover:ring-2 ring-violet-500/50 transition-all">
                    {task.thumbnail ? (
                        <img src={task.thumbnail} alt={task.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                            {task.options?.isAudio ? <Music size={24} /> : <Video size={24} />}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    {/* Format Badge */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-sm">
                        {task.options?.isAudio ? 'MP3' : 'MP4'}
                    </div>

                    {/* Play Overlay */}
                    {isCompleted && onPlay && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-violet-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => onPlay(task)}
                        >
                            <PlayCircle className="text-white drop-shadow-lg" size={32} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-bold text-slate-100 truncate text-sm mb-2 pr-2 leading-tight group-hover:text-white transition-colors" title={task.title}>
                        {task.title}
                    </h3>

                    {/* Progress Bar Container */}
                    {(isDownloading || isPaused || isQueued) && (
                        <div className="relative h-1.5 bg-slate-800/80 rounded-full overflow-hidden w-full mb-2">
                            <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 transition-all duration-500 ease-out ${isPaused ? 'opacity-40' : ''}`}
                                style={{ width: `${task.progress || 0}%` }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
                        <span className={`flex items-center gap-1.5 ${isCompleted ? 'text-emerald-400' :
                                isFailed ? 'text-red-400' :
                                    isPaused ? 'text-amber-400' :
                                        'text-violet-400'
                            }`}>
                            {isCompleted && <CheckCircle2 size={12} />}
                            {isFailed && <AlertCircle size={12} />}
                            {isPaused && <Pause size={12} className="fill-amber-400/20" />}
                            {isDownloading && <Loader2 size={12} className="animate-spin" />}

                            {isCompleted ? 'Finished' :
                                isFailed ? 'Error' :
                                    isQueued ? 'Queued' :
                                        isPaused ? `Paused • ${Math.round(task.progress || 0)}%` :
                                            `Loading • ${Math.round(task.progress || 0)}%`}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isDownloading && onPause && (
                        <button onClick={() => onPause(task.id)} className="p-2 rounded-xl hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 transition-all">
                            <Pause size={18} />
                        </button>
                    )}
                    {isPaused && onResume && (
                        <button onClick={() => onResume(task.id)} className="p-2 rounded-xl hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all">
                            <Play size={18} />
                        </button>
                    )}
                    {!isCompleted && !isFailed && (
                        <button onClick={() => onCancel(task.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                            <X size={18} />
                        </button>
                    )}
                    {isCompleted && (
                        <button onClick={() => onDelete(task.id, task.result?.path)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
