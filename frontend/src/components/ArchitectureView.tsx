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
    <div className="authkit-card rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Synthesized AWS Architecture
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
              {topology.app_archetype}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1 flex items-center space-x-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span>{topology.architecture_name}</span>
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/60 border border-white/[0.08] rounded-xl text-xs font-mono">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-zinc-400">Est. Cost:</span>
            <span className="font-bold text-white">${topology.cost_estimate_monthly_usd.toFixed(2)}/mo</span>
          </div>

          {cfTemplate && (
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 rounded-xl text-xs font-mono text-zinc-200 flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>{showTemplate ? 'Hide IaC' : 'View CloudFormation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rationale Narrative */}
      <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
          Well-Architected Rationale
        </span>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          {topology.rationale}
        </p>
      </div>

      {/* Active AWS Services Badges */}
      <div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">
          Provisioned AWS Services
        </span>
        <div className="flex flex-wrap gap-2">
          {topology.services.map((svc, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/60 border border-white/[0.07] rounded-xl text-xs font-mono text-zinc-200 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{svc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Deployed Endpoint Banner */}
      {endpointUrl && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex items-center space-x-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                Live Shipped AWS Endpoint
              </span>
              <span className="text-xs font-mono text-zinc-200 break-all">
                {endpointUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`${endpointUrl}/health`}
              target="_blank"
              rel="noreferrer"
              className="authkit-btn-primary px-4 py-2 rounded-xl text-xs font-mono flex items-center space-x-1.5"
            >
              <span>Test /health</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* CloudFormation Template Drawer */}
      {showTemplate && cfTemplate && (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-black/90">
          <div className="bg-zinc-950 border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">AWS CloudFormation Template (JSON)</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-72">
            {cfTemplate}
          </pre>
        </div>
      )}
    </div>
  )
}
