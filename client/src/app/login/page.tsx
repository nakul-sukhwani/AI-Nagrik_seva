"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('officer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'officer' || urlRole === 'worker') {
        setRole(urlRole);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = role === 'officer' ? '/api/auth/login-officer' : '/api/auth/login-worker';
    const payload = role === 'officer' ? { officer_id: uniqueId, password } : { worker_id: uniqueId, password };
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Assume token is set via cookies by backend or returned in data
      if (role === 'officer') {
        router.push('/dashboard');
      } else {
        router.push('/worker-dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-gray-200">
      <div className="max-w-md w-full space-y-8 bg-gray-900/80 p-8 rounded-xl border border-gray-800 shadow-2xl backdrop-blur">
        
        <div className="text-center">
          <Link href="/" className="inline-block p-3 rounded-full bg-blue-900/30 text-blue-400 mb-4 hover:bg-blue-900/50 transition">
            <span className="text-3xl">🛡️</span>
          </Link>
          <h2 className="text-3xl font-bold">Secure Access</h2>
          <p className="mt-2 text-gray-400">Smart City Municipal Portal</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">{error}</div>}
          
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'officer' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setRole('officer')}
            >
              Command Officer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'worker' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setRole('worker')}
            >
              Field Worker
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">
                {role === 'officer' ? 'Officer ID' : 'Worker ID'}
              </label>
              <input
                type="text"
                required
                placeholder={role === 'officer' ? 'e.g. OFF-2026-001' : 'e.g. WRK-2026-001'}
                className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                required
                className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow transition
              ${loading ? 'bg-gray-700 cursor-not-allowed' : role === 'officer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo / Trial Accounts */}
        <div className="pt-4 border-t border-gray-800 text-center space-y-3">
          <p className="text-xs font-semibold text-gray-400">
            ⚡ Quick Trial Accounts (Click to Fill):
          </p>
          {role === 'worker' ? (
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setUniqueId('WRK-1024'); setPassword('password123'); }}
                className="px-3 py-1.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/80 transition"
              >
                👷 Rahul Sharma (WRK-1024)
              </button>
              <button
                type="button"
                onClick={() => { setUniqueId('WRK-1001'); setPassword('password123'); }}
                className="px-3 py-1.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/80 transition"
              >
                🧹 Suresh Kumar (WRK-1001)
              </button>
              <button
                type="button"
                onClick={() => { setUniqueId('WRK-1005'); setPassword('password123'); }}
                className="px-3 py-1.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/80 transition"
              >
                💧 Anita Patel (WRK-1005)
              </button>
            </div>
          ) : (
            <div className="flex justify-center text-xs">
              <button
                type="button"
                onClick={() => { setUniqueId('OFF-2026-001'); setPassword('password123'); }}
                className="px-4 py-1.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/80 transition"
              >
                🛡️ Demo Officer (OFF-2026-001)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
