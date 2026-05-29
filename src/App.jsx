import { useState, useEffect } from 'react'
import InvestmentCalc from './InvestmentCalc'
import ResponsibilityCalc from './ResponsibilityCalc'

const TABS = [
  { id: 'smeta', label: '📊 Смета' },
  { id: 'resp',  label: '👥 Задачи' },
]

function getInitTab() {
  const hash = window.location.hash.replace('#', '')
  return TABS.find(t => t.id === hash) ? hash : 'smeta'
}

export default function App() {
  const [tab, setTab] = useState(getInitTab)

  useEffect(() => {
    window.location.hash = tab
  }, [tab])

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh" }}>
      {/* TAB BAR */}
      <div style={{
        display: 'flex', gap: 2, padding: '10px 12px 0',
        borderBottom: '1.5px solid #EBE2D3',
        background: 'rgba(250,249,246,0.97)',
        backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 18px', borderRadius: '8px 8px 0 0',
            border: 'none', cursor: 'pointer',
            fontFamily: "'Georgia', serif",
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            background: tab === t.id ? '#1a1a1a' : 'transparent',
            color: tab === t.id ? '#fff' : '#999',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'smeta' && <InvestmentCalc />}
      {tab === 'resp'  && <ResponsibilityCalc />}
    </div>
  )
}
