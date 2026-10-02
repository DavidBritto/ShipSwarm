import React, { useState } from 'react'
import { Header } from './components/Header'
import { AuditForm } from './components/AuditForm'
import { SwarmConsole } from './components/SwarmConsole'
import { ArchitectureView } from './components/ArchitectureView'
import { ShipScoreCard } from './components/ShipScoreCard'
import { FindingsList } from './components/FindingsList'
import { TelemetryView } from './components/TelemetryView'
import { RemediationModal } from './components/RemediationModal'
import type { AuditReport, SwarmEvent, BuildRequest, ArchitectureTopology, BuildReport } from './types'
import { AlertCircle, Sparkles } from 'lucide-react'

export const App: React.FC = () => {
  const [events, setEvents] = useState<SwarmEvent[]>([])
  const [activeAgent, setActiveAgent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [report, setReport] = useState<AuditReport | null>(null)
  const [topology, setTopology] = useState<ArchitectureTopology | null>(null)
  const [deployedEndpoint, setDeployedEndpoint] = useState<string | null>(null)
  const [cfTemplate, setCfTemplate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleStartBuild = async (buildRequest: BuildRequest) => {
    setEvents([])
    setReport(null)
    setTopology(null)
    setDeployedEndpoint(null)
    setCfTemplate(null)
    setErrorMsg(null)
    setIsStreaming(true)
    setActiveAgent('Agent-Ingest')

    try {
      const response = await fetch('/api/build/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequest),
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

              if (eventObj.payload?.services && eventObj.payload?.architecture_name) {
                setTopology(eventObj.payload as ArchitectureTopology)
              }

              if (eventObj.payload?.cloudformation_template) {
                setCfTemplate(eventObj.payload.cloudformation_template)
              }

              if (eventObj.payload?.endpoint_url) {
                setDeployedEndpoint(eventObj.payload.endpoint_url)
              }

              if (eventObj.event_type === 'complete' && eventObj.payload) {
                const bReport = eventObj.payload as BuildReport
                if (bReport.topology) setTopology(bReport.topology)
                if (bReport.deployed_endpoint_url) setDeployedEndpoint(bReport.deployed_endpoint_url)
                if (bReport.cloudformation_template) setCfTemplate(bReport.cloudformation_template)
                if (bReport.audit_report) setReport(bReport.audit_report)
              }
            } catch (err) {
              console.warn('Failed to parse SSE JSON event:', jsonStr)
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Build stream error:', err)
      setErrorMsg(err.message || 'Autonomous build execution failed.')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleStartAudit = async (
    targetUrl: string,
    region: string,
    appType: string,
    service: string
  ) => {
    setEvents([])
    setReport(null)
    setTopology(null)
    setDeployedEndpoint(null)
    setCfTemplate(null)
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
    <div className="authkit-bg min-h-screen text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* AuthKit Hero Section with Precision Crosshairs */}
        <div className="relative border-b border-white/[0.08] pb-8">
          <span className="absolute -bottom-2 -left-2 text-xs text-zinc-600 font-mono select-none">+</span>
          <span className="absolute -bottom-2 -right-2 text-xs text-zinc-600 font-mono select-none">+</span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Sparkles className="h-3 w-3" />
                <span>AWS Zero to Shipped Hackathon</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Autonomous Cloud Engine
              </h1>
              <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
                From idea or GitHub repository to a live, production-grade AWS infrastructure in minutes.
                Powered by a peer-to-peer swarm of AWS Strands agents and Amazon Bedrock.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400 bg-zinc-950/70 p-3.5 rounded-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Engine</span>
                <span className="text-white font-bold">AWS Strands Swarm</span>
              </div>
              <div className="border-l border-white/[0.08] pl-3">
                <span className="text-zinc-500 block text-[10px] uppercase">IaC Deployer</span>
                <span className="text-white font-bold">CloudFormation</span>
              </div>
              <div className="border-l border-white/[0.08] pl-3">
                <span className="text-zinc-500 block text-[10px] uppercase">Reasoning</span>
                <span className="text-white font-bold">Amazon Bedrock</span>
              </div>
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
            <AuditForm
              onStartAudit={handleStartAudit}
              onStartBuild={handleStartBuild}
              isLoading={isStreaming}
            />
          </div>

          <div className="lg:col-span-7">
            <SwarmConsole
              events={events}
              activeAgent={activeAgent}
              isStreaming={isStreaming}
            />
          </div>
        </div>

        {/* Synthesized Architecture View */}
        {topology && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <ArchitectureView
              topology={topology}
              endpointUrl={deployedEndpoint || undefined}
              cfTemplate={cfTemplate || undefined}
            />
          </div>
        )}

        {/* Completed Verification Swarm Results View */}
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
      <footer className="border-t border-white/[0.06] bg-[#05070c]/90 py-6 text-center text-xs font-mono text-zinc-500">
        <p>Built for the AWS Zero to Shipped Hackathon • Powered by AWS Strands Agents SDK & Amazon Bedrock</p>
      </footer>
    </div>
  )
}

export default App
