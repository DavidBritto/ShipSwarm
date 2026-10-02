import React, { useState } from 'react'
import { X, Copy, Check, Download, FileCode2 } from 'lucide-react'

interface RemediationModalProps {
  patchCode: string
  isOpen: boolean
  onClose: () => void
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  patchCode,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(patchCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([patchCode], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'shipswarm_remediation.patch')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Sentinel-Architect Remediation Patch
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Hardened AWS CDK & Application Middleware
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 hover:bg-emerald-400 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .patch</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-[#080c14]">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {patchCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Apply via: git apply shipswarm_remediation.patch or copy into your CDK stack</span>
          <span className="text-emerald-400 font-bold">AWS Well-Architected Compliant</span>
        </div>
      </div>
    </div>
  )
}
