import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Upload, Calendar, Star, Trash2, Check, X, Image as ImageIcon, Video, Plus } from 'lucide-react';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gallery' | 'timeline' | 'charms'>('gallery');

  // Gallery State
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaThumbnail, setMediaThumbnail] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Timeline State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImage, setEventImage] = useState('');

  // Charms State
  const [pendingCharms, setPendingCharms] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.rpc('is_admin');
      if (data) {
        setIsAdmin(true);
        fetchPendingCharms();
      }
    }
    setLoading(false);
  };

  const fetchPendingCharms = async () => {
    const { data } = await supabase
      .from('idol_charms')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (data) setPendingCharms(data);
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const { error } = await supabase.from('media_items').insert([
      {
        title: mediaTitle,
        type: mediaType,
        url: mediaUrl,
        thumbnail_url: mediaThumbnail,
        display_order: 0 // Default to top
      }
    ]);

    if (error) {
      alert('Error uploading media: ' + error.message);
    } else {
      alert('Media uploaded successfully!');
      setMediaTitle('');
      setMediaUrl('');
      setMediaThumbnail('');
    }
    setIsUploading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const { error } = await supabase.from('timeline_events').insert([
      {
        title: eventTitle,
        event_date: eventDate,
        description: eventDesc,
        image_url: eventImage
      }
    ]);

    if (error) {
      alert('Error adding event: ' + error.message);
    } else {
      alert('Event added successfully!');
      setEventTitle('');
      setEventDate('');
      setEventDesc('');
      setEventImage('');
    }
    setIsUploading(false);
  };

  const handleApproveCharm = async (id: string) => {
    await supabase.from('idol_charms').update({ is_approved: true }).eq('id', id);
    fetchPendingCharms();
  };

  const handleDeleteCharm = async (id: string) => {
    await supabase.from('idol_charms').delete().eq('id', id);
    fetchPendingCharms();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pink-50/30 text-pink-600 font-bold">Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
        <p className="text-slate-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-pink-50/30">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'gallery' ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 hover:bg-pink-100'}`}
            >
              Gallery
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'timeline' ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 hover:bg-pink-100'}`}
            >
              Timeline
            </button>
            <button 
              onClick={() => setActiveTab('charms')}
              className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'charms' ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 hover:bg-pink-100'}`}
            >
              Charms ({pendingCharms.length})
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100"
        >
          {activeTab === 'gallery' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-pink-600">
                <ImageIcon /> Upload to Gallery
              </h2>
              <form onSubmit={handleUploadMedia} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Title</label>
                  <input value={mediaTitle} onChange={e => setMediaTitle(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Type</label>
                  <select value={mediaType} onChange={e => setMediaType(e.target.value as any)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50">
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Media URL</label>
                  <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50" required placeholder="https://..." />
                </div>
                {mediaType === 'video' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Thumbnail URL (Optional)</label>
                    <input value={mediaThumbnail} onChange={e => setMediaThumbnail(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50" placeholder="https://..." />
                  </div>
                )}
                <button type="submit" disabled={isUploading} className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors">
                  {isUploading ? 'Uploading...' : 'Upload Item'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-pink-600">
                <Calendar /> Add Timeline Event
              </h2>
              <form onSubmit={handleAddEvent} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Event Title</label>
                  <input value={eventTitle} onChange={e => setEventTitle(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Date</label>
                  <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Description</label>
                  <textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50 h-32" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Image URL (Optional)</label>
                  <input value={eventImage} onChange={e => setEventImage(e.target.value)} className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/50" placeholder="https://..." />
                </div>
                <button type="submit" disabled={isUploading} className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors">
                  {isUploading ? 'Adding...' : 'Add Event'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'charms' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-pink-600">
                <Star /> Review Pending Charms
              </h2>
              {pendingCharms.length === 0 ? (
                <p className="text-slate-500">No pending charms to review.</p>
              ) : (
                <div className="grid gap-4">
                  {pendingCharms.map(charm => (
                    <div key={charm.id} className="flex items-center justify-between p-4 border border-pink-100 rounded-xl bg-pink-50/30">
                      <p className="text-slate-800 font-medium">{charm.content}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveCharm(charm.id)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                          <Check size={20} />
                        </button>
                        <button onClick={() => handleDeleteCharm(charm.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}