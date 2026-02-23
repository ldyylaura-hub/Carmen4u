import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Login error:', authError);
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.session) {
        setError('No session created. Please check your credentials.');
        setLoading(false);
        return;
      }

      console.log('Login successful, checking admin status...');

      // Check if admin after login with timeout
      let targetPath = '/community';
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Admin check timeout')), 3000)
        );
        
        const adminCheckPromise = supabase.rpc('is_admin');
        
        const { data } = await Promise.race([adminCheckPromise, timeoutPromise]) as any;
        
        if (data) {
          targetPath = '/admin';
          console.log('User is admin, redirecting to admin panel');
        } else {
          console.log('User is not admin, redirecting to community');
        }
      } catch (rpcError) {
        console.warn('Admin check failed or timed out, defaulting to community:', rpcError);
        // Continue with default path
      }

      // If user came from a specific page, redirect back there
      const from = (location.state as any)?.from;
      if (from && !targetPath.includes('admin')) {
        targetPath = from;
      }

      console.log('Redirecting to:', targetPath);

      // Small delay to allow store listener to update
      setTimeout(() => {
        setLoading(false);
        navigate(targetPath);
      }, 300);

    } catch (err: any) {
      console.error('Unexpected error during login:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-pink-100 shadow-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-slate-800">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative bg-white px-4 text-sm text-slate-500">login with email</div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 mt-5">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-100 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-pink-300 focus:bg-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-100 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-pink-300 focus:bg-white transition-colors"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-500 font-bold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
