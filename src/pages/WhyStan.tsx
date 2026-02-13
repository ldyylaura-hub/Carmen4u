import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Heart, Star, Award, Play, Sparkles, MapPin, Calendar, Clock, User, Smile, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Charm {
  id: string;
  content: string;
}

// Preset charms defined by user
const PRESET_CHARMS = [
  "小卡门，大眼萌！",
  "反差魅力",
  "心系粉丝，积极营业",
  "歌唱实力优秀，舞蹈水平快速上升",
  "...未完待续"
];

export default function WhyStan() {
  const [charms, setCharms] = useState<Charm[]>([]);
  const [showAddCharm, setShowAddCharm] = useState(false);
  const [newCharmText, setNewCharmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  useEffect(() => {
    fetchCharms();
  }, []);

  const fetchCharms = async () => {
    // 1. Get user generated charms
    const { data, error } = await supabase
      .from('idol_charms')
      .select('*')
      .eq('is_approved', true);
    
    // 2. Filter out presets if they exist in DB to avoid duplicates (optional, simplified here)
    // 3. Construct final list: Presets first, then shuffled UGC
    const presetObjects = PRESET_CHARMS.map((content, idx) => ({
      id: `preset-${idx}`,
      content
    }));

    let ugcCharms: Charm[] = [];
    if (data) {
      // Shuffle UGC only
      ugcCharms = data
        .filter(d => !PRESET_CHARMS.includes(d.content)) // Avoid exact duplicate text
        .sort(() => 0.5 - Math.random());
    }

    setCharms([...presetObjects, ...ugcCharms]);
  };

  const totalPages = Math.ceil(charms.length / itemsPerPage);
  const currentCharms = charms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleAddCharm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharmText.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('idol_charms')
      .insert([{ content: newCharmText }]);

    if (!error) {
      setNewCharmText('');
      setShowAddCharm(false);
      fetchCharms(); // Refresh list
    }
    setIsSubmitting(false);
  };

  const carouselImages = [
    { src: "https://i.imgs.ovh/2026/02/13/ymOrOM.jpeg", label: "Pre-debut" },
    { src: "https://i.imgs.ovh/2026/02/13/ymOUWt.jpeg", label: "Debut: The Chase" },
    { src: "https://i.imgs.ovh/2026/02/13/ymZ97r.jpeg", label: "1st Comeback: Style" },
    { src: "https://i.imgs.ovh/2026/02/13/ymZodN.jpeg", label: "2nd Comeback: Focus" }
  ];

  return (
    <div className="min-h-screen py-20 px-4 relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: 'url("https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/picture/background.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlL2JhY2tncm91bmQucG5nIiwiaWF0IjoxNzcxMDAzMzk0LCJleHAiOjE5Mjg2ODMzOTR9.t2ldOiA4TvMlxhweivZ-y2tW9SA-D4emZXqntKd-DsQ")',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Pink Overlay to ensure text readability - Reduced opacity to show background better */}
      <div className="fixed inset-0 bg-pink-50/20 z-0 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md text-pink-600 font-bold text-sm mb-4 border border-pink-200/50 shadow-sm">
            ♡⊹ ˖ 𓏴 𝒪𝓊𝓇 ℯ𝓍𝒸𝓁𝓊𝓈𝒾𝓋ℯ 𝓂ℯ𝓂ℴ𝓇𝒾ℯ𝓈 𓏴 ˖ ⊹♡
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-slate-800 drop-shadow-sm">
            安利手册 <span className="text-4xl">🌴</span>
          </h1>
          <p className="text-slate-600 text-lg font-medium">Everything you need to know about Carmen.</p>
        </motion.div>

        {/* Full Width Scrolling Carousel */}
        <div className="mb-16 -mx-4 md:-mx-0 overflow-hidden relative group h-[300px] md:h-[400px]">
           {/* Decorative Text Background */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[15rem] font-black text-white/20 whitespace-nowrap select-none pointer-events-none z-0 mix-blend-overlay">
              CARMEN
           </div>

           <div className="relative z-10 flex gap-4 overflow-hidden py-4 items-center h-full">
             <motion.div 
               className="flex gap-4 flex-nowrap"
               animate={{ x: ["0%", "-50%"] }}
               transition={{ 
                 repeat: Infinity, 
                 ease: "linear", 
                 duration: 20 
               }}
             >
               {[...carouselImages, ...carouselImages, ...carouselImages].map((item, index) => (
                 <div key={index} className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50 relative group/item">
                   <img src={item.src} alt={item.label} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-4">
                     <span className="text-white font-bold text-lg">{item.label}</span>
                   </div>
                 </div>
               ))}
             </motion.div>
           </div>
           
           <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-pink-100/50 to-transparent z-20 pointer-events-none" />
           <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-pink-100/50 to-transparent z-20 pointer-events-none" />
        </div>

        {/* Basic Profile Section (Moved Below) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-pink-100/40 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 mb-24 max-w-4xl mx-auto hover:bg-pink-100/50 transition-colors duration-500"
        >
           <h3 className="text-3xl font-bold text-slate-800 mb-8 flex items-center justify-center gap-3">
             <User className="text-pink-500 w-8 h-8" /> Basic Profile
           </h3>
           
           <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
             <ProfileItem label="全名" value="Nyoman Ayu Carmenita (妮欧曼·阿尤·卡门妮塔)" />
             <ProfileItem label="艺名" value="Carmen" />
             <ProfileItem label="韩文名" value="카르멘" />
             <ProfileItem label="生日" value="2006年3月28日" icon={<Calendar size={16} />} />
             <ProfileItem label="出道日期" value="2025年2月24日" icon={<Sparkles size={16} />} />
             <ProfileItem label="练习时间" value="约两年两个月 (2022年11/12月起 @SM)" icon={<Clock size={16} />} />
             <ProfileItem label="国籍" value="印度尼西亚 🇮🇩" icon={<MapPin size={16} />} />
             <ProfileItem label="官方表情" value="🌴" />
             <ProfileItem label="队内定位" value="主唱" icon={<Music size={16} />} />
             <ProfileItem label="MBTI" value="INFP ➡️ ESFP" icon={<Smile size={16} />} />
             <ProfileItem label="所属社" value="@SMTOWN" />
             <ProfileItem label="所属组合" value="@Hearts2Hearts" />
           </div>
        </motion.div>

        {/* TMI Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="text-center mb-10">
             <h2 className="text-3xl font-bold text-slate-800 inline-flex items-center gap-3">
               <span>₊⁺ ♡̶ꗯ꙼̈๑⃙⃘₊⁺</span>
               TMI 🌴
               <span>₊⁺ ♡̶ꗯ꙼̈๑⃙⃘₊⁺</span>
             </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <TmiCard number={1} content="Carmen的父母是巴厘岛非常著名的音乐家，她来自一个音乐家庭 🎵" />
            <TmiCard number={2} content="会弹奏钢琴🎹和吉他🎸，唱歌很棒，是全能音乐人" />
            <TmiCard number={3} content="哥哥是厨师👨‍🍳，姐姐是Kpop死忠粉。家人经常飞往韩国支持她！" />
            <TmiCard number={4} content="勤奋宝宝：每天都会早早起床前往公司进行训练 🏃‍♀️" />
            <TmiCard number={5} content="传奇经历：Email试镜通过 -> 二轮淘汰 -> 6个月后被SM召回雅加达重试 -> 成功入选 ✨" />
            <TmiCard number={6} content="甜品大师：喜欢做烘焙，经常给队友投喂布朗尼 🍰" />
            <TmiCard number={7} content="个人技：手指很长，手可以翻转360度！🖐️" />
          </div>
        </motion.div>

        {/* Charms Section (UGC) */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 inline-flex items-center gap-3">
               <span>✨</span>
               卡门的小小闪光点
               <span>✨</span>
            </h2>
            <p className="text-pink-600 mt-2 font-medium">点击右下角添加你发现的卡门魅力！</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-[1400px] mx-auto px-4 place-items-center">
            <AnimatePresence mode='wait'>
              {currentCharms.map((charm, index) => (
                <CharmCard key={charm.id} content={charm.content} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-12">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-3 rounded-full bg-white/50 hover:bg-white text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-bold text-pink-600 text-lg">
                Page {currentPage} / {totalPages}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-3 rounded-full bg-white/50 hover:bg-white text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Add Charm Button */}
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => setShowAddCharm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
              <Plus size={20} /> 我也要安利！
            </button>
          </div>
        </div>

        {/* Add Charm Modal */}
        {showAddCharm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-pink-100 relative"
            >
              <button 
                onClick={() => setShowAddCharm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">安利卡门的小闪光 ✨</h3>
              
              <form onSubmit={handleAddCharm}>
                <textarea
                  value={newCharmText}
                  onChange={(e) => setNewCharmText(e.target.value)}
                  placeholder="比如：笑起来眼睛弯弯的像月牙..."
                  className="w-full h-32 bg-pink-50/50 rounded-xl border-2 border-pink-100 p-4 text-slate-700 placeholder:text-pink-300 focus:border-pink-400 focus:outline-none focus:bg-white transition-all resize-none mb-6 font-medium"
                  maxLength={50}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newCharmText.trim()}
                    className="bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? '发送中...' : '发射安利 🚀'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Vocal Showcase */}
        <div className="bg-pink-100/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 shadow-xl">
          <h2 className="text-3xl font-bold mb-10 text-center flex items-center justify-center gap-3 text-slate-800">
            <Music className="text-pink-500" /> Discography & Vocal Showcase
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <AlbumCard 
              title="The Chase"
              type="Debut Single"
              cover="https://i.imgs.ovh/2026/02/13/ymc86c.jpeg"
              tracks={[
                { title: "The Chase", duration: "3:12", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-The%20Chase.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLVRoZSBDaGFzZS5tcDMiLCJpYXQiOjE3NzA5OTc2NTIsImV4cCI6MTkyODY3NzY1Mn0.2toAdinPMLmiAkdADMR3ryobCMj2cXnD0-HcR5ggNj8" },
                { title: "Butterflies", duration: "2:58", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-Butterflies.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLUJ1dHRlcmZsaWVzLm1wMyIsImlhdCI6MTc3MDk5NzY3OCwiZXhwIjoxOTI4Njc3Njc4fQ.-VO5vEbkMBLoItoGXuWgGQTmebDCxiJ-ISDaJvppwEE" }
              ]}
            />
            <AlbumCard 
              title="Style"
              type="1st Single Comeback"
              cover="https://i.imgs.ovh/2026/02/13/ymf9eq.jpeg"
              tracks={[
                { title: "Style", duration: "3:05", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-STYLE.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLVNUWUxFLm1wMyIsImlhdCI6MTc3MDk5NzczNCwiZXhwIjoxOTI4Njc3NzM0fQ.VLgmXGGjqDVN8jGkFChRLU4TRVyuQ5PnDo8CSljLTi0" }
              ]}
            />
            <AlbumCard 
              title="Focus"
              type="2nd Mini Album"
              cover="https://i.imgs.ovh/2026/02/13/ymfPy4.jpeg"
              tracks={[
                { title: "Focus", duration: "3:22", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-FOCUS%20.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLUZPQ1VTIC5tcDMiLCJpYXQiOjE3NzA5OTc4MDMsImV4cCI6MTkyODY3NzgwM30.gfgWDPMYOuQq-lZt0UrFxRyyA_Nq5XGKaC5tufO6C7w" },
                { title: "Apple Pie", duration: "2:58", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-Apple%20Pie.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLUFwcGxlIFBpZS5tcDMiLCJpYXQiOjE3NzA5OTc4MjAsImV4cCI6MTkyODY3NzgyMH0.3UBTjpFx5pbFCBxwvMCRuJoRHkdtvsn-z0LT35eSo0M" },
                { title: "Pretty Please", duration: "3:15", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-Pretty%20Please.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLVByZXR0eSBQbGVhc2UubXAzIiwiaWF0IjoxNzcwOTk3ODQ3LCJleHAiOjE5Mjg2Nzc4NDd9.X4d7EHT04uO7UTQRrcHvMBAZEexuh_MvTWJwzNAYPBU" },
                { title: "Flutter", duration: "3:10", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-Flutter.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLUZsdXR0ZXIubXAzIiwiaWF0IjoxNzcwOTk3ODcxLCJleHAiOjE5Mjg2Nzc4NzF9._T2GLOclp1axVhjAz_Rq5i-1QJM5XCHTk1PVtI7VDMM" },
                { title: "Blue Moon", duration: "3:30", url: "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/music/Hearts2Hearts-Blue%20Moon.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtdXNpYy9IZWFydHMySGVhcnRzLUJsdWUgTW9vbi5tcDMiLCJpYXQiOjE3NzA5OTc4OTAsImV4cCI6MTkyODY3Nzg5MH0.21cOY4OLMXFd9OP7qQ2z_v6w1Zya6FyJefBMjp0Zf-g" }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/40 pb-3 last:border-0 last:pb-0">
      <span className="text-pink-500 mt-1">{icon || <Sparkles size={16} />}</span>
      <div>
        <span className="block text-xs font-bold text-pink-600 uppercase tracking-wider">{label}</span>
        <span className="text-slate-800 font-medium text-lg">{value}</span>
      </div>
    </div>
  );
}

function TmiCard({ number, content }: { number: number, content: string }) {
  return (
    <div className="bg-pink-100/40 backdrop-blur-md p-6 rounded-2xl shadow-md border border-white/50 hover:shadow-lg hover:bg-pink-100/50 transition-all flex gap-4 items-start group">
      <div className="w-10 h-10 rounded-full bg-white/60 text-pink-600 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-colors">
        {number}
      </div>
      <p className="text-slate-800 font-medium leading-relaxed pt-1">{content}</p>
    </div>
  );
}

function CharmCard({ content, index }: { content: string, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Use the provided doll image as background
  const dollImage = "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/picture/doll.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlL2RvbGwucG5nIiwiaWF0IjoxNzcxMDA1MTE0LCJleHAiOjE5Mjg2ODUxMTR9.55MkHT6qU80g14pdb5DJdTHX3rTHLcUfUyisfp3X6Nw";
  
  // Subtle rotation for organic feel
  const rotate = ((index * 7) % 10) - 5; 

  return (
    <div 
      className="w-56 h-72 md:w-64 md:h-[340px] cursor-pointer group perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full relative transition-all duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          rotate: `${rotate}deg`
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Front Side: Just the Doll Image */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backgroundImage: `url('${dollImage}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Optional: "Click Me" hint on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/80 px-3 py-1 rounded-full text-pink-500 text-sm font-bold shadow-sm">Click Me!</span>
          </div>
        </div>

        {/* Back Side: "Blank" Doll (White Overlay) + Text */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backgroundImage: `url('${dollImage}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Heavy white overlay to create "blank" look while keeping shape */}
          {/* We use a mask-image approach or just a simple overlay if the image has transparency. 
              Since it's a PNG with transparency, a simple div overlay might fill the bounding box.
              Better approach: Use CSS filter to make it white/blank.
          */}
          <div 
             className="absolute inset-0"
             style={{
               backgroundImage: `url('${dollImage}')`,
               backgroundSize: 'contain',
               backgroundRepeat: 'no-repeat',
               backgroundPosition: 'center',
               filter: 'brightness(0) invert(1)', // Turns it white
               opacity: 0.9
             }}
          />
          
          {/* Content Container - Centered */}
          <div className="absolute inset-0 flex items-center justify-center p-10 z-10">
            <div className="text-center">
              <span className="text-pink-600 font-bold text-xl md:text-2xl drop-shadow-sm leading-relaxed block mb-2">{content}</span>
              <Sparkles className="inline-block text-yellow-400 w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AlbumCard({ title, type, cover, tracks }: { title: string, type: string, cover: string, tracks: { title: string, duration: string, url: string }[] }) {
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const togglePlay = (url: string) => {
    if (playingUrl === url) {
      // Pause
      audio?.pause();
      setPlayingUrl(null);
    } else {
      // Play new
      audio?.pause(); // Stop previous
      const newAudio = new Audio(url);
      newAudio.play();
      setAudio(newAudio);
      setPlayingUrl(url);
      
      newAudio.onended = () => {
        setPlayingUrl(null);
      };
    }
  };

  return (
    <div className="bg-pink-100/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-md border border-white/50 hover:shadow-xl hover:bg-pink-100/50 transition-all group">
      <div className="relative aspect-square overflow-hidden">
        <img src={cover} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </div>
      <div className="p-6">
        <div className="mb-4">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block mb-1">{type}</span>
          <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-3">
          {tracks.map((track, idx) => {
            const isPlaying = playingUrl === track.url;
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between text-sm text-slate-800 font-medium hover:text-pink-600 cursor-pointer group/track"
                onClick={() => togglePlay(track.url)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-slate-500 text-xs">{idx + 1}</span>
                  <span className={`font-medium ${isPlaying ? 'text-pink-600 font-bold' : ''}`}>{track.title}</span>
                </div>
                {isPlaying ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </div>
                ) : (
                  <Play className="w-4 h-4 opacity-0 group-hover/track:opacity-100 transition-opacity text-pink-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
