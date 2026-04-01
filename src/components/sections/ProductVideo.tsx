import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import { Shield, Bug, Zap, Search } from 'lucide-react';

const FloatingBadge = ({ children, icon: Icon, delay = 0, className = "" }: { children: React.ReactNode, icon: any, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0, 1, 1, 0.8],
      y: [20, 0, -5, 0],
    }}
    transition={{ 
      duration: 4, 
      delay, 
      repeat: Infinity,
      repeatType: "reverse"
    }}
    className={`absolute z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
  >
    <Icon className="w-3.5 h-3.5 text-cyan" />
    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">{children}</span>
  </motion.div>
);

export default function ProductVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsUrl = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.play().catch(e => console.error("Auto-play failed:", e));
    };

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', playVideo);
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Floating UI Elements */}
      <div className="absolute inset-0 z-40 hidden md:block opacity-90">
        <FloatingBadge icon={Search} delay={0.5} className="top-[20%] left-[15%]">Scanning repository...</FloatingBadge>
        <FloatingBadge icon={Bug} delay={1.5} className="bottom-[30%] right-[15%]">+32 issues detected</FloatingBadge>
        <FloatingBadge icon={Shield} delay={2.5} className="top-[40%] right-[20%]">Security Score: 94%</FloatingBadge>
        <FloatingBadge icon={Zap} delay={3.5} className="bottom-[20%] left-[20%]">Analysis Pipeline: Active</FloatingBadge>
      </div>

      {/* Video Element - Increased Opacity for Visibility */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-70 contrast-125 brightness-110 transition-opacity duration-1000"
      />

      {/* Simple Fades for Contrast */}
      <div className="absolute inset-0 bg-void/10 mix-blend-overlay"></div>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-void to-transparent"></div>
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-void/60 to-transparent"></div>
    </div>
  );
}
