/*
-- Run in Supabase Dashboard:
-- create table if not exists finance_state (id text primary key, data jsonb not null, updated_at timestamptz default now());
-- alter table finance_state enable row level security;
-- create policy "public read" on finance_state for select using (true);
-- create policy "public insert" on finance_state for insert with check (true);
-- create policy "public update" on finance_state for update using (true);
*/

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_STAFF = [
  { role: 'Собственник/управляющий', count: 1, salary: 3000, encargos: 1.1, stage: 1 },
  { role: 'Бариста',                 count: 1, salary: 2200, encargos: 1.7, stage: 1 },
  { role: 'Хостес / касса',          count: 1, salary: 2000, encargos: 1.7, stage: 1 },
  { role: 'Помощник зала / мойка',   count: 1, salary: 1700, encargos: 1.7, stage: 1 },
  { role: 'Повар',                   count: 1, salary: 2800, encargos: 1.7, stage: 2 },
  { role: 'Помощник кухни',          count: 1, salary: 1800, encargos: 1.7, stage: 2 },
  { role: 'Официант',                count: 1, salary: 1900, encargos: 1.7, stage: 2 },
]

const DEFAULT_INPUTS = {
  workDays: 26,
  capex: 300000,
  capital: 350000,
  launchMonth2: 7,
  usdRate: 5.4,
  s1Guests: 45,
  s1Entry: 25,
  s1Drinks: 28,
  s1FoodCost: 28,
  s2Guests: 75,
  s2Check: 65,
  s2FoodCost: 33,
  acquiring: 3,
  tax: 6,
  rent: 8000,
  utilities: 2500,
  marketing: 2000,
  accountant: 1200,
  other: 1500,
  staff: DEFAULT_STAFF,
  season: [1.4, 1.4, 1.4, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 1.4],
  ramp:   [0.6, 0.75, 0.85, 0.95, 1, 1, 1, 1, 1, 1, 1, 1],
}

const DEFAULT_CHECKLIST = {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return Math.round(n).toLocaleString('ru-RU') + ' R$'
}
const fmtN = (n, dec = 1) => {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return n.toFixed(dec)
}
const pct = (n) => (isNaN(n) ? '—' : n.toFixed(1) + '%')

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

function staffFOT(staff, stage) {
  return staff
    .filter(s => s.stage <= stage)
    .reduce((sum, s) => sum + Number(s.count) * Number(s.salary) * Number(s.encargos), 0)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  wrap: { maxWidth: 860, margin: '0 auto', padding: '24px 16px', fontFamily: "'Georgia', serif" },
  section: { marginBottom: 8 },
  sectionHeader: (open) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '13px 18px', cursor: 'pointer', userSelect: 'none',
    borderRadius: open ? '8px 8px 0 0' : 8,
    border: '1.5px solid #EBE2D3',
    background: open ? '#1a1a1a' : '#F5F0E8',
    color: open ? '#fff' : '#1a1a1a',
    fontWeight: 600, fontSize: 15,
    transition: 'all 0.15s',
  }),
  sectionBody: {
    border: '1.5px solid #EBE2D3', borderTop: 'none',
    borderRadius: '0 0 8px 8px', padding: '20px 18px',
    background: '#fff',
  },
  subGroup: { marginBottom: 20 },
  subTitle: { fontWeight: 600, fontSize: 13, color: '#5C3D1E', marginBottom: 10, letterSpacing: 0.3 },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  label: { fontSize: 13, color: '#444', minWidth: 260, flex: '0 0 260px' },
  input: {
    border: '1.5px solid #D4C4A8', borderRadius: 6, padding: '4px 8px',
    fontFamily: "'Georgia', serif", fontSize: 13, width: 110, textAlign: 'right',
    background: '#FDFAF5', outline: 'none',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 8 },
  th: { background: '#F5F0E8', fontWeight: 600, padding: '6px 8px', border: '1px solid #EBE2D3', textAlign: 'center' },
  td: { padding: '5px 8px', border: '1px solid #EBE2D3', textAlign: 'right' },
  tdLeft: { padding: '5px 8px', border: '1px solid #EBE2D3', textAlign: 'left' },
  tdMono: { padding: '5px 8px', border: '1px solid #EBE2D3', textAlign: 'right', fontFamily: 'monospace' },
  hlRow: { background: '#F9F5ED', fontWeight: 700 },
  posNum: { color: '#2D6A2D', fontFamily: 'monospace' },
  negNum: { color: '#8B2020', fontFamily: 'monospace' },
  neutralNum: { fontFamily: 'monospace' },
  badge: (ok) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11,
    background: ok ? '#E8F5E9' : '#FDECEA', color: ok ? '#2D6A2D' : '#8B2020',
  }),
  saveStatus: { fontSize: 11, color: '#999', marginLeft: 8 },
}

// ─── Numeric Input ────────────────────────────────────────────────────────────

