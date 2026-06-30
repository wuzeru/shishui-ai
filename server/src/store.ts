import { randomUUID } from 'node:crypto'
import type { ResearchJob, JobProgress } from './types.js'

const jobs = new Map<string, ResearchJob>()
const CLEANUP_MS = 10 * 60 * 1000 // 10 minutes

export function createJob(): { jobId: string } {
  const jobId = randomUUID().slice(0, 8)
  const job: ResearchJob = {
    jobId,
    status: 'processing',
    progress: { stage: 'demand', message: '正在验证搜索热度和社媒声量…' },
    createdAt: Date.now(),
  }
  jobs.set(jobId, job)
  return { jobId }
}

export function getJob(jobId: string): ResearchJob | undefined {
  return jobs.get(jobId)
}

export function updateProgress(jobId: string, progress: JobProgress): void {
  const job = jobs.get(jobId)
  if (job) job.progress = progress
}

export function completeJob(jobId: string, result: unknown): void {
  const job = jobs.get(jobId)
  if (job) {
    job.status = 'completed'
    job.progress = { stage: 'done', message: '调研完成' }
    job.result = result as ResearchJob['result']
  }
}

export function failJob(jobId: string, error: string): void {
  const job = jobs.get(jobId)
  if (job) {
    job.status = 'failed'
    job.error = error
  }
}

// Cleanup old jobs periodically
setInterval(() => {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (now - job.createdAt > CLEANUP_MS) jobs.delete(id)
  }
}, 60_000)
