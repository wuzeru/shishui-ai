import { Check } from 'lucide-react'

interface StepIndicatorProps {
  current: number  // 1-indexed
  total: number
}

const labels = ['说想法', '选条件', '确认假设', '出报告']

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="steps">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isActive = step === current
        const isDone = step < current
        return (
          <div key={step} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className={`step-dot ${isDone ? 'step-dot--done' : ''} ${isActive ? 'step-dot--active' : ''}`}>
                {isDone ? <Check size={14} /> : step}
              </div>
              <span className="text-xs" style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`step-line ${isDone ? 'step-line--done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
