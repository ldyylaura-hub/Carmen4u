import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ClickEffectSafe as ClickEffect } from './ClickEffect';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  // Custom Scroll Progress Bar
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check admin status on route change too, just in case
  useEffect(() => {
    checkUser();
  }, [location, isMenuOpen]); // Also check when menu opens (for mobile) or re-renders

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Use the secure RPC function we created
      const { data } = await supabase.rpc('is_admin');
      if (data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    window.location.href = '/'; // Redirect to home
  };

  const links = [
    { to: '/', label: '卡门小屋' },
    { to: '/why-stan', label: '安利手册' },
    { to: '/timeline', label: '卡卡的星途漫步' },
    { to: '/gallery', label: '小卡时光照相机' },
    { to: '/community', label: '卡比论坛' },
  ];

  // Only add Admin link if not already on the admin page (avoid clutter)
  // Actually, keeping it in nav is good for access.
  // But user wanted "login directly to admin", so we handled that in Login.tsx
  // User said "naked admin link is ugly". Let's hide it from nav if we want,
  // but usually admin needs a way to get there.
  // Let's keep it but maybe make it subtle or only icon?
  // User said "Admin where? And I want to login directly... naked link is ugly"
  // So I will REMOVE it from the main links list to satisfy "too ugly/naked",
  // relying on the redirect in Login.tsx.
  // BUT, once logged in, how do they get back if they navigate away?
  // Maybe a subtle icon in the corner? Or just rely on the fact they are redirected.
  
  // Revised plan based on "naked link is ugly":
  // 1. Remove "Admin" text link from main nav.
  // 2. Add a subtle "Shield" icon next to the Logo if admin, clickable to go to dashboard.
  
  /* 
  if (isAdmin) {
    links.push({ to: '/admin', label: 'Admin' });
  } 
  */

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 relative">
      <ClickEffect />
      
      {/* Force hide scrollbar with inline style as backup */}
      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      {/* Custom Doll Scrollbar */}
      <div className="fixed right-1 top-0 bottom-0 w-0 z-[100] pointer-events-none hidden md:block">
        <div 
          className="absolute w-16 h-16 -right-5"
          style={{ top: `${Math.min(Math.max(scrollProgress * 90, 0), 90)}%` }} 
        >
          <img 
            src="https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/picture/doll.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlL2RvbGwucG5nIiwiaWF0IjoxNzcxMDA1MTE0LCJleHAiOjE5Mjg2ODUxMTR9.55MkHT6qU80g14pdb5DJdTHX3rTHLcUfUyisfp3X6Nw" 
            alt="Scroll Doll" 
            className="w-full h-full object-contain drop-shadow-lg filter hover:brightness-110 animate-bounce"
          />
        </div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 text-2xl font-extrabold tracking-tighter text-pink-500 hover:text-pink-600 transition-colors group">
            {isAdmin ? (
              <Shield className="w-6 h-6 text-pink-400 group-hover:text-pink-600 transition-colors" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            CARMEN
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold transition-all hover:text-pink-500 relative group ${
                  location.pathname === link.to ? 'text-pink-600' : 'text-slate-500'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-400 transition-all duration-300 ${
                  location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
            {/* Show login/admin status in nav */}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-bold text-pink-600 hover:text-pink-700 transition-all flex items-center gap-1"
              >
                <Shield size={16} />
                Admin
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-slate-500 hover:text-pink-600 transition-all"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-slate-500 hover:text-pink-600 transition-all"
              >
                走进小卡的世界
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-pink-100 p-4 flex flex-col gap-4 shadow-lg"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-base font-bold transition-colors hover:text-pink-500 ${
                  location.pathname === link.to ? 'text-pink-600' : 'text-slate-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="text-base font-bold text-left text-slate-600 hover:text-pink-500 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-base font-bold text-slate-600 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                走进小卡的世界
              </Link>
            )}
          </motion.nav>
        )}
      </header>

      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <footer className="bg-white/50 border-t border-pink-100 py-8 text-center text-slate-500 text-sm backdrop-blur-sm">
        <p className="flex items-center justify-center gap-2">
          Made with <span className="text-pink-500">❤</span> for Carmen
        </p>
        <p className="mt-2 text-xs opacity-70">&copy; {new Date().getFullYear()} Fan Site. All rights reserved.</p>
      </footer>
    </div>
  );
}
