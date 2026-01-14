import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Sidebar, Navbar } from './components/layout/Sidebar';
import { Dashboard } from './components/layout/Dashboard';
import { VideoItem } from './components/VideoItem';
import { VideoPlayer } from './components/player/VideoPlayer';
import { Modal } from './components/Modal';
import { api } from './services/api';
import './index.css';

const socket = io('http://localhost:5000');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, path: null });

  // Input states
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [selectedFormatId, setSelectedFormatId] = useState('');
  const [playlistQuality, setPlaylistQuality] = useState('best');
  const [customPath, setCustomPath] = useState('');

  // Tasks state
  const [tasks, setTasks] = useState({
    queue: [],
    active: [],
    paused: [],
    completed: []
  });

  // Re-fetch queue on mount
  useEffect(() => {
    fetchQueue();

    socket.on('progress', updateTaskInState);
    socket.on('taskAdded', fetchQueue);
    socket.on('taskDeleted', fetchQueue);

    return () => {
      socket.off('progress');
      socket.off('taskAdded');
      socket.off('taskDeleted');
    };
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.getQueue();
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  const updateTaskInState = (updatedTask) => {
    setTasks(prev => {
      const isTerminal = ['completed', 'failed', 'cancelled'].includes(updatedTask.status);

      if (isTerminal) {
        setTimeout(fetchQueue, 1000);
      }

      // Update active list optimistically
      const newActive = prev.active.map(t => t.id === updatedTask.id ? updatedTask : t);
      if (prev.active.find(t => t.id === updatedTask.id)) {
        return { ...prev, active: newActive };
      }

      return prev;
    });
  };

  // URL Analysis (optimized for speed)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url && (url.includes('http') || url.includes('www'))) {
        analyzeUrl(url);
      } else {
        setMetadata(null);
      }
    }, 400); // Reduced from 800ms for faster response
    return () => clearTimeout(timer);
  }, [url]);

  const analyzeUrl = async (targetUrl) => {
    setAnalyzing(true);
    setMetadata(null);
    try {
      const res = await api.getInfo(targetUrl);
      setMetadata(res.data);
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
    if (!metadata || downloading) return;

    setDownloading(true);
    try {
      await api.download({
        url,
        options: {
          isAudio: format === 'mp3',
          formatId: selectedFormatId,
          playlistQuality: playlistQuality,
          title: metadata.title,
          isPlaylist: metadata.is_playlist,
          outputPath: customPath
        }
      });
      setUrl('');
      setMetadata(null);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePause = async (id) => {
    await api.pause(id);
    fetchQueue();
  };

  const handleResume = async (id) => {
    await api.resume(id);
    fetchQueue();
  };

  const handleCancel = async (id) => {
    await api.cancel(id);
    fetchQueue();
  };

  const handleDelete = async (id, path) => {
    setDeleteModal({ isOpen: true, id, path });
  };

  const confirmDelete = async () => {
    if (deleteModal.id) {
      await api.deleteFile(deleteModal.id, deleteModal.path);
      fetchQueue();
    }
  };

  const handleBrowse = async () => {
    try {
      const res = await api.browse();
      if (res.data.path) setCustomPath(res.data.path);
    } catch (e) {
      alert('Browse not available');
    }
  };

  const allActive = [...tasks.active, ...tasks.queue, ...tasks.paused];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-violet-500/30 flex overflow-hidden">

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[128px]" />
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden transition-all duration-300 md:ml-64">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 custom-scrollbar">
          <div className="max-w-5xl mx-auto">

            {activeTab === 'dashboard' && (
              <Dashboard
                stats={{
                  active: tasks.active.length,
                  completed: tasks.completed.length
                }}
                url={url}
                setUrl={setUrl}
                analyzing={analyzing}
                downloading={downloading}
                metadata={metadata}
                format={format}
                setFormat={setFormat}
                selectedFormatId={selectedFormatId}
                setSelectedFormatId={setSelectedFormatId}
                playlistQuality={playlistQuality}
                setPlaylistQuality={setPlaylistQuality}
                customPath={customPath}
                onBrowse={handleBrowse}
                onDownload={handleDownload}
              />
            )}

            {activeTab === 'dashboard' && (
              <div className="mt-12 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-violet-500 rounded-full" />
                  Active Downloads
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {allActive.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-white/5 bg-white/5 rounded-3xl text-center text-slate-500 text-sm">
                      Your queue is empty.
                    </div>
                  ) : (
                    allActive.map(task => (
                      <VideoItem
                        key={task.id}
                        task={task}
                        onCancel={handleCancel}
                        onPause={handlePause}
                        onResume={handleResume}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'downloads' || activeTab === 'library') && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Library</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.completed.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5">No downloads yet.</p>
                  ) : (
                    tasks.completed.slice().reverse().map(task => (
                      <VideoItem
                        key={task.id}
                        task={task}
                        onDelete={handleDelete}
                        onPlay={setPlayingVideo}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete File?"
        message="This will permanently remove the media file from your server. This action cannot be undone."
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}

export default App;
