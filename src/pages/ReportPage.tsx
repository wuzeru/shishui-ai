import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Factory, BarChart3, MessageSquare, Calculator,
  Trophy, ShieldCheck, ChevronDown, ChevronUp,
  Download, Share2, Sparkles, Clock, CheckCircle2,
  AlertCircle, RotateCcw, Menu, X, TrendingUp, Star,
  Search, Hash, Target
} from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import { useProjectStore } from '../stores/useProjectStore'
import { startResearch, pollResearch, stageToPercent } from '../api/client'

const reportSections = [
  { id: 'demand',      num: '01', icon: Search,      title: '需求验证' },
  { id: 'competition', num: '02', icon: Trophy,       title: '竞争分析' },
  { id: 'reviews',     num: '03', icon: MessageSquare, title: '差评挖掘' },
  { id: 'profit',      num: '04', icon: Calculator,   title: '利润空间' },
  { id: 'scoring',     num: '05', icon: BarChart3,    title: 'SKU 评分' },
  { id: 'supply',      num: '06', icon: Factory,      title: '供应链' },
]

export default function ReportPage() {
  const navigate = useNavigate()
  const {
    idea, hypothesis,
    researchJobId, researchStatus, researchError,
    researchStage, researchMessage, researchResult,
  } = useProjectStore()

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Start research / poll for result
  useEffect(() => {
    if (!idea) { navigate('/'); return }

    const store = useProjectStore.getState()

    // No job yet → start one
    if (!researchJobId && researchStatus === 'idle') {
      let cancelled = false
      const init = async () => {
        try {
          const { jobId } = await startResearch({
            idea: idea!,
            hypothesis: { ...hypothesis },
            budget: store.budget || '5k-20k',
            contentMode: store.contentMode || 'self-film',
            advantage: store.advantage || 'content',
          })
          if (cancelled) return
          store.setResearchJobId(jobId)
          store.setResearchStatus('processing')
        } catch (err) {
          if (!cancelled) store.setResearchError(
            err instanceof Error ? err.message : '启动调研失败'
          )
        }
      }
      init()
      return () => { cancelled = true }
    }

    // Poll while processing
    if (researchJobId && researchStatus === 'processing') {
      const interval = setInterval(async () => {
        try {
          const job = await pollResearch(researchJobId)
          const s = useProjectStore.getState()
          if (job.status === 'processing') {
            s.setResearchProgress(job.progress.stage, job.progress.message)
          } else if (job.status === 'completed' && job.result) {
            s.setResearchResult(job.result)
          } else if (job.status === 'failed') {
            s.setResearchError(job.error || '调研失败')
          }
        } catch { /* retry next tick */ }
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [idea, navigate, researchJobId, researchStatus])

  const handleRetry = () => {
    const s = useProjectStore.getState()
    s.setResearchJobId('')
    s.setResearchStatus('idle')
    s.setResearchError('')
  }

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileNavOpen(false)
  }

  if (!idea) return null

  // Loading
  if (researchStatus === 'idle' || researchStatus === 'processing') {
    const pct = stageToPercent(researchStage)
    return (
      <div className="page" style={{ justifyContent: 'center' }}>
        <div className="page-content" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            background: 'var(--accent-light)', marginBottom: 24,
          }}>
            <Sparkles size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-xl" style={{ marginBottom: 8 }}>
            正在跑选品调研，稍等一下
          </h2>
          <p className="text-secondary text-sm" style={{ marginBottom: 32 }}>
            验证需求、拆解竞品、挖差评、算利润、打分、查供应链……
          </p>
          <div className="progress-bar" style={{ marginBottom: 16 }}>
            <div className="progress-bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <div className="text-sm text-muted">
            {researchMessage || '正在准备…'}
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (researchStatus === 'failed') {
    return (
      <div className="page" style={{ justifyContent: 'center' }}>
        <div className="page-content" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            background: '#fef2f2', marginBottom: 24,
          }}>
            <AlertCircle size={32} style={{ color: '#dc2626' }} />
          </div>
          <h2 className="text-xl" style={{ marginBottom: 8 }}>调研失败了</h2>
          <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>
            {researchError || '发生未知错误'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleRetry}>
              <RotateCcw size={14} /> 重试
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!researchResult) return null

  const result = researchResult
  const totalScore = result.scoring.totalScore
  const passed = result.scoring.passed
  const scoreColor = passed ? 'var(--success)' : '#dc2626'
  const scoreBg = passed ? 'var(--success-light)' : '#fef2f2'
  const isCollapsed = (id: string) => collapsedSections.has(id)

  return (
    <div className="page">
      <div className="page-content page-content--wide">
        <StepIndicator current={4} total={4} />

        {/* Sticky nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '12px 0', marginBottom: 32,
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
        }}>
          {reportSections.map(({ id, num, title }) => (
            <button
              key={id}
              className="btn btn-sm"
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent-text)',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
              }}
              onClick={() => scrollTo(id)}
            >
              {num} {title}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{ display: 'none' }}
          >
            {mobileNavOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </nav>

        {/* Report header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge--success">
                  <CheckCircle2 size={12} /> 调研完成
                </span>
                <span className="badge">
                  <Clock size={12} /> 刚刚生成
                </span>
              </div>
              <h2 className="text-2xl">「{idea}」选品调研报告</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm">
                <Share2 size={14} /> 分享
              </button>
              <button className="btn btn-primary btn-sm">
                <Download size={14} /> 下载
              </button>
            </div>
          </div>
          <p className="text-secondary">
            {hypothesis.audience} · {hypothesis.platforms.join(' + ')} · 预算 {hypothesis.budget}
          </p>
        </div>

        {/* Key findings summary */}
        <div className="card card--accent" style={{ marginBottom: 32 }}>
          <p className="text-sm" style={{ fontWeight: 600, color: 'var(--accent-text)', marginBottom: 12 }}>
            关键数据一览
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {result.keyFindings.map(({ label, value, detail }) => (
              <div key={label}>
                <div className="text-xs text-muted" style={{ marginBottom: 2 }}>{label}</div>
                <div className="text-lg" style={{ fontWeight: 700, color: 'var(--accent-text)' }}>{value}</div>
                <div className="text-xs text-secondary">{detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Section 1: Demand Validation ─── */}
        <div id="demand" className="report-section">
          <div
            className="report-section-header"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('demand')}
          >
            <span className="section-num">01</span>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ flex: 1 }}>需求验证 · 这个品搜索量够大吗</h3>
            {isCollapsed('demand') ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isCollapsed('demand') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                {result.demand.signals.map(({ metric, value, sub, trend }) => (
                  <div key={metric} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {trend === 'up' && <TrendingUp size={13} style={{ color: 'var(--success)' }} />}
                      {trend === 'down' && <TrendingUp size={13} style={{ color: '#dc2626', transform: 'rotate(180deg)' }} />}
                      {trend === 'stable' && <Hash size={13} style={{ color: 'var(--text-muted)' }} />}
                      <span className="text-xs text-muted">{metric}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
                    <div className="text-xs text-secondary">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 16, background: 'var(--success-light)', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  <span className="text-sm" style={{ color: '#16a34a', fontWeight: 600 }}>
                    {result.demand.verdict}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Section 2: Competition Analysis ── */}
        <div id="competition" className="report-section">
          <div
            className="report-section-header"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('competition')}
          >
            <span className="section-num">02</span>
            <Trophy size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ flex: 1 }}>竞争分析 · 竞品打不打得过</h3>
            {isCollapsed('competition') ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isCollapsed('competition') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { label: '在售卖家', value: String(result.competition.totalSellers) },
                  { label: 'Top 10 份额', value: result.competition.top10Share },
                  { label: '新品存活率', value: result.competition.newProductRate },
                  { label: '定价甜点', value: result.competition.sweetSpot },
                ].map(({ label, value }) => (
                  <div key={label} className="card" style={{ padding: 12, textAlign: 'center' }}>
                    <div className="text-xs text-muted" style={{ marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="card table-scroll" style={{ padding: 0, overflow: 'auto', marginBottom: 16 }}>
                <table className="data-table" style={{ minWidth: 540 }}>
                  <thead>
                    <tr>
                      <th>竞品店铺</th>
                      <th>定价</th>
                      <th>月销</th>
                      <th>Listing 质量</th>
                      <th>评分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.competition.competitors.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{c.price}</td>
                        <td className="text-secondary">{c.monthly}</td>
                        <td><span className="badge">{c.quality}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={12} style={{ color: '#eab308', fill: '#eab308' }} />
                            {c.reviews}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card" style={{ padding: 16, background: 'var(--info-light)', border: '1px solid #c7d2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={16} style={{ color: 'var(--info)' }} />
                  <span className="text-sm" style={{ color: '#4f46e5', fontWeight: 600 }}>
                    竞争判断：{result.competition.verdict}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Section 3: Review Mining ─── */}
        <div id="reviews" className="report-section">
          <div
            className="report-section-header"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('reviews')}
          >
            <span className="section-num">03</span>
            <MessageSquare size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ flex: 1 }}>差评挖掘 · 买家在骂什么</h3>
            {isCollapsed('reviews') ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isCollapsed('reviews') && (
            <>
              <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
                分析了 Top {result.reviews.analyzed} 竞品的 {result.reviews.totalReviews}，提炼出以下共性差评和对应的差异化机会：
              </p>
              <div className="card table-scroll" style={{ padding: 0, overflow: 'auto', marginBottom: 16 }}>
                <table className="data-table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 32 }}>#</th>
                      <th>买家差评</th>
                      <th>占比</th>
                      <th>你的差异化方向</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.reviews.complaints.map((c) => (
                      <tr key={c.rank}>
                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.rank}</td>
                        <td style={{ fontWeight: 500 }}>{c.complaint}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className="progress-bar-fill" style={{ transform: `scaleX(${c.pct / 100})` }} />
                            </div>
                            <span className="text-sm" style={{ fontWeight: 600 }}>{c.pct}%</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--success)', fontWeight: 500 }}>{c.opportunity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card" style={{ padding: 16, background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
                    核心洞察：{result.reviews.insight}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Section 4: Profit Calculation ─── */}
        <div id="profit" className="report-section">
          <div
            className="report-section-header"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('profit')}
          >
            <span className="section-num">04</span>
            <Calculator size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ flex: 1 }}>利润空间 · 这个品能赚多少钱</h3>
            {isCollapsed('profit') ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isCollapsed('profit') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div className="text-sm" style={{ fontWeight: 600, marginBottom: 16, color: 'var(--text-muted)' }}>成本拆解</div>
                  <div style={{ display: 'flex', height: 24, borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 16 }}>
                    {result.profit.costs.map((c, i) => (
                      <div
                        key={c.label}
                        style={{
                          width: `${c.pct}%`,
                          background: i === 0 ? 'var(--accent)' : i < 3 ? 'var(--accent-border)' : 'var(--bg-hover)',
                          minWidth: 2,
                        }}
                        title={`${c.label}: ¥${c.amount}`}
                      />
                    ))}
                  </div>
                  {result.profit.costs.map((c) => (
                    <div key={c.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <span className="text-sm">{c.label}</span>
                      <span className="text-sm" style={{ fontWeight: 600 }}>¥{c.amount}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0 0', marginTop: 4,
                  }}>
                    <span className="text-sm" style={{ fontWeight: 700 }}>总成本</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}>¥{result.profit.totalCost}</span>
                  </div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div className="text-sm" style={{ fontWeight: 600, marginBottom: 16, color: 'var(--text-muted)' }}>利润指标</div>
                  {[
                    { label: '建议零售价', value: `¥${result.profit.retailPrice}` },
                    { label: '单件利润', value: `¥${result.profit.profitPerUnit}`, highlight: true },
                    { label: '毛利率', value: `${result.profit.grossMargin}%` },
                    { label: '净利率', value: `${result.profit.netMargin}%`, highlight: true },
                    { label: '回本单量', value: `${result.profit.bepUnits} 件` },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <span className="text-sm">{label}</span>
                      <span style={{
                        fontSize: highlight ? 20 : 15,
                        fontWeight: 700,
                        color: highlight ? 'var(--success)' : 'var(--text-primary)',
                      }}>{value}</span>
                    </div>
                  ))}
                  <div className="card" style={{
                    marginTop: 16, padding: 12, background: 'var(--success-light)',
                    border: '1px solid #bbf7d0',
                  }}>
                    <span className="text-sm" style={{ color: '#16a34a', fontWeight: 600 }}>
                      净利率 {result.profit.netMargin}% &ge; 15% 基准 ✓
                    </span>
                  </div>
                </div>
              </div>

              <div className="card table-scroll" style={{ padding: 0, overflow: 'auto' }}>
                <table className="data-table" style={{ minWidth: 420 }}>
                  <thead>
                    <tr>
                      <th>月份</th>
                      <th>预估销量</th>
                      <th>预估收入</th>
                      <th>广告投入</th>
                      <th>净利润</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.profit.monthProjections.map((m) => (
                      <tr key={m.month}>
                        <td style={{ fontWeight: 600 }}>{m.month}</td>
                        <td>{m.units} 件</td>
                        <td>¥{m.revenue.toLocaleString()}</td>
                        <td className="text-secondary">¥{m.adSpend.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: m.profit > 0 ? 'var(--success)' : '#dc2626' }}>
                          {m.profit > 0 ? '+' : ''}¥{m.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ─── Section 5: SKU Scorecard ─── */}
        <div id="scoring" className="report-section">
          <div
            className="report-section-header"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('scoring')}
          >
            <span className="section-num">05</span>
            <BarChart3 size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ flex: 1 }}>SKU 综合评分 · 这个品值不值得做</h3>
            {isCollapsed('scoring') ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isCollapsed('scoring') && (
            <>
              <div className="card" style={{
                marginBottom: 16, textAlign: 'center', padding: 32,
                background: scoreBg, border: `1px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor, lineHeight: 1, marginBottom: 8 }}>
                  {totalScore.toFixed(1)}
                </div>
                <div className="text-sm" style={{ color: scoreColor, fontWeight: 600, marginBottom: 4 }}>
                  / 5.0 · {passed ? '通过选品评估' : '未达基准线'}
                </div>
                <div className="text-xs text-muted">
                  通过线 {result.scoring.passingLine} 分 · {passed ? '可以进入测试阶段' : '建议重新评估或换品'}
                </div>
              </div>

              <div className="card" style={{ padding: 0 }}>
                {result.scoring.dimensions.map((d, i) => (
                  <div key={d.name} style={{
                    padding: '14px 20px',
                    borderBottom: i < result.scoring.dimensions.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, flex: 1 }}>{d.name}</span>
                      <span className="text-xs text-muted">权重 {Math.round(d.weight * 100)}%</span>
                      <span style={{
                        fontWeight: 700, fontSize: 16,
                        color: d.score >= 4 ? 'var(--success)' : d.score >= 3.5 ? 'var(--accent)' : '#dc2626',
                      }}>{d.score.toFixed(1)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            transform: `scaleX(${d.score / 5})`,
                            background: d.score >= 4 ? 'var(--success)' : d.score >= 3.5 ? 'var(--accent)' : '#dc2626',
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted" style={{ minWidth: 200 }}>{d.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─── Section 6: Supply Chain Feasibility ─── */}
        <div id="supply" className="report-section">
          <div
            className="report-section-header"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('supply')}
          >
            <span className="section-num">06</span>
            <Factory size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ flex: 1 }}>供应链可行性 · 哪里拿货</h3>
            {isCollapsed('supply') ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isCollapsed('supply') && (
            <>
              <div className="card table-scroll" style={{ padding: 0, overflow: 'auto', marginBottom: 16 }}>
                <table className="data-table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>供应商</th>
                      <th>单价</th>
                      <th>起订量</th>
                      <th>发货地</th>
                      <th>评分</th>
                      <th>标签</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.supply.suppliers.map((s) => (
                      <tr key={s.rank}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{s.rank}</td>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{s.price}</td>
                        <td>{s.moq}</td>
                        <td className="text-secondary">{s.location}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={12} style={{ color: '#eab308', fill: '#eab308' }} />
                            {s.rating}
                          </div>
                        </td>
                        <td>{s.tag && <span className="badge badge--accent" style={{ fontSize: 11 }}>{s.tag}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card" style={{ padding: 16, background: 'var(--success-light)', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
                  <span className="text-sm" style={{ color: '#16a34a', fontWeight: 600 }}>
                    {result.supply.verdict}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Decision Card ─── */}
        <div className="card" style={{
          marginBottom: 32, padding: 28,
          border: `2px solid ${passed ? 'var(--success)' : '#fecaca'}`,
          background: passed ? 'var(--success-light)' : '#fef2f2',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {passed ? (
              <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
            ) : (
              <AlertCircle size={24} style={{ color: '#dc2626' }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: passed ? '#16a34a' : '#dc2626' }}>
                {passed ? '选品评估通过' : '选品评估未通过'}
              </div>
              <div className="text-sm" style={{ color: passed ? '#15803d' : '#b91c1c' }}>
                综合得分 {totalScore.toFixed(1)} / 5.0（通过线 {result.scoring.passingLine}）
              </div>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-primary)', marginBottom: passed ? 0 : 20 }}>
            {passed
              ? '6 个维度全部达到基准线，这个品值得小批量测试。'
              : '利润空间不足或竞争压力较大，建议调整选品方向或重新评估差异化策略。'}
          </p>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            再试一个品
          </button>
        </div>
      </div>
    </div>
  )
}
