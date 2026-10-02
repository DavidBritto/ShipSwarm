export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
export type FindingCategory = 'SECURITY' | 'PERFORMANCE' | 'RELIABILITY' | 'OBSERVABILITY'

export interface Finding {
  id: string
  severity: FindingSeverity
  category: FindingCategory
  title: string
  description: string
  evidence: string
  remediation_code?: string
  agent_source: string
}

export interface LatencyMetrics {
  sample_count: number
  p50_ms: float
  p95_ms: float
  p99_ms: float
  min_ms: float
  max_ms: float
  error_percentage: float
  status_codes: Record<string, number>
}

type float = number

export interface CloudWatchMetrics {
  invocations: number
  error_count: number
  error_rate: float
  avg_duration_ms: float
  throttles: number
  region: string
}

export interface AuditReport {
  target_url: string
  ship_score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  security_score: number
  performance_score: number
  reliability_score: number
  latency: LatencyMetrics
  cloudwatch: CloudWatchMetrics
  findings: Finding[]
  remediation_patch: string
  executive_summary: string
}

export type SwarmEventType =
  | 'agent_start'
  | 'tool_call'
  | 'handoff'
  | 'finding'
  | 'metric_update'
  | 'complete'
  | 'error'

export interface SwarmEvent {
  event_type: SwarmEventType
  agent_name: string
  message: string
  payload?: any
  timestamp: number
}
