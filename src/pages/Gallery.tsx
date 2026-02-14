import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Play, Image as ImageIcon, ChevronLeft, Upload, X, Loader2, Heart } from 'lucide-react';
import { Album, MediaCategory, MediaItem } from '../types';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<MediaCategory>('concept');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumMedia, setAlbumMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch albums when category changes
  useEffect(() => {
    fetchAlbums();
    setSelectedAlbum(null);
  }, [activeCategory]);

  const fetchAlbums = async () => {
    setLoading(true);
    // Sort by display_order first, then created_at
    const { data } = await supabase
      .from('albums')
      .select('*')
      .eq('category', activeCategory)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    setAlbums(data as Album[] || []);
    setLoading(false);
  };

  const fetchMedia = async (albumId: string) => {
    const { data } = await supabase
      .from('media_items')
      .select('*')
      .eq('album_id', albumId)
      .eq('status', 'approved') // Only show approved
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    setAlbumMedia(data as MediaItem[] || []);
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    fetchMedia(album.id);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800">
            Media Gallery
          </h1>
          <p className="text-slate-500 mb-8">Capturing the moments that shine.</p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {(['concept', 'poster', 'mv', 'fancam', 'cut', 'activity', 'bingping', 'fan_art'] as MediaCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all capitalize ${
                  activeCategory === cat 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' 
                    : 'bg-white text-slate-600 hover:bg-pink-50 border border-slate-100'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode='wait'>
          {selectedAlbum ? (
            <motion.div 
              key="media-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setSelectedAlbum(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-pink-500 font-bold transition-colors"
                >
                  <ChevronLeft /> Back to Albums
                </button>
                <div className="h-6 w-px bg-slate-300"></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedAlbum.title}</h2>
                  <p className="text-slate-500 text-sm">{selectedAlbum.description}</p>
                </div>
                
                {activeCategory === 'fan_art' && (
                  <button 
                    onClick={() => setShowUpload(true)}
                    className="ml-auto bg-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Upload size={18} /> Submit Art
                  </button>
                )}
              </div>

              {albumMedia.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl">
                  No media in this album yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albumMedia.map(item => (
                     <MediaItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="album-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
               {activeCategory === 'fan_art' && (
                 <div className="flex justify-end mb-6">
                    <button 
                      onClick={() => setShowUpload(true)}
                      className="bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg flex items-center gap-2 hover:-translate-y-1 transition-all"
                    >
                      <Upload size={20} /> Submit Fan Art
                    </button>
                 </div>
               )}

               {loading ? (
                 <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-400" size={40} /></div>
               ) : albums.length === 0 ? (
                 <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl">
                   No albums found in this category.
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {albums.map(album => (
                     <div 
                       key={album.id}
                       onClick={() => handleAlbumClick(album)}
                       className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-pink-100 cursor-pointer transition-all duration-300 hover:-translate-y-2"
                     >
                       <div className="aspect-video bg-slate-100 relative overflow-hidden">
                         {album.cover_url ? (
                           <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>
                         )}
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                         <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-xl drop-shadow-md truncate">{album.title}</h3>
                            <p className="text-white/80 text-sm drop-shadow-sm truncate">{album.description}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {showUpload && (
          <FanArtUploadModal onClose={() => setShowUpload(false)} albums={albums.filter(a => a.category === 'fan_art')} />
        )}
      </div>
    </div>
  );
}

function MediaItemCard({ item }: { item: MediaItem }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      {item.type === 'video' ? (
        <div className="aspect-video relative bg-black">
           {/* @ts-ignore */}
           <ReactPlayer 
             // @ts-ignore
             url={item.url} 
             width="100%" 
             height="100%" 
             controls
             // @ts-ignore
             light={item.thumbnail_url || true}
             playIcon={
                <div className="w-16 h-16 bg-pink-500/90 rounded-full flex items-center justify-center group-hover:bg-pink-600 transition-colors backdrop-blur-sm shadow-lg">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
             }
           />
        </div>
      ) : (
        <div className="aspect-[4/3] overflow-hidden relative">
          <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
        {item.metadata?.era && <p className="text-xs text-pink-500 font-bold uppercase mt-1">{item.metadata.era}</p>}
      </div>
    </div>
  );
}

function FanArtUploadModal({ onClose, albums }: { onClose: () => void, albums: Album[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [era, setEra] = useState('');
  const [albumId, setAlbumId] = useState(albums[0]?.id || '');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !albumId) {
      alert('Please select a file and an album.');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `fan-art/${Date.now()}.${fileExt}`;

    const { error: upErr } = await supabase.storage.from('media').upload(filePath, file);
    
    if (upErr) {
      alert('Upload failed: ' + upErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

    const { error: dbErr } = await supabase.from('media_items').insert({
      album_id: albumId,
      title,
      type: 'photo',
      url: urlData.publicUrl,
      status: 'pending', // Pending approval
      metadata: { era }
    });

    setUploading(false);
    if (dbErr) alert(dbErr.message);
    else {
      alert('Submitted for approval! Thank you!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Heart className="text-pink-500" /> Submit Fan Art</h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Album / Collection</label>
            <select value={albumId} onChange={e => setAlbumId(e.target.value)} className="w-full p-2 border rounded-lg" required>
              {albums.length === 0 && <option value="">No Fan Art Albums Available</option>}
              {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            {albums.length === 0 && <p className="text-xs text-red-500 mt-1">Admin needs to create a 'Fan Art' album first.</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Comeback / Era (Optional)</label>
            <input value={era} onChange={e => setEra(e.target.value)} placeholder="e.g. The Chase Era" className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Image File</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" required />
          </div>
          <button 
            type="submit" 
            disabled={uploading || !albumId}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 disabled:bg-pink-300 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Submit for Approval'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
