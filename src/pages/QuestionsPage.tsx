import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import { useProjectStore, type Budget, type ContentMode, type Advantage } from '../stores/useProjectStore'

const budgetOptions: { value: Budget; icon: string; label: string; desc: string }[] = [
  { value: 'lt5k',    icon: '🪙', label: '< 5K',       desc: '低成本验证，自己多干' },
  { value: '5k-20k',  icon: '💰', label: '5K - 20K',   desc: '有一定预算，可以小额投流' },
  { value: 'gt20k',   icon: '🏦', label: '> 20K',      desc: '充足预算，快速验证' },
]

const contentOptions: { value: ContentMode; icon: string; label: string; desc: string }[] = [
  { value: 'self-film',   icon: '📱', label: '自己拍',   desc: '出镜或拍产品实测' },
  { value: 'find-koc',    icon: '🤝', label: '找达人',   desc: '找 KOC 置换合作' },
  { value: 'text-image',  icon: '📝', label: '纯图文',   desc: '先做图文笔记测试' },
]

const advantageOptions: { value: Advantage; icon: string; label: string; desc: string }[] = [
  { value: 'price',   icon: '🏷️', label: '价格更低',   desc: '有成本优势' },
  { value: 'quality', icon: '✨', label: '产品更好',   desc: '有差异化卖点' },
  { value: 'channel', icon: '🔗', label: '有供应链',   desc: '有工厂或渠道资源' },
  { value: 'content', icon: '🎬', label: '会做内容',   desc: '擅长拍视频或写文案' },
]

export default function QuestionsPage() {
  const navigate = useNavigate()
  const { budget, contentMode, advantage, setBudget, setContentMode, setAdvantage, idea } = useProjectStore()

  if (!idea) { navigate('/'); return null }

  const allAnswered = budget && contentMode && advantage

  return (
    <div className="page">
      <div className="page-content">
        <StepIndicator current={2} total={4} />

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p className="text-sm text-accent" style={{ fontWeight: 500, marginBottom: 8 }}>
            关于「{idea}」
          </p>
          <h2 className="text-2xl" style={{ marginBottom: 8 }}>
            回答 3 个问题，我帮你跑一遍完整调研
          </h2>
          <p className="text-secondary">
            需求够不够大、竞争能不能打、利润够不够厚，一次看清楚。
          </p>
        </div>

        {/* Q1: Budget → 利润够不够厚 */}
        <div style={{ marginBottom: 36 }}>
          <label className="text-sm" style={{ fontWeight: 600, marginBottom: 12, display: 'block' }}>
            ① 准备投多少钱做测试？
          </label>
          <div className="choice-grid choice-grid--3">
            {budgetOptions.map((opt) => (
              <div
                key={opt.value}
                className={`choice-pill ${budget === opt.value ? 'choice-pill--selected' : ''}`}
                onClick={() => setBudget(opt.value)}
              >
                <div className="choice-icon">{opt.icon}</div>
                <div>
                  <div className="choice-label">{opt.label}</div>
                  <div className="choice-desc">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Q2: Content Mode → 测试方式 */}
        <div style={{ marginBottom: 36 }}>
          <label className="text-sm" style={{ fontWeight: 600, marginBottom: 12, display: 'block' }}>
            ② 你打算用什么方式测试市场？
          </label>
          <div className="choice-grid choice-grid--3">
            {contentOptions.map((opt) => (
              <div
                key={opt.value}
                className={`choice-pill ${contentMode === opt.value ? 'choice-pill--selected' : ''}`}
                onClick={() => setContentMode(opt.value)}
              >
                <div className="choice-icon">{opt.icon}</div>
                <div>
                  <div className="choice-label">{opt.label}</div>
                  <div className="choice-desc">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Q3: Advantage → 竞争能不能打 */}
        <div style={{ marginBottom: 40 }}>
          <label className="text-sm" style={{ fontWeight: 600, marginBottom: 12, display: 'block' }}>
            ③ 你觉得自己最大的优势是什么？
          </label>
          <div className="choice-grid choice-grid--3">
            {advantageOptions.map((opt) => (
              <div
                key={opt.value}
                className={`choice-pill ${advantage === opt.value ? 'choice-pill--selected' : ''}`}
                onClick={() => setAdvantage(opt.value)}
              >
                <div className="choice-icon">{opt.icon}</div>
                <div>
                  <div className="choice-label">{opt.label}</div>
                  <div className="choice-desc">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            返回
          </button>
          <button
            className="btn btn-primary btn-lg"
            disabled={!allAnswered}
            onClick={() => navigate('/hypothesis')}
          >
            下一步
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
