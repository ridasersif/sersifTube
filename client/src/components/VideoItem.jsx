import React from 'react';
import { Play, Pause, X, Trash2, Video, Music, Loader2, CheckCircle2 } from 'lucide-react';

export const VideoItem = ({ task, onCancel, onDelete, onRetry }) => {
    const isCompleted = task.status === 'completed';
    const isFailed = task.status === 'failed';
    const isDownloading = task.status === 'downloading' || task.status === 'starting';
    const isQueued = task.status === 'queued';

    return (
        <div className="group relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 transition-all hover:bg-slate-800/50 hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/5">
            <div className="flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                    {task.thumbnail ? (
                        <img src={task.thumbnail} alt={task.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Video size={20} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Type Badge */}
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm p-1 rounded text-[10px] font-bold text-white uppercase">
                        {task.options?.isAudio ? 'MP3' : 'MP4'}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100 truncate text-sm mb-1">{task.title}</h3>

                    {/* Status Bar */}
                    <div className="flex items-center gap-3 text-xs">
                        {isDownloading && (
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                                    style={{ width: `${task.progress || 0}%` }}
                                />
                            </div>
                        )}

                        <span className={`font-medium ${isCompleted ? 'text-emerald-400' :
                                isFailed ? 'text-red-400' :
                                    isQueued ? 'text-amber-400' :
                                        'text-violet-400'
                            }`}>
                            {isCompleted ? 'Completed' :
                                isFailed ? 'Failed' :
                                    isQueued ? 'Queued' :
                                        `${Math.round(task.progress || 0)}%`}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isDownloading && (
                        <button
                            onClick={() => onCancel(task.id)}
                            className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Stop Download"
                        >
                            <X size={18} />
                        </button>
                    )}

                    {isQueued && (
                        <button
                            onClick={() => onCancel(task.id)}
                            className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Remove from Queue"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}

                    {(isCompleted || isFailed) && (
                        <button
                            onClick={() => onDelete(task.id, task.result?.path)}
                            className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