function NumInput({ value, onChange, style }) {
  const [local, setLocal] = useState(String(value))
  useEffect(() => { setLocal(String(value)) }, [value])
  return (
    <input
      style={{ ...S.input, ...style }}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => {
        const n = parseFloat(local)
        if (!isNaN(n)) onChange(n)
        else setLocal(String(value))
      }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Finance() {
  const [open, setOpen] = useState({})
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [saveStatus, setSaveStatus] = useState('') // '', 'saving', 'saved', 'error'
  const debounceRef = useRef(null)
  const isRemoteUpdate = useRef(false)

  // ── Load from DB ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('finance_state').select('data').eq('id', 'main').single()
      .then(({ data, error }) => {
        if (error || !data) return
        isRemoteUpdate.current = true
        if (data.data.inputs) setInputs(prev => ({ ...DEFAULT_INPUTS, ...data.data.inputs }))
        if (data.data.checklist) setChecklist(data.data.checklist)
        setTimeout(() => { isRemoteUpdate.current = false }, 0)
      })
  }, [])

  // ── Realtime ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('finance_state_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_state' }, (payload) => {
        if (isRemoteUpdate.current) return
        const d = payload.new?.data
        if (!d) return
        isRemoteUpdate.current = true
        if (d.inputs) setInputs(prev => ({ ...DEFAULT_INPUTS, ...d.inputs }))
        if (d.checklist) setChecklist(d.checklist)
        setTimeout(() => { isRemoteUpdate.current = false }, 0)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Debounced Save ──────────────────────────────────────────────────────────
  const saveToDb = useCallback((inp, cl) => {
    if (isRemoteUpdate.current) return
    clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase.from('finance_state').upsert({
        id: 'main', data: { inputs: inp, checklist: cl }, updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      setSaveStatus(error ? 'error' : 'saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 800)
  }, [])

  const setInput = useCallback((key, val) => {
    setInputs(prev => {
      const next = { ...prev, [key]: val }
      saveToDb(next, checklist)
      return next
    })
  }, [checklist, saveToDb])

  const setChecked = useCallback((key, val) => {
    setChecklist(prev => {
      const next = { ...prev, [key]: val }
      saveToDb(inputs, next)
      return next
    })
  }, [inputs, saveToDb])

  const toggleSection = (id) => setOpen(p => ({ ...p, [id]: !p[id] }))

  // ── Computed Model ──────────────────────────────────────────────────────────
  const model = useMemo(() => {
    const { workDays, capex, capital, launchMonth2, s1Guests, s1Entry, s1Drinks, s1FoodCost,
            s2Guests, s2Check, s2FoodCost, acquiring, tax, rent, utilities,
            marketing, accountant, other, staff, season, ramp } = inputs

    const fot1 = staffFOT(staff, 1)
    const fot2 = staffFOT(staff, 2)
    const fixedNoFot = rent + utilities + marketing + accountant + other

    const months = Array.from({ length: 12 }, (_, i) => {
      const mo = i + 1
      const stage = mo < launchMonth2 ? 1 : 2
      const seas = season[i] || 1
      const rm = ramp[i] || 1
      const baseGuests = stage === 1 ? s1Guests : s2Guests
      const guestsDay = parseFloat((baseGuests * seas * rm).toFixed(1))
      const checkVal = stage === 1 ? (s1Entry + s1Drinks) : s2Check
      const revenue = guestsDay * checkVal * workDays
      const foodCostPct = stage === 1 ? s1FoodCost : s2FoodCost
      const foodCost = -revenue * foodCostPct / 100
      const acqCost = -revenue * acquiring / 100
      const taxCost = -revenue * tax / 100
      const totalVar = foodCost + acqCost + taxCost
      const margin = revenue + totalVar
      const marginPct = revenue ? margin / revenue * 100 : 0
      const fot = stage === 1 ? fot1 : fot2
      const totalFixed = -(fot + fixedNoFot)
      const opProfit = margin + totalFixed
      const opPct = revenue ? opProfit / revenue * 100 : 0
      const opCF = opProfit
      const capexCost = mo === 1 ? -capex : 0
      const netCF = opCF + capexCost
      return {
        stage, seas, rm, guestsDay, checkVal, revenue,
        foodCost, acqCost, taxCost, totalVar, margin, marginPct,
        fot: -fot, totalFixed, opProfit, opPct,
        opCF, capexCost, netCF,
      }
    })

    // cumulative cash
    let cum = capital
    const cumCash = months.map(m => {
      cum += m.netCF
      return cum
    })

    return { months, cumCash, fot1, fot2, fixedNoFot }
  }, [inputs])

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.wrap}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#1a1a1a' }}>💰 Финансовая модель</h2>
        {saveStatus === 'saving' && <span style={S.saveStatus}>сохраняю…</span>}
        {saveStatus === 'saved'  && <span style={{ ...S.saveStatus, color: '#2D6A2D' }}>сохранено ✓</span>}
        {saveStatus === 'error'  && <span style={{ ...S.saveStatus, color: '#8B2020' }}>ошибка сохранения</span>}
      </div>

      {/* ── 1. Вводные ── */}
      <Section id="inputs" label="📋 Вводные" open={open} toggle={toggleSection}>
        <SectionInputs inputs={inputs} setInput={setInput} model={model} />
      </Section>

      {/* ── 2. Модель 12 месяцев ── */}
      <Section id="model" label="📊 Модель 12 месяцев" open={open} toggle={toggleSection}>
        <ModelTable inputs={inputs} model={model} />
      </Section>

      {/* ── 3. Точка безубыточности ── */}
      <Section id="bep" label="⚖️ Точка безубыточности" open={open} toggle={toggleSection}>
        <BEPSection inputs={inputs} model={model} />
      </Section>

      {/* ── 4. Чек-лист ── */}
      <Section id="checklist" label="✅ Чек-лист" open={open} toggle={toggleSection}>
        <ChecklistSection checklist={checklist} setChecked={setChecked} />
      </Section>

      {/* ── 5. Финансы на пальцах ── */}
      <Section id="edu" label="📚 Финансы на пальцах" open={open} toggle={toggleSection}>
        <EduSection />
      </Section>
    </div>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ id, label, open, toggle, children }) {
  const isOpen = !!open[id]
  return (
    <div style={S.section}>
      <div style={S.sectionHeader(isOpen)} onClick={() => toggle(id)}>
        <span>{label}</span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div style={S.sectionBody}>{children}</div>}
    </div>
  )
}

