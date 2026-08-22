"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const portals = [
  {
    key: 'officer',
    icon: '🛡️',
    label: 'OFFICER',
    description: 'Access municipal analytics, maps & issue resolution',
    bg: 'from-blue-900/40 to-blue-950/60',
    border: 'border-blue-800/50',
    iconBg: 'bg-blue-900/60',
    href: '/login?role=officer',
  },
  {
    key: 'citizen',
    icon: '🧑‍💼',
    label: 'CITIZEN',
    description: 'Report civic issues and scan status using visual AI',
    bg: 'from-orange-900/40 to-orange-950/60',
    border: 'border-orange-800/50',
    iconBg: 'bg-orange-900/60',
    href: '/command-center',
  },
  {
    key: 'worker',
    icon: '🔧',
    label: 'FIELD WORKER',
    description: 'Manage field tasks and update issue resolutions',
    bg: 'from-gray-800/40 to-gray-900/60',
    border: 'border-gray-700/50',
    iconBg: 'bg-gray-800/60',
    href: '/login?role=worker',
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center font-sans px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏙️</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent tracking-wide">
              Smart City Command Hub
            </h1>
            <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mt-0.5">
              Municipal Management &amp; Reporting
            </p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-3xl bg-[#111827]/80 border border-gray-800/60 rounded-2xl p-10 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome</h2>
          <p className="text-gray-400 text-sm">Please select your portal to log in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {portals.map((portal) => (
            <button
              key={portal.key}
              onClick={() => router.push(portal.href)}
              className={`
                group flex flex-col items-center text-center p-8 rounded-xl
                bg-gradient-to-b ${portal.bg}
                border ${portal.border}
                hover:scale-105 hover:shadow-xl hover:border-opacity-100
                transition-all duration-200 cursor-pointer
              `}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 ${portal.iconBg} shadow-lg`}>
                {portal.icon}
              </div>
              <div className="font-bold text-sm tracking-[0.15em] text-white mb-2">
                {portal.label}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {portal.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
