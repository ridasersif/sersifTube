import React from 'react';
import { Search, Loader2, Youtube, PlaySquare, Folder } from 'lucide-react';
import { Button } from './Button';

export const UrlInput = ({
    url,
    setUrl,
    analyzing,
    downloading,
    metadata,
    format,
    setFormat,
    selectedFormatId,
    setSelectedFormatId,
    onDownload,
    customPath,
    onBrowse
}) => {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">

            {/* Input Field */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                <div className="relative flex items-center bg-slate-900 rounded-xl p-2">
                    <div className="pl-4 pr-2 text-slate-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 py-3 px-2"
                        placeholder="Paste YouTube Link (Video or Playlist)..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    {analyzing && (
                        <div className="pr-4">
                            <Loader2 className="animate-spin text-violet-500" size={20} />
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata Card */}
            {metadata && (
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Thumbnail */}
                        <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden shadow-2xl group">
                            <img src={metadata.thumbnail} alt={metadata.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                            {metadata.duration > 0 && (
                                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                                    {Math.floor(metadata.duration / 60)}:{String(metadata.duration % 60).padStart(2, '0')}
                                </div>
                            )}
                            {metadata.is_playlist && (
                                <div className="absolute top-2 right-2 bg-violet-600 shadow-lg shadow-violet-600/20 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                    <PlaySquare size={12} /> Playlist ({metadata.entry_count})
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight mb-1 line-clamp-2">{metadata.title}</h2>
                                <p className="text-slate-400 text-sm font-medium">{metadata.uploader}</p>
                            </div>

                            {/* Controls Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Format */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format</label>
                                    <div className="flex bg-slate-800 rounded-lg p-1">
                                        <button
                                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${format === 'mp4' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                            onClick={() => setFormat('mp4')}
                                        >
                                            Video
                                        </button>
                                        <button
                                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${format === 'mp3' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                            onClick={() => setFormat('mp3')}
                                        >
                                            Audio
                                        </button>
                                    </div>
                                </div>

                                {/* Quality (Video only) */}
                                {format === 'mp4' && !metadata.is_playlist && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quality</label>
                                        <select
                                            className="w-full bg-slate-800 text-white text-sm font-medium rounded-lg px-3 py-2 border border-slate-700 outline-none focus:border-violet-500 transition-colors"
                                            value={selectedFormatId}
                                            onChange={(e) => setSelectedFormatId(e.target.value)}
                                        >
                                            <option value="">Best Available</option>
                                            {metadata.formats?.map(f => (
                                                <option key={f.format_id} value={f.format_id}>
                                                    {f.resolution} {f.filesize ? `(${Math.round(f.filesize / 1024 / 1024)}MB)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Path & Action */}
                            <div className="pt-2 flex items-center gap-3">
                                <div
                                    className="flex-1 flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-pointer hover:bg-slate-800 transition-colors"
                                    onClick={onBrowse}
                                >
                                    <Folder size={16} />
                                    <span className="truncate">{customPath || 'Default Downloads Folder'}</span>
                                </div>

                                <Button
                                    onClick={onDownload}
                                    className="px-8 whitespace-nowrap"
                                    loading={downloading}
                                    disabled={downloading}
                                >
                                    Download Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
