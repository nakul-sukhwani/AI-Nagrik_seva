"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LUCKNOW_PRESETS = [
  { label: "📍 Live GPS (Auto-Detect)", lat: null, lng: null },
  { label: "Jankipuram (Zone-3)", lat: 26.9412, lng: 80.9434 },
  { label: "Aliganj (Zone-3)", lat: 26.8920, lng: 80.9380 },
  { label: "Gomti Nagar (Zone-4)", lat: 26.8500, lng: 80.9980 },
  { label: "Hazratganj (Zone-1)", lat: 26.8467, lng: 80.9462 },
  { label: "Indira Nagar (Zone-7)", lat: 26.8850, lng: 80.9950 },
  { label: "Chowk (Zone-6)", lat: 26.8680, lng: 80.9040 },
  { label: "Ashiyana (Zone-8)", lat: 26.7920, lng: 80.9120 },
  { label: "Alambagh (Zone-5)", lat: 26.8080, lng: 80.9020 },
  { label: "Aishbagh (Zone-2)", lat: 26.8350, lng: 80.9150 },
];

export default function CommandCenter() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Geolocation state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Detecting GPS...");
  const [isDetectingLoc, setIsDetectingLoc] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("📍 Live GPS (Auto-Detect)");

  // Acquire live GPS position
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by browser");
      return;
    }
    setIsDetectingLoc(true);
    setLocationStatus("Acquiring GPS fix...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        setLocationStatus(`📍 GPS: ${userLat.toFixed(4)}°N, ${userLng.toFixed(4)}°E`);
        setIsDetectingLoc(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        // If GPS permission denied or localhost fallback, default to Jankipuram coordinates if not available
        setLocationStatus("GPS unavailable (click to retry or pick area below)");
        setIsDetectingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    detectLiveLocation();
  }, []);

  const handlePresetChange = (presetLabel: string) => {
    setSelectedPreset(presetLabel);
    const preset = LUCKNOW_PRESETS.find(p => p.label === presetLabel);
    if (preset && preset.lat && preset.lng) {
      setCoords({ lat: preset.lat, lng: preset.lng });
      setLocationStatus(`Selected: ${presetLabel} (${preset.lat}, ${preset.lng})`);
    } else {
      detectLiveLocation();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    // Pass real acquired GPS / location coordinates
    if (coords?.lat && coords?.lng) {
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());
    }

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

          {/* Location status & selector bar */}
          <div className="mb-4 bg-gray-900/90 border border-blue-900/40 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium flex items-center gap-1">
                <span className="text-blue-400">📍</span> Device Geolocation
              </span>
              <button
                onClick={detectLiveLocation}
                disabled={isDetectingLoc}
                className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] underline"
              >
                {isDetectingLoc ? "Detecting..." : "Refresh GPS"}
              </button>
            </div>
            <div className="font-mono text-emerald-400 truncate font-semibold">
              {locationStatus}
            </div>
            <div className="pt-1">
              <label className="text-gray-400 block mb-1 text-[11px]">Area Location</label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {LUCKNOW_PRESETS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <p className="text-gray-600 text-[11px] mt-1">Geo-tagging will automatically route to zone</p>
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
                    <div className="col-span-2 bg-blue-950/30 p-2.5 rounded border border-blue-900/50">
                      <div className="text-gray-400 text-xs font-semibold">📍 Resolved Ward &amp; Zone:</div>
                      <div className="font-bold text-emerald-400 text-sm mt-0.5">
                        {result.routing?.zone_id} ({result.routing?.zone_name || result.routing?.ward_name})
                      </div>
                      <div className="text-gray-300 text-xs mt-0.5">
                        {result.routing?.ward_id} • {result.routing?.ward_name}
                      </div>
                      {result.location?.address && (
                        <div className="text-gray-400 text-[11px] mt-1 truncate">
                          {result.location?.address}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-500 text-xs">Dept / Officer</div>
                      <div className="font-bold text-gray-300">{result.routing?.department}</div>
                      <div className="text-gray-400 text-xs">Assigned: {result.routing?.officer_name}</div>
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
