import type { ReportResult } from '../../server/src/types.js'

const API_BASE = '/api'

export interface ResearchJob {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  progress: { stage: string; message: string }
  result?: ReportResult
  error?: string
}

export async function startResearch(body: {
  idea: string
  hypothesis: Record<string, unknown>
  budget: string
  contentMode: string
  advantage: string
}): Promise<{ jobId: string }> {
  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function pollResearch(jobId: string): Promise<ResearchJob> {
  const res = await fetch(`${API_BASE}/research/${jobId}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

const STAGE_ORDER = ['demand', 'competition', 'reviews', 'profit', 'scoring', 'supply', 'done']

export function stageToPercent(stage: string): number {
  const idx = STAGE_ORDER.indexOf(stage)
  if (idx < 0) return 0
  if (stage === 'done') return 100
  return Math.round(((idx + 1) / STAGE_ORDER.length) * 100)
}
