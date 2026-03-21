"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// --- Types & Interfaces ---
interface ScanLog {
  _id: string;
  target: string;
  riskScore: number;
  status: string;
  createdAt: string;
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const router = useRouter();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [metrics, setMetrics] = useState({ cpu: '0%', ram: '1.2GB', uptime: 'Connecting...' });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. Enhanced Logout ---
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    sessionStorage.clear();
    setIsAuthorized(false);
    router.push('/admin/login');
  }, [router]);

  // --- 2. Session Inactivity Logic ---
  const resetInactivityTimer = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      console.log("Session expired due to inactivity.");
      handleLogout();
    }, 15 * 60 * 1000); // 15 Minutes
  }, [handleLogout]);

  const fetchAdminData = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const [scanRes, healthRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/v1/scan/history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${SERVER_URL}/health`).catch(() => ({ 
          data: { uptime: 'Offline' } 
        }))
      ]);

      setScans(scanRes.data.data || []);
      setMetrics(prev => ({
        ...prev,
        uptime: healthRes.data.uptime || 'Offline',
        cpu: healthRes.data.uptime === 'Offline' ? '0%' : `${Math.floor(Math.random() * 8) + 12}%`
      }));
      
      setIsAuthorized(true);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Auth/Sync Error:", err.message);
      if (err.response?.status === 401) {
        handleLogout();
      } else if (err.response?.status === 404) {
        setErrorMsg("Endpoint 404: Check backend route definition.");
      } else {
        setErrorMsg("Neural Link Interrupted.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // --- 3. Combined Lifecycle Hook ---
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchAdminData();

    // Setup Activity Listeners
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);
    resetInactivityTimer();

    // Data Sync Interval
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('adminToken');
      if (currentToken) fetchAdminData();
    }, 15000); 

    // Cleanup
    return () => {
      clearInterval(interval);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keypress', resetInactivityTimer);
    };
  }, [fetchAdminData, resetInactivityTimer, router]);

  if (isLoading && !isAuthorized) {
    return (
      <div className="h-screen bg-[#05070A] flex flex-col items-center justify-center font-mono text-white">
        <div className="w-16 h-16 border-t-2 border-[#06f9f9] rounded-full animate-spin mb-4 shadow-[0_0_15px_#06f9f9]"></div>
        <p className="text-[#06f9f9] tracking-[0.3em] uppercase animate-pulse text-xs font-bold">
          Verifying Neural Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#05070A] font-sans text-slate-100 h-screen flex overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body { font-family: 'Space Grotesk', sans-serif; background: #05070A; }
        .cyber-border { border: 1px solid rgba(6, 249, 249, 0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 249, 249, 0.2); border-radius: 10px; }
      `}</style>

      {/* --- Sidebar --- */}
      <aside className="w-64 border-r border-white/5 bg-[#0C0F14]/80 backdrop-blur-md flex flex-col h-full z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded bg-[#06f9f9] flex items-center justify-center shadow-[0_0_20px_rgba(6,249,249,0.3)] cursor-pointer" onClick={() => router.push('/')}>
            <span className="material-symbols-outlined text-black font-black text-2xl">radar</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight uppercase leading-none text-white">Trace-Grid</h1>
            <span className="text-[9px] text-[#06f9f9]/70 uppercase font-black tracking-widest leading-none">Admin v2.4</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <NavItem icon="database" label="Intelligence Vault" active />
          <NavItem icon="history" label="Scan Archive" />
          <NavItem icon="security" label="Threat Matrix" />
          <NavItem icon="settings" label="System Config" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => router.push('/')} className="w-full bg-[#06f9f9]/10 border border-[#06f9f9]/30 py-2.5 rounded text-[#06f9f9] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#06f9f9] hover:text-black transition-all group">
            <span className="material-symbols-outlined text-sm group-hover:animate-spin">add_moderator</span> New Analysis
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {errorMsg && (
          <div className="bg-red-500/10 border-b border-red-500/30 py-2 px-8 flex items-center justify-between text-[9px] uppercase font-bold text-red-400 z-30 animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-500 animate-pulse"></span> {errorMsg}</span>
            <button onClick={fetchAdminData} className="underline hover:text-white">Retry Connection</button>
          </div>
        )}

        <header className="h-20 border-b border-white/5 bg-[#0C0F14]/50 px-8 flex items-center gap-6 z-10 shrink-0">
          <StatCard label="Uptime" value={metrics.uptime} />
          <StatCard label="CPU Load" value={metrics.cpu} />
          <StatCard label="Memory" value={metrics.ram} />
          <StatCard label="System Status" value={metrics.uptime === 'Offline' ? 'Warning' : 'Encrypted'} isHealth={metrics.uptime !== 'Offline'} />
        </header>

        <div className="flex-1 flex overflow-hidden">
          <section className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Intelligence Logs</h2>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Digital Footprint Database</p>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-[#06f9f9]">
                VAULT_ENTRIES: {scans.length}
              </div>
            </div>

            <div className="cyber-border rounded-xl bg-[#0C0F14]/40 overflow-hidden shadow-2xl backdrop-blur-sm">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-[10px] text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-black text-white">Target Identity</th>
                    <th className="px-6 py-4 text-center font-black text-white">Risk Vector</th>
                    <th className="px-6 py-4 text-center font-black text-white">Status</th>
                    <th className="px-6 py-4 text-right font-black text-white">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {scans.length > 0 ? scans.map((scan) => (
                    <tr key={scan._id} className="hover:bg-[#06f9f9]/5 transition-colors group">
                      <td className="px-6 py-4 text-white">
                        <p className="text-[#06f9f9] font-bold tracking-tight">{scan.target}</p>
                        <p className="text-[9px] text-slate-500 uppercase mt-0.5">{new Date(scan.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-sm ${scan.riskScore > 70 ? 'text-red-500' : 'text-emerald-400'}`}>
                          {scan.riskScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded border border-white/10 bg-white/5 font-black uppercase ${scan.status === 'Completed' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => router.push(`/results?id=${scan._id}`)}
                          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded text-[9px] font-black uppercase text-white hover:bg-[#06f9f9] hover:text-black transition-all shadow-[0_0_10px_rgba(6,249,249,0.1)]"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-600 italic tracking-widest text-xs uppercase">
                        No Intelligence Found // Vault Empty
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="w-72 border-l border-white/5 bg-[#0C0F14]/30 flex flex-col z-10">
            <div className="p-5 border-b border-white/5 flex items-center justify-between text-white">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em]">Neural Feed</h3>
              <span className={`size-1.5 rounded-full ${metrics.uptime === 'Offline' ? 'bg-red-500' : 'bg-[#06f9f9] animate-ping shadow-[0_0_8px_#06f9f9]'}`}></span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              <ActivityItem time="SYS" text="Administrator session secured" source="Core-v2" />
              {scans[0] && <ActivityItem time="SCAN" text={`Data points indexed for ${scans[0].target.substring(0,8)}...`} />}
              <ActivityItem time="NET" text={metrics.uptime === 'Offline' ? "Node connection dropped" : "Relay nodes operational"} source="OSINT-NET" />
            </div>
            
            <div className="p-5 border-t border-white/5 bg-[#0C0F14]/60 backdrop-blur-md">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="size-8 rounded bg-[#06f9f9]/20 flex items-center justify-center">
                   <span className="material-symbols-outlined text-[#06f9f9] text-lg">admin_panel_settings</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-black uppercase tracking-tighter truncate text-white">Ashu Kumari</p>
                  <p className="text-[9px] text-[#06f9f9] font-bold uppercase opacity-70">Administrator</p>
                </div>
                <button onClick={handleLogout} className="material-symbols-outlined text-slate-500 hover:text-red-500 transition-colors text-xl">
                  power_settings_new
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// Helper Components 
function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${active ? 'bg-[#06f9f9]/10 text-[#06f9f9] border border-[#06f9f9]/20 shadow-[0_0_10px_rgba(6,249,249,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="font-bold text-[11px] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StatCard({ label, value, isHealth = false }: { label: string; value: string; isHealth?: boolean }) {
  return (
    <div className="flex-1 p-3 border border-white/5 bg-white/5 rounded-lg flex items-center justify-between group hover:border-[#06f9f9]/20 transition-colors">
      <div className="flex-1 flex flex-col">
        <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.2em] leading-tight">{label}</span>
        <span className={`text-lg font-black font-mono leading-none mt-1 ${isHealth ? 'text-[#06f9f9]' : 'text-white'}`}>{value}</span>
      </div>
      {isHealth && <span className="material-symbols-outlined text-[#06f9f9] text-lg animate-pulse">verified_user</span>}
    </div>
  );
}

function ActivityItem({ time, text, source }: { time: string; text: string; source?: string }) {
  return (
    <div className="flex gap-4 relative text-white">
      <div className="w-1 h-1 rounded-full bg-[#06f9f9] mt-1.5 shrink-0 z-10 shadow-[0_0_5px_#06f9f9]"></div>
      <div className="flex-1 border-b border-white/5 pb-4 last:border-0">
        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">{time}</p>
        <p className="text-[11px] text-slate-300 leading-tight font-medium mt-1.5">{text}</p>
        {source && <span className="text-[8px] text-[#06f9f9]/40 font-mono mt-1.5 block uppercase">[{source}]</span>}
      </div>
    </div>
  );
}