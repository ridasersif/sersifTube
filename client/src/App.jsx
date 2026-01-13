import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Youtube, LayoutGrid, List, BarChart3 } from 'lucide-react';
import { UrlInput } from './components/UrlInput';
import { VideoItem } from './components/VideoItem';
import './index.css';

const socket = io('http://localhost:5000');
const API_URL = 'http://localhost:5000/api';

function App() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [selectedFormatId, setSelectedFormatId] = useState('');
  const [customPath, setCustomPath] = useState('');

  // Tasks state
  const [tasks, setTasks] = useState({
    queue: [],
    active: [],
    completed: []
  });

  // Re-fetch queue on mount
  useEffect(() => {
    fetchQueue();

    socket.on('progress', (updatedTask) => {
      updateTaskInState(updatedTask);
    });

    socket.on('taskAdded', (newTask) => {
      fetchQueue(); // Simplest way to sync order
    });

    socket.on('taskDeleted', ({ id }) => {
      fetchQueue();
    });

    return () => {
      socket.off('progress');
      socket.off('taskAdded');
      socket.off('taskDeleted');
    };
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`${API_URL}/queue`);
      // res.data has { queue, active, completed }
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  const updateTaskInState = (updatedTask) => {
    setTasks(prev => {
      // We need to intelligently update the task wherever it is
      // Or just lazy re-fetch if status changed meaningfully?
      // Let's try to update in place for performance
      const newActive = prev.active.map(t => t.id === updatedTask.id ? updatedTask : t);

      // If it wasn't in active, maybe it was in queue?
      // If status became 'downloading' from 'queued', it should move.
      // For simplicity in this "MVP pro", re-fetch if status changes to/from terminal states
      if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
        // Delay slightly to show 100% then move
        setTimeout(fetchQueue, 1000);
        return prev;
      }

      return {
        ...prev,
        active: newActive
      };
    });
  };

  // URL Analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        analyzeUrl(url);
      } else {
        setMetadata(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [url]);

  const analyzeUrl = async (targetUrl) => {
    setAnalyzing(true);
    setMetadata(null);
    try {
      const res = await axios.post(`${API_URL}/info`, { url: targetUrl });
      setMetadata(res.data);
      // Defaults
      setFormat('mp4');
      if (res.data.formats && res.data.formats.length > 0) {
        const best = res.data.formats.find(f => f.type === 'video')?.format_id || res.data.formats[0].format_id;
        setSelectedFormatId(best);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!metadata) return;

    try {
      await axios.post(`${API_URL}/download`, {
        url,
        options: {
          isAudio: format === 'mp3',
          formatId: selectedFormatId,
          title: metadata.title,
          isPlaylist: metadata.is_playlist,
          // If docker, customPath ignored by backend usually, but passed anyway
          outputPath: customPath
        }
      });

      // Clear input
      setUrl('');
      setMetadata(null);
      // Wait for socket to update queue
    } catch (err) {
      alert('Failed to start download: ' + err.message);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.post(`${API_URL}/cancel`, { id });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id, path) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.post(`${API_URL}/delete-file`, { id, path });
        fetchQueue();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleBrowse = async () => {
    try {
      const res = await axios.post(`${API_URL}/browse`);
      if (res.data.path) setCustomPath(res.data.path);
    } catch (e) {
      alert('Browse not available (or docker mode)');
    }
  };

  // Combine Active and Queue for display?
  // Or separate sections.
  const allActive = [...tasks.active, ...tasks.queue];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-violet-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-6xl mx-auto p-6 md:p-12">

        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-violet-500/20">
              <Youtube className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                sersif<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Tube</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">Professional Downloader</p>
            </div>
          </div>

          {/* Stats (Mock for now) */}
          <div className="hidden md:flex gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{tasks.completed.length}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Completed</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-violet-400">{tasks.queue.length + tasks.active.length}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active</div>
            </div>
          </div>
        </header>

        {/* Main Input Area */}
        <section className="mb-16">
          <UrlInput
            url={url}
            setUrl={setUrl}
            analyzing={analyzing}
            metadata={metadata}
            format={format}
            setFormat={setFormat}
            selectedFormatId={selectedFormatId}
            setSelectedFormatId={setSelectedFormatId}
            onDownload={handleDownload}
            customPath={customPath}
            onBrowse={handleBrowse}
          />
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Active Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <List className="text-violet-500" />
                Active Queue
              </h2>
              <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{allActive.length}</span>
            </div>

            <div className="space-y-3">
              {allActive.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                  <BarChart3 className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No active downloads</p>
                </div>
              ) : (
                allActive.map(task => (
                  <VideoItem
                    key={task.id}
                    task={task}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </div>
          </div>

          {/* History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2Icon className="text-emerald-500" />
                History
              </h2>
              <button
                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                onClick={() => setTasks(prev => ({ ...prev, completed: [] }))} // Local clear only for now
              >
                CLEAR ALL
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.completed.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                  <p>No history yet</p>
                </div>
              ) : (
                tasks.completed.slice().reverse().map(task => (
                  <VideoItem
                    key={task.id}
                    task={task}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Icon helper since I missed importing it
const CheckCircle2Icon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default App;
