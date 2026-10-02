import React from 'react'
import { Activity, Gauge } from 'lucide-react'
import type { CloudWatchMetrics, LatencyMetrics } from '../types'

interface TelemetryViewProps {
  latency: LatencyMetrics
  cloudwatch: CloudWatchMetrics
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ latency, cloudwatch }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Concurrency & Latency Stress Telemetry */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Gauge className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Concurrency & Latency Benchmarks
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">p50 Median</span>
            <span className="text-lg font-bold font-mono text-slate-200">{latency.p50_ms}</span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">ms</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">p95 Tail</span>
            <span className={`text-lg font-bold font-mono ${latency.p95_ms > 500 ? 'text-rose-400' : 'text-amber-400'}`}>
              {latency.p95_ms}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">ms</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">p99 Max Spike</span>
            <span className="text-lg font-bold font-mono text-rose-400">{latency.p99_ms}</span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">ms</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Error Rate</span>
            <span className={`text-lg font-bold font-mono ${latency.error_percentage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {latency.error_percentage}%
            </span>
          </div>
        </div>

        {/* Status Codes Distribution */}
        <div className="border-t border-slate-800/80 pt-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
            Status Code Distribution ({latency.sample_count} requests)
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(latency.status_codes).length === 0 ? (
              <span className="text-xs text-slate-500 font-mono">No requests logged yet</span>
            ) : (
              Object.entries(latency.status_codes).map(([code, count]) => {
                const is2xx = code.startsWith('2')
                const is4xx = code.startsWith('4')
                const color = is2xx
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : is4xx
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'

                return (
                  <span
                    key={code}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold border ${color}`}
                  >
                    HTTP {code}: {count}
                  </span>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* CloudWatch Server Telemetry */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-sky-400" />
          <h3 className="text-base font-bold text-white">
            AWS CloudWatch Telemetry
          </h3>
          <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
            {cloudwatch.region}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Invocations</span>
            <span className="text-lg font-bold font-mono text-sky-400">{cloudwatch.invocations}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">5xx Server Errors</span>
            <span className={`text-lg font-bold font-mono ${cloudwatch.error_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {cloudwatch.error_count}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Avg Duration</span>
            <span className="text-lg font-bold font-mono text-slate-200">{cloudwatch.avg_duration_ms}</span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">ms</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Throttles</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{cloudwatch.throttles}</span>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Server Error Rate: {cloudwatch.error_rate}%</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Telemetry Ingest Verified</span>
          </span>
        </div>
      </div>
    </div>
  )
}
