import React, { useState, useEffect } from 'react';

// --- Icons ---
const UploadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const VideoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const PlayIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function RCAVideos() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editMode, setEditMode] = useState({ isEditing: false, id: null });

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, fileUrl: '', title: '' });

  const fetchVideos = () => {
    fetch('http://localhost:5000/api/rca/videos')
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error("Failed to fetch videos:", err));
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return setMsg({ type: 'error', text: 'Please provide a video title.' });
    if (!editMode.isEditing && !file) return setMsg({ type: 'error', text: 'Please select a video file to upload.' });

    setIsLoading(true);
    setMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('title', title);
    if (file) formData.append('video', file); // Matches upload.single('video') in backend

    const url = editMode.isEditing 
      ? `http://localhost:5000/api/rca/videos/${editMode.id}` 
      : 'http://localhost:5000/api/rca/videos';
    
    const method = editMode.isEditing ? 'PUT' : 'POST';

    fetch(url, { method, body: formData })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.error) return setMsg({ type: 'error', text: data.error });
        
        setMsg({ type: 'success', text: editMode.isEditing ? 'Video updated successfully!' : 'Video uploaded successfully!' });
        handleCancelEdit();
        fetchVideos();
      })
      .catch(() => {
        setIsLoading(false);
        setMsg({ type: 'error', text: 'Server connection failed.' });
      });
  };

  const handleEditClick = (vid) => {
    setEditMode({ isEditing: true, id: vid.id });
    setTitle(vid.title);
    setFile(null); // Reset file input
    document.getElementById('video-upload').value = ''; 
    setMsg({ type: 'info', text: 'Editing mode active. You can update the title, or select a new video to overwrite the old one.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditMode({ isEditing: false, id: null });
    setTitle('');
    setFile(null);
    document.getElementById('video-upload').value = ''; 
    if (msg.type === 'info') setMsg({ type: '', text: '' });
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this video? This cannot be undone.")) {
      fetch(`http://localhost:5000/api/rca/videos/${id}`, { method: 'DELETE' })
        .then(() => {
          if (editMode.id === id) handleCancelEdit();
          fetchVideos();
        });
    }
  };

  // --- Filter Videos via Search Input ---
  const filteredVideos = videos.filter(vid => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vid.title.toLowerCase().includes(searchLower) ||
      vid.uploadDate.toLowerCase().includes(searchLower)
    );
  });

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      
      {/* Upload/Edit Section */}
      <div className={`bg-white rounded-2xl shadow-sm border p-8 transition-all ${editMode.isEditing ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <VideoIcon /> {editMode.isEditing ? 'Modify Analysis Video' : 'Upload Analysis Video'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage MP4 video files to document root cause visual evidence.</p>
          </div>
          {editMode.isEditing && (
            <button onClick={handleCancelEdit} className="text-sm font-bold text-rose-500 hover:bg-rose-100 px-4 py-2 bg-rose-50 rounded-lg transition-colors">
              Cancel Edit
            </button>
          )}
        </div>
        
        {msg.text && (
          <div className={`p-3 rounded-xl mb-6 text-sm font-medium text-center ${
            msg.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
            msg.type === 'info' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
            'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Video Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Paint Shop Robot Alignment Issue" className={inputClass} />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {editMode.isEditing ? 'Replace Video (Optional)' : 'Video File (MP4)'}
            </label>
            <input id="video-upload" type="file" accept="video/mp4,video/x-m4v,video/*" onChange={(e) => setFile(e.target.files[0])} required={!editMode.isEditing} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${editMode.isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              <UploadIcon /> {isLoading ? 'Processing...' : editMode.isEditing ? 'Save Changes' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>

      {/* Library Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Interactive Search Header */}
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Media Library</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total Videos: <span className="font-bold text-indigo-600">{filteredVideos.length}</span></p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              <th className="py-4 px-8 w-1/2">Video Title</th>
              <th className="py-4 px-8">Upload Date</th>
              <th className="py-4 px-8 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVideos.map((vid) => (
              <tr key={vid.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-8 font-medium text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200"><VideoIcon /></div>
                  {vid.title}
                </td>
                <td className="py-4 px-8 text-slate-500">{vid.uploadDate}</td>
                <td className="py-4 px-8 flex justify-center gap-3">
                  <button onClick={() => setViewModal({ isOpen: true, fileUrl: `http://localhost:5000/uploads/videos/${vid.filename}`, title: vid.title })} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Play Video">
                    <PlayIcon />
                  </button>
                  <button onClick={() => handleEditClick(vid)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Record">
                    <EditIcon />
                  </button>
                  <button onClick={() => handleDelete(vid.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredVideos.length === 0 && (
              <tr>
                <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                  {videos.length === 0 ? "No videos uploaded yet." : "No videos found matching your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Video View Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
          <div className="bg-black rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <h3 className="font-bold text-slate-200 flex items-center gap-2"><VideoIcon /> {viewModal.title}</h3>
              <button onClick={() => setViewModal({ isOpen: false, fileUrl: '', title: '' })} className="bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            <div className="bg-black flex items-center justify-center p-4">
              <video 
                controls 
                autoPlay 
                className="max-w-full max-h-[75vh] rounded-lg shadow-2xl"
                src={viewModal.fileUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}