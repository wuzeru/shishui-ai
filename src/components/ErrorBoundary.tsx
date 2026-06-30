import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ justifyContent: 'center' }}>
          <div className="page-content" style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 'var(--radius-xl)',
              background: '#fef2f2', marginBottom: 24,
            }}>
              <AlertTriangle size={32} style={{ color: '#dc2626' }} />
            </div>
            <h2 className="text-xl" style={{ marginBottom: 8 }}>
              出了点问题
            </h2>
            <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>
              {this.state.error?.message || '页面遇到了一个意外错误'}
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
            >
              <RotateCcw size={16} />
              回到首页重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