// ─── 1. Вводные ──────────────────────────────────────────────────────────────

function SectionInputs({ inputs, setInput, model }) {
  const { fot1, fot2 } = model

  const setStaffField = (idx, field, val) => {
    const next = inputs.staff.map((r, i) => i === idx ? { ...r, [field]: val } : r)
    setInput('staff', next)
  }
  const setSeasonField = (key, idx, val) => {
    const next = [...inputs[key]]
    next[idx] = val
    setInput(key, next)
  }

  return (
    <div>
      {/* Общие */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Общие</div>
        {[
          ['workDays',    'Рабочих дней в месяц'],
          ['capex',       'Стартовые инвестиции CAPEX, R$'],
          ['capital',     'Привлечённый капитал, R$'],
          ['launchMonth2','Месяц запуска Этапа 2 (1–12)'],
          ['usdRate',     'Курс USD→BRL'],
        ].map(([key, label]) => (
          <div key={key} style={S.inputRow}>
            <span style={S.label}>{label}</span>
            <NumInput value={inputs[key]} onChange={v => setInput(key, v)} />
          </div>
        ))}
      </div>

      {/* Этап 1 */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Этап 1 — двор + напитки</div>
        {[
          ['s1Guests',   'Гостей в день (база)'],
          ['s1Entry',    'Вход / couvert, R$ на гостя'],
          ['s1Drinks',   'Чек напитки/снеки, R$ на гостя'],
          ['s1FoodCost', 'Food/bev cost %'],
        ].map(([key, label]) => (
          <div key={key} style={S.inputRow}>
            <span style={S.label}>{label}</span>
            <NumInput value={inputs[key]} onChange={v => setInput(key, v)} />
          </div>
        ))}
      </div>

      {/* Этап 2 */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Этап 2 — полное кафе</div>
        {[
          ['s2Guests',   'Гостей в день (база)'],
          ['s2Check',    'Средний чек, R$'],
          ['s2FoodCost', 'Food cost %'],
        ].map(([key, label]) => (
          <div key={key} style={S.inputRow}>
            <span style={S.label}>{label}</span>
            <NumInput value={inputs[key]} onChange={v => setInput(key, v)} />
          </div>
        ))}
      </div>

      {/* Переменные */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Переменные расходы (% выручки)</div>
        {[
          ['acquiring', 'Эквайринг %'],
          ['tax',       'Налог Simples Nacional %'],
        ].map(([key, label]) => (
          <div key={key} style={S.inputRow}>
            <span style={S.label}>{label}</span>
            <NumInput value={inputs[key]} onChange={v => setInput(key, v)} />
          </div>
        ))}
      </div>

      {/* Постоянные */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Постоянные расходы, R$/мес (без ФОТ)</div>
        {[
          ['rent',       'Аренда'],
          ['utilities',  'Коммуналка'],
          ['marketing',  'Маркетинг'],
          ['accountant', 'Бухгалтер'],
          ['other',      'Прочее'],
        ].map(([key, label]) => (
          <div key={key} style={S.inputRow}>
            <span style={S.label}>{label}</span>
            <NumInput value={inputs[key]} onChange={v => setInput(key, v)} />
          </div>
        ))}
      </div>

      {/* Персонал */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Персонал</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Роль', 'Кол-во', 'ЗП брутто R$', 'Энкаргос ×', 'С этапа', 'Итого R$/мес'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inputs.staff.map((row, i) => {
                const total = row.count * row.salary * row.encargos
                return (
                  <tr key={i}>
                    <td style={S.tdLeft}>
                      <input
                        style={{ ...S.input, width: 160, textAlign: 'left' }}
                        value={row.role}
                        onChange={e => setStaffField(i, 'role', e.target.value)}
                      />
                    </td>
                    <td style={S.td}>
                      <NumInput value={row.count} onChange={v => setStaffField(i, 'count', v)} style={{ width: 50 }} />
                    </td>
                    <td style={S.td}>
                      <NumInput value={row.salary} onChange={v => setStaffField(i, 'salary', v)} style={{ width: 80 }} />
                    </td>
                    <td style={S.td}>
                      <NumInput value={row.encargos} onChange={v => setStaffField(i, 'encargos', v)} style={{ width: 60 }} />
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      <select
                        style={{ ...S.input, width: 60, textAlign: 'center' }}
                        value={row.stage}
                        onChange={e => setStaffField(i, 'stage', Number(e.target.value))}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                    </td>
                    <td style={S.tdMono}>{fmt(total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 13, color: '#444', marginTop: 6 }}>
          <span style={{ marginRight: 24 }}>ФОТ Этап 1: <b style={S.negNum}>{fmt(fot1)}</b></span>
          <span>ФОТ Этап 2: <b style={S.negNum}>{fmt(fot2)}</b></span>
        </div>
      </div>

      {/* Сезонность */}
      <div style={S.subGroup}>
        <div style={S.subTitle}>Сезонность и раскрутка</div>
        {[
          ['season', 'Сезонность'],
          ['ramp',   'Раскрутка'],
        ].map(([key, label]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MONTHS.map((mo, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>{mo}</div>
                  <NumInput
                    value={inputs[key][i]}
                    onChange={v => setSeasonField(key, i, v)}
                    style={{ width: 48 }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 2. Модель 12 месяцев ─────────────────────────────────────────────────────

function ModelTable({ inputs, model }) {
  const { months, cumCash } = model

  // Year totals / averages
  const sum = (arr) => arr.reduce((a, b) => a + b, 0)
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

  const rows = [
    { label: 'Этап (1/2)',                key: 'stage',      fmt: (v) => v,              isAvg: false, highlight: false, isNum: false },
    { label: 'Сезонность',                key: 'seas',       fmt: (v) => fmtN(v),         isAvg: true,  highlight: false, isNum: false },
    { label: 'Раскрутка',                 key: 'rm',         fmt: (v) => fmtN(v),         isAvg: true,  highlight: false, isNum: false },
    { label: 'Гостей в день (с коэф)',    key: 'guestsDay',  fmt: (v) => fmtN(v),         isAvg: true,  highlight: false, isNum: true },
    { label: 'Выручка на гостя R$',       key: 'checkVal',   fmt: (v) => fmtN(v, 0),      isAvg: true,  highlight: false, isNum: true },
    { label: 'Выручка за месяц R$',       key: 'revenue',    fmt: (v) => fmt(v),           isAvg: false, highlight: true,  isNum: true, bold: true },
    { label: 'Food cost',                 key: 'foodCost',   fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Эквайринг',                 key: 'acqCost',    fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Налог',                     key: 'taxCost',    fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Итого переменные',          key: 'totalVar',   fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Маржинальная прибыль R$',  key: 'margin',     fmt: (v) => fmt(v),           isAvg: false, highlight: true,  isNum: true, bold: true },
    { label: 'Маржинальность %',          key: 'marginPct',  fmt: (v) => pct(v),           isAvg: true,  highlight: false, isNum: false },
    { label: 'ФОТ',                       key: 'fot',        fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Аренда',                    key: '_rent',      fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Коммуналка',                key: '_util',      fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Маркетинг',                 key: '_mkt',       fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Бухгалтер',                 key: '_acc',       fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Прочее',                    key: '_oth',       fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Итого постоянные',          key: 'totalFixed', fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Операционная прибыль R$',  key: 'opProfit',   fmt: (v) => fmt(v),           isAvg: false, highlight: true,  isNum: true, bold: true, colorized: true },
    { label: 'Рентабельность %',          key: 'opPct',      fmt: (v) => pct(v),           isAvg: true,  highlight: false, isNum: false },
    { label: '---',                       key: '_sep',       fmt: () => '',                isAvg: false, highlight: false, isNum: false, isSep: true },
    { label: 'Денежный поток от операций',key: 'opCF',       fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Инвестиции CAPEX',          key: 'capexCost',  fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Чистый денежный поток',     key: 'netCF',      fmt: (v) => fmt(v),           isAvg: false, highlight: false, isNum: true },
    { label: 'Деньги на счёте на конец месяца', key: '_cum', fmt: (v) => fmt(v),          isAvg: false, highlight: true,  isNum: true, bold: true, colorized: true },
  ]

  const getVal = (m, i, key) => {
    if (key === '_rent') return -inputs.rent
    if (key === '_util') return -inputs.utilities
    if (key === '_mkt') return -inputs.marketing
    if (key === '_acc') return -inputs.accountant
    if (key === '_oth') return -inputs.other
    if (key === '_cum') return cumCash[i]
    if (key === '_sep') return null
    return m[key]
  }

  const getYearVal = (row) => {
    if (row.isSep) return ''
    if (['stage', 'seas', 'rm', 'guestsDay', 'checkVal', 'marginPct', 'opPct'].includes(row.key)) return ''
    if (row.key === '_cum') return row.fmt(cumCash[11])
    const vals = months.map((m, i) => getVal(m, i, row.key))
    if (row.isAvg) return row.fmt(avg(vals))
    return row.fmt(sum(vals))
  }

  const minCash = Math.min(...cumCash)

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ ...S.table, minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ ...S.th, textAlign: 'left', minWidth: 200 }}>Показатель</th>
              {MONTHS.map(m => <th key={m} style={{ ...S.th, minWidth: 72 }}>{m}</th>)}
              <th style={{ ...S.th, minWidth: 90 }}>Год</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              if (row.isSep) {
                return (
                  <tr key={ri}>
                    <td colSpan={14} style={{ border: '1px solid #EBE2D3', padding: 2, background: '#F5F0E8' }} />
                  </tr>
                )
              }
              const rowStyle = row.highlight ? S.hlRow : {}
              return (
                <tr key={ri} style={rowStyle}>
                  <td style={{ ...S.tdLeft, fontWeight: row.bold ? 700 : 400, fontSize: 12 }}>{row.label}</td>
                  {months.map((m, mi) => {
                    const v = getVal(m, mi, row.key)
                    let color = {}
                    if (row.colorized && typeof v === 'number') {
                      color = { color: v >= 0 ? '#2D6A2D' : '#8B2020' }
                    }
                    if (row.isNum && typeof v === 'number' && !row.colorized) {
                      color = { color: v < 0 ? '#8B2020' : v > 0 ? '#2D6A2D' : '#1a1a1a' }
                    }
                    return (
                      <td key={mi} style={{ ...S.tdMono, fontWeight: row.bold ? 700 : 400, fontSize: 11, ...color }}>
                        {row.fmt(v)}
                      </td>
                    )
                  })}
                  <td style={{ ...S.tdMono, fontWeight: 700, fontSize: 11 }}>{getYearVal(row)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 13 }}>
        <span>Минимальный остаток за год: </span>
        <span style={{ fontWeight: 700, color: minCash < 0 ? '#8B2020' : '#2D6A2D', fontFamily: 'monospace' }}>
          {fmt(minCash)}
        </span>
        {minCash < 0 && <span style={{ color: '#8B2020', marginLeft: 8, fontSize: 12 }}>⚠ Кассовый разрыв! Нужна дополнительная подушка.</span>}
      </div>
    </div>
  )
}

// ─── 3. Точка безубыточности ──────────────────────────────────────────────────

function BEPSection({ inputs, model }) {
  const { workDays, s1Entry, s1Drinks, s2Check, s1FoodCost, s2FoodCost,
          acquiring, tax, rent, utilities, marketing, accountant, other } = inputs
  const { fot1, fot2, fixedNoFot } = model

  const calc = (stage) => {
    const foodPct = stage === 1 ? s1FoodCost : s2FoodCost
    const totalVarPct = foodPct + acquiring + tax
    const marginPct = 100 - totalVarPct
    const fot = stage === 1 ? fot1 : fot2
    const totalFixed = fot + fixedNoFot
    const bepRevenue = marginPct > 0 ? totalFixed / (marginPct / 100) : Infinity
    const checkVal = stage === 1 ? (s1Entry + s1Drinks) : s2Check
    const bepGuests = checkVal > 0 ? bepRevenue / checkVal / workDays : Infinity
    const planGuests = stage === 1 ? inputs.s1Guests : inputs.s2Guests
    const safety = planGuests > 0 ? (planGuests - bepGuests) / bepGuests * 100 : 0
    return { foodPct, totalVarPct, marginPct, fot, totalFixed, bepRevenue, checkVal, bepGuests, planGuests, safety }
  }

  const s1 = calc(1)
  const s2 = calc(2)

  const Row = ({ label, v1, v2 }) => (
    <tr>
      <td style={S.tdLeft}>{label}</td>
      <td style={S.tdMono}>{v1}</td>
      <td style={S.tdMono}>{v2}</td>
    </tr>
  )

  return (
    <div>
      <table style={{ ...S.table, maxWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ ...S.th, textAlign: 'left', width: 260 }}>Показатель</th>
            <th style={S.th}>Этап 1</th>
            <th style={S.th}>Этап 2</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Food cost %" v1={pct(s1.foodPct)} v2={pct(s2.foodPct)} />
          <Row label="Эквайринг %" v1={pct(inputs.acquiring)} v2={pct(inputs.acquiring)} />
          <Row label="Налог %" v1={pct(inputs.tax)} v2={pct(inputs.tax)} />
          <Row label="Переменные итого %" v1={pct(s1.totalVarPct)} v2={pct(s2.totalVarPct)} />
          <Row label="Маржинальность %" v1={pct(s1.marginPct)} v2={pct(s2.marginPct)} />
          <Row label="ФОТ R$/мес" v1={fmt(s1.fot)} v2={fmt(s2.fot)} />
          <Row label="Прочие постоянные R$/мес" v1={fmt(s1.totalFixed - s1.fot)} v2={fmt(s2.totalFixed - s2.fot)} />
          <Row label="Постоянные итого R$/мес" v1={fmt(s1.totalFixed)} v2={fmt(s2.totalFixed)} />
          <tr style={S.hlRow}>
            <td style={{ ...S.tdLeft, fontWeight: 700 }}>Точка безубыточности — выручка R$/мес</td>
            <td style={{ ...S.tdMono, fontWeight: 700 }}>{fmt(s1.bepRevenue)}</td>
            <td style={{ ...S.tdMono, fontWeight: 700 }}>{fmt(s2.bepRevenue)}</td>
          </tr>
          <Row label="Выручка на гостя R$" v1={fmtN(s1.checkVal, 0)} v2={fmtN(s2.checkVal, 0)} />
          <Row label="Рабочих дней" v1={workDays} v2={workDays} />
          <tr style={S.hlRow}>
            <td style={{ ...S.tdLeft, fontWeight: 700 }}>Точка безубыточности — гостей в день</td>
            <td style={{ ...S.tdMono, fontWeight: 700, color: '#8B2020' }}>{fmtN(s1.bepGuests, 1)}</td>
            <td style={{ ...S.tdMono, fontWeight: 700, color: '#8B2020' }}>{fmtN(s2.bepGuests, 1)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.8 }}>
        <div>
          <b>Этап 1:</b> нужно <span style={{ color: '#8B2020', fontFamily: 'monospace' }}>{fmtN(s1.bepGuests, 1)}</span> гостей в день.
          Ваш план: <span style={{ fontFamily: 'monospace' }}>{s1.planGuests}</span> гостей →{' '}
          запас <span style={s1.safety > 0 ? S.posNum : S.negNum}>{fmtN(s1.safety, 0)}%</span>
        </div>
        <div>
          <b>Этап 2:</b> нужно <span style={{ color: '#8B2020', fontFamily: 'monospace' }}>{fmtN(s2.bepGuests, 1)}</span> гостей в день.
          Ваш план: <span style={{ fontFamily: 'monospace' }}>{s2.planGuests}</span> гостей →{' '}
          запас <span style={s2.safety > 0 ? S.posNum : S.negNum}>{fmtN(s2.safety, 0)}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Чек-лист ─────────────────────────────────────────────────────────────

const CHECKLIST_SECTIONS = [
  {
    title: 'До открытия — фундамент собран?',
    items: [
      'Сведён инвестиционный бюджет (CAPEX): ремонт, оборудование, обустройство двора, первая закупка, запас на 2–3 месяца',
      'Привлечённый капитал покрывает CAPEX + подушку (в модели «Минимальный остаток за год» не уходит в минус)',
      'Составлен БДР (план доходов/расходов) на 12 месяцев — это твоя финмодель',
      'Посчитана точка безубыточности в гостях в день — и она ниже планового трафика (запас прочности есть)',
      'Посчитана окупаемость: за сколько лет вернёшь вложения (ориентир — 3 года и быстрее)',
      'Налоговый режим подтверждён у contador (скорее всего Simples Nacional, Anexo I; ставка с 4%)',
      'Прогноз выручки проверен «в полях»: разговор с практиками / похожими заведениями, а не «из головы»',
    ],
  },
  {
    title: 'Каждый день (5 минут)',
    items: [
      'Выручка за день — записана',
      'Число гостей и средний чек (выручка ÷ гости)',
      'Деньги на счёте и в кассе — сколько есть прямо сейчас',
      'Сравнение с дневным планом (выше / ниже точки безубыточности)',
    ],
  },
  {
    title: 'Каждую неделю',
    items: [
      'Food cost % (себестоимость проданного ÷ выручка) — держим ~28–33%',
      'Labor cost % (ФОТ с encargos ÷ выручка) — следим, чтобы не разрастался, особенно в низкий сезон',
      'Списания / порча продуктов — это прямой убыток, фиксируем причину',
      'Эквайринг и кассовые расхождения — всё сходится?',
      'Закрыли ли неделю выше безубыточности',
    ],
  },
  {
    title: 'Каждый месяц',
    items: [
      'P&L (факт) против БДР (плана) — где и почему разошлось',
      'ДДС: остаток на счёте и насколько близко подошёл к нулю (кассовый разрыв)',
      'Операционная прибыль и рентабельность, % — в плане?',
      'Сравнение фактического трафика с точкой безубыточности',
      'Средний чек и поток гостей — динамика месяц к месяцу',
      'Не подкрались ли «тихие» расходы (подписки, доставка, мелкий ремонт)',
    ],
  },
  {
    title: 'Каждый квартал',
    items: [
      'Пересчитать финмодель под факт — обновить синие цифры в Excel',
      'Проверить цены — особенно перед высоким сезоном (декабрь–март)',
      'План на следующий квартал помесячно с учётом сезонности Флорипы (дек–мар +40%, апр–ноя −30%)',
      'Решение по сезонности: куда деть/как занять команду в низкий сезон, чтобы не терять людей',
    ],
  },
  {
    title: 'Сезонные риски Флорипы',
    items: [
      'В модели видно, что апрель–июнь — самые слабые месяцы. Подушка должна их перекрыть',
      'Высокий сезон (дек–мар) даёт основную прибыль — не упусти его на старте',
      'Не нанимай «по высокому сезону» так, чтобы labor cost убил тебя в низкий',
    ],
  },
  {
    title: 'Красные флаги — когда срочно вмешиваться',
    items: [
      'Деньги на счёте приближаются к нулю — даже если P&L прибыльный. Это кассовый разрыв',
      'Food cost > 35% или резкий скачок — проверь закупки, порции, списания',
      'Labor cost растёт быстрее выручки — пересмотри график смен под трафик',
      'Несколько месяцев «болтаешься в нуле» — фиксируй и меняй, а не тяни',
      'Выручка ниже точки безубыточности два месяца подряд — разбирай причину',
    ],
    isRedFlags: true,
  },
]

function ChecklistSection({ checklist, setChecked }) {
  return (
    <div>
      {CHECKLIST_SECTIONS.map((section) => {
        const checked = section.items.filter(item => checklist[item]).length
        const total = section.items.length
        return (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: section.isRedFlags ? '#8B2020' : '#1a1a1a' }}>
                {section.title}
              </span>
              <span style={S.badge(checked === total)}>
                {checked} / {total} ✓
              </span>
            </div>
            {section.items.map((item) => (
              <label key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!checklist[item]}
                  onChange={e => setChecked(item, e.target.checked)}
                  style={{ marginTop: 3, accentColor: section.isRedFlags ? '#8B2020' : '#8B4513', flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: checklist[item] ? '#999' : '#333', textDecoration: checklist[item] ? 'line-through' : 'none', lineHeight: 1.5 }}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ─── 5. Финансы на пальцах ────────────────────────────────────────────────────

const EDU_ITEMS = [
  {
    title: '1. Главная идея — три вопроса и три отчёта',
    content: (
      <div>
        <p>Всё финансовое управление кафе сводится к трём вопросам:</p>
        <ul>
          <li><b>Зарабатываю ли я?</b> → ОПиУ / P&L</li>
          <li><b>Выживу ли я физически?</b> → ДДС / Cash Flow</li>
          <li><b>Чем владею и сколько должен?</b> → Баланс</li>
        </ul>
        <p>Можно быть прибыльным «на бумаге» и умереть от кассового разрыва. Все три отчёта нужны вместе.</p>
      </div>
    ),
  },
  {
    title: '2. ОПиУ / P&L — «зарабатываю ли я»',
    content: (
      <div>
        <p>Отчёт о прибылях и убытках показывает, сколько денег ты заработал или потерял за период.</p>
        <table style={{ ...S.table, maxWidth: 500 }}>
          <tbody>
            <tr><td style={S.tdLeft}>Выручка</td><td style={{ ...S.tdMono, color: '#2D6A2D' }}>100 000 R$</td></tr>
            <tr><td style={S.tdLeft}>– Себестоимость (food cost, encargos)</td><td style={{ ...S.tdMono, color: '#8B2020' }}>– 40 000 R$</td></tr>
            <tr><td style={S.tdLeft}>= Маржинальная прибыль</td><td style={{ ...S.tdMono, color: '#2D6A2D' }}>60 000 R$</td></tr>
            <tr><td style={S.tdLeft}>– Постоянные расходы (аренда, ФОТ…)</td><td style={{ ...S.tdMono, color: '#8B2020' }}>– 50 000 R$</td></tr>
            <tr><td style={{ ...S.tdLeft, fontWeight: 700 }}>= Операционная прибыль</td><td style={{ ...S.tdMono, fontWeight: 700, color: '#2D6A2D' }}>10 000 R$</td></tr>
          </tbody>
        </table>
        <p>Если строчка «Операционная прибыль» отрицательная — кафе работает в убыток. Нужно либо увеличить выручку, либо снизить расходы.</p>
      </div>
    ),
  },
  {
    title: '3. ДДС / Cash flow — «выживу ли я физически»',
    content: (
      <div>
        <p>Отчёт о движении денежных средств показывает реальные поступления и выплаты. Это не то же самое, что прибыль.</p>
        <p><b>Пример кассового разрыва:</b> ты продал торт за 1 000 R$ в кредит (клиент заплатит через месяц), а муку купил сегодня за 300 R$. В P&L — прибыль 700 R$. В кассе — минус 300 R$.</p>
        <p>Для кафе это реже бывает (наличная выручка сразу), но риски есть: предоплата аренды, сезонные ямы, CAPEX в начале.</p>
        <p>Следи: <b>остаток на счёте должен всегда быть выше нуля</b>, даже если P&L прибыльный.</p>
      </div>
    ),
  },
  {
    title: '4. Баланс — «чем владею и сколько должен»',
    content: (
      <div>
        <p>Баланс — снимок финансового состояния на конкретную дату.</p>
        <table style={{ ...S.table, maxWidth: 500 }}>
          <thead>
            <tr>
              <th style={S.th}>Активы (чем владею)</th>
              <th style={S.th}>Пассивы (откуда взял)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={S.tdLeft}>Деньги на счёте, оборудование, запасы</td>
              <td style={S.tdLeft}>Кредиты, долги поставщикам, собственный капитал</td>
            </tr>
          </tbody>
        </table>
        <p>Для малого кафе баланс нужен реже — раз в квартал для понимания общей картины. Ежедневно важнее P&L и Cash Flow.</p>
      </div>
    ),
  },
  {
    title: '5. БДР и БДДС — плановые версии отчётов',
    content: (
      <div>
        <p><b>БДР</b> (Бюджет доходов и расходов) = плановый P&L. Это то, что ты делаешь в этой финмодели.</p>
        <p><b>БДДС</b> (Бюджет движения денежных средств) = плановый Cash Flow. Показывает, когда именно деньги поступят и выйдут.</p>
        <p>Смысл: сравниваешь план с фактом каждый месяц → видишь отклонения → принимаешь решения раньше, чем станет поздно.</p>
        <p>Правило: если факт хуже плана два месяца подряд — пересматривай план или меняй действия, не жди «само выправится».</p>
      </div>
    ),
  },
  {
    title: '6. Юнит-экономика: считаем по одному гостю',
    content: (
      <div>
        <p>Юнит = один гость. Сколько ты зарабатываешь с каждого?</p>
        <table style={{ ...S.table, maxWidth: 500 }}>
          <tbody>
            <tr><td style={S.tdLeft}>Средний чек</td><td style={S.tdMono}>65 R$</td></tr>
            <tr><td style={S.tdLeft}>– Food cost 33%</td><td style={{ ...S.tdMono, color: '#8B2020' }}>– 21,5 R$</td></tr>
            <tr><td style={S.tdLeft}>– Эквайринг 3%</td><td style={{ ...S.tdMono, color: '#8B2020' }}>– 2 R$</td></tr>
            <tr><td style={S.tdLeft}>– Налог 6%</td><td style={{ ...S.tdMono, color: '#8B2020' }}>– 3,9 R$</td></tr>
            <tr><td style={{ ...S.tdLeft, fontWeight: 700 }}>= Маржа с гостя</td><td style={{ ...S.tdMono, fontWeight: 700, color: '#2D6A2D' }}>37,6 R$</td></tr>
          </tbody>
        </table>
        <p>Постоянные расходы — 50 000 R$/мес. Рабочих дней — 26. Значит, нужно: 50 000 ÷ 37,6 ÷ 26 = <b>~51 гость в день</b> для выхода в ноль.</p>
        <p>Это и есть точка безубыточности в гостях. Раздел «⚖️ Точка безубыточности» считает это автоматически.</p>
      </div>
    ),
  },
  {
    title: '7. Какие цифры смотреть и как часто',
    content: (
      <div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Период</th>
              <th style={S.th}>Метрика</th>
              <th style={S.th}>Норма</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Каждый день', 'Выручка + число гостей', 'Выше дневной точки БУ'],
              ['Каждый день', 'Остаток на счёте', '> 0, желательно > месячной аренды'],
              ['Каждую неделю', 'Food cost %', '28–33%'],
              ['Каждую неделю', 'Labor cost %', 'До 30% выручки'],
              ['Каждый месяц', 'Операционная прибыль', '> 0'],
              ['Каждый месяц', 'Рентабельность', '> 10% — хорошо, > 20% — отлично'],
              ['Каждый квартал', 'Факт vs план', 'Отклонение < 15%'],
            ].map(([p, m, n], i) => (
              <tr key={i}>
                <td style={S.tdLeft}>{p}</td>
                <td style={S.tdLeft}>{m}</td>
                <td style={S.tdLeft}>{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: '8. Три главных вывода',
    content: (
      <div>
        <p><b>1. Прибыль ≠ деньги в кассе.</b> Следи за Cash Flow отдельно от P&L. Особенно в первые месяцы.</p>
        <p><b>2. Точка безубыточности — твой главный ориентир каждый день.</b> Не «хорошо или плохо поработали», а «выше или ниже БУ».</p>
        <p><b>3. Сезонность убивает тех, кто не готовился.</b> В апреле–июне выручка упадёт на 30–40%. Эти деньги нужно заработать и отложить в декабре–марте.</p>
      </div>
    ),
  },
]

function EduSection() {
  const [open, setOpen] = useState({})
  return (
    <div>
      {EDU_ITEMS.map((item, i) => {
        const isOpen = !!open[i]
        return (
          <div key={i} style={{ marginBottom: 6 }}>
            <div
              style={{
                padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
                borderRadius: isOpen ? '6px 6px 0 0' : 6,
                border: '1.5px solid #EBE2D3',
                background: isOpen ? '#F5F0E8' : '#FDFAF5',
                fontWeight: 600, fontSize: 13, color: '#1a1a1a',
                display: 'flex', justifyContent: 'space-between',
              }}
              onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))}
            >
              <span>{item.title}</span>
              <span style={{ opacity: 0.5, fontSize: 11 }}>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
              <div style={{
                border: '1.5px solid #EBE2D3', borderTop: 'none',
                borderRadius: '0 0 6px 6px', padding: '16px 18px',
                background: '#fff', fontSize: 13, lineHeight: 1.7, color: '#1a1a1a',
              }}>
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
