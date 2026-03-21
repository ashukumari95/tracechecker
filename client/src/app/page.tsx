"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function TraceCheckerHero() {
  const router = useRouter();
  
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState<'single' | 'deep'>('single');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- UPDATED BACKEND INTEGRATION LOGIC ---
  const handleStartScan = async () => {
    if (!target.trim()) {
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setIsError(false);

   try {
  // 1. Backend URL ko environment variable se uthayein
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 2. Ab axios request mein variable use karein
  const response = await axios.post(`${API_BASE}/api/v1/scan/start`, {
    target: target.trim(),
    scanType: scanType === 'deep' ? 'Deep' : 'Standard'
  });
      // 🛑 FIX: Backend response structure 'data._id' hai, 'scanId' nahi.
      if (response.data.success && response.data.data?._id) {
        const scanId = response.data.data._id;
        
        // 2. Redirect with Valid Scan ID and Target
        // Use encodeURIComponent taaki special characters (@) URL mein break na ho
        router.push(`/scan?id=${scanId}&target=${encodeURIComponent(target)}&mode=${scanType}`);
      } else {
        console.error("ID not found in response:", response.data);
        setIsError(true);
        alert("Scan started but ID was not received from server.");
      }
    } catch (error: any) {
      console.error("Failed to initiate trace:", error.response?.data || error.message);
      setIsError(true);
      alert("Backend Connection Error. Make sure your server is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#05070a] font-sans text-slate-100 min-h-screen relative overflow-hidden flex flex-col items-center">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: `linear-gradient(rgba(6, 249, 249, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 249, 249, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}>
      </div>

      <header className="w-full max-w-[1440px] px-12 py-10 flex items-center justify-between z-20 bg-transparent">
        <div className="flex items-center gap-3 text-[#06f9f9]">
          <span className="material-symbols-outlined text-3xl font-bold">radar</span>
          <h2 className="text-white text-xl font-bold tracking-tight">TraceChecker</h2>
        </div>

        <nav className="hidden md:flex items-center gap-12">
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">API</a>
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">Docs</a>
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-white transition-colors">search</span>
          <button className="border border-[#06f9f9]/30 px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest text-[#06f9f9] hover:bg-[#06f9f9]/10 transition-all">
            Console
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 -mt-16">
        <div className="w-full max-w-[850px] flex flex-col items-center">
          
          <div className="flex bg-[#161b22]/30 backdrop-blur-md rounded-t-lg border-x border-t border-white/10 p-1 w-full max-w-[450px]">
            <button 
              onClick={() => setScanType('single')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${scanType === 'single' ? 'bg-[#06f9f9]/10 text-[#06f9f9] border border-[#06f9f9]/20 shadow-[0_0_15px_rgba(6,249,249,0.1)]' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">search</span>
              Single Scan
            </button>
            <button 
              onClick={() => setScanType('deep')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${scanType === 'deep' ? 'bg-[#06f9f9]/10 text-[#06f9f9] border border-[#06f9f9]/20' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">layers</span>
              Combined Deep Scan
            </button>
          </div>

          <div className={`w-full bg-[#0d1117]/80 backdrop-blur-xl border rounded-xl p-6 md:p-8 flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 ${isError ? 'border-red-500/50' : 'border-white/10'}`}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500">
                <span className="material-symbols-outlined text-xl">alternate_email</span>
              </div>
              <input 
                disabled={isLoading}
                value={target}
                onChange={(e) => {setTarget(e.target.value); if(isError) setIsError(false);}}
                onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
                className="w-full bg-black/40 border border-white/5 rounded-lg h-16 pl-16 pr-6 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#06f9f9]/30 transition-all disabled:opacity-50" 
                placeholder="Enter email, username, or domain to scan..." 
                type="text"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-emerald-500/50">check_circle</span> OSINT Ready</span>
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-emerald-500/50">check_circle</span> API Connected</span>
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-emerald-500/50">check_circle</span> SSL Encrypted</span>
               </div>

               <button 
                disabled={isLoading}
                onClick={handleStartScan}
                className={`group w-full md:w-auto flex items-center justify-center gap-3 bg-[#06f9f9] text-black px-10 py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(6,249,249,0.4)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className={`material-symbols-outlined font-black ${isLoading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
                  {isLoading ? 'sync' : 'bolt'}
                </span>
                {isLoading ? 'Initializing...' : 'Start Scan'}
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-slate-600 font-mono text-[9px] tracking-[0.4em] uppercase flex items-center gap-4">
              <span className="h-px w-12 bg-white/5"></span>
              Powered by HIBP, Sherlock Engine, and OSINT Frameworks
              <span className="h-px w-12 bg-white/5"></span>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full px-10 py-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em] z-10 bg-[#05070a]">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Network Status: Secure
          </span>
          <span>Database: V2.4.1</span>
        </div>
        <div>© 2026 TRACECHECKER INTERFACE</div>
      </footer>
    </div>
  );
}
