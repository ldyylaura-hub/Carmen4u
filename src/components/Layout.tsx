import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  // Check admin status on route change too, just in case
  useEffect(() => {
    checkAdmin();
  }, [location]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Use the secure RPC function we created
      const { data } = await supabase.rpc('is_admin');
      if (data) setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/why-stan', label: '安利手册' },
    { to: '/timeline', label: 'Timeline' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/community', label: 'Community' },
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
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
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
