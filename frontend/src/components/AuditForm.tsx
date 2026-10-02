import React, { useState } from 'react'
import { Rocket, Globe, Sparkles, GitBranch, ShieldAlert } from 'lucide-react'
import type { BuildRequest } from '../types'

interface AuditFormProps {
  onStartAudit: (targetUrl: string, region: string, appType: string, service: string) => void
  onStartBuild: (buildRequest: BuildRequest) => void
  isLoading: boolean
}

export const AuditForm: React.FC<AuditFormProps> = ({
  onStartAudit,
  onStartBuild,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'audit'>('build')

  // Build Mode State
  const [prompt, setPrompt] = useState('Serverless E-Commerce API with DynamoDB, inventory tracking, and sub-50ms latency')
  const [githubUrl, setGithubUrl] = useState('')
  const [projectName, setProjectName] = useState('ecommerce-api')
  const [buildRegion, setBuildRegion] = useState('us-east-1')
  const [dryRun, setDryRun] = useState(false)
  const [autoVerify, setAutoVerify] = useState(true)

  // Audit Mode State
  const [targetUrl, setTargetUrl] = useState('')
  const [auditRegion, setAuditRegion] = useState('us-east-1')
  const [appType, setAppType] = useState('api')
  const [service, setService] = useState('apigateway')

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

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUrl.trim()) return
    onStartAudit(targetUrl.trim(), auditRegion, appType, service)
  }

  const promptPresets = [
    {
      title: 'E-Commerce API',
      prompt: 'Serverless REST API with DynamoDB for e-commerce products and inventory management',
      name: 'ecommerce-api',
    },
    {
      title: 'AI Webhook Engine',
      prompt: 'High-throughput event webhook processor with SQS and DynamoDB for AI agents',
      name: 'agent-webhook',
    },
    {
      title: 'Real-time Metrics',
      prompt: 'FastAPI microservice collecting user telemetry with CloudWatch metrics logging',
      name: 'telemetry-svc',
    },
  ]

  return (
    <div className="authkit-card rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mode Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-white/[0.07] mb-6 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('build')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'build'
              ? 'bg-emerald-500 text-[#021a12] font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Autonomous Builder (Zero to Shipped)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'audit'
              ? 'bg-emerald-500 text-[#021a12] font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Audit Existing Target</span>
        </button>
      </div>

      {activeTab === 'build' ? (
        /* BUILD MODE FORM */
        <form onSubmit={handleBuildSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase text-zinc-400">
                Product Prompt or Feature Idea
              </label>
              <span className="text-[10px] font-mono text-emerald-400">Natural Language</span>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to ship (e.g. 'Serverless subscription billing API with DynamoDB and API Gateway')..."
              className="authkit-input w-full rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 font-mono transition-all resize-none"
            />

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="text-zinc-500">Presets:</span>
              {promptPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(preset.prompt)
                    setProjectName(preset.name)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/[0.06] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors shadow-sm"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center space-x-1">
              <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
              <span>Public GitHub Repo (Optional alternative)</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/fastapi/fastapi (optional)"
              className="authkit-input w-full rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 font-mono"
            />
          </div>

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
                AWS Region
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
              <span>Auto-verify with Strands Swarm</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="rounded bg-black border-zinc-700 text-emerald-500 focus:ring-0"
              />
              <span>Instant Dry-Run (Preview)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !githubUrl.trim())}
            className="authkit-btn-primary w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Autonomous Cloud Engine Active...</span>
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                <span>🚀 Unleash Autonomous Cloud Engine</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* AUDIT MODE FORM */
        <form onSubmit={handleAuditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Public Endpoint Target (HTTPS)
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.my-startup-mvp.com or https://d1abc.cloudfront.net"
              className="authkit-input w-full rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 font-mono transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                AWS Region
              </label>
              <select
                value={auditRegion}
                onChange={(e) => setAuditRegion(e.target.value)}
                className="authkit-input w-full rounded-xl px-3 py-2.5 text-xs text-zinc-200 font-mono"
              >
                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                <option value="us-west-2">us-west-2 (Oregon)</option>
                <option value="eu-west-1">eu-west-1 (Ireland)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                App Archetype
              </label>
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
                className="authkit-input w-full rounded-xl px-3 py-2.5 text-xs text-zinc-200 font-mono"
              >
                <option value="api">REST / GraphQL API</option>
                <option value="serverless">Serverless Microservice</option>
                <option value="web">Full-stack Web Application</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Service
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="authkit-input w-full rounded-xl px-3 py-2.5 text-xs text-zinc-200 font-mono"
              >
                <option value="apigateway">API Gateway</option>
                <option value="lambda">Lambda Function URL</option>
                <option value="cloudfront">CloudFront</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !targetUrl.trim()}
            className="authkit-btn-primary w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Sentinel Swarm Active...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4" />
                <span>Auditar Endpoint Existente</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
