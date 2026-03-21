"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Env variables for Production
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const PAYLOAD_SECRET = process.env.NEXT_PUBLIC_PAYLOAD_SECRET || 'trace_secret_payload_key';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 🛡️ ENCRYPTION: Password ko bhejte waqt encrypt karna
      const encryptedPassword = CryptoJS.AES.encrypt(password.trim(), PAYLOAD_SECRET).toString();

      // 🌐 API REQUEST
      const res = await axios.post(`${API_BASE}/api/v1/auth/admin-login`, {
        username: username.trim(),
        encryptedPassword: encryptedPassword 
      });

      if (res.data.success) {
        // Token store karein
        localStorage.setItem('adminToken', res.data.token);
        
        // Dashboard par bhejien (Make sure folder exists at /admin/dashboard)
        router.push('/admin'); 
      }
    } catch (err: any) {
      console.error("Login Handshake Failed:", err);
      setError(err.response?.data?.message || 'Access Denied: Invalid Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center font-sans p-6 overflow-hidden relative">
      {/* Dynamic Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#06f9f9]/5 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0C0F14]/80 backdrop-blur-2xl border border-[#06f9f9]/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,249,249,0.05)]">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="size-16 rounded-xl bg-[#06f9f9]/10 border border-[#06f9f9]/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,249,249,0.1)]">
              <span className="material-symbols-outlined text-[#06f9f9] text-4xl font-bold animate-pulse">security</span>
            </div>
            <h1 className="text-white text-2xl font-black tracking-tighter uppercase">Trace Console</h1>
            <div className="flex items-center gap-2">
              <span className="size-1.5 bg-[#06f9f9] rounded-full animate-ping"></span>
              <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Encrypted Session Only</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] p-3 rounded-lg text-center font-bold uppercase tracking-wider">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Admin Identity</label>
              <input 
                type="text" 
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#05070A] border border-white/5 rounded-lg px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#06f9f9]/40 transition-all font-mono placeholder:text-slate-800"
                placeholder="root_operator"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Encryption Key</label>
              <input 
                type="password" 
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#05070A] border border-white/5 rounded-lg px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#06f9f9]/40 transition-all font-mono placeholder:text-slate-800"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="group w-full bg-[#06f9f9] text-black font-black py-4 rounded-lg uppercase text-[11px] tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(6,249,249,0.15)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Bypassing Firewalls...
                </>
              ) : (
                'Initialize Handshake'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[8px] text-slate-600 uppercase font-mono tracking-widest leading-relaxed">
            All connection attempts are monitored by TraceChecker Neural Shield.<br/>
            IP: 127.0.0.1 | Auth: RSA_AES_256
          </p>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
}
