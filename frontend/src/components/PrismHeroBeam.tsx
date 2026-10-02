import React, { useState, useEffect } from 'react'

export const PrismHeroBeam: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      // Normalize between -1 and 1
      const x = (e.clientX / innerWidth) * 2 - 1
      const y = (e.clientY / innerHeight) * 2 - 1
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Dynamic light beam deflection based on cursor
  const beamAngleOffset = mousePos.x * 6 // degrees

  return (
    <div className="absolute top-0 left-0 right-0 h-[620px] overflow-hidden pointer-events-none select-none z-0">
      {/* Top Incident White Light Source (Laser entering the apex) */}
      <div 
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[3px] h-[220px] bg-gradient-to-b from-white/0 via-white to-white shadow-[0_0_24px_6px_rgba(255,255,255,0.9)] opacity-90 transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-50%) rotate(${beamAngleOffset * 0.4}deg)`,
          transformOrigin: 'top center',
        }}
      />

      {/* Optical Flare / Hotspot at Prism Entry Point */}
      <div 
        className="absolute top-[130px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white blur-[6px] shadow-[0_0_50px_15px_rgba(255,255,255,1)] opacity-95 transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-50% + ${mousePos.x * 12}px)) translateY(${mousePos.y * 6}px)`,
        }}
      />

      {/* 3D Glass Prism Geometry (Refraction Core) */}
      <div 
        className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[140px] h-[120px] transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-50% + ${mousePos.x * 12}px)) translateY(${mousePos.y * 6}px) rotateY(${mousePos.x * 14}deg)`,
          perspective: '600px',
        }}
      >
        <svg 
          viewBox="0 0 140 120" 
          className="w-full h-full filter drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]"
        >
          {/* Glass Fill with subtle gradient */}
          <polygon 
            points="70,10 130,110 10,110" 
            fill="url(#prismGlassGradient)" 
            className="opacity-40"
          />

          {/* Internal Refraction Glow Line */}
          <line 
            x1="70" y1="20" x2="105" y2="105" 
            stroke="url(#prismCoreRainbow)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="animate-pulse"
          />

          {/* Prism Glass Edges & Specular Highlights */}
          <polygon 
            points="70,10 130,110 10,110" 
            fill="none" 
            stroke="rgba(255,255,255,0.7)" 
            strokeWidth="1.5" 
            className="opacity-80"
          />

          {/* Left Bevel (Incident entry highlight) */}
          <line 
            x1="70" y1="10" x2="10" y2="110" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            className="opacity-90 filter drop-shadow-[0_0_8px_#ffffff]"
          />

          {/* Right Bevel (Rainbow exit highlight) */}
          <line 
            x1="70" y1="10" x2="130" y2="110" 
            stroke="url(#prismCoreRainbow)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            className="opacity-90 filter drop-shadow-[0_0_10px_#10b981]"
          />

          {/* Bottom Shelf */}
          <line 
            x1="10" y1="110" x2="130" y2="110" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1" 
          />

          {/* SVG Gradients */}
          <defs>
            <linearGradient id="prismGlassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="prismCoreRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Refracted Dispersion Fan (The Next.js Conf signature light ray) */}
      <div 
        className="absolute top-[170px] left-1/2 -translate-x-1/2 w-[1100px] h-[500px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(-50%) rotate(${beamAngleOffset}deg)`,
          transformOrigin: 'top center',
        }}
      >
        {/* Ray 1: Ultraviolet / Deep Violet */}
        <div 
          className="absolute top-0 left-1/2 origin-top h-[540px] w-[90px] -translate-x-1/2 -rotate-[32deg] opacity-40 blur-[28px] mix-blend-screen"
          style={{
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.8) 0%, rgba(99, 102, 241, 0.4) 50%, transparent 100%)',
          }}
        />

        {/* Ray 2: Electric Cyan */}
        <div 
          className="absolute top-0 left-1/2 origin-top h-[540px] w-[110px] -translate-x-1/2 -rotate-[16deg] opacity-55 blur-[24px] mix-blend-screen"
          style={{
            background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.9) 0%, rgba(14, 165, 233, 0.5) 50%, transparent 100%)',
          }}
        />

        {/* Ray 3: Pure Strands Emerald (Primary Hackathon Core Beam) */}
        <div 
          className="absolute top-0 left-1/2 origin-top h-[560px] w-[130px] -translate-x-1/2 rotate-[0deg] opacity-70 blur-[22px] mix-blend-screen"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(16, 185, 129, 0.85) 25%, rgba(5, 150, 105, 0.4) 65%, transparent 100%)',
          }}
        />

        {/* Ray 4: Radiant Amber / Gold */}
        <div 
          className="absolute top-0 left-1/2 origin-top h-[540px] w-[110px] -translate-x-1/2 rotate-[16deg] opacity-55 blur-[24px] mix-blend-screen"
          style={{
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.85) 0%, rgba(217, 119, 6, 0.45) 50%, transparent 100%)',
          }}
        />

        {/* Ray 5: Neon Hot Magenta / Rose */}
        <div 
          className="absolute top-0 left-1/2 origin-top h-[540px] w-[90px] -translate-x-1/2 rotate-[32deg] opacity-45 blur-[28px] mix-blend-screen"
          style={{
            background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.8) 0%, rgba(225, 29, 72, 0.4) 50%, transparent 100%)',
          }}
        />

        {/* Soft Ambient Caustic Cone */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] opacity-35 blur-[60px] mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(16, 185, 129, 0.4), rgba(6, 182, 212, 0.25) 40%, rgba(244, 63, 94, 0.15) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* Optical Horizontal Horizon Flare (Keynote Stage Glow) */}
      <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[1px] opacity-60" />
      <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-[400px] h-[3px] bg-gradient-to-r from-cyan-400/0 via-emerald-400 to-rose-400/0 blur-[2px] opacity-70" />
    </div>
  )
}
