import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import QuestionsPage from './pages/QuestionsPage'
import HypothesisPage from './pages/HypothesisPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/hypothesis" element={<HypothesisPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </ErrorBoundary>
  )
}
