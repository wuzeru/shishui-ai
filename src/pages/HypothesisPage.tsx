import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Package, Users, Monitor, Banknote, Trophy, Clock, Edit2, Check, X, Wallet } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import { useProjectStore, type ProjectState } from '../stores/useProjectStore'

type FieldKey = 'product' | 'audience' | 'platforms' | 'priceRange' | 'competitor' | 'budget' | 'timeline'

interface FieldConfig {
  key: FieldKey
  icon: typeof Package
  label: string
  type: 'text' | 'textarea'
}

const fieldsConfig: FieldConfig[] = [
  { key: 'product',     icon: Package,  label: '产品',     type: 'text' },
  { key: 'audience',    icon: Users,    label: '目标客群', type: 'text' },
  { key: 'platforms',   icon: Monitor,  label: '目标平台', type: 'text' },
  { key: 'priceRange',  icon: Banknote, label: '价格带',   type: 'text' },
  { key: 'competitor',  icon: Trophy,   label: '对标竞品', type: 'text' },
  { key: 'budget',      icon: Wallet,   label: '预算',     type: 'text' },
  { key: 'timeline',    icon: Clock,    label: '上线时间', type: 'text' },
]

function getDisplayValue(key: FieldKey, h: ProjectState['hypothesis']): string {
  if (key === 'platforms') return h.platforms.join(' + ')
  return h[key] as string
}

export default function HypothesisPage() {
  const navigate = useNavigate()
  const { hypothesis, idea, updateHypothesis } = useProjectStore()
  const [editing, setEditing] = useState<FieldKey | null>(null)
  const [draft, setDraft] = useState('')

  if (!idea) { navigate('/'); return null }

  const startEdit = (key: FieldKey) => {
    setEditing(key)
    setDraft(getDisplayValue(key, hypothesis))
  }

  const saveEdit = () => {
    if (!editing) return
    if (editing === 'platforms') {
      const platforms = draft.split(/[,，+、]/).map(s => s.trim()).filter(Boolean)
      updateHypothesis({ platforms })
    } else {
      updateHypothesis({ [editing]: draft })
    }
    setEditing(null)
  }

  const cancelEdit = () => {
    setEditing(null)
  }

  return (
    <div className="page">
      <div className="page-content">
        <StepIndicator current={3} total={4} />

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 className="text-2xl" style={{ marginBottom: 8 }}>
            帮你整理的调研假设
          </h2>
          <p className="text-secondary">
            看看这些前提对不对，点任何一行就能改。改完确认就帮你跑 6 步选品调研。
          </p>
        </div>

        {/* Hypothesis Card */}
        <div className="card" style={{ marginBottom: 32 }}>
          {fieldsConfig.map(({ key, icon: Icon, label }) => {
            const isEditing = editing === key
            const displayValue = getDisplayValue(key, hypothesis)

            return (
              <div className="hypo-field" key={key}>
                <div className="hypo-icon">
                  <Icon size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="hypo-label">{label}</div>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="input"
                        style={{ padding: '6px 12px', fontSize: 15, flex: 1 }}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={saveEdit}
                        style={{ padding: '6px 10px' }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={cancelEdit}
                        style={{ padding: '6px 10px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="hypo-value"
                      onClick={() => startEdit(key)}
                      style={{ cursor: 'pointer' }}
                      title="点击修改"
                    >
                      {displayValue}
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEdit(key)}
                    style={{ padding: '4px 8px' }}
                    aria-label={`修改${label}`}
                  >
                    <Edit2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* What happens next */}
        <div className="card card--accent" style={{ marginBottom: 40 }}>
          <p className="text-sm" style={{ fontWeight: 600, color: 'var(--accent-text)', marginBottom: 12 }}>
            确认后我会帮你跑一遍完整调研：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {[
              '搜索热度 · 社媒声量验证',
              'Top 竞品 Listing 拆解',
              '差评挖掘 → 差异化卖点',
              '完整利润测算（含广告/退货）',
              'SKU 综合评分卡（6 维度）',
              '1688 供应链可行性对比',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>✓</div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/questions')}>
            <ArrowLeft size={16} />
            返回修改
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/report')}
          >
            没问题，开始调研
            <ArrowRight size={16} />
          </button>        </div>
      </div>
    </div>
  )
}
