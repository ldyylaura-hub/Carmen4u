import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/why-stan', label: '安利手册' }, // Renamed for better UX
    { to: '/timeline', label: 'Timeline' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/community', label: 'Community' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tighter text-pink-500 hover:text-pink-600 transition-colors">
            <Sparkles className="w-6 h-6" />
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
