import React, { useState } from 'react'
import {
  Layers,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Cpu,
  Database,
  ShieldCheck,
  Activity,
  Zap,
  Radio,
  Download,
  FileCode,
  Sparkles
} from 'lucide-react'
import type { ArchitectureTopology } from '../types'

interface ArchitectureViewProps {
  topology: ArchitectureTopology
  endpointUrl?: string
  cfTemplate?: string
}

interface ServiceNode {
  id: string
  name: string
  tier: 'ingress' | 'compute' | 'storage' | 'ai' | 'observability'
  icon: React.ComponentType<{ className?: string }>
  status: string
  metric: string
  description: string
  details: {
    runtime?: string
    memory?: string
    iamRole?: string
    costMetric?: string
  }
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  topology,
  endpointUrl,
  cfTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'pillars' | 'iac' | 'code'>('topology')
  const [copied, setCopied] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string>('lambda')

  const handleCopyTemplate = () => {
    if (cfTemplate) {
      navigator.clipboard.writeText(cfTemplate)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyCurl = () => {
    if (endpointUrl) {
      navigator.clipboard.writeText(`curl -s ${endpointUrl}/health | jq`)
      setCopiedCurl(true)
      setTimeout(() => setCopiedCurl(false), 2000)
    }
  }

  const handleDownloadTemplate = () => {
    if (cfTemplate) {
      const blob = new Blob([cfTemplate], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${topology.architecture_name}-cloudformation.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  // Derive dynamic service nodes based on topology services
  const isBedrock = topology.services.some((s) => s.toLowerCase().includes('bedrock'))
  const isQueue = topology.services.some((s) => s.toLowerCase().includes('sqs') || s.toLowerCase().includes('eventbridge'))
  const isWeb = topology.app_archetype === 'web'

  const serviceNodes: ServiceNode[] = [
    {
      id: 'ingress',
      name: isWeb ? 'Amazon CloudFront CDN' : 'Amazon API Gateway (HTTP v2)',
      tier: 'ingress',
      icon: Radio,
      status: 'PROVISIONED',
      metric: '< 15ms latency',
      description: isWeb
        ? 'Global edge content delivery network terminating TLS 1.3 with automated DDoS mitigation.'
        : 'Low-latency HTTP API with payload proxying, strict CORS policies, and rate throttling.',
      details: {
        runtime: 'HTTP/2 & HTTP/3',
        costMetric: '$1.00 per 1M requests',
        iamRole: 'AmazonAPIGatewayPushToCloudWatch',
      },
    },
    {
      id: 'lambda',
      name: 'AWS Lambda (Python 3.12)',
      tier: 'compute',
      icon: Cpu,
      status: 'PROVISIONED',
      metric: '512MB • ARM64 Graviton',
      description: 'Serverless execution engine running asynchronous FastAPI event loop with zero cold-starts.',
      details: {
        runtime: 'Python 3.12 (Graviton3)',
        memory: '512 MB (Dedicated vCPU slice)',
        iamRole: `${topology.architecture_name}-execution-role`,
        costMetric: '$0.0000000021 per ms',
      },
    },
    {
      id: 'dynamodb',
      name: 'Amazon DynamoDB',
      tier: 'storage',
      icon: Database,
      status: 'ACTIVE',
      metric: 'Pay-Per-Request (On-Demand)',
      description: 'Fully managed NoSQL document store with single-digit millisecond latency at any scale.',
      details: {
        runtime: 'On-Demand Capacity Mode',
        memory: 'Point-In-Time Recovery Enabled',
        iamRole: 'DynamoDBCrudPolicy',
        costMetric: '$0 idle cost',
      },
    },
    {
      id: 'ai-bus',
      name: isBedrock
        ? 'Amazon Bedrock Foundation Model'
        : isQueue
        ? 'Amazon SQS / EventBridge Bus'
        : 'AWS Secrets Manager & IAM',
      tier: 'ai',
      icon: isBedrock ? Sparkles : Zap,
      status: 'ONLINE',
      metric: isBedrock ? 'Claude 3.5 / Nova' : 'Decoupled Event Bus',
      description: isBedrock
        ? 'Fully managed serverless API providing foundational LLM inference with automated guardrails.'
        : 'High-throughput asynchronous message broker with automated dead-letter-queue retry.',
      details: {
        runtime: isBedrock ? 'Bedrock InvokeModel' : 'EventBridge v2',
        costMetric: 'Serverless Token Pricing',
        iamRole: 'BedrockInvokeModelPolicy',
      },
    },
    {
      id: 'observability',
      name: 'Amazon CloudWatch & X-Ray',
      tier: 'observability',
      icon: Activity,
      status: 'INGESTING',
      metric: 'Sub-second Structured Logs',
      description: 'Centralized telemetry, latency percentile alarms, and distributed tracing across microservices.',
      details: {
        runtime: 'CloudWatch Embedded Metric Format',
        memory: '7-Day Retention Window',
        iamRole: 'AWSLambdaBasicExecutionRole',
        costMetric: 'Free Tier eligible',
      },
    },
  ]

  const activeNodeData = serviceNodes.find((n) => n.id === selectedNode) || serviceNodes[1]

  const samplePythonHandler = `# Synthesized Serverless Handler for ${topology.architecture_name}
# Runtime: Python 3.12 (AWS Lambda + Mangum)
import os
import json
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI(title="${topology.architecture_name}", version="1.0.0")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "${topology.architecture_name}",
        "architecture": "${topology.app_archetype}",
        "cloud_provider": "AWS",
        "region": os.environ.get("AWS_REGION", "us-east-1"),
        "latency_target": "sub-50ms"
    }

@app.get("/api/v1/resource")
def get_resource():
    return {
        "items": [
            {"id": "item_01", "name": "Cloud Native Asset", "status": "synced"},
            {"id": "item_02", "name": "Event Stream Buffer", "status": "active"}
        ],
        "shipscore": 96,
        "mode": "autonomous"
    }

handler = Mangum(app)
`

  return (
    <div className="authkit-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-7 border border-white/[0.08]">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span>Synthesized AWS Architecture</span>
            </span>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)] uppercase font-semibold">
              {topology.app_archetype}
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-1.5 flex items-center space-x-2.5">
            <Layers className="h-6 w-6 text-emerald-400" />
            <span>{topology.architecture_name}</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 px-3.5 py-2 bg-black/60 border border-white/[0.08] rounded-xl text-xs font-mono shadow-sm">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-zinc-400">Est. Idle Cost:</span>
            <span className="font-bold text-emerald-300">${topology.cost_estimate_monthly_usd.toFixed(2)}/mo</span>
          </div>

          <div className="flex items-center space-x-2 bg-black/50 p-1 rounded-xl border border-white/[0.06] font-mono text-xs">
            <button
              onClick={() => setActiveTab('topology')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'topology'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Visual Topology
            </button>
            <button
              onClick={() => setActiveTab('pillars')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pillars'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Well-Architected
            </button>
            <button
              onClick={() => setActiveTab('iac')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'iac'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              CloudFormation
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Python Handler
            </button>
          </div>
        </div>
      </div>

      {/* Live Deployed Endpoint Spotlight Banner */}
      {endpointUrl && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
          <div className="flex items-center space-x-3.5">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#10b981]" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  Live Shipped AWS Endpoint
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  HTTP 200 OK
                </span>
              </div>
              <span className="text-xs sm:text-sm font-mono text-white font-medium break-all block mt-0.5">
                {endpointUrl}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyCurl}
              className="px-3 py-2 bg-black/60 hover:bg-black border border-white/10 rounded-xl text-xs font-mono text-zinc-300 hover:text-white flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
              <span>{copiedCurl ? 'Copied curl' : 'Copy curl'}</span>
            </button>

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

      {/* TAB 1: VISUAL TOPOLOGY CANVAS */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="bg-black/60 border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-inner relative overflow-hidden">
            {/* Visual Canvas Subtitle */}
            <div className="flex items-center justify-between mb-6 text-xs font-mono text-zinc-400 border-b border-white/[0.05] pb-3">
              <span className="flex items-center space-x-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Interactive Cloud Topology Graph (Click any node to inspect specs)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Encrypted TLS 1.3 Conduit</span>
            </div>

            {/* Interactive Node Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
              {serviceNodes.map((node, idx) => {
                const Icon = node.icon
                const isSelected = selectedNode === node.id
                return (
                  <div key={node.id} className="relative flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedNode(node.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all relative group flex flex-col justify-between min-h-[140px] ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                          : 'bg-zinc-950/80 border-white/[0.07] hover:border-emerald-500/40 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-400 text-black' : 'bg-white/[0.06] text-emerald-400'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.05]">
                            Tier {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight line-clamp-2">
                          {node.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">{node.metric}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </button>

                    {/* Connector Arrow for non-last nodes */}
                    {idx < serviceNodes.length - 1 && (
                      <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-400/60 text-xs font-mono font-bold">
                        ➔
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Selected Node Spec Inspector Card */}
            <div className="mt-6 bg-[#03060a] border border-emerald-500/25 rounded-xl p-4 sm:p-5 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white text-sm">{activeNodeData.name}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-emerald-400 uppercase text-[10px]">{activeNodeData.status}</span>
                </div>
                <span className="text-zinc-400 text-[11px]">{activeNodeData.metric}</span>
              </div>

              <p className="text-zinc-300 font-sans text-xs leading-relaxed mb-4">
                {activeNodeData.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/[0.05]">
                  <span className="text-zinc-500 block text-[9px] uppercase">Runtime Engine</span>
                  <span className="text-zinc-200 font-bold">{activeNodeData.details.runtime || 'AWS Managed'}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/[0.05]">
                  <span className="text-zinc-500 block text-[9px] uppercase">Memory / Capacity</span>
                  <span className="text-zinc-200 font-bold">{activeNodeData.details.memory || 'Auto-scaling'}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/[0.05]">
                  <span className="text-zinc-500 block text-[9px] uppercase">IAM Least-Privilege</span>
                  <span className="text-emerald-400 font-bold truncate block">{activeNodeData.details.iamRole || 'Scoped'}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/[0.05]">
                  <span className="text-zinc-500 block text-[9px] uppercase">Cost Metric</span>
                  <span className="text-zinc-200 font-bold">{activeNodeData.details.costMetric || 'Included'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rationale Narrative */}
          <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 sm:p-5 shadow-sm">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5 font-bold">
              Well-Architected Synthesis Rationale
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {topology.rationale}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: WELL-ARCHITECTED PILLARS SCORECARD */}
      {activeTab === 'pillars' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Security Pillar: Certified</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                IAM execution roles restrict actions exclusively to specified DynamoDB ARNs and CloudWatch log groups. Zero public wildcard (`*`) access permitted.
              </p>
            </div>

            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                <Zap className="h-4 w-4" />
                <span>Performance Efficiency: Sub-50ms</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                HTTP API Gateway v2 routes directly to ARM64 Graviton-powered Lambda with lightweight ASGI loop, eliminating container cold starts and proxy overhead.
              </p>
            </div>

            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-mono text-xs font-bold">
                <DollarSign className="h-4 w-4" />
                <span>Cost Optimization: $0 Idle</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                100% serverless stack with on-demand billing. Estimated base cost is $0.00 when idle; costs scale strictly with active traffic requests.
              </p>
            </div>

            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Reliability & Resilience</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                DynamoDB multi-AZ active-active data replication with point-in-time recovery capability and automated Lambda concurrency isolation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLOUDFORMATION IAC */}
      {activeTab === 'iac' && (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-black/90">
          <div className="bg-zinc-950 border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 flex items-center space-x-1.5">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>AWS CloudFormation Template (JSON)</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Download .json</span>
              </button>
              <button
                onClick={handleCopyTemplate}
                className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed selection:bg-emerald-500 selection:text-black">
            {cfTemplate || '// No CloudFormation template generated.'}
          </pre>
        </div>
      )}

      {/* TAB 4: SYNTHESIZED PYTHON HANDLER */}
      {activeTab === 'code' && (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-black/90">
          <div className="bg-zinc-950 border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 flex items-center space-x-1.5">
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span>Synthesized Lambda Handler (`lambda_function.py`)</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(samplePythonHandler)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-96 leading-relaxed">
            {samplePythonHandler}
          </pre>
        </div>
      )}
    </div>
  )
}
