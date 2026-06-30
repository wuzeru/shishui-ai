import { create } from 'zustand'

export type Budget = 'lt5k' | '5k-20k' | 'gt20k'
export type ContentMode = 'self-film' | 'find-koc' | 'text-image'
export type Advantage = 'price' | 'quality' | 'channel' | 'content'

export interface Hypothesis {
  product: string
  audience: string
  platforms: string[]
  priceRange: string
  competitor: string
  budget: string
  timeline: string
}

export interface ResearchResult {
  keyFindings: { label: string; value: string; detail: string }[]
  demand: {
    signals: { metric: string; value: string; sub: string; trend: string }[]
    verdict: string
  }
  competition: {
    totalSellers: number
    top10Share: string
    newProductRate: string
    sweetSpot: string
    verdict: string
    competitors: { name: string; price: string; monthly: string; quality: string; reviews: string }[]
  }
  reviews: {
    analyzed: number
    totalReviews: string
    complaints: { rank: number; complaint: string; pct: number; opportunity: string }[]
    insight: string
  }
  profit: {
    retailPrice: number
    costs: { label: string; amount: number; pct: number }[]
    totalCost: number
    profitPerUnit: number
    grossMargin: number
    netMargin: number
    bepUnits: number
    monthProjections: { month: string; units: number; revenue: number; profit: number; adSpend: number }[]
  }
  scoring: {
    dimensions: { name: string; weight: number; score: number; reason: string }[]
    passingLine: number
    totalScore: number
    passed: boolean
  }
  supply: {
    suppliers: { rank: number; name: string; price: string; moq: string; location: string; rating: number; tag: string }[]
    verdict: string
  }
}

export interface ProjectState {
  idea: string
  budget: Budget | null
  contentMode: ContentMode | null
  advantage: Advantage | null
  hypothesis: Hypothesis

  researchResult: ResearchResult | null
  researchJobId: string | null
  researchStatus: 'idle' | 'processing' | 'completed' | 'failed'
  researchError: string | null
  researchStage: string
  researchMessage: string

  setIdea: (idea: string) => void
  setBudget: (b: Budget) => void
  setContentMode: (m: ContentMode) => void
  setAdvantage: (a: Advantage) => void
  updateHypothesis: (patch: Partial<Hypothesis>) => void
  setResearchJobId: (id: string) => void
  setResearchStatus: (s: ProjectState['researchStatus']) => void
  setResearchResult: (r: ResearchResult) => void
  setResearchError: (e: string) => void
  setResearchProgress: (stage: string, message: string) => void
  reset: () => void
}

const defaultHypothesis: Hypothesis = {
  product: '',
  audience: '25-45 岁女性 · 一二线城市',
  platforms: ['小红书', '抖音'],
  priceRange: '39-79 元',
  competitor: '待调研',
  budget: '5,000-20,000 元',
  timeline: '3 周',
}

const budgetLabel: Record<Budget, string> = {
  'lt5k': '< 5,000 元',
  '5k-20k': '5,000-20,000 元',
  'gt20k': '> 20,000 元',
}

export { budgetLabel }

export const useProjectStore = create<ProjectState>((set) => ({
  idea: '',
  budget: null,
  contentMode: null,
  advantage: null,
  hypothesis: defaultHypothesis,
  researchResult: null,
  researchJobId: null,
  researchStatus: 'idle',
  researchError: null,
  researchStage: '',
  researchMessage: '',

  setIdea: (idea) => set({
    idea,
    hypothesis: { ...defaultHypothesis, product: idea },
  }),
  setBudget: (budget) => set((s) => ({
    budget,
    hypothesis: { ...s.hypothesis, budget: budgetLabel[budget] },
  })),
  setContentMode: (contentMode) => set({ contentMode }),
  setAdvantage: (advantage) => set({ advantage }),
  updateHypothesis: (patch) => set((s) => ({
    hypothesis: { ...s.hypothesis, ...patch },
  })),
  setResearchJobId: (researchJobId) => set({ researchJobId }),
  setResearchStatus: (researchStatus) => set({ researchStatus }),
  setResearchResult: (researchResult) => set({ researchResult, researchStatus: 'completed' }),
  setResearchError: (researchError) => set({ researchError, researchStatus: 'failed' }),
  setResearchProgress: (researchStage, researchMessage) => set({ researchStage, researchMessage }),
  reset: () => set({
    idea: '',
    budget: null,
    contentMode: null,
    advantage: null,
    hypothesis: defaultHypothesis,
    researchResult: null,
    researchJobId: null,
    researchStatus: 'idle',
    researchError: null,
    researchStage: '',
    researchMessage: '',
  }),
}))
