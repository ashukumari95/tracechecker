"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// 1. Sabse pehle Logic aur UI ko ek separate component mein move karenge
function AnalysisResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const scanId = searchParams.get('id');
  const target = searchParams.get('target') || 'user@example.com';

  const [finalData, setFinalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- BACKEND DATA FETCH LOGIC ---
  useEffect(() => {
    const fetchReport = async () => {
      if (!scanId) return;
      try {
        // NOTE: Production mein localhost ki jagah environment variable use karein
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_BASE}/api/v1/scan/${scanId}`);
        setFinalData(response.data.data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [scanId]);

  const score = finalData?.riskScore || 0;
  const isHighRisk = score > 70;
  const riskColor = isHighRisk ? '#ef4444' : '#06f9f9';
  const riskLabel = isHighRisk ? 'Critical' : score > 40 ? 'Elevated' : 'Low Risk';

  if (loading) return (
    <div className="bg-[#0D1117] min-h-screen flex items-center justify-center">
      <div className="text-[#06f9f9] font-mono animate-pulse tracking-[0.5em] uppercase">
        Decoding Intelligence...
      </div>
    </div>
  );

  return (
    <div className="bg-[#0D1117] font-sans text-slate-100 min-h-screen flex flex-col">
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body { font-family: 'Space Grotesk', sans-serif; }
        .glass-card {
          background: rgba(22, 27, 34, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(6, 249, 249, 0.15);
        }
        .circular-progress {
          background: radial-gradient(closest-side, #161B22 79%, transparent 80% 100%),
                      conic-gradient(${riskColor} ${score}%, #1f2937 0);
        }
        .cyan-glow { box-shadow: 0 0 15px ${isHighRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 249, 249, 0.2)'}; }
      `}</style>

      <header className="flex items-center justify-between border-b border-white/5 px-6 lg:px-10 py-6 bg-[#0D1117] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#06f9f9]">
            <span className="material-symbols-outlined text-3xl font-bold">radar</span>
            <h1 className="text-white text-2xl font-bold tracking-tight">TraceChecker</h1>
          </div>
          <div className="hidden md:block bg-white/5 border border-white/10 px-3 py-1 rounded text-xs font-mono text-slate-400">
            {finalData?.target || target}
          </div>
        </div>
        <button onClick={() => router.push('/')} className="bg-[#06f9f9] text-black px-6 py-2 rounded font-black text-sm uppercase hover:brightness-110 shadow-[0_0_15px_rgba(6, 249, 249, 0.3)]">
          New Scan
        </button>
      </header>

      <main className="flex-1 px-6 lg:px-10 py-10 max-w-[1440px] mx-auto w-full">
        <div className="mb-10">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mb-1">
            Scan ID: {scanId?.slice(-8).toUpperCase()}
          </p>
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Analysis Results</h2>
          <p className="text-slate-400 max-w-2xl">Real-time assessment of your digital vulnerabilities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center relative">
            <div className="circular-progress w-48 h-48 rounded-full flex items-center justify-center cyan-glow transition-all duration-1000">
              <div className="flex flex-col items-center">
                <span className={`text-5xl font-black ${isHighRisk ? 'text-red-500' : 'text-[#06f9f9]'}`}>
                  {score}<span className="text-2xl opacity-60">/100</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{riskLabel}</span>
              </div>
            </div>
            <p className="mt-6 font-bold text-lg">Overall Risk Score</p>
          </div>

          <div className="glass-card rounded-xl p-8 flex flex-col justify-between hover:border-[#06f9f9]/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-red-500">leak_add</span>
              </div>
              <h3 className="text-slate-400 text-sm font-bold uppercase mb-1">Data Leaks Found</h3>
              <p className="text-4xl font-black">{finalData?.leaksFound || 0}</p>
            </div>
            <p className="text-red-400 text-sm mt-4">{isHighRisk ? 'Immediate Action Required' : 'Monitored via COMB'}</p>
          </div>

          <div className="glass-card rounded-xl p-8 flex flex-col justify-between hover:border-[#06f9f9]/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#06f9f9]/10 border border-[#06f9f9]/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#06f9f9]">hub</span>
              </div>
              <h3 className="text-slate-400 text-sm font-bold uppercase mb-1">Active Profiles</h3>
              <p className="text-4xl font-black">{finalData?.activeProfiles || 0}</p>
            </div>
            <p className="text-emerald-400 text-sm mt-4">Verified Social Footprint</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-7 glass-card rounded-xl p-8">
            <h3 className="text-xl font-bold mb-8">Vulnerability Insights</h3>
            <div className="relative border-l border-slate-800 ml-4 space-y-8">
               {finalData?.leaksFound > 0 ? (
                 <TimelineItem title="Public COMB Exposure" date="Recent Analysis" severity="Critical" tags={['Breach Detect', 'Email Leak']} />
               ) : (
                 <TimelineItem title="No Major Breaches" date="Clean Record" severity="Safe" tags={['Database Clean']} />
               )}
               <TimelineItem title="Social Metadata" date="Profile Crawler" severity="Medium" tags={['Identity Match']} />
            </div>
          </div>

          <div className="lg:col-span-5 glass-card rounded-xl p-8">
            <h3 className="text-xl font-bold mb-8">Digital Presence</h3>
            <div className="grid grid-cols-5 gap-4">
              {['public', 'work', 'photo_camera', 'terminal', 'chat'].map((icon, i) => (
                <div key={i} className={`flex flex-col items-center gap-2 ${i >= (finalData?.activeProfiles || 0) ? 'opacity-20' : ''}`}>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-[#06f9f9]/40 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-[#06f9f9]">{icon}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 p-5 rounded-lg border border-[#06f9f9]/20 bg-[#06f9f9]/5">
              <h4 className="font-bold text-sm mb-1 text-[#06f9f9]">Privacy Insight</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Identity cross-referenced across {finalData?.activeProfiles || 0} secure nodes. Risk calculated via OSINT modules.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-10 py-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/10 uppercase tracking-[0.2em] bg-[#0D1117]">
        <div>Node Status: Secure</div>
        <div>© 2026 TRACECHECKER INTERFACE</div>
      </footer>
    </div>
  );
}

// 2. Main component jo export hoga, usme Suspense Boundary wrap karenge
export default function AnalysisResults() {
  return (
    <Suspense fallback={
      <div className="bg-[#0D1117] min-h-screen flex items-center justify-center">
        <div className="text-[#06f9f9] font-mono animate-pulse tracking-[0.5em] uppercase">
          Initializing Neural Link...
        </div>
      </div>
    }>
      <AnalysisResultsContent />
    </Suspense>
  );
}

function TimelineItem({ title, date, severity, tags }: any) {
  const isSafe = severity === 'Safe';
  return (
    <div className="relative pl-8">
      <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${isSafe ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-[#06f9f9] shadow-[0_0_10px_#06f9f9]'}`}></div>
      <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800 hover:border-[#06f9f9]/20 transition-all">
        <div className="flex justify-between mb-1">
          <h4 className="font-bold text-white">{title}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{severity}</span>
        </div>
        <p className="text-xs text-slate-500 mb-2">{date}</p>
        <div className="flex gap-2 flex-wrap">
          {tags.map((t: string) => <span key={t} className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 border border-white/5">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
