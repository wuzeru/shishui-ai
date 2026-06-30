import * as dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '..', '.env') })

import OpenAI from 'openai'
import type { ResearchRequest, ReportResult } from './types.js'
import { updateProgress } from './store.js'

const LITELLM_URL = process.env.LITELLM_URL || 'http://localhost:4000'
const LITELLM_API_KEY = process.env.LITELLM_API_KEY || 'sk-no-key'
const LITELLM_MODEL = process.env.LITELLM_MODEL || 'deepseek/deepseek-chat'

const client = new OpenAI({
  baseURL: LITELLM_URL,
  apiKey: LITELLM_API_KEY,
})

const SYSTEM_PROMPT = `你是"试水 AI"的选品调研引擎。你的任务是根据用户提供的产品信息，生成一份完整的 6 步选品调研报告。

你必须严格输出 JSON，不要包含 markdown 代码块标记（如 \`\`\`json），不要包含任何额外文字。只输出 JSON 对象。

JSON 结构如下：
{
  "keyFindings": [
    { "label": "指标名", "value": "数值", "detail": "补充说明" }
  ],
  "demand": {
    "signals": [
      { "metric": "指标名", "value": "数值", "sub": "来源说明", "trend": "up|down|stable" }
    ],
    "verdict": "一句话需求判断"
  },
  "competition": {
    "totalSellers": 数字,
    "top10Share": "百分比字符串",
    "newProductRate": "百分比字符串",
    "sweetSpot": "价格带如 ¥39-69",
    "verdict": "一句话竞争判断",
    "competitors": [
      { "name": "店铺名", "price": "¥价格", "monthly": "月销量", "quality": "高|中|中低|低", "reviews": "评分" }
    ]
  },
  "reviews": {
    "analyzed": 数字,
    "totalReviews": "差评总数描述",
    "complaints": [
      { "rank": 1, "complaint": "差评内容", "pct": 数字, "opportunity": "差异化方向" }
    ],
    "insight": "一句话核心洞察"
  },
  "profit": {
    "retailPrice": 数字,
    "costs": [
      { "label": "成本项", "amount": 数字, "pct": 数字 }
    ],
    "totalCost": 数字,
    "profitPerUnit": 数字,
    "grossMargin": 数字,
    "netMargin": 数字,
    "bepUnits": 数字,
    "monthProjections": [
      { "month": "第 N 月", "units": 数字, "revenue": 数字, "profit": 数字, "adSpend": 数字 }
    ]
  },
  "scoring": {
    "dimensions": [
      { "name": "维度名", "weight": 数字, "score": 数字, "reason": "评分理由" }
    ],
    "passingLine": 3.5,
    "totalScore": 数字,
    "passed": 布尔值
  },
  "supply": {
    "suppliers": [
      { "rank": 数字, "name": "供应商名", "price": "¥价格", "moq": "起订量", "location": "发货地", "rating": 数字, "tag": "标签或空字符串" }
    ],
    "verdict": "一句话供应链判断"
  }
}

要求：
- keyFindings: 4 个关键指标（月搜索量、增长率、甜点价格带、最低起订量）
- demand.signals: 4 个信号（月搜索量、近30天增长、品类热度、社媒声量）
- competition.competitors: 5 个竞品
- reviews.complaints: 5 个差评 + 差异化方向，pct 总和约 100
- profit.costs: 6 个成本项（产品成本、包装贴纸、国内物流、平台佣金5%、广告费15%、退货损耗3%），pct 总和约 100
- profit.monthProjections: 3 个月（第1月亏损或微利，第2月盈利，第3月放量）
- scoring.dimensions: 6 个维度（需求热度25%、竞争可打入20%、利润空间20%、差异化空间15%、供应链可行10%、广告可投10%），score 范围 1-5
- scoring.totalScore: 各维度 score × weight 的加权和
- scoring.passed: totalScore >= 3.5 为 true
- supply.suppliers: 5 个供应商，按评分排序
- 所有数据要基于真实市场常识，合理但可以是估算值
- 价格、销量等数字要符合中国电商实际情况`

const STAGES: { stage: string; message: string }[] = [
  { stage: 'demand', message: '正在验证搜索热度和社媒声量…' },
  { stage: 'competition', message: '分析竞品 listing 和价格分布…' },
  { stage: 'reviews', message: '挖掘差评，找差异化机会…' },
  { stage: 'profit', message: '测算利润空间和回本周期…' },
  { stage: 'scoring', message: '生成 SKU 综合评分…' },
  { stage: 'supply', message: '检查供应链可行性…' },
]

function repairTruncatedJson(s: string): string | null {
  const stack: string[] = []
  let inString = false
  let escape = false
  const chars = [...s]
  let lastValidEnd = 0

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inString) { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']')
    else if (c === '}' || c === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === c) {
        stack.pop()
        lastValidEnd = i + 1
      }
    }
  }

  if (stack.length === 0) return null

  let result = s.slice(0, lastValidEnd).trimEnd()
  result = result.replace(/[,:\s]+$/, '')
  for (const closer of stack.reverse()) {
    result += closer
  }
  try { JSON.parse(result); return result } catch { /* fall through */ }

  for (let pos = result.length; pos > 0; pos--) {
    if (result[pos - 1] !== '}') continue
    const candidate = result.slice(0, pos).trimEnd()
    try { JSON.parse(candidate); return candidate } catch { continue }
  }

  return null
}

export async function generateReport(jobId: string, request: ResearchRequest): Promise<ReportResult> {
  let stageIndex = 0
  const stageInterval = setInterval(() => {
    if (stageIndex < STAGES.length) {
      updateProgress(jobId, STAGES[stageIndex])
      stageIndex++
    }
  }, 8000)

  try {
    const userPrompt = `请为以下产品生成选品调研报告：

产品: ${request.idea}
目标客群: ${request.hypothesis.audience}
目标平台: ${request.hypothesis.platforms.join(' + ')}
价格带: ${request.hypothesis.priceRange}
对标竞品: ${request.hypothesis.competitor}
预算: ${request.hypothesis.budget}
上线时间: ${request.hypothesis.timeline}
内容方式: ${request.contentMode}
最大优势: ${request.advantage}`

    const response = await client.chat.completions.create({
      model: LITELLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    })

    clearInterval(stageInterval)
    updateProgress(jobId, { stage: 'done', message: '调研完成' })

    const content = response.choices?.[0]?.message?.content
    if (!content) throw new Error('LLM 返回内容为空')

    const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

    try {
      return JSON.parse(jsonStr) as ReportResult
    } catch {
      const repaired = repairTruncatedJson(jsonStr)
      if (repaired) return JSON.parse(repaired) as ReportResult
      throw new Error('LLM 返回的 JSON 无法解析，请重试')
    }
  } catch (err) {
    clearInterval(stageInterval)
    throw err
  }
}
