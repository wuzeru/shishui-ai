import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Search, BarChart3, Calculator } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'

const examples = [
  '我想卖拖把',
  '我想卖手工香薰',
  '我想卖宠物零食',
  '我想卖瑜伽垫',
]

export default function LandingPage() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setIdea = useProjectStore((s) => s.setIdea)

  const handleSubmit = () => {
    const idea = value.trim()
    if (!idea) {
      setError('告诉我你想卖什么呀，哪怕一个词也行')
      return
    }
    if (idea.length < 2) {
      setError('再具体一点，比如"我想卖拖把"')
      return
    }
    setError('')
    setIdea(idea)
    navigate('/questions')
  }

  return (
    <div className="page" style={{ justifyContent: 'center' }}>
      <div className="page-content" style={{ maxWidth: 600 }}>
        {/* Logo / Brand */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56, height: 56,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent)',
            marginBottom: 20,
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 className="text-4xl" style={{ marginBottom: 12 }}>
            试水 AI
          </h1>
          <p className="text-lg text-secondary" style={{ maxWidth: 420, margin: '0 auto' }}>
            说一句你想卖什么，6 步帮你验证这个品值不值得做
          </p>
        </div>

        {/* Hero Input */}
        <div className="fade-up fade-up-delay-1" style={{ marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            <input
              className="input input--hero"
              placeholder="说一句你想卖什么，比如：我想卖拖把"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
              style={{
                paddingRight: 56,
                borderColor: error ? '#dc2626' : undefined,
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!value.trim()}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 40, height: 40,
                borderRadius: 'var(--radius-md)',
                padding: 0,
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          {error && (
            <p className="text-sm" style={{ color: '#dc2626', marginTop: 8, paddingLeft: 4 }}>
              {error}
            </p>
          )}
        </div>

        {/* Example chips */}
        <div className="fade-up fade-up-delay-2" style={{ marginBottom: 56 }}>
          <p className="text-sm text-muted" style={{ marginBottom: 12, textAlign: 'center' }}>
            不知道从哪开始？试试这些：
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {examples.map((ex) => (
              <button
                key={ex}
                className="btn btn-secondary btn-sm"
                onClick={() => { setValue(ex); setIdea(ex); setError('') }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Value props */}
        <div className="fade-up fade-up-delay-3">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {[
              { icon: Search, title: '需求验证', desc: '搜索热度 + 社媒声量' },
              { icon: BarChart3, title: '竞争分析', desc: '竞品拆解 + 差评挖掘' },
              { icon: Calculator, title: '利润测算', desc: '成本 · 净利 · SKU 评分' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center', padding: 20 }}>
                <Icon size={22} style={{ color: 'var(--accent)', marginBottom: 10 }} />
                <div className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
