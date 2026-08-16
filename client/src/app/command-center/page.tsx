"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommandCenter() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-200 font-sans">
      {/* Navbar */}
      <nav className="bg-[#111827] border-b border-gray-800 px-6 py-3 flex justify-between items-center">
        <div className="font-bold text-xl text-blue-400 flex items-center gap-2">
          <span>🛡️</span> Smart City Command Center
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-400 border border-green-800 px-3 py-1 rounded-full bg-green-900/20">
            ● System Online
          </span>
          <Link href="/login?role=officer" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition">
            Officer Dashboard
          </Link>
          <Link href="/" className="px-4 py-1.5 border border-gray-700 hover:border-gray-500 text-gray-300 rounded text-sm transition">
            ← Back
          </Link>
        </div>
      </nav>

      <main className="container mx-auto p-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Ingestion */}
        <div className="col-span-1 bg-[#111827]/80 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-200">
            <span className="text-blue-400">⌨</span> Data Ingestion
          </h2>

          {/* Upload Tabs */}
          <div className="flex gap-2 mb-4 bg-gray-800/50 p-1 rounded-lg">
            <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white transition">
              📷 Image
            </button>
            <button className="flex-1 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-gray-200 transition">
              🎥 Video
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-blue-600/60 transition cursor-pointer relative bg-gray-900/30">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
            <div className="text-4xl mb-3 text-gray-600">☁️</div>
            <p className="text-gray-500 text-sm">Drag &amp; Drop or Click to Upload</p>
          </div>

          {imagePreview && (
            <div className="mt-5">
              <h3 className="font-semibold mb-2 text-gray-400 text-sm flex items-center gap-2">
                <span className="text-blue-400">⚡</span> Live Stream / Result
              </h3>
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg border border-gray-700" />
                {loading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-4 bg-gray-900/70 border border-blue-900/40 p-4 rounded-lg text-sm">
                  <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-1">🤖 AI Reasoning</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-500 text-xs">Detected</div>
                      <div className="font-bold text-gray-200">{result.explainability?.detected || 'None'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Confidence</div>
                      <div className="font-bold text-gray-200">{result.explainability?.confidence || 'N/A'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-500 text-xs">Municipal Ward &amp; Zone</div>
                      <div className="font-bold text-blue-400">{result.routing?.zone_id} ({result.routing?.ward_name})</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-500 text-xs">Dept / Officer</div>
                      <div className="font-bold text-gray-300">{result.routing?.department}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!imagePreview && (
            <div className="text-center text-gray-600 mt-8">
              <div className="text-4xl opacity-25">⬛</div>
              <p className="text-sm mt-2">Waiting for input stream...</p>
            </div>
          )}
        </div>

        {/* Right Column: System Status */}
        <div className="col-span-1 lg:col-span-2 bg-[#111827]/80 border border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
              <span className="text-blue-400">💻</span> System Status
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-gray-700 rounded text-gray-400 hover:border-gray-500 transition">All</button>
              <button className="px-3 py-1 text-xs border border-yellow-700 rounded text-yellow-500 hover:border-yellow-500 transition">Roads</button>
              <button className="px-3 py-1 text-xs border border-red-700 rounded text-red-500 hover:border-red-500 transition">Sanitation</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">{stats?.total_reports ?? 0}</div>
                <div className="text-gray-500 text-sm mt-1">Total Reports</div>
              </div>
              <div className="text-3xl opacity-20">📊</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-yellow-500">{stats?.total_potholes ?? 0}</div>
                <div className="text-gray-500 text-sm mt-1">Active Potholes</div>
              </div>
              <div className="text-3xl opacity-20">🚧</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-red-500">{stats?.total_garbage ?? 0}</div>
                <div className="text-gray-500 text-sm mt-1">Garbage Alerts</div>
              </div>
              <div className="text-3xl opacity-20">🗑️</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-emerald-400">{stats?.model_accuracy ?? 0}%</div>
                <div className="text-gray-500 text-sm mt-1">Model / Live Acc</div>
              </div>
              <div className="text-3xl opacity-20">🎯</div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 mb-4">
            <h3 className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">🤖 AI Model Health</h3>
            <div className="bg-black/30 border border-gray-800 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Model Version</div>
                <div className="font-bold text-gray-200">{stats?.model_version || 'Loading...'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Avg Confidence</div>
                <div className="font-bold text-blue-400">{stats?.avg_confidence || 0}%</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Avg Latency</div>
                <div className="font-bold text-yellow-400">{stats?.avg_inference || 0} ms</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Images Processed</div>
                <div className="font-bold text-gray-300">{stats?.total_reports || 0}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Detection Acc</div>
                <div className="font-bold text-green-400">{stats?.model_accuracy || 0}%</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">System Uptime</div>
                <div className="font-bold text-green-400">{stats?.system_uptime || 0}%</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/export-csv`}
              className="flex-1 py-2 text-center border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg text-sm transition"
            >
              📄 Export Data (CSV)
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
