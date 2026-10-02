import React, { useState } from 'react'
import { Rocket, Sparkles, GitBranch, Cpu, Database, Zap, Globe, Sliders, Shield, DollarSign } from 'lucide-react'
import type { BuildRequest } from '../types'

interface AuditFormProps {
  onStartBuild: (buildRequest: BuildRequest) => void
  isLoading: boolean
}

interface PresetArchetype {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  prompt: string
  slug: string
  archetype: 'serverless' | 'api' | 'event-driven' | 'web'
  badge: string
}

export const AuditForm: React.FC<AuditFormProps> = ({
  onStartBuild,
  isLoading,
}) => {
  // Builder State
  const [selectedArchetype, setSelectedArchetype] = useState<string>('ai-agent')
  const [prompt, setPrompt] = useState('Autonomous AI Agent & RAG reasoning engine with Amazon Bedrock, DynamoDB memory, and sub-50ms API Gateway routing')
  const [githubUrl, setGithubUrl] = useState('')
  const [projectName, setProjectName] = useState('bedrock-agent-core')
  const [buildRegion, setBuildRegion] = useState('us-east-1')
  const [optimizationGoal, setOptimizationGoal] = useState<'latency' | 'free-tier' | 'ha'>('latency')
  const [dryRun, setDryRun] = useState(false)
  const [autoVerify, setAutoVerify] = useState(true)

  const archetypes: PresetArchetype[] = [
    {
      id: 'ai-agent',
      title: 'AI Agent & Bedrock RAG',
      subtitle: 'Bedrock Claude/Nova • Lambda • DynamoDB',
      icon: Cpu,
      prompt: 'Autonomous AI Agent & RAG reasoning engine with Amazon Bedrock, DynamoDB memory, and sub-50ms API Gateway routing',
      slug: 'bedrock-agent-core',
      archetype: 'serverless',
      badge: 'Amazon Bedrock',
    },
    {
      id: 'ecommerce',
      title: 'Serverless E-Commerce',
      subtitle: 'API Gateway • Lambda • DynamoDB • Events',
      icon: Database,
      prompt: 'High-throughput serverless REST API with DynamoDB on-demand billing, inventory state, and EventBridge order bus',
      slug: 'ecommerce-engine',
      archetype: 'api',
      badge: 'Pay-Per-Request',
    },
    {
      id: 'streaming',
      title: 'Event Stream & Webhooks',
      subtitle: 'SQS FIFO • Lambda Worker • Fast Ingestion',
      icon: Zap,
      prompt: 'Sub-millisecond event streaming webhook receiver with Amazon SQS buffer, Lambda batch processor, and CloudWatch metrics',
      slug: 'event-stream-svc',
      archetype: 'event-driven',
      badge: 'Zero-Drop Queue',
    },
    {
      id: 'fullstack',
      title: 'Edge Fullstack Web',
      subtitle: 'CloudFront • S3 • Serverless API URL',
      icon: Globe,
      prompt: 'Next.js edge distributed application on Amazon CloudFront and S3 with serverless Python backend API',
      slug: 'edge-fullstack-app',
      archetype: 'web',
      badge: 'Edge CDN',
    },
  ]

  const handleSelectArchetype = (arch: PresetArchetype) => {
    setSelectedArchetype(arch.id)
    setPrompt(arch.prompt)
    setProjectName(arch.slug)
  }

  const handleBuildSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() && !githubUrl.trim()) return
    onStartBuild({
      prompt: prompt.trim() || undefined,
      github_repo_url: githubUrl.trim() || undefined,
      project_name: projectName.trim() || 'shipswarm-app',
      aws_region: buildRegion,
      dry_run: dryRun,
      auto_verify: autoVerify,
    })
  }

  return (
    <div className="authkit-card rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Autonomous Cloud Engine
            </span>
            <span className="block text-[10px] font-mono text-zinc-400">
              Zero to Shipped Builder • Natural Language & Repo to AWS
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold">
          4 Agents Active
        </span>
      </div>

      <form onSubmit={handleBuildSubmit} className="space-y-5">
        {/* 1. Architecture Archetype Cards */}
        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-2 flex items-center justify-between">
            <span>1. Select Architecture Blueprint</span>
            <span className="text-[10px] text-emerald-400 font-normal">Well-Architected Presets</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {archetypes.map((arch) => {
              const Icon = arch.icon
              const isSelected = selectedArchetype === arch.id
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => handleSelectArchetype(arch)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                      : 'bg-black/50 border-white/[0.06] hover:border-white/20 hover:bg-black/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-400 text-black' : 'bg-white/[0.05] text-zinc-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.05]">
                      {arch.badge}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {arch.title}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                      {arch.subtitle}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Product Prompt or Custom Intent */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono uppercase text-zinc-400">
              2. Describe Product Intent or Requirements
            </label>
            <span className="text-[10px] font-mono text-emerald-400">Bedrock Prompt Engine</span>
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to ship (e.g. 'Serverless subscription billing API with DynamoDB and API Gateway')..."
            className="authkit-input w-full rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 font-mono transition-all resize-none leading-relaxed"
          />
        </div>

        {/* 3. GitHub Repo Option */}
        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
              <span>Or Import Existing GitHub Repo</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Optional</span>
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/my-org/my-fastapi-service"
            className="authkit-input w-full rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 font-mono"
          />
        </div>

        {/* 4. Optimization Goal & Config */}
        <div className="bg-black/40 border border-white/[0.06] rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span className="uppercase text-[11px] font-bold text-zinc-300">Well-Architected Tuning</span>
            </span>
            <span className="text-[10px] text-zinc-500">Least-Privilege IAM Enforced</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setOptimizationGoal('latency')}
              className={`px-2 py-1.5 rounded-lg border text-center font-mono text-[10px] transition-all ${
                optimizationGoal === 'latency'
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-black/50 border-white/[0.06] text-zinc-400 hover:border-white/10'
              }`}
            >
              <Zap className="h-3 w-3 mx-auto mb-0.5 text-emerald-400" />
              Sub-50ms Latency
            </button>
            <button
              type="button"
              onClick={() => setOptimizationGoal('free-tier')}
              className={`px-2 py-1.5 rounded-lg border text-center font-mono text-[10px] transition-all ${
                optimizationGoal === 'free-tier'
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-black/50 border-white/[0.06] text-zinc-400 hover:border-white/10'
              }`}
            >
              <DollarSign className="h-3 w-3 mx-auto mb-0.5 text-cyan-400" />
              $0 Idle / Free Tier
            </button>
            <button
              type="button"
              onClick={() => setOptimizationGoal('ha')}
              className={`px-2 py-1.5 rounded-lg border text-center font-mono text-[10px] transition-all ${
                optimizationGoal === 'ha'
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-black/50 border-white/[0.06] text-zinc-400 hover:border-white/10'
              }`}
            >
              <Shield className="h-3 w-3 mx-auto mb-0.5 text-indigo-400" />
              Multi-AZ High Avail
            </button>
          </div>
        </div>

        {/* 5. Stack Slug & Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Stack Identifier Slug
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-cool-api"
              className="authkit-input w-full rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              AWS Target Region
            </label>
            <select
              value={buildRegion}
              onChange={(e) => setBuildRegion(e.target.value)}
              className="authkit-input w-full rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
            >
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="us-west-2">us-west-2 (Oregon)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs font-mono text-zinc-400">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoVerify}
              onChange={(e) => setAutoVerify(e.target.checked)}
              className="rounded bg-black border-zinc-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-zinc-300">Auto-verify with Strands Swarm</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="rounded bg-black border-zinc-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-zinc-300">Instant Dry-Run (Preview)</span>
          </label>
        </div>

        {/* CTA Launch Button */}
        <button
          type="submit"
          disabled={isLoading || (!prompt.trim() && !githubUrl.trim())}
          className="authkit-btn-primary w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Autonomous Cloud Engine Active...</span>
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              <span>🚀 Synthesize Architecture & Launch Swarm</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
