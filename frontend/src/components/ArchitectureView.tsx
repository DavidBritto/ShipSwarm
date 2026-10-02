import React, { useState } from 'react'
import { Layers, DollarSign, CheckCircle2, ExternalLink, Code2, Copy, Check } from 'lucide-react'
import type { ArchitectureTopology } from '../types'

interface ArchitectureViewProps {
  topology: ArchitectureTopology
  endpointUrl?: string
  cfTemplate?: string
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  topology,
  endpointUrl,
  cfTemplate,
}) => {
  const [showTemplate, setShowTemplate] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (cfTemplate) {
      navigator.clipboard.writeText(cfTemplate)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Synthesized AWS Architecture
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {topology.app_archetype}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1 flex items-center space-x-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span>{topology.architecture_name}</span>
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400">Est. Cost:</span>
            <span className="font-bold text-white">${topology.cost_estimate_monthly_usd.toFixed(2)}/mo</span>
          </div>

          {cfTemplate && (
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>{showTemplate ? 'Hide IaC' : 'View CloudFormation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rationale Narrative */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
          Well-Architected Rationale
        </span>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {topology.rationale}
        </p>
      </div>

      {/* Active AWS Services Badges */}
      <div>
        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
          Provisioned AWS Services
        </span>
        <div className="flex flex-wrap gap-2">
          {topology.services.map((svc, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800/90 rounded-xl text-xs font-mono text-slate-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{svc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Deployed Endpoint Banner */}
      {endpointUrl && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                Live Shipped AWS Endpoint
              </span>
              <span className="text-xs font-mono text-slate-200 break-all">
                {endpointUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`${endpointUrl}/health`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 hover:bg-emerald-400 transition-colors shadow-sm"
            >
              <span>Test /health</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* CloudFormation Template Drawer */}
      {showTemplate && cfTemplate && (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#060910]">
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">AWS CloudFormation Template (JSON)</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">
            {cfTemplate}
          </pre>
        </div>
      )}
    </div>
  )
}
