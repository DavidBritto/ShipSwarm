import React from 'react'
import { ShieldCheck, Zap, Activity, Download } from 'lucide-react'
import type { AuditReport } from '../types'

interface ShipScoreCardProps {
  report: AuditReport
  onExportPatch: () => void
}

export const ShipScoreCard: React.FC<ShipScoreCardProps> = ({ report, onExportPatch }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'from-emerald-500 to-teal-600 text-emerald-400 border-emerald-500/30'
      case 'B':
        return 'from-sky-500 to-blue-600 text-sky-400 border-sky-500/30'
      case 'C':
        return 'from-amber-500 to-yellow-600 text-amber-400 border-amber-500/30'
      default:
        return 'from-rose-500 to-red-600 text-rose-400 border-rose-500/30'
    }
  }

  const gradeColor = getGradeColor(report.grade)

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-5">
          {/* Circular Badge */}
          <div
            className={`h-24 w-24 rounded-2xl border-2 flex flex-col items-center justify-center bg-slate-950 shadow-inner ${gradeColor}`}
          >
            <span className="text-3xl font-extrabold tracking-tight">{report.ship_score}</span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Grade {report.grade}
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Certification Result
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400 truncate max-w-xs">
                {report.target_url}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Production ShipScore™
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
              {report.executive_summary}
            </p>
          </div>
        </div>

        <button
          onClick={onExportPatch}
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700 hover:border-emerald-500/50 shadow-md transition-all"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Export Remediation Patch</span>
        </button>
      </div>

      {/* Sub-Score Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
              <span>Security Baseline</span>
            </span>
            <span className="font-mono font-bold text-rose-400">{report.security_score}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${report.security_score}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Concurrency & Latency</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">{report.performance_score}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${report.performance_score}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              <span>Cloud Telemetry</span>
            </span>
            <span className="font-mono font-bold text-sky-400">{report.reliability_score}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${report.reliability_score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
