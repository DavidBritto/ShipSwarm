import React, { useState } from 'react'
import { ShieldAlert, ChevronDown, ChevronRight } from 'lucide-react'
import type { Finding, FindingSeverity } from '../types'

interface FindingsListProps {
  findings: Finding[]
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  const [filter, setFilter] = useState<string>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = findings.filter((f) => {
    if (filter === 'ALL') return true
    return f.severity === filter
  })

  const getSeverityBadge = (severity: FindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'LOW':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30'
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700'
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span>Actionable Swarm Findings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Discovered vulnerabilities, bottlenecks, and configuration gaps across the target endpoint.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === lvl
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-500 font-mono text-xs">
          No findings matching the selected severity level.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const isExpanded = expandedId === f.id
            return (
              <div
                key={f.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
              >
                <div
                  onClick={() => toggleExpand(f.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(f.severity)}`}>
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">[{f.id}]</span>
                    <span className="text-sm font-semibold text-slate-200">{f.title}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      Source: {f.agent_source}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-900 bg-slate-900/30 text-xs space-y-3 pt-3">
                    <div>
                      <span className="font-mono text-slate-400 block text-[10px] uppercase font-bold mb-1">
                        Description & Impact
                      </span>
                      <p className="text-slate-300 leading-relaxed">{f.description}</p>
                    </div>

                    <div>
                      <span className="font-mono text-slate-400 block text-[10px] uppercase font-bold mb-1">
                        Evidence / Payload Detected
                      </span>
                      <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300/90 overflow-x-auto">
                        {f.evidence}
                      </pre>
                    </div>

                    {f.remediation_code && (
                      <div>
                        <span className="font-mono text-slate-400 block text-[10px] uppercase font-bold mb-1">
                          Remediation Recommendation
                        </span>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400">
                          {f.remediation_code}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
