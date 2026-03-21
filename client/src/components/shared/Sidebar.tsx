"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  // Home page par sidebar nahi dikhana chahiye
  if (pathname === "/") return null;

  const menu = [
    { name: 'Dashboard', icon: 'grid_view', path: '/admin' },
    { name: 'Active Scan', icon: 'radar', path: '/scan' },
    { name: 'Results', icon: 'analytics', path: '/results' },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0C0F14] h-screen sticky top-0 flex flex-col">
      <div className="p-6 font-bold text-[#06f9f9] text-xl tracking-tighter italic">TRACECHECKER</div>
      <nav className="flex-1 px-4 space-y-2">
        {menu.map((item) => (
          <Link key={item.path} href={item.path} 
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${pathname === item.path ? 'bg-[#06f9f9]/10 text-[#06f9f9] border border-[#06f9f9]/20' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}