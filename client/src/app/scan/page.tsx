"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// 1. Pura logic aur UI is internal component mein move kiya
function ScanConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const scanId = searchParams.get('id'); 
  const target = searchParams.get('target') || 'Targeting...';

  const [scanData, setScanData] = useState<any>(null);
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 1. POLLING LOGIC ---
  useEffect(() => {
    if (!scanId || scanId === 'undefined' || scanId === '') return;

    let pollInterval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        // Render Backend URL variable use kiya
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_BASE}/api/v1/scan/${scanId}`);
        const data = response.data.data;
        if (!data) return;

        setScanData(data);

        const isFinished = data.status === 'Completed' || data.status === 'completed';
        if (isFinished || data.status === 'failed' || data.status === 'Failed') {
          clearInterval(pollInterval);
        }
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          clearInterval(pollInterval);
        }
      }
    };

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 3000);

    return () => clearInterval(pollInterval);
  }, [scanId]);

  // --- 2. LOG ANIMATION ---
  useEffect(() => {
    if (!scanData?.logs) return;

    const interval = setInterval(() => {
      setDisplayedLogs((prev) => {
        if (prev.length < scanData.logs.length) {
          const nextLog = scanData.logs[prev.length];
          const isFinished = scanData.status === 'Completed' || scanData.status === 'completed';
          const newProgress = isFinished && (prev.length + 1 === scanData.logs.length) 
            ? 100 
            : Math.min((prev.length + 1) * 15, 98);
          
          setProgress(newProgress);

          if (newProgress === 100) {
            setTimeout(() => router.push(`/results?id=${scanId}`), 2000);
          }

          return [...prev, nextLog];
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [scanData, scanId, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  if (!scanId || scanId === 'undefined') {
    return (
      <div className="bg-[#0D1117] min-h-screen flex items-center justify-center font-mono text-[#06f9f9]">
        <div className="animate-pulse tracking-widest uppercase text-sm">Initializing Neural Link...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] font-sans text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <header className="flex items-center justify-between border-b border-white/5 px-6 lg:px-10 py-6 bg-[#0D1117] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest ${progress === 100 ? 'bg-emerald-500 text-black' : 'bg-[#06f9f9] text-black'}`}>
            {progress === 100 ? 'Scan Finished' : 'Live Scan'}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">{target}</h2>
        </div>
        <button onClick={() => router.push('/')} className="text-red-500 border border-red-500/20 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
          Terminate Trace
        </button>
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-10 py-10 flex flex-col gap-6">
        <div className="flex justify-between items-end mb-2">
            <div>
                <h3 className="text-white text-2xl font-black tracking-tight uppercase">Deep Trace Engine</h3>
                <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">
                    {progress === 100 ? 'Analysis Finalized' : 'Processing global data nodes...'}
                </p>
            </div>
            <span className="text-[#06f9f9] text-4xl font-black font-mono tracking-tighter">{progress}%</span>
        </div>
        
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#06f9f9] shadow-[0_0_15px_#06f9f9] transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-4">
            <StatBox label="Risk Level" value={scanData?.riskScore > 60 ? "High Risk" : "Elevated"} color={scanData?.riskScore > 60 ? "text-red-500" : "text-amber-500"} />
            <StatBox label="Profiles Found" value={scanData?.activeProfiles || 0} />
            <StatBox label="Leaks Found" value={scanData?.leaksFound || 0} color="text-red-500" />
            
            <div className="mt-auto border border-white/5 p-5 rounded-lg bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2 text-[#06f9f9] font-bold text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">vpn_lock</span> Neural Tunnel
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">Routing through 14 secure proxies. Data encrypted via AES-256.</p>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 bg-[#0D1117] rounded-lg border border-white/10 flex flex-col overflow-hidden shadow-2xl min-h-[450px]">
              <div className="bg-[#1c2128]/50 border-b border-white/5 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">
                <div className="flex gap-1.5">
                    <div className="size-2 rounded-full bg-red-500/50"></div>
                    <div className="size-2 rounded-full bg-yellow-500/50"></div>
                    <div className="size-2 rounded-full bg-green-500/50"></div>
                </div>
                <span>Terminal_Output_v2.0</span>
                <span className="material-symbols-outlined text-xs">terminal</span>
              </div>
              
              <div ref={scrollRef} className="flex-1 p-6 font-mono text-[13px] space-y-2 overflow-y-auto scroll-smooth">
                {displayedLogs.map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-700 shrink-0">[{log.time}]</span>
                    <p className="text-slate-300">
                        <span className={`${log.type === 'WARN' ? 'text-red-500' : log.type === 'OK' ? 'text-green-400' : 'text-cyan-400'} font-bold mr-2 uppercase`}>
                            [{log.type}]
                        </span> 
                        {log.message}
                    </p>
                  </div>
                ))}
                
                {progress < 100 && (
                  <div className="text-[#06f9f9] font-bold animate-pulse flex items-center gap-2 mt-4 text-[10px] uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span> 
                    Analyzing data packet...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-10 py-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/10 uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <span>Mainframe: Online</span>
          <span>Encryption: AES-256</span>
        </div>
        <span>© 2026 TRACECHECKER_OSINT_LABS</span>
      </footer>
    </div>
  );
}

// 2. Main Export with Suspense Wrapper
export default function ScanConsole() {
  return (
    <Suspense fallback={
        <div className="bg-[#0D1117] min-h-screen flex items-center justify-center font-mono text-[#06f9f9]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin material-symbols-outlined text-4xl">sync</div>
                <p className="tracking-widest uppercase animate-pulse text-sm">Establishing Secure Tunnel...</p>
            </div>
        </div>
    }>
      <ScanConsoleContent />
    </Suspense>
  );
}

function StatBox({ label, value, color = "text-white" }: any) {
  return (
    <div className="bg-white/[0.02] p-5 rounded-lg border border-white/5">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-black font-sans ${color}`}>{value}</p>
    </div>
  );
}
