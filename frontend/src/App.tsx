import React, { useState } from 'react'
import { Header } from './components/Header'
import { AuditForm } from './components/AuditForm'
import { SwarmConsole } from './components/SwarmConsole'
import { ShipScoreCard } from './components/ShipScoreCard'
import { FindingsList } from './components/FindingsList'
import { TelemetryView } from './components/TelemetryView'
import { RemediationModal } from './components/RemediationModal'
import type { AuditReport, SwarmEvent } from './types'
import { AlertCircle } from 'lucide-react'

export const App: React.FC = () => {
  const [events, setEvents] = useState<SwarmEvent[]>([])
  const [activeAgent, setActiveAgent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [report, setReport] = useState<AuditReport | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleStartAudit = async (
    targetUrl: string,
    region: string,
    appType: string,
    service: string
  ) => {
    setEvents([])
    setReport(null)
    setErrorMsg(null)
    setIsStreaming(true)
    setActiveAgent('Sentinel-Sec')

    try {
      const response = await fetch('/api/audit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: targetUrl,
          aws_region: region,
          app_type: appType,
          aws_service: service,
          allow_test_hosts: true,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Readable stream not supported by browser.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '')
            try {
              const eventObj: SwarmEvent = JSON.parse(jsonStr)
              setEvents((prev) => [...prev, eventObj])

              if (eventObj.agent_name) {
                setActiveAgent(eventObj.agent_name)
              }

              if (eventObj.event_type === 'complete' && eventObj.payload) {
                setReport(eventObj.payload as AuditReport)
              }
            } catch (err) {
              console.warn('Failed to parse SSE JSON event:', jsonStr)
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Audit stream error:', err)
      setErrorMsg(err.message || 'Swarm execution failed.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>AWS Zero to Shipped Hackathon Showcase</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ShipSwarm AI
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Eliminate post-deployment anxiety. A peer-to-peer swarm of 4 AWS Strands agents actively red-teams, stress-tests, and certifies newly shipped cloud applications on AWS.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Framework:</span>
              <span className="text-white font-bold">AWS Strands SDK (Swarm)</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-500 block">LLM Engine:</span>
              <span className="text-white font-bold">Amazon Bedrock</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex items-center space-x-3 text-sm text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form & Real-time Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <AuditForm onStartAudit={handleStartAudit} isLoading={isStreaming} />
          </div>

          <div className="lg:col-span-7">
            <SwarmConsole
              events={events}
              activeAgent={activeAgent}
              isStreaming={isStreaming}
            />
          </div>
        </div>

        {/* Completed Audit Results View */}
        {report && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <ShipScoreCard
              report={report}
              onExportPatch={() => setIsModalOpen(true)}
            />

            <TelemetryView
              latency={report.latency}
              cloudwatch={report.cloudwatch}
            />

            <FindingsList findings={report.findings} />
          </div>
        )}
      </main>

      {/* Remediation Patch Modal */}
      {report && (
        <RemediationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patchCode={report.remediation_patch}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        <p>Built for the AWS Zero to Shipped Hackathon • Powered by AWS Strands Agents SDK & Amazon Bedrock</p>
      </footer>
    </div>
  )
}

export default App
