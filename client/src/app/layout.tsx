import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// TraceChecker ke liye Cyber-style fonts
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jet-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TraceChecker | Digital Footprint Analyzer",
  description: "Identify and analyze your digital exposure across the open web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[#080A0C] text-slate-100 antialiased min-h-screen relative overflow-x-hidden`}
      >
        {/* Global Grid Overlay - Ye har page ke background mein rahega */}
        <div 
          className="fixed inset-0 pointer-events-none z-[-1] opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 249, 249, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 249, 249, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />

        {/* Global Radial Glow */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-[-1]" />
        
        {children}
      </body>
    </html>
  );
}