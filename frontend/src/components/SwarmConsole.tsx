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
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        icon: <Zap className="h-3 w-3 inline mr-1 text-amber-400" />,
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
    { id: 'Sentinel-Sec', label: '1. Sec Prober', icon: Shield, color: 'text-rose-400' },
    { id: 'Sentinel-Chaos', label: '2. Chaos & Latency', icon: Zap, color: 'text-amber-400' },
    { id: 'Sentinel-CloudWatch', label: '3. CloudWatch', icon: Activity, color: 'text-sky-400' },
    { id: 'Sentinel-Architect', label: '4. Architect Lead', icon: Award, color: 'text-emerald-400' },
  ]

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Console Header with Peer-to-Peer Pipeline Tracker */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            Strands Swarm Deliberation Console
          </span>
          {isStreaming && (
            <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
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
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-all ${
                    isActive
                      ? 'bg-slate-800 border-amber-500/50 shadow-sm text-white font-bold'
                      : 'text-slate-500 border-transparent'
                  }`}
                >
                  <Icon className={`h-3 w-3 ${ag.color}`} />
                  <span className="hidden md:inline">{ag.label}</span>
                </div>
                {idx < agents.length - 1 && (
                  <ArrowRight className="h-2.5 w-2.5 text-slate-600" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Terminal Event Stream Body */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 bg-[#060910]">
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
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
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
