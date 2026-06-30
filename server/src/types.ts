// ─── API Types ───────────────────────────────────────────────

export interface ResearchRequest {
  idea: string
  hypothesis: {
    product: string
    audience: string
    platforms: string[]
    priceRange: string
    competitor: string
    budget: string
    timeline: string
  }
  budget: 'lt5k' | '5k-20k' | 'gt20k'
  contentMode: 'self-film' | 'find-koc' | 'text-image'
  advantage: 'price' | 'quality' | 'channel' | 'content'
}

export type JobStatus = 'processing' | 'completed' | 'failed'

export interface JobProgress {
  stage: string
  message: string
}

export interface ResearchJob {
  jobId: string
  status: JobStatus
  progress: JobProgress
  result?: ReportResult
  error?: string
  createdAt: number
}

// ─── Report Result (6 sections) ─────────────────────────────

export interface DemandSignal {
  metric: string
  value: string
  sub: string
  trend: 'up' | 'down' | 'stable'
}

export interface DemandSection {
  signals: DemandSignal[]
  verdict: string
}

export interface Competitor {
  name: string
  price: string
  monthly: string
  quality: string
  reviews: string
}

export interface CompetitionSection {
  totalSellers: number
  top10Share: string
  newProductRate: string
  sweetSpot: string
  verdict: string
  competitors: Competitor[]
}

export interface ReviewComplaint {
  rank: number
  complaint: string
  pct: number
  opportunity: string
}

export interface ReviewSection {
  analyzed: number
  totalReviews: string
  complaints: ReviewComplaint[]
  insight: string
}

export interface CostItem {
  label: string
  amount: number
  pct: number
}

export interface MonthProjection {
  month: string
  units: number
  revenue: number
  profit: number
  adSpend: number
}

export interface ProfitSection {
  retailPrice: number
  costs: CostItem[]
  totalCost: number
  profitPerUnit: number
  grossMargin: number
  netMargin: number
  bepUnits: number
  monthProjections: MonthProjection[]
}

export interface ScoreDimension {
  name: string
  weight: number
  score: number
  reason: string
}

export interface ScoringSection {
  dimensions: ScoreDimension[]
  passingLine: number
  totalScore: number
  passed: boolean
}

export interface Supplier {
  rank: number
  name: string
  price: string
  moq: string
  location: string
  rating: number
  tag: string
}

export interface SupplySection {
  suppliers: Supplier[]
  verdict: string
}

export interface ReportResult {
  demand: DemandSection
  competition: CompetitionSection
  reviews: ReviewSection
  profit: ProfitSection
  scoring: ScoringSection
  supply: SupplySection
  keyFindings: {
    label: string
    value: string
    detail: string
  }[]
}
