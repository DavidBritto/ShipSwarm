import React, { useEffect, useRef } from 'react'
import { Terminal, Shield, Zap, Activity, Award, ArrowRight } from 'lucide-react'
import type { SwarmEvent } from '../types'

interface SwarmConsoleProps {
  events: SwarmEvent[]
  activeAgent: string
  isStreaming: boolean
}

export const SwarmConsole: React.FC<SwarmConsoleProps> = ({ events, activeAgent, isStreaming }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  const getAgentBadge = (agent: string) => {
    if (agent.includes('Ingest')) {
      return {
        name: 'Agent-Ingest',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        icon: <Terminal className="h-3 w-3 inline mr-1 text-purple-400" />,
      }
    }
    if (agent.includes('InfraEngine')) {
      return {
        name: 'Agent-InfraEngine',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        icon: <Zap className="h-3 w-3 inline mr-1 text-cyan-400" />,
      }
    }
    if (agent.includes('Deployer')) {
      return {
        name: 'Agent-Deployer',
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        icon: <Award className="h-3 w-3 inline mr-1 text-indigo-400" />,
      }
    }
    if (agent.includes('Sec')) {
      return {
        name: 'Sentinel-Sec',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        icon: <Shield className="h-3 w-3 inline mr-1 text-rose-400" />,
      }
    }
    if (agent.includes('Chaos')) {
      return {
        name: 'Sentinel-Chaos',
        color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        icon: <Zap className="h-3 w-3 inline mr-1 text-teal-400" />,
      }
    }
    if (agent.includes('CloudWatch')) {
      return {
        name: 'Sentinel-CloudWatch',
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        icon: <Activity className="h-3 w-3 inline mr-1 text-sky-400" />,
      }
    }
    return {
      name: 'Sentinel-Architect',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: <Award className="h-3 w-3 inline mr-1 text-emerald-400" />,
    }
  }

  const agents = [
    { id: 'Agent-Ingest', label: '1. Ingest', icon: Terminal, color: 'text-purple-400' },
    { id: 'Sentinel-Architect', label: '2. Architect', icon: Award, color: 'text-emerald-400' },
    { id: 'Agent-Deployer', label: '3. Cloud Deploy', icon: Award, color: 'text-indigo-400' },
    { id: 'Sentinel-Sec', label: '4. Strands Sentinels', icon: Shield, color: 'text-rose-400' },
  ]

  return (
    <div className="authkit-card rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Console Header with Peer-to-Peer Pipeline Tracker */}
      <div className="bg-black/50 border-b border-white/[0.06] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-zinc-200">
            Strands Swarm Deliberation Console
          </span>
          {isStreaming && (
            <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE PEER HANDOFF</span>
            </span>
          )}
        </div>

        {/* Swarm Peers Pipeline */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-mono">
          {agents.map((ag, idx) => {
            const Icon = ag.icon
            const isActive = activeAgent === ag.id
            return (
              <React.Fragment key={ag.id}>
                <div
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] text-white font-bold'
                      : 'text-zinc-500 border-transparent hover:text-zinc-400'
                  }`}
                >
                  <Icon className={`h-3 w-3 ${ag.color}`} />
                  <span className="hidden md:inline">{ag.label}</span>
                </div>
                {idx < agents.length - 1 && (
                  <ArrowRight className="h-2.5 w-2.5 text-zinc-600" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Terminal Event Stream Body */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 bg-[#04060a]">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Terminal className="h-8 w-8 stroke-1 text-slate-700" />
            <p className="text-xs">Awaiting target submission to initialize Strands Swarm...</p>
          </div>
        ) : (
          events.map((ev, index) => {
            const badge = getAgentBadge(ev.agent_name)
            const isHandoff = ev.event_type === 'handoff'
            const isFinding = ev.event_type === 'finding'
            const isMetric = ev.event_type === 'metric_update'
            const isTool = ev.event_type === 'tool_call'

            return (
              <div
                key={index}
                className={`p-2 rounded-lg border transition-all ${
                  isHandoff
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : isFinding
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : isMetric
                    ? 'bg-sky-950/20 border-sky-500/30 text-sky-200'
                    : isTool
                    ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                    : 'bg-transparent border-transparent text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] text-slate-500">
                    {new Date(ev.timestamp * 1000).toLocaleTimeString()}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                    {badge.icon}
                    {badge.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    [{ev.event_type}]
                  </span>
                </div>
                <div className="text-xs font-mono leading-relaxed pl-1">
                  {ev.message}
                </div>

                {ev.payload && (
                  <pre className="mt-1 text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800/80 overflow-x-auto">
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
