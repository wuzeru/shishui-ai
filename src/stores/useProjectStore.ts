import { create } from 'zustand'

export type Budget = 'lt5k' | '5k-20k' | 'gt20k'
export type ContentMode = 'self-film' | 'find-koc' | 'text-image'
export type Advantage = 'price' | 'quality' | 'channel' | 'content'

export interface ProjectState {
  // Step 1: one-liner
  idea: string

  // Step 2: three questions
  budget: Budget | null
  contentMode: ContentMode | null
  advantage: Advantage | null

  // Step 3: hypothesis card (auto-filled + editable)
  hypothesis: {
    product: string
    audience: string
    platforms: string[]
    priceRange: string
    competitor: string
    budget: string
    timeline: string
  }

  // Actions
  setIdea: (idea: string) => void
  setBudget: (b: Budget) => void
  setContentMode: (m: ContentMode) => void
  setAdvantage: (a: Advantage) => void
  updateHypothesis: (patch: Partial<ProjectState['hypothesis']>) => void
  reset: () => void
}

const defaultHypothesis = {
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
  reset: () => set({
    idea: '',
    budget: null,
    contentMode: null,
    advantage: null,
    hypothesis: defaultHypothesis,
  }),
}))
