import { useState, useEffect } from 'react'
import InvestmentCalc from './InvestmentCalc'
import ResponsibilityCalc from './ResponsibilityCalc'
import BrandTab from './BrandTab'
import KnowledgeBase from './KnowledgeBase'
import BusinessPlan from './BusinessPlan'
import MenuPricing from './MenuPricing'
import RentalOptions from './RentalOptions'
import Finance from './Finance'

const TABS = [
  { id: 'bizplan', label: '📋 Бизнес-план' },
  { id: 'resp',    label: '👥 Ответственность' },
  { id: 'rental',  label: '🏠 Аренда' },
  { id: 'smeta',   label: '📊 Смета' },
  { id: 'finance', label: '💰 Финансы' },
  { id: 'menu',    label: '🍽️ Меню' },
  { id: 'brand',   label: '🎨 Дизайн-код' },
  { id: 'kb',      label: '📚 База знаний' },
]

function getInitTab() {
  const hash = window.location.hash.replace('#', '')
  return TABS.find(t => t.id === hash) ? hash : 'bizplan'
}

export default function App() {
  const [tab, setTab] = useState(getInitTab)
  const [pendingAnchor, setPendingAnchor] = useState(null)

  useEffect(() => {
    window.location.hash = tab
  }, [tab])

  useEffect(() => {
    const handler = (e) => {
      if (TABS.find(t => t.id === e.detail)) setTab(e.detail)
    }
    document.addEventListener('navigate-tab', handler)
    return () => document.removeEventListener('navigate-tab', handler)
  }, [])

  useEffect(() => {
    if (tab === 'kb' && pendingAnchor) {
      setTimeout(() => {
        const el = document.getElementById(pendingAnchor)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setPendingAnchor(null)
      }, 100)
    }
  }, [tab, pendingAnchor])

  const handleNavigate = (targetTab, anchor) => {
    setTab(targetTab)
    if (anchor) setPendingAnchor(anchor)
  }

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

      {tab === 'smeta'   && <InvestmentCalc />}
      {tab === 'bizplan' && <BusinessPlan />}
      {tab === 'rental'  && <RentalOptions />}
      {tab === 'menu'    && <MenuPricing />}
      {tab === 'brand'   && <BrandTab />}
      {tab === 'resp'    && <ResponsibilityCalc onNavigate={handleNavigate} />}
      {tab === 'finance' && <Finance />}
      {tab === 'kb'      && <KnowledgeBase />}
    </div>
  )
}
