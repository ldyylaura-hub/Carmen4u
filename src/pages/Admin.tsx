import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Upload, Calendar, Star, Trash2, Check, X, Image as ImageIcon, Plus, Home, Layers, MessageSquare, Shield, GripVertical } from 'lucide-react';
import { Album, MediaCategory, MediaItem, TimelineEvent, Charm } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'gallery' | 'timeline' | 'approvals' | 'reports'>('home');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check role in public.users
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (data?.role === 'admin') {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pink-50/30 text-pink-600 font-bold">Loading...</div>;

  console.log('Admin Render:', { isAdmin, activeTab });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
        <p className="text-slate-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-pink-50/30 font-sans">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
            <Shield className="text-pink-500" size={32} />
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap gap-2 justify-center">
            <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={18} />} label="Home" />
            <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={<Layers size={18} />} label="Gallery" />
            <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar size={18} />} label="Timeline" />
            <TabButton active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} icon={<Check size={18} />} label="Approvals" />
            <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<Shield size={18} />} label="Reports" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-pink-100 min-h-[500px]">
          {activeTab === 'home' && <HomeManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'timeline' && <TimelineManager />}
          {activeTab === 'approvals' && <ApprovalsManager />}
          {activeTab === 'reports' && <ReportsManager />}
        </div>
      </div>
    </div>
  );
}

