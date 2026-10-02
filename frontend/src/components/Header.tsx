import React from 'react'
import { Cpu, ExternalLink } from 'lucide-react'

export const Header: React.FC = () => {
  return (
    <header className="border-b border-white/[0.06] bg-[#05070c]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]">
            <Cpu className="h-5 w-5 text-[#021a12] stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                ShipSwarm AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                AWS Strands Swarm
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Autonomous Cloud Engine & Production Swarm
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bedrock Online</span>
          </div>

          <a
            href="https://builder.aws.com/build/hackathons/e83e84e5-4f4c-383b-bbe9-4a15ac195d55/zero-to-shipped"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <span>AWS Zero to Shipped</span>
            <ExternalLink className="h-3 w-3 text-emerald-400" />
          </a>
        </div>
      </div>
    </header>
  )
}
