import React from 'react'
import { Sparkles, Layers, ShieldCheck, Zap, Cpu, RefreshCw } from 'lucide-react'

export const FeaturesBento: React.FC = () => {
  return (
    <section className="py-20 relative">
      {/* Precision Lines & Crosshairs */}
      <div className="relative border-t border-white/[0.08] pt-16">
        <span className="absolute -top-2 -left-2 text-xs text-zinc-600 font-mono select-none">+</span>
        <span className="absolute -top-2 -right-2 text-xs text-zinc-600 font-mono select-none">+</span>

        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Sparkles className="h-3 w-3" />
            <span>Autonomous Cloud Engineering</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Built for Founders & Teams Shipping Fast
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Eliminate hours of manual AWS console clicking, IAM policy debugging, and post-deployment stress.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="authkit-card rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Topology Synthesis
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Amazon Bedrock translates high-level product intent into AWS Well-Architected topologies (API Gateway, Lambda, DynamoDB) optimized for sub-50ms latency.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Agent</span>
              <span className="text-emerald-400 font-bold">Sentinel-Architect</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="authkit-card rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Zero-DevOps CloudFormation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Synthesizes syntactically validated AWS CloudFormation templates with least-privilege IAM execution roles, CORS configurations, and CloudWatch log groups.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Engine</span>
              <span className="text-cyan-400 font-bold">Agent-InfraEngine</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="authkit-card rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                Red-Team Security Probing
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sentinel-Sec attacks the freshly deployed endpoint verifying HSTS, CSP, X-Frame-Options, CORS wildcard policies, and error disclosure prevention.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Prober</span>
              <span className="text-rose-400 font-bold">Sentinel-Sec</span>
            </div>
          </div>

          {/* Card 4 (Spans 2 cols on md) */}
          <div className="md:col-span-2 authkit-card rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                Concurrent Chaos & Latency Waves
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sentinel-Chaos executes structured concurrent load bursts to measure real-world p50, p95, and p99 percentiles, identifying cold-starts and throughput bottlenecks before your users arrive.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Benchmarking</span>
              <span className="text-teal-400 font-bold">Sentinel-Chaos (p50 / p95 / p99)</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="authkit-card rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Closed-Loop Self-Healing
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Synthesizes runnable AWS CDK and CloudFormation patches to remediate discovered vulnerabilities with single-click export.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Remediation</span>
              <span className="text-emerald-400 font-bold">1-Click Git Patch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
