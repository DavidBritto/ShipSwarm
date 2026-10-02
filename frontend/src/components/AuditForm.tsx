import React, { useState } from 'react'
import { Rocket, Globe } from 'lucide-react'

interface AuditFormProps {
  onStartAudit: (targetUrl: string, region: string, appType: string, service: string) => void
  isLoading: boolean
}

export const AuditForm: React.FC<AuditFormProps> = ({ onStartAudit, isLoading }) => {
  const [targetUrl, setTargetUrl] = useState('')
  const [region, setRegion] = useState('us-east-1')
  const [appType, setAppType] = useState('api')
  const [service, setService] = useState('apigateway')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUrl.trim()) return
    onStartAudit(targetUrl.trim(), region, appType, service)
  }

  const handleUseSample = (sampleUrl: string) => {
    setTargetUrl(sampleUrl)
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Globe className="h-5 w-5 text-amber-400" />
          <span>Deploy Target Evaluation</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Provide your newly shipped AWS public endpoint. The Strands peer-to-peer swarm will execute red-team probing, concurrency load bursts, and CloudWatch audits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
            Public Endpoint Target (HTTPS)
          </label>
          <div className="relative">
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.my-startup-mvp.com or https://d1abc.cloudfront.net"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono transition-all"
            />
          </div>

          <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500">
            <span>Quick presets:</span>
            <button
              type="button"
              onClick={() => handleUseSample('https://httpbin.org/get')}
              className="hover:text-amber-400 underline transition-colors"
            >
              httpbin.org
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleUseSample('https://jsonplaceholder.typicode.com/posts')}
              className="hover:text-amber-400 underline transition-colors"
            >
              jsonplaceholder
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleUseSample('https://api.github.com')}
              className="hover:text-amber-400 underline transition-colors"
            >
              api.github.com
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              AWS Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            >
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="us-west-2">us-west-2 (Oregon)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="ap-south-1">ap-south-1 (Mumbai)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              App Archetype
            </label>
            <select
              value={appType}
              onChange={(e) => setAppType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            >
              <option value="api">REST / GraphQL API</option>
              <option value="serverless">Serverless Microservice</option>
              <option value="web">Full-stack Web Application</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Primary AWS Service
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            >
              <option value="apigateway">API Gateway</option>
              <option value="lambda">Lambda Function URL</option>
              <option value="apprunner">AWS App Runner</option>
              <option value="cloudfront">CloudFront Distribution</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !targetUrl.trim()}
          className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Swarm Deliberation Active...</span>
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              <span>Unleash ShipSwarm (4 Peer Agents)</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
