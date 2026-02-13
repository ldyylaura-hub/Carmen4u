import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/community');
    }
    setLoading(false);
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

        <form onSubmit={handleLogin} className="space-y-5">
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
