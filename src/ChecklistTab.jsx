/*
SQL to run in Supabase Dashboard:

create table if not exists checklist_state (
  id text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table checklist_state enable row level security;
create policy "public read" on checklist_state for select using (true);
create policy "public insert" on checklist_state for insert with check (true);
create policy "public update" on checklist_state for update using (true);
*/

import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

const CHECKLISTS = [
  {
    id: 'opening',
    title: '🏪 Перед открытием',
    source: 'База знаний → Открытие кафе',
    color: '#1a4f1a',
    bg: '#f0f7ed',
    border: '#b8d9b8',
    items: [
      'Концепция сформулирована в одном предложении',
      'Финансовая модель на 3 года (3 сценария)',
      'Локация: трафик, конкуренты, документы',
      'Alvará sanitário получен',
      'CNPJ открыт, contabilidade нанята',
      'Меню протестировано на 20+ людях вне команды',
      'Команда нанята и обучена стандартам',
      'Soft open проведён (минимум 1 неделя)',
      'QR-коды обратной связи + Telegram-алерт настроены',
      'Google Maps / iFood профиль заполнен с фото',
      'Instagram ведётся за 2+ недели до открытия',
      'Резерв: 3 месяца операционных расходов',
    ]
  },
  {
    id: 'tax',
    title: '💼 До открытия — вопросы к contador',
    source: 'База знаний → Налоги BR',
    color: '#7a5a00',
    bg: '#fffbe6',
    border: '#f0d97a',
    items: [
      'Подтвердить CNAE для кафе с детской зоной (и возможно магазином)',
      'Выбрать режим налогообложения (Simples Nacional vs Lucro Presumido)',
      'Разобраться: платить ISS или ICMS для смешанной деятельности',
      'Настроить nota fiscal eletrônica (NF-e / NFC-e)',
      'Уточнить пороги для обязательного кассового аппарата (ECF/SAT)',
      'Спланировать график квартальных платежей DAS',
      'Разобраться с pro-labore vs distribuição de lucros',
      'Уточнить учёт импортных товаров (если есть)',
    ]
  },
  {
    id: 'cctv',
    title: '📹 Видеонаблюдение (CCTV)',
    source: 'База знаний → Видеонаблюдение',
    color: '#1a3a5f',
    bg: '#edf3fa',
    border: '#b8cfe0',
    items: [
      'Запрошен orçamento с nota fiscal у продавца SC',
      'NVR Intelbras NVD 1404 P — выбрана модель',
      'Камеры IP67 — 4 шт × Intelbras VIP 1230 B',
      'WD Purple 1 ТБ — жёсткий диск для CFTV',
      'Определены 4 точки установки камер',
      'Проложен кабель cat5e/cat6 по точкам',
      'NVR установлен и подключён',
      'Настроен удалённый доступ с телефона',
      'Проверены углы обзора днём и ночью',
      'ИБП/Nobreak подключён к регистратору',
    ]
  },
  {
    id: 'security',
    title: '🔒 Система безопасности',
    source: 'База знаний → Система безопасности',
    color: '#4a1a5f',
    bg: '#f5edfb',
    border: '#cfb8e0',
    items: [
      'Камеры IP67, регистратор + WD Purple — orçamento com nota fiscal',
      'Определены 4 точки установки камер',
      'Настроен удалённый доступ с телефона',
      'Куплен базовый кит сигнализации, датчики на двери/окно',
      'Прожекторы с датчиком движения по периметру',
      'Замки/решётка на окно выдачи',
      'Огнетушители ABC + класс K, аварийный свет, табличка «saída»',
      'Пожарная безопасность увязана с треком Bombeiros (AVCB/CLCB)',
      'Периметр детской зоны: забор + калитка с защёлкой',
      'Аптечка на месте',
      '(Опц.) сейф для выручки',
      '(Опц.) решение по службе мониторинга',
    ]
  },
]

export default function ChecklistTab() {
  const [checks, setChecks] = useState({})
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    supabase.from('checklist_state').select('data').eq('id', 'main').single()
      .then(({ data }) => { if (data?.data) setChecks(data.data) })
  }, [])

  const toggle = (checklistId, idx) => {
    const key = `${checklistId}_${idx}`
    const next = { ...checks, [key]: !checks[key] }
    setChecks(next)
    setSaving(true)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase.from('checklist_state')
        .upsert({ id: 'main', data: next, updated_at: new Date().toISOString() })
        .then(() => setSaving(false))
    }, 800)
  }

  const totalItems = CHECKLISTS.reduce((a, c) => a + c.items.length, 0)
  const doneItems = CHECKLISTS.reduce((a, c) =>
    a + c.items.filter((_, i) => checks[`${c.id}_${i}`]).length, 0)
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf9f6', minHeight: '100vh', padding: '1rem 1rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>Задачи</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>✅ Чек-листы</div>
          <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>Все задачи перед запуском</div>
        </div>
        <div style={{ fontSize: 11, color: saving ? '#aaa' : 'transparent', marginTop: 6 }}>
          {saving ? 'сохранение…' : '✓'}
        </div>
      </div>

      {/* Overall progress */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 600 }}>Общий прогресс</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: pct === 100 ? '#1a4f1a' : '#854F0B' }}>
            {doneItems} / {totalItems} ({pct}%)
          </span>
        </div>
        <div style={{ height: 8, background: '#f0ebe3', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: pct === 100 ? '#1a4f1a' : '#854F0B',
            borderRadius: 99,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Checklist groups */}
      {CHECKLISTS.map(cl => {
        const done = cl.items.filter((_, i) => checks[`${cl.id}_${i}`]).length
        const total = cl.items.length
        const clPct = total > 0 ? Math.round((done / total) * 100) : 0

        return (
          <div key={cl.id} style={{
            marginBottom: 14,
            background: '#fff',
            border: `1px solid ${cl.border}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              background: cl.bg,
              borderBottom: `1px solid ${cl.border}`,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: cl.color }}>{cl.title}</div>
                  <div style={{ fontSize: 10, color: cl.color, opacity: 0.7, marginTop: 2 }}>{cl.source}</div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: done === total ? cl.color : '#854F0B',
                  background: 'rgba(255,255,255,0.6)',
                  padding: '3px 10px',
                  borderRadius: 99,
                  border: `1px solid ${cl.border}`,
                }}>
                  {done} / {total}
                  {done === total && ' ✓'}
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${clPct}%`,
                  background: cl.color,
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '4px 0 8px' }}>
              {cl.items.map((item, i) => {
                const key = `${cl.id}_${i}`
                const checked = !!checks[key]
                return (
                  <div
                    key={i}
                    onClick={() => toggle(cl.id, i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      cursor: 'pointer',
                      borderBottom: i < cl.items.length - 1 ? '0.5px solid #f0ebe3' : 'none',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: checked ? `2px solid ${cl.color}` : '2px solid #ccc',
                      background: checked ? cl.color : '#fff',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 13,
                      color: checked ? '#999' : '#1a1a1a',
                      textDecoration: checked ? 'line-through' : 'none',
                      opacity: checked ? 0.5 : 1,
                      transition: 'all 0.15s',
                      lineHeight: 1.4,
                    }}>
                      {item}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
