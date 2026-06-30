import { Hono } from 'hono'
import type { ResearchRequest } from '../types.js'
import { createJob, getJob, completeJob, failJob } from '../store.js'
import { generateReport } from '../llm.js'

const app = new Hono()

app.post('/', async (c) => {
  const body = await c.req.json<ResearchRequest>()

  if (!body.idea || !body.hypothesis) {
    return c.json({ error: '缺少 idea 或 hypothesis' }, 400)
  }

  const { jobId } = createJob()

  // Start LLM generation in background
  ;(async () => {
    try {
      const result = await generateReport(jobId, body)
      completeJob(jobId, result)
    } catch (err) {
      failJob(jobId, err instanceof Error ? err.message : String(err))
    }
  })()

  return c.json({ jobId, status: 'processing' }, 202)
})

app.get('/:jobId', (c) => {
  const jobId = c.req.param('jobId')
  const job = getJob(jobId)

  if (!job) {
    return c.json({ error: 'Job not found' }, 404)
  }

  return c.json(job)
})

export default app