function ReportsManager() {
  const [reports, setReports] = useState<Array<{
    id: string;
    created_at: string;
    reason: string;
    status: string;
    post_id: string;
    post?: { title: string; content: string } | null;
    reporter?: { nickname: string } | null;
  }>>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Join with posts and reporter
    const { data } = await supabase.from('forum_reports')
      .select('*, post:forum_posts(title, content), reporter:users(nickname)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  const resolveReport = async (id: string) => {
    await supabase.from('forum_reports').update({ status: 'resolved' }).eq('id', id);
    fetchReports();
  };

  const dismissReport = async (id: string) => {
    await supabase.from('forum_reports').update({ status: 'dismissed' }).eq('id', id);
    fetchReports();
  };

  const deletePost = async (postId: string, reportId: string) => {
      if(!confirm('Delete this reported post?')) return;
      await supabase.from('forum_posts').delete().eq('id', postId);
      await resolveReport(reportId); // Auto resolve report as post is gone
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2"><Shield size={20} /> Reported Content</h3>
      {reports.length === 0 ? <p className="text-slate-400 italic">No pending reports.</p> : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
               <div className="flex gap-2 items-center mb-2">
                   <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase">Report</span>
                   <span className="text-slate-500 text-sm">by {report.reporter?.nickname || 'Unknown'}</span>
                   <span className="text-slate-400 text-xs ml-auto">{new Date(report.created_at).toLocaleString()}</span>
               </div>
               <p className="font-bold text-slate-800 mb-1">Reason: <span className="text-red-500">{report.reason}</span></p>
               
               <div className="bg-slate-50 p-4 rounded-lg my-4 border border-slate-100">
                   <h4 className="font-bold text-slate-700 mb-1">{report.post?.title || 'Post Deleted'}</h4>
                   <p className="text-slate-600 text-sm line-clamp-2">{report.post?.content}</p>
               </div>

               <div className="flex gap-2 justify-end">
                   <button onClick={() => dismissReport(report.id)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold">Dismiss</button>
                   <button onClick={() => resolveReport(report.id)} className="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-200">Mark Resolved</button>
                   <button onClick={() => deletePost(report.post_id, report.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 flex items-center gap-2"><Trash2 size={16} /> Delete Post</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
        active ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-white text-slate-600 hover:bg-pink-50 border border-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// --- Home Manager ---
function HomeManager() {
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGreetingVideo();
  }, []);

  const fetchGreetingVideo = async () => {
    // We now fetch an array of strings
    const { data } = await supabase.from('home_content').select('value').eq('key', 'greeting_videos').single();
    if (data && data.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) setVideoUrls(parsed);
        else setVideoUrls([data.value]); // Backward compatibility
      } catch {
        setVideoUrls([data.value]); // If not JSON, treat as single string
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `greeting-video-${Date.now()}-${i}.${fileExt}`;
        const filePath = `home/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('gallery_uploads').upload(filePath, file);
        
        if (uploadError) {
          // Fallback to media
          const { error: retryError } = await supabase.storage.from('media').upload(filePath, file);
          if (!retryError) {
             const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
             newUrls.push(publicUrl);
          }
        } else {
            const { data: { publicUrl } } = supabase.storage.from('gallery_uploads').getPublicUrl(filePath);
            newUrls.push(publicUrl);
        }
    }

    if (newUrls.length > 0) {
        // Append new URLs to existing ones
        const updatedList = [...videoUrls, ...newUrls];
        await saveToDb(updatedList);
    }
    
    setUploading(false);
  };

  const saveToDb = async (urls: string[]) => {
    const { error: dbError } = await supabase.from('home_content').upsert({
      key: 'greeting_videos', // Changed key to plural
      value: JSON.stringify(urls), // Store as JSON string
      updated_at: new Date().toISOString()
    });

    if (dbError) alert('Database update failed: ' + dbError.message);
    else {
      setVideoUrls(urls);
      alert('Greeting videos updated successfully!');
    }
  };

  const removeVideo = async (indexToRemove: number) => {
      if(!confirm('Remove this video?')) return;
      const newList = videoUrls.filter((_, idx) => idx !== indexToRemove);
      await saveToDb(newList);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
        <Home className="text-pink-500" /> Home Page Content
      </h2>
      
      <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
        <h3 className="font-bold text-slate-700 mb-4">Greeting Videos (Sequential Play)</h3>
        
        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {videoUrls.map((url, idx) => (
            <div key={idx} className="relative group">
                <video src={url} controls className="w-full aspect-video rounded-xl shadow-md bg-black" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => removeVideo(idx)} className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600">
                        <Trash2 size={16} />
                    </button>
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    Sequence: {idx + 1}
                </div>
            </div>
          ))}
          {videoUrls.length === 0 && (
             <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
              No videos set
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="bg-white border-2 border-dashed border-pink-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 transition-colors">
            <Upload className="text-pink-400 mb-2" size={32} />
            <span className="font-bold text-slate-600">{uploading ? 'Uploading...' : 'Click to Upload New Videos (Multiple allowed)'}</span>
            <input type="file" accept="video/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}

// --- Gallery Manager ---
function GalleryManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    // Sort by display_order first, then created_at
    const { data } = await supabase.from('albums').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });
    if (data) setAlbums(data as Album[]);
  };

  const deleteAlbum = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await supabase.from('media_items').delete().eq('album_id', id);
    await supabase.from('albums').delete().eq('id', id);
    fetchAlbums();
    setSelectedAlbum(null);
  };

  const handleDragEnd = async (result: DropResult) => {
      if (!result.destination) return;
      
      const items = Array.from(albums);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      setAlbums(items); // Optimistic update

      // Update order in DB
      // Note: This is a simple implementation. For large lists, we should use a more efficient algorithm.
      // But for a personal site, updating all is fine.
      const updates = items.map((item, index) => ({
          id: item.id,
          display_order: index,
          title: item.title // Required for upsert sometimes, but let's try minimal update
      }));

      for (const update of updates) {
          await supabase.from('albums').update({ display_order: update.display_order }).eq('id', update.id);
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
          <Layers className="text-pink-500" /> Gallery Albums
        </h2>
        {!selectedAlbum && (
          <button 
            onClick={() => setShowCreateAlbum(!showCreateAlbum)}
            className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-pink-600"
          >
            <Plus size={18} /> New Album
          </button>
        )}
      </div>

      {showCreateAlbum && !selectedAlbum && (
        <CreateAlbumForm onComplete={() => { setShowCreateAlbum(false); fetchAlbums(); }} onCancel={() => setShowCreateAlbum(false)} />
      )}

      {selectedAlbum ? (
        <AlbumDetail album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="albums" direction="horizontal">
                {(provided) => (
                    <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                    {albums.map((album, index) => (
                        <Draggable key={album.id} draggableId={album.id} index={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="relative group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
                                >
                                    <div className="absolute top-2 left-2 z-10 bg-black/30 text-white p-1 rounded cursor-grab active:cursor-grabbing">
                                        <GripVertical size={16} />
                                    </div>

                                    {/* Delete Button (Only visible on hover) */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent opening the album
                                            deleteAlbum(album.id, album.title);
                                        }}
                                        className="absolute top-2 right-2 z-10 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                        title="Delete Album"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div onClick={() => setSelectedAlbum(album)} className="cursor-pointer">
                                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                        {album.cover_url ? (
                                            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon size={48} /></div>
                                        )}
                                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            {album.category}
                                        </div>
                                        </div>
                                        <div className="p-4">
                                        <h3 className="font-bold text-slate-800 text-lg">{album.title}</h3>
                                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">{album.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

function CreateAlbumForm({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MediaCategory>('concept');
  const [desc, setDesc] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let coverUrl = null;
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const filePath = `covers/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('gallery_uploads').upload(filePath, coverFile);
      if (!error) {
        const { data } = supabase.storage.from('gallery_uploads').getPublicUrl(filePath);
        coverUrl = data.publicUrl;
      } else {
         // Fallback to 'media' bucket
         const { error: retryError } = await supabase.storage.from('media').upload(filePath, coverFile);
         if (!retryError) {
            const { data } = supabase.storage.from('media').getPublicUrl(filePath);
            coverUrl = data.publicUrl;
         }
      }
    }

    const { error } = await supabase.from('albums').insert({
      title,
      category,
      description: desc,
      cover_url: coverUrl
    });

    setUploading(false);
    if (error) alert(error.message);
    else onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Album Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded-lg border border-pink-200" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as MediaCategory)} className="w-full p-2 rounded-lg border border-pink-200">
            <option value="concept">Concept Photos</option>
            <option value="poster">Posters</option>
            <option value="mv">Music Video</option>
            <option value="fancam">Fancam</option>
            <option value="cut">Personal Cut</option>
            <option value="activity">Activity / Event</option>
            <option value="bingping">Bingping 🧸</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Description (Era/Info)</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-2 rounded-lg border border-pink-200" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="w-full" />
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
          <button type="submit" disabled={uploading} className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold">
            {uploading ? 'Creating...' : 'Create Album'}
          </button>
        </div>
      </div>
    </form>
  );
}

function AlbumDetail({ album, onBack }: { album: Album; onBack: () => void }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchMedia();
  }, [album.id]);

  const startEdit = () => {
    setEditTitle(album.title);
    setEditDesc(album.description || '');
    setIsEditing(true);
  };

  const saveEdit = async () => {
    await supabase.from('albums').update({
        title: editTitle,
        description: editDesc
    }).eq('id', album.id);
    setIsEditing(false);
    // Refresh parent or local state (simplified here to just close)
    album.title = editTitle;
    album.description = editDesc;
  };

  const fetchMedia = async () => {
    const { data } = await supabase.from('media_items').select('*').eq('album_id', album.id).order('created_at', { ascending: false });
    if (data) setMedia(data as MediaItem[]);
  };

  return (
    <div>
      <button onClick={onBack} className="text-slate-500 hover:text-pink-500 font-bold mb-4 flex items-center gap-1">← Back to Albums</button>
      <div className="flex justify-between items-start mb-6">
        {isEditing ? (
            <div className="flex-1 mr-4 bg-pink-50 p-4 rounded-xl border border-pink-200">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-xl font-bold mb-2 p-1 border rounded" />
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full p-1 border rounded h-20" />
                <div className="flex gap-2 mt-2">
                    <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded font-bold">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-slate-500">Cancel</button>
                </div>
            </div>
        ) : (
            <div>
              <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">{album.title}</h3>
                  <button onClick={startEdit} className="text-slate-400 hover:text-pink-500"><MessageSquare size={16} /></button>
              </div>
              <p className="text-slate-500">{album.category} • {album.description}</p>
            </div>
        )}
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-pink-600"
        >
          <Upload size={18} /> Upload Media
        </button>
      </div>

      {showUpload && <UploadMediaForm albumId={album.id} onComplete={() => { setShowUpload(false); fetchMedia(); }} />}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.map(item => (
          <div key={item.id} className="relative group aspect-square bg-slate-100 rounded-xl overflow-hidden">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-2 opacity-0 group-hover:opacity-100">
              <p className="text-white text-xs truncate w-full">{item.title}</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
              <button onClick={async () => {
                 if (confirm('Delete this item?')) {
                   await supabase.from('media_items').delete().eq('id', item.id);
                   fetchMedia();
                 }
              }} className="bg-red-500 text-white p-1 rounded-full"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadMediaForm({ albumId, onComplete }: { albumId: string; onComplete: () => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [era, setEra] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const filePath = `album-media/${albumId}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: upErr } = await supabase.storage.from('gallery_uploads').upload(filePath, file);
      
      let finalUrl = '';
      if (!upErr) {
        const { data } = supabase.storage.from('gallery_uploads').getPublicUrl(filePath);
        finalUrl = data.publicUrl;
      } else {
         // Fallback
         const { error: retryError } = await supabase.storage.from('media').upload(filePath, file);
         if (!retryError) {
            const { data } = supabase.storage.from('media').getPublicUrl(filePath);
            finalUrl = data.publicUrl;
         }
      }

      if (finalUrl) {
        await supabase.from('media_items').insert({
          album_id: albumId,
          title: file.name,
          type: file.type.startsWith('video') ? 'video' : 'photo',
          url: finalUrl,
          status: 'approved',
          metadata: { era }
        });
      }
    }
    setUploading(false);
    onComplete();
  };

  return (
    <form onSubmit={handleUpload} className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 mb-6">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-1">Batch Era/Tag (Optional)</label>
          <input 
            value={era} 
            onChange={e => setEra(e.target.value)} 
            placeholder="e.g. The Chase Era" 
            className="w-full p-2 bg-white rounded-lg border border-pink-200" 
          />
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-600 mb-1">Select Files (Images/Videos)</label>
            <input type="file" multiple onChange={e => setFiles(e.target.files)} className="w-full p-2 bg-white rounded-lg border border-pink-200" />
          </div>
          <button type="submit" disabled={uploading} className="bg-pink-500 text-white px-6 py-2.5 rounded-lg font-bold">
            {uploading ? 'Uploading...' : 'Upload All'}
          </button>
        </div>
      </div>
    </form>
  );
}

// --- Timeline Manager ---
function TimelineManager() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchAlbums();
  }, []);

  const fetchEvents = async () => {
    // Sort by display_order first, then date
    const { data } = await supabase.from('timeline_events').select('*').order('display_order', { ascending: true }).order('event_date', { ascending: false });
    if (data) setEvents(data);
  };
  
  const fetchAlbums = async () => {
    const { data } = await supabase.from('albums').select('id, title').order('created_at', { ascending: false });
    if (data) setAlbums(data as Album[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let coverUrl = null;
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const filePath = `timeline/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('gallery_uploads').upload(filePath, coverFile);
      if (!error) {
        const { data } = supabase.storage.from('gallery_uploads').getPublicUrl(filePath);
        coverUrl = data.publicUrl;
      } else {
         // Fallback
         const { error: retryError } = await supabase.storage.from('media').upload(filePath, coverFile);
         if (!retryError) {
            const { data } = supabase.storage.from('media').getPublicUrl(filePath);
            coverUrl = data.publicUrl;
         }
      }
    }

    const { error } = await supabase.from('timeline_events').insert({
      title,
      event_date: date,
      description: desc,
      album_id: albumId || null,
      cover_url: coverUrl
    });

    if (error) alert(error.message);
    else {
      setTitle(''); setDate(''); setDesc(''); setAlbumId(''); setCoverFile(null);
      fetchEvents();
      // Reset form mode (if we were editing)
      setEditingEventId(null);
    }
    setUploading(false);
  };

  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const startEditEvent = (event: TimelineEvent) => {
      setTitle(event.title);
      setDate(event.event_date);
      setDesc(event.description || '');
      setAlbumId(event.album_id || '');
      setEditingEventId(event.id);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDragEnd = async (result: DropResult) => {
      if (!result.destination) return;
      
      const items = Array.from(events);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      setEvents(items); // Optimistic update

      // Update order in DB
      const updates = items.map((item, index) => ({
          id: item.id,
          display_order: index
      }));

      for (const update of updates) {
          await supabase.from('timeline_events').update({ display_order: update.display_order }).eq('id', update.id);
      }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
            <Plus /> {editingEventId ? 'Edit Event' : 'Add Event'}
        </h2>
        <form onSubmit={async (e) => {
            e.preventDefault();
            if (editingEventId) {
                // Update Logic
                setUploading(true);
                const updateData: { title: string; event_date: string; description: string; album_id: string | null; cover_url?: string } = {
                    title, event_date: date, description: desc, album_id: albumId || null
                };
                
                if (coverFile) {
                    // Upload new cover logic... (simplified duplication from insert)
                    const fileExt = coverFile.name.split('.').pop();
                    const filePath = `timeline/${Date.now()}.${fileExt}`;
                    const { error } = await supabase.storage.from('gallery_uploads').upload(filePath, coverFile);
                    if (!error) {
                        const { data } = supabase.storage.from('gallery_uploads').getPublicUrl(filePath);
                        updateData.cover_url = data.publicUrl;
                    } else {
                         const { error: retryError } = await supabase.storage.from('media').upload(filePath, coverFile);
                         if (!retryError) {
                            const { data } = supabase.storage.from('media').getPublicUrl(filePath);
                            updateData.cover_url = data.publicUrl;
                         }
                    }
                }

                await supabase.from('timeline_events').update(updateData).eq('id', editingEventId);
                setEditingEventId(null);
                setTitle(''); setDate(''); setDesc(''); setAlbumId(''); setCoverFile(null);
                fetchEvents();
                setUploading(false);
            } else {
                handleSubmit(e);
            }
        }} className="space-y-4 bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded-lg border border-pink-200" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded-lg border border-pink-200" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-2 rounded-lg border border-pink-200" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Linked Album (Optional)</label>
            <select value={albumId} onChange={e => setAlbumId(e.target.value)} className="w-full p-2 rounded-lg border border-pink-200">
              <option value="">-- Select Album --</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Cover Image</label>
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="w-full" />
          </div>
          <button type="submit" disabled={uploading} className="w-full bg-pink-500 text-white py-2 rounded-lg font-bold">
            {uploading ? 'Processing...' : (editingEventId ? 'Update Event' : 'Add Event')}
          </button>
          {editingEventId && (
              <button type="button" onClick={() => {
                  setEditingEventId(null);
                  setTitle(''); setDate(''); setDesc(''); setAlbumId(''); setCoverFile(null);
              }} className="w-full mt-2 text-slate-500 font-bold">Cancel Edit</button>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2"><Calendar /> Existing Events</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="timeline">
                {(provided) => (
                    <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                    >
                    {events.map((event, index) => (
                        <Draggable key={event.id} draggableId={event.id} index={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 group items-center"
                                >
                                    <div className="text-slate-300 cursor-grab active:cursor-grabbing mr-2">
                                        <GripVertical size={20} />
                                    </div>

                                    {event.cover_url && <img src={event.cover_url} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">{event.title}</h4>
                                        <p className="text-xs text-pink-500 font-bold">{event.event_date}</p>
                                        <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditEvent(event)} className="text-blue-400 hover:text-blue-600" title="Edit">
                                            <MessageSquare size={18} />
                                        </button>
                                        <button onClick={async () => {
                                            if(confirm('Delete event?')) {
                                            await supabase.from('timeline_events').delete().eq('id', event.id);
                                            fetchEvents();
                                            }
                                        }} className="text-red-400 hover:text-red-600" title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

// --- Approvals Manager ---
function ApprovalsManager() {
  const [fanArt, setFanArt] = useState<MediaItem[]>([]);
  const [charms, setCharms] = useState<Charm[]>([]);
  const [posts, setPosts] = useState<Array<{ id: string; title: string; content: string; category: string }>>([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const { data: art } = await supabase.from('media_items').select('*').eq('status', 'pending');
    if (art) setFanArt(art as MediaItem[]);

    const { data: ch } = await supabase.from('idol_charms').select('*').eq('is_approved', false);
    if (ch) setCharms(ch);

    const { data: ps } = await supabase.from('forum_posts').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (ps) setPosts(ps);
  };

  const approveArt = async (id: string) => {
    await supabase.from('media_items').update({ status: 'approved' }).eq('id', id);
    fetchPending();
  };

  const approveCharm = async (id: string) => {
    await supabase.from('idol_charms').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  const approvePost = async (id: string) => {
    await supabase.from('forum_posts').update({ status: 'approved' }).eq('id', id);
    fetchPending();
  };
  
  const deleteItem = async (table: string, id: string) => {
    if(!confirm('Reject/Delete this item?')) return;
    await supabase.from(table).delete().eq('id', id);
    fetchPending();
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"><MessageSquare size={20} /> Pending Forum Posts</h3>
        {posts.length === 0 ? <p className="text-slate-400 italic">No pending posts.</p> : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-xl border border-pink-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-lg">{post.title}</h4>
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">{post.category}</span>
                </div>
                <p className="text-slate-600 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => approvePost(post.id)} className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 font-bold flex items-center gap-2"><Check size={16} /> Approve</button>
                  <button onClick={() => deleteItem('forum_posts', post.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 font-bold flex items-center gap-2"><X size={16} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"><ImageIcon size={20} /> Pending Fan Art</h3>
        {fanArt.length === 0 ? <p className="text-slate-400 italic">No pending fan art.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fanArt.map(art => (
              <div key={art.id} className="bg-white p-2 rounded-xl border border-pink-100 shadow-sm">
                <img src={art.url} className="w-full aspect-square object-cover rounded-lg mb-2 bg-slate-100" />
                <p className="font-bold text-sm truncate">{art.title}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => approveArt(art.id)} className="flex-1 bg-green-100 text-green-600 py-1 rounded-lg hover:bg-green-200"><Check size={16} className="mx-auto" /></button>
                  <button onClick={() => deleteItem('media_items', art.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded-lg hover:bg-red-200"><X size={16} className="mx-auto" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"><Star size={20} /> Pending Charms</h3>
        {charms.length === 0 ? <p className="text-slate-400 italic">No pending charms.</p> : (
          <div className="space-y-2">
            {charms.map(charm => (
              <div key={charm.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
                <p className="font-medium text-slate-700">{charm.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => approveCharm(charm.id)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><Check size={18} /></button>
                  <button onClick={() => deleteItem('idol_charms', charm.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
