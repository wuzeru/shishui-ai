import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import researchRoutes from './routes/research.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '..', '.env') })

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok', ts: Date.now() }))

app.route('/api/research', researchRoutes)

const port = parseInt(process.env.PORT || '3457', 10)

console.log(`shishui-server listening on :${port}`)
serve({ fetch: app.fetch, port })
