/*
-- Run in Supabase Dashboard:
-- create table if not exists business_plan_state (id text primary key default 'main', state jsonb not null, updated_at timestamptz default now());
-- create table if not exists menu_state (id text primary key default 'main', state jsonb not null, updated_at timestamptz default now());
-- alter table business_plan_state enable row level security;
-- alter table menu_state enable row level security;
-- create policy "public read" on business_plan_state for select using (true);
-- create policy "public insert" on business_plan_state for insert with check (true);
-- create policy "public update" on business_plan_state for update using (true);
-- create policy "public read" on menu_state for select using (true);
-- create policy "public insert" on menu_state for insert with check (true);
-- create policy "public update" on menu_state for update using (true);
*/

import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const RATE = 5.03;

const initialIdeas = [
  { text: "Куры в дворе = вирусный контент. Дети кормят кур → фото → Instagram → приходят снова", tag: "🐔 Деревня" },
  { text: "Вертикальный огород на серой стене — укроп и петрушка растут сами и идут в борщ. Подписи на RU+PT", tag: "🐔 Деревня" },
  { text: "Концепция 'Русская деревня' — всё вместе: куры, огород, деревянная кухня, типи, ростомер с подсолнухом", tag: "💡 Концепция" },
  { text: "Бесплатные мастер-классы по выходным — кормим кур, сажаем зелень, лепим пирожки. Запись через Instagram", tag: "📸 Instagram" },
  { text: "Типи с фонариками внутри = фото-зона для мам. Мамы фотографируют детей → Stories с отметкой → бесплатная реклама", tag: "📸 Instagram" },
  { text: "НАЗВАНИЕ — варианты: Dacha (понятно всем), Berezka (русский символ), Avul (деревня по-татарски, экзотика), Ert (дом по-татарски, минимализм). Выбрать до открытия.", tag: "💡 Концепция" },
  { text: "Параллельный контент для Moms App — кафе как точка сбора аудитории", tag: "📱 Moms App" },
  { text: "Деревянный дек — утром йога для мам, днём пуфики-лаунж, вечером сцена для живой музыки", tag: "💡 Концепция" },
  { text: "Качели с лентами на дереве = фото-точка №1 Берёзки", tag: "📸 Instagram" },
  { text: "Ростомер с подсолнухом — надпись на РУ+PT: 'Как ты вырос? / Quanto você cresceu?'", tag: "📸 Instagram" },
];

const initialKidsZone = [
  { name: "Меловая стена (краска + мелки)", who: "сама", brl: 400, done: false, zone: "indoor" },
  { name: "Ростомер с подсолнухом", who: "сама", brl: 150, done: false, zone: "outdoor" },
  { name: "Типи (бамбук + ткань + фонарики) — ФОТО-ЗОНА 📸", who: "сама", brl: 400, done: false, zone: "outdoor" },
  { name: "Фонарики outdoor IP44 × 2 набора", who: "купить", brl: 400, done: false, zone: "outdoor" },
  { name: "Удлинитель уличный влагозащищённый", who: "купить", brl: 150, done: false, zone: "outdoor" },
  { name: "Грязевая кухня (поддоны)", who: "сама", brl: 500, done: false, zone: "outdoor" },
  { name: "Посуда для кухни (металл б/у)", who: "купить", brl: 200, done: false, zone: "outdoor" },
  { name: "Детские инструменты (лопата, грабли, лейка)", who: "купить", brl: 250, done: false, zone: "outdoor" },
  { name: "Пни-ступеньки", who: "купить (OLX)", brl: 600, done: false, zone: "outdoor" },
  { name: "Водный жёлоб из бамбука", who: "сама (бесплатно)", brl: 0, done: false, zone: "outdoor" },
  { name: "Песок", who: "купить", brl: 300, done: false, zone: "outdoor" },
  { name: "Пропитка для дерева", who: "купить", brl: 150, done: false, zone: "outdoor" },
  { name: "Контейнер для хранения", who: "купить", brl: 200, done: false, zone: "indoor" },
  { name: "Крестики-нолики (камни + пень)", who: "сама", brl: 0, done: false, zone: "outdoor" },
  { name: "Забор детской зоны", who: "сама", brl: 0, done: false, zone: "outdoor" },
  { name: "Слэклайн между деревьями", who: "купить (MercadoLivre)", brl: 150, done: false, zone: "outdoor" },
  { name: "Качели на дерево (доска + верёвка + ленты)", who: "сама", brl: 170, done: false, zone: "outdoor" },
  { name: "Куры (3–4 штуки)", who: "купить (feira/OLX)", brl: 400, done: false, zone: "garden" },
  { name: "Кормушка + поилка", who: "купить", brl: 150, done: false, zone: "garden" },
  { name: "Вертикальный огород из поддонов", who: "сама", brl: 300, done: false, zone: "garden" },
  { name: "Горшки + земля + семена трав", who: "купить", brl: 300, done: false, zone: "garden" },
  { name: "Детский огород + семена", who: "сама", brl: 300, done: false, zone: "garden" },
  { name: "Ящики с природными материалами", who: "сама", brl: 200, done: false, zone: "outdoor" },
];

const initialPillars = [
  { icon: "☕", title: "Specialty кофе и напитки", desc: "Фильтр-кофе, капучино, матча латте, травяные чаи — с первого дня на Этапе 1" },
  { icon: "🍳", title: "Завтраки как в Москве", desc: "Сырники, каша, авокадо-тост, яйца benedict — с Этапа 2" },
  { icon: "🥟", title: "Русская еда весь день", desc: "Борщ, пельмени, блины, оливье, пирожки — полное меню с Этапа 2" },
  { icon: "👶", title: "Природная детская зона", desc: "Типи, пни, грязевая кухня, ростомер, слэклайн, качели, водный жёлоб из бамбука" },
  { icon: "🎨", title: "Мастер-классы", desc: "По выходным R$20/ребёнок — кормим кур, сажаем зелень, лепим пирожки, рисуем" },
  { icon: "🧘", title: "Йога и фитнес для мам", desc: "Утренние классы на деревянном деке пока дети на площадке. Инструктор приходящий" },
  { icon: "🎸", title: "Живая музыка вечером", desc: "Пятница-суббота на деке-сцене. Гости задерживаются, средний чек растёт" },
  { icon: "🎉", title: "Аренда под мероприятия", desc: "Закрываем кафе целиком: DR, корпоратив, детский праздник. R$2 500–3 000 фикс + меню" },
  { icon: "🌿", title: "Вертикальный огород", desc: "Укроп, петрушка, базилик, мята на стене из поддонов — травы идут прямо в кухню" },
  { icon: "🐔", title: "Русская деревня", desc: "Куры, огород, деревянная кухня для детей — концепция BEREZKA как lifestyle venue" },
  { icon: "🪵", title: "Магазин эко-игрушек", desc: "Монтессори-игрушки, деревянные фигурки, семена с лого Берёзки на стеллаже у выхода" },
];

const revenueStreams = [
  {
    stream: "☕ Кафе — еда и напитки",
    desc: "Работает каждый день. Средний чек R$55. ⚠️ Учти сезонность: дек–март +40%, апр–ноябрь −30%",
    scenarios: [
      { label: "Реалистичный старт (10 чеков/день × 29 дней)", brl: 15950 },
      { label: "Рабочий режим (25 чеков/день × 26 дней)", brl: 35750 },
    ],
  },
  {
    stream: "👶 Детская зона — платный вход",
    desc: "Платный ТОЛЬКО на Этапе 1. После открытия кухни — бесплатно",
    scenarios: [
      { label: "Реалистичный старт: 5–8 детей/день × R$18 × 30", brl: 3240 },
      { label: "При хорошей загрузке: 20 детей/день × R$18", brl: 10800 },
    ],
  },
  {
    stream: "🎨 Мастер-классы",
    desc: "R$20/ребёнок · 2 класса по выходным · 10–15 детей каждый",
    scenarios: [
      { label: "8 классов/мес × 12 детей × R$20", brl: 1920 },
      { label: "При полной записи (15 детей)", brl: 2400 },
    ],
  },
  {
    stream: "🪵 Магазин эко-игрушек",
    desc: "Монтессори-игрушки, деревянные фигурки, семена с лого Берёзки",
    scenarios: [
      { label: "Минимум (10 продаж/мес)", brl: 600 },
      { label: "Активный (30 продаж/мес)", brl: 1800 },
    ],
  },
  {
    stream: "🧘 Йога/фитнес для мам",
    desc: "Утренние классы на деревянном деке · пока дети на площадке",
    scenarios: [
      { label: "3 класса/нед × 8 чел × R$35", brl: 3360 },
      { label: "5 классов/нед × 12 чел × R$45", brl: 8640 },
    ],
  },
  {
    stream: "🎸 Живая музыка (вечера)",
    desc: "Пятница-суббота вечером · музыкант на деке · гости задерживаются дольше",
    scenarios: [
      { label: "8 вечеров/мес · +R$25 к чеку · 20 чел", brl: 2000 },
      { label: "При полной посадке 30 чел", brl: 4500 },
    ],
  },
  {
    stream: "🎉 Аренда кафе под мероприятия",
    desc: "Закрываем кафе целиком · DR, корпоратив, детский праздник",
    scenarios: [
      { label: "Минимум: 1 день/мес × R$2 750", brl: 2750 },
      { label: "Максимум: 4 дня/мес × R$2 750", brl: 11000 },
    ],
  },
];

// ── КЛЮЧЕВЫЕ МЕТРИКИ ─────────────────────────────────────────────────────────
function KeyMetrics({ metrics, setMetrics, finRent }) {
  const upd = (key, val) => setMetrics({ ...metrics, [key]: val });

  const rev = metrics.monthlyRevenue || 1;
  const foodPct  = metrics.foodCost / 100;
  const laborPct = metrics.laborCost / 100;
  const rent = finRent !== undefined ? finRent : metrics.rent;
  const rentPct  = (rent / rev) * 100;
  const ebitda   = rev - rev * foodPct - rev * laborPct - rent;
  const ebitdaPct = (ebitda / rev) * 100;
  const maxDayRev = metrics.avgCheck * metrics.tableTurns * metrics.seats;

  const status = (val, [lo, hi]) => {
    if (val >= lo && val <= hi) return { color: '#16a34a', bg: '#f0fdf4', label: '✓ цель' };
    if (val < lo) return { color: '#d97706', bg: '#fffbeb', label: '↓ ниже цели' };
    return { color: '#dc2626', bg: '#fef2f2', label: '↑ выше цели' };
  };

  const foodSt  = status(metrics.foodCost,  [28, 32]);
  const laborSt = status(metrics.laborCost, [25, 30]);
  const rentSt  = status(rentPct,           [0,  12]);
  const ebitdaSt = status(ebitdaPct,        [15, 20]);

  const MetricRow = ({ label, value, unit, range, st, children }) => (
    <div style={{ background: st.bg, border: `1px solid ${st.color}33`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{label}</div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>цель: {range[0]}–{range[1]}{unit}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: st.color }}>{typeof value === 'number' ? value.toFixed(1) : value}{unit}</div>
          <div style={{ fontSize: 10, color: st.color, fontWeight: 500 }}>{st.label}</div>
        </div>
      </div>
      {children}
      <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, marginTop: 6 }}>
        <div style={{ height: '100%', borderRadius: 99, background: st.color, width: `${Math.min(100, (parseFloat(value) / range[1]) * 100)}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: '#e8e0d4' }} />
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa' }}>Ключевые метрики</span>
        <div style={{ flex: 1, height: 1, background: '#e8e0d4' }} />
      </div>

      <div style={{ background: '#f7f7f5', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Введи текущую выручку/мес для расчёта метрик</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#666', flexShrink: 0 }}>Выручка/мес R$</span>
          <input type="number" value={metrics.monthlyRevenue} min={0} step={1000}
            onChange={e => upd('monthlyRevenue', Number(e.target.value) || 0)}
            style={{ flex: 1, border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', fontSize: 14, fontWeight: 600, fontFamily: "'Georgia',serif", textAlign: 'right' }} />
        </div>
      </div>

      <MetricRow label="Food cost" value={metrics.foodCost} unit="%" range={[28,32]} st={foodSt}>
        <input type="range" min={10} max={60} step={0.5} value={metrics.foodCost}
          onChange={e => upd('foodCost', Number(e.target.value))}
          style={{ width: '100%', accentColor: foodSt.color }} />
        <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>= R${Math.round(rev * foodPct).toLocaleString()}/мес</div>
      </MetricRow>

      <MetricRow label="Labor cost (зарплаты + encargos)" value={metrics.laborCost} unit="%" range={[25,30]} st={laborSt}>
        <input type="range" min={10} max={60} step={0.5} value={metrics.laborCost}
          onChange={e => upd('laborCost', Number(e.target.value))}
          style={{ width: '100%', accentColor: laborSt.color }} />
        <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>= R${Math.round(rev * laborPct).toLocaleString()}/мес</div>
      </MetricRow>

      <MetricRow label={`Аренда / выручка${finRent !== undefined ? " (из Финансов)" : ""}`} value={rentPct} unit="%" range={[0,12]} st={rentSt}>
        <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
          R${rent.toLocaleString()}/мес ÷ R${rev.toLocaleString()} выручка
        </div>
      </MetricRow>

      <MetricRow label="EBITDA margin" value={ebitdaPct} unit="%" range={[15,20]} st={ebitdaSt}>
        <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
          Выручка − food − labor − аренда = R${Math.round(ebitda).toLocaleString()}/мес
        </div>
      </MetricRow>

      <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 16px', marginTop: 4 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666', marginBottom: 10 }}>Макс. выручка дня</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', gap: 4, alignItems: 'center', marginBottom: 12 }}>
          {[
            { label: 'Ср. чек', key: 'avgCheck', min: 10, max: 200, step: 5, suffix: 'R$' },
            { op: '×' },
            { label: 'Оборот стола', key: 'tableTurns', min: 1, max: 8, step: 0.5, suffix: 'x/день' },
            { op: '×' },
            { label: 'Мест', key: 'seats', min: 5, max: 200, step: 5, suffix: 'мест' },
            { op: '=' },
            { label: 'В день макс.', value: `R$${maxDayRev.toLocaleString()}`, highlight: true },
          ].map((item, i) => {
            if (item.op) return <div key={i} style={{ color: '#555', fontSize: 16 }}>{item.op}</div>;
            if (item.highlight) return (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>{item.value}</div>
                <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>~{Math.round(maxDayRev * 26 / 1000)}к/мес</div>
              </div>
            );
            return (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {item.suffix === 'R$' ? 'R$' : ''}{metrics[item.key]}{item.suffix !== 'R$' ? ' ' + item.suffix : ''}
                </div>
                <input type="range" min={item.min} max={item.max} step={item.step} value={metrics[item.key]}
                  onChange={e => upd(item.key, Number(e.target.value))}
                  style={{ width: '100%', marginTop: 4, accentColor: '#4ade80' }} />
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>
          При 26 рабочих днях: до R${(maxDayRev * 26).toLocaleString()}/мес · ~${Math.round(maxDayRev * 26 / RATE).toLocaleString()}/мес
        </div>
      </div>
    </div>
  );
}

// ── БДР 5 ЛЕТ ────────────────────────────────────────────────────────────────
const BDR_SCENARIOS = [
  {
    id: 'pessimistic',
    label: 'Пессимистичный',
    emoji: '📉',
    color: '#dc2626', bg: '#fef2f2', border: '#fca5a5',
    rev:   [15000, 25000, 34000, 40000, 45000],
    fixed: [22000, 35000, 37000, 39000, 41000],
    foodPct: 0.33,
    taxPct:  0.08,
    note: 'Медленный старт, низкий сезонный трафик, минимальная загрузка зала',
  },
  {
    id: 'realistic',
    label: 'Реалистичный',
    emoji: '📊',
    color: '#d97706', bg: '#fffbeb', border: '#fcd34d',
    rev:   [22000, 38000, 52000, 62000, 70000],
    fixed: [24000, 38000, 40000, 42000, 44000],
    foodPct: 0.30,
    taxPct:  0.08,
    note: 'Нормальный рост, стабильная аудитория к году 2, активный сезон используется',
  },
  {
    id: 'optimistic',
    label: 'Оптимистичный',
    emoji: '📈',
    color: '#16a34a', bg: '#f0fdf4', border: '#86efac',
    rev:   [30000, 50000, 68000, 82000, 92000],
    fixed: [26000, 40000, 43000, 46000, 49000],
    foodPct: 0.28,
    taxPct:  0.08,
    note: 'Вирусный эффект детской зоны, высокий сезон загружен полностью, мастер-классы и аренда работают',
  },
];

function calcBDR(sc) {
  return sc.rev.map((rev, y) => {
    const annualRev   = rev * 12;
    const cogs        = Math.round(annualRev * sc.foodPct);
    const grossProfit = annualRev - cogs;
    const annualFixed = sc.fixed[y] * 12;
    const ebitda      = grossProfit - annualFixed;
    const tax         = Math.round(annualRev * sc.taxPct);
    const netProfit   = ebitda - tax;
    return { annualRev, cogs, grossProfit, annualFixed, ebitda, tax, netProfit };
  });
}

function BDRTable({ active, setActive }) {
  const sc = BDR_SCENARIOS.find(s => s.id === active);
  const rows = calcBDR(sc);
  const cumProfit = rows.reduce((acc, r) => { acc.push((acc[acc.length-1] || 0) + r.netProfit); return acc; }, []);

  const fmtM = (n) => `R$${Math.round(Math.abs(n)/1000)}к`;
  const sign  = (n) => n >= 0 ? '+' : '−';
  const col   = (n) => n >= 0 ? '#16a34a' : '#dc2626';

  const ROWS = [
    { label: '📥 Выручка',           key: 'annualRev',   neutral: true },
    { label: '🛒 Себестоимость',      key: 'cogs',        neg: true },
    { label: '= Валовая прибыль',     key: 'grossProfit', bold: true },
    { label: '🏢 Постоянные расходы', key: 'annualFixed', neg: true },
    { label: '= EBITDA',              key: 'ebitda',      bold: true },
    { label: '📋 Налог (~8% выручки)', key: 'tax',        neg: true },
    { label: '💰 Чистая прибыль',     key: 'netProfit',   bold: true, highlight: true },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: '#e8e0d4' }} />
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa' }}>БДР · 5 лет</span>
        <div style={{ flex: 1, height: 1, background: '#e8e0d4' }} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {BDR_SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            flex: 1, padding: '8px 6px', borderRadius: 8, border: `1.5px solid ${active === s.id ? s.color : '#e8e0d4'}`,
            background: active === s.id ? s.bg : '#faf9f6',
            cursor: 'pointer', fontSize: 11, fontFamily: "'Georgia',serif",
            color: active === s.id ? s.color : '#999', fontWeight: active === s.id ? 600 : 400,
            transition: 'all 0.15s',
          }}>
            <div>{s.emoji}</div>
            <div style={{ marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#888', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 14, lineHeight: 1.5 }}>
        {sc.note}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ebebeb' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: '#aaa', fontWeight: 400, minWidth: 140 }}>Статья</th>
              {[1,2,3,4,5].map(y => (
                <th key={y} style={{ textAlign: 'right', padding: '6px 8px', fontSize: 11, color: '#aaa', fontWeight: 400, minWidth: 72 }}>
                  Год {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.key} style={{
                borderBottom: '1px solid #f0f0f0',
                background: row.highlight ? sc.bg : 'transparent',
              }}>
                <td style={{
                  padding: '7px 8px', fontSize: 11,
                  color: row.bold ? '#1a1a1a' : '#555',
                  fontWeight: row.bold ? 600 : 400,
                }}>{row.label}</td>
                {rows.map((r, y) => {
                  const v = r[row.key];
                  const isNeg = row.neg;
                  const c = row.highlight ? col(v) : row.bold ? col(v) : isNeg ? '#888' : '#1a1a1a';
                  return (
                    <td key={y} style={{ textAlign: 'right', padding: '7px 8px', fontWeight: row.bold ? 600 : 400, color: c, fontSize: 12 }}>
                      {isNeg ? '−' : (row.bold || row.highlight) ? sign(v) : ''}{fmtM(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr style={{ background: '#1a1a1a' }}>
              <td style={{ padding: '8px 8px', fontSize: 11, color: '#aaa', fontWeight: 500 }}>📈 Накоплен. итог</td>
              {cumProfit.map((c, y) => (
                <td key={y} style={{ textAlign: 'right', padding: '8px 8px', fontWeight: 700, fontSize: 12, color: c >= 0 ? '#4ade80' : '#f87171' }}>
                  {sign(c)}{fmtM(c)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {(() => {
        const breakIdx = cumProfit.findIndex(c => c >= 0);
        return (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: breakIdx >= 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${breakIdx >= 0 ? '#86efac' : '#fca5a5'}`, fontSize: 12 }}>
            {breakIdx >= 0
              ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Окупаемость — Год {breakIdx + 1}</span>
              : <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠ Не выходит в плюс за 5 лет — пересмотри расходы или концепцию</span>
            }
            <div style={{ color: '#888', marginTop: 3, lineHeight: 1.4 }}>
              Итого за 5 лет: <strong style={{ color: col(cumProfit[4]) }}>{sign(cumProfit[4])}{fmtM(cumProfit[4])}</strong>
              {' · '}Выручка Y5: <strong>R${(sc.rev[4] * 12).toLocaleString()}/год</strong>
            </div>
          </div>
        );
      })()}

      <div style={{ marginTop: 10, padding: '8px 12px', background: '#f7f7f5', borderRadius: 8, fontSize: 10, color: '#aaa', lineHeight: 1.6 }}>
        Допущения: выручка = средняя по месяцам с учётом сезонности · налог Simples Nacional ~8% · food cost {Math.round(sc.foodPct*100)}% · расходы растут по мере найма персонала
      </div>
    </div>
  );
}

const visualData = {
  vibe: "Русская дача встречает скандинавскую избу во Флорипе. Тёмное дерево, белые распашные окна, гортензии, льняные скатерти, персидские ковры, печь.",
  exterior: [
    { zone: "🏠 Фасад", items: [
      { name: "Тёмное дерево — уже есть", cost: 0, diy: true },
      { name: "Белые распашные окна (janela de abrir) — marceneiro", cost: 2400, diy: false },
      { name: "Резные наличники — деревянный декор на окна", cost: 800, diy: false },
      { name: "Тюль белый на окна", cost: 300, diy: true },
      { name: "Гортензии в больших горшках × 6", cost: 600, diy: true },
    ]},
    { zone: "🌿 Двор и веранда", items: [
      { name: "Гравий вместо асфальта в зоне уличных столов", cost: 700, diy: false },
      { name: "Деревянные столы со скамьями под деревьями", cost: 1800, diy: false },
      { name: "Гирлянды между деревьями", cost: 300, diy: true },
      { name: "Крупные горшки с растениями на деке", cost: 400, diy: true },
    ]},
  ],
  interior: [
    { zone: "🎨 Стены и потолок", items: [
      { name: "Белая краска — стены и потолок (сама)", cost: 800, diy: true },
      { name: "Деревянные балки на потолке — уже есть", cost: 0, diy: true },
    ]},
    { zone: "🪵 Мебель и текстиль", items: [
      { name: "Льняные скатерти × 12 б/у (Feira do Largo)", cost: 480, diy: false },
      { name: "Персидские ковры под столами × 4 б/у OLX", cost: 600, diy: false },
      { name: "Разные деревянные стулья б/у — фишка интерьера", cost: 0, diy: false },
      { name: "Кресло-качалка б/у рядом с печью", cost: 400, diy: false },
    ]},
    { zone: "🕯️ Свет и декор", items: [
      { name: "Чёрные промышленные светильники × 6", cost: 720, diy: false },
      { name: "Открытые деревянные полки с посудой (сама из досок)", cost: 300, diy: true },
      { name: "Декор — горшки, вазы, посуда на полках", cost: 500, diy: true },
    ]},
    { zone: "🔥 Печь (муляж)", items: [
      { name: "Короб из гипсокартона + штукатурка — marceneiro/gesseiro", cost: 2500, diy: false },
      { name: "Декоративные дрова в топке", cost: 100, diy: true },
      { name: "Медный чайник + горшки сверху б/у", cost: 200, diy: false },
    ]},
  ],
  kids: [
    { zone: "👶 Детская игровая (природная)", items: [
      { name: "Типи из бамбука + водонепроницаемая ткань + фонарики", cost: 400, diy: true },
      { name: "Пни-ступеньки разной высоты", cost: 600, diy: false },
      { name: "Грязевая кухня из поддонов", cost: 500, diy: true },
      { name: "Меловая стена + ростомер с подсолнухом", cost: 550, diy: true },
      { name: "Водный жёлоб из бамбука", cost: 0, diy: true },
      { name: "Качели с лентами на дереве", cost: 170, diy: true },
      { name: "Слэклайн между деревьями", cost: 150, diy: false },
      { name: "Курятник + 4 курицы", cost: 1200, diy: false },
      { name: "Вертикальный огород из поддонов", cost: 300, diy: true },
    ]},
  ],
};

const phases = [
  {
    num: 1, title: "Этап 1 — «Двор и напитки» (месяцы 1–4)", color: "#EAF3DE", border: "#639922", text: "#3B6D11",
    desc: "Валидация спроса. Проверяем аудиторию с минимальными вложениями — до того как тратимся на кухню и alvará sanitário. Самый дешёвый способ узнать, готов ли рынок.",
    items: [
      "Specialty-кофе, матча, фильтр — с первого дня",
      "Платный вход в детскую зону R$18/ребёнок",
      "Касса SumUp/InfinitePay — без вложений",
      "Документы: CNPJ + alvará de funcionamento (право работать, не про еду)",
      "Инвестиции этапа: ~R$2 000 напитки + ~R$1 500 оформление + обустройство двора",
      "Условие перехода: ≥ 45 гостей/день два месяца подряд (БУТ Этапа 1 = 33 гостя)",
      "Риск: платный вход в игровую зону → espaço infantil → страховка ответственности. Уточнить у despachante до старта",
    ],
  },
  {
    num: 2, title: "Этап 2 — «Кухня» (месяцы 5–8)", color: "#E6F1FB", border: "#185FA5", text: "#0C447C",
    desc: "Полная модель. Вкладываемся в кухню только имея подтверждённый трафик. Русско-татарское меню; детская зона становится бесплатной и работает как драйвер трафика.",
    items: [
      "Полное меню: борщ, пельмени, сырники, блины, завтраки",
      "Детская зона — бесплатно, трафик-магнит",
      "Кофемашина Gaggia/Rancilio б/у + полная команда поваров",
      "Документы: alvará sanitário (Vigilância Sanitária) — критический путь этапа. Подавать заявку ещё на Этапе 1",
      "Инвестиции: оборудование кухни + первая закупка продуктов — основной CAPEX проекта",
      "Чек растёт с ~R$53 до ~R$65; food cost цель ≤ 33%",
      "Условие перехода: опер. прибыль на плане + food cost ≤ 33% два месяца подряд",
      "Риск: задержка alvará sanitário → кассовый разрыв. Подушка на 2 лишних месяца Этапа 1",
    ],
  },
  {
    num: 3, title: "Этап 3 — «Полный формат» (месяцы 9+)", color: "#FAEEDA", border: "#BA7517", text: "#7A4F0E",
    desc: "Рост маржи на готовом трафике. Добавляем высокомаржинальные активности почти без новых вложений — «выжимаем» больше из той же аренды и команды.",
    items: [
      "Мастер-классы R$20/ребёнок по выходным — кормим кур, сажаем зелень, лепим пирожки",
      "Живая музыка пятница–суббота — гости задерживаются, чек растёт",
      "Аренда под мероприятия R$2 500–3 000 — монетизация после 17:00 и в низкий сезон",
      "Магазин эко-игрушек у выхода (монтессори, деревянные фигурки, семена BEREZKA)",
      "Йога для мам на деревянном деке",
      "Инвестиции: минимальные — организация, не CAPEX",
      "Риск: распыление фокуса. Запускать активности по одной",
    ],
  },
];

const TAG_COLORS = {
  "🏠 Помещение": "#E6F1FB",
  "👶 Детская зона": "#EAF3DE",
  "👤 Сотрудники": "#FAEEDA",
  "📋 Документы": "#FCEBEB",
  "📸 Instagram": "#FBEAF0",
  "💡 Концепция": "#EEEDFE",
  "🐔 Деревня": "#FFF8E1",
  "⚠️ Риски": "#FFF0E0",
  "🍳 Кухня": "#FFF8F0",
  "📱 Moms App": "#E6FAF5",
};

const TAG_TEXT = {
  "🏠 Помещение": "#0C447C",
  "👶 Детская зона": "#3B6D11",
  "👤 Сотрудники": "#854F0B",
  "📋 Документы": "#A32D2D",
  "📸 Instagram": "#993556",
  "💡 Концепция": "#3C3489",
  "🐔 Деревня": "#7B5800",
  "⚠️ Риски": "#8a4a00",
  "🍳 Кухня": "#7A4F0E",
  "📱 Moms App": "#0F6E56",
};

function Section({ title, open, onToggle, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{title}</div>
        <span style={{ fontSize: 13, color: "#bbb" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function BusinessPlan() {
  const [openSections, setOpenSections] = useState({});
  const [pillars, setPillars] = useState(initialPillars);
  const [newPillar, setNewPillar] = useState({ icon: "⭐", title: "", desc: "" });
  const [showNewPillar, setShowNewPillar] = useState(false);
  const [ideas, setIdeas] = useState(initialIdeas);
  const [newIdea, setNewIdea] = useState("");
  const [newIdeaTag, setNewIdeaTag] = useState("💡 Концепция");
  const [kidsZone, setKidsZone] = useState(initialKidsZone);
  const [kidsTab, setKidsTab] = useState("outdoor");
  const [newKidsItem, setNewKidsItem] = useState({ name: '', who: 'купить', brl: 0, zone: 'outdoor' });
  const [showNewKids, setShowNewKids] = useState(false);
  const [bdrScenario, setBdrScenario] = useState('realistic');
  const [metrics, setMetrics] = useState({
    monthlyRevenue: 35000,
    foodCost: 30,
    laborCost: 28,
    rent: 11000,
    avgCheck: 55,
    tableTurns: 2.5,
    seats: 40,
  });
  const [phasesState, setPhasesState] = useState(phases);
  const [styleState, setStyleState] = useState(visualData);
  const [finInputs, setFinInputs] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle");
  const saveTimer = useRef(null);
  const isRemoteUpdate = useRef(false);

  // Inline editing state
  const [editingIdeaIdx, setEditingIdeaIdx] = useState(null);
  const [ideaDraft, setIdeaDraft] = useState("");
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseDraft, setPhaseDraft] = useState("");
  const [editingStyle, setEditingStyle] = useState(null);
  const [styleDraft, setStyleDraft] = useState("");
  const [styleCostDraft, setStyleCostDraft] = useState("");
  const [addingStyle, setAddingStyle] = useState(null);
  const [styleNewItem, setStyleNewItem] = useState({ name: '', cost: 0, diy: false });

  const toggleSection = (idx) => setOpenSections(p => ({ ...p, [idx]: !p[idx] }));

  // Load from DB + realtime
  useEffect(() => {
    supabase.from("business_plan_state").select("state").eq("id", "main").maybeSingle()
      .then(({ data }) => {
        if (!data?.state) return;
        isRemoteUpdate.current = true;
        const s = data.state;
        if (s.ideas) setIdeas(s.ideas);
        if (s.pillars) setPillars(s.pillars);
        if (s.kidsZone) setKidsZone(s.kidsZone);
        if (s.bdrScenario) setBdrScenario(s.bdrScenario);
        if (s.metrics) setMetrics(s.metrics);
        if (s.phasesState) setPhasesState(s.phasesState);
        if (s.styleState) setStyleState(s.styleState);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      });

    supabase.from('finance_state').select('data').eq('id', 'main').single()
      .then(({ data }) => { if (data?.data?.inputs) setFinInputs(data.data.inputs); });

    const channel = supabase.channel("biz_plan_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "business_plan_state" }, (payload) => {
        if (!payload.new?.state) return;
        isRemoteUpdate.current = true;
        const s = payload.new.state;
        if (s.ideas) setIdeas(s.ideas);
        if (s.pillars) setPillars(s.pillars);
        if (s.kidsZone) setKidsZone(s.kidsZone);
        if (s.bdrScenario) setBdrScenario(s.bdrScenario);
        if (s.metrics) setMetrics(s.metrics);
        if (s.phasesState) setPhasesState(s.phasesState);
        if (s.styleState) setStyleState(s.styleState);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      })
      .subscribe();

    const finChannel = supabase.channel('finance_rt_in_biz')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_state' }, (payload) => {
        const d = payload.new?.data;
        if (d?.inputs) setFinInputs(d.inputs);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(finChannel);
    };
  }, []);

  const scheduleSave = (state) => {
    if (isRemoteUpdate.current) return;
    setSyncStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("business_plan_state").upsert({ id: "main", state, updated_at: new Date().toISOString() });
      setSyncStatus(error ? "error" : "saved");
      if (!error) setTimeout(() => setSyncStatus("idle"), 2000);
    }, 800);
  };

  const saveAll = (overrides = {}) => {
    scheduleSave({ ideas, pillars, kidsZone, bdrScenario, metrics, phasesState, styleState, ...overrides });
  };

  // Ideas
  const deleteIdea = (i) => { const next = ideas.filter((_,j) => j!==i); setIdeas(next); saveAll({ideas:next}); };
  const startEditIdea = (i) => { setEditingIdeaIdx(i); setIdeaDraft(ideas[i].text); };
  const saveIdeaEdit = (i) => {
    if (!ideaDraft.trim()) return;
    const next = ideas.map((x,j) => j===i ? {...x, text:ideaDraft.trim()} : x);
    setIdeas(next); setEditingIdeaIdx(null); saveAll({ideas:next});
  };
  const addIdea = () => {
    if (!newIdea.trim()) return;
    const next = [...ideas, { text: newIdea.trim(), tag: newIdeaTag }];
    setIdeas(next); setNewIdea(""); saveAll({ideas:next});
  };

  // Kids zone
  const toggleKids = (i) => { const next = kidsZone.map((x,j) => j===i ? {...x,done:!x.done} : x); setKidsZone(next); saveAll({kidsZone:next}); };
  const deleteKidsItem = (i) => { const next = kidsZone.filter((_,j) => j!==i); setKidsZone(next); saveAll({kidsZone:next}); };
  const addKidsItem = () => {
    if (!newKidsItem.name.trim()) return;
    const next = [...kidsZone, {...newKidsItem, brl:Number(newKidsItem.brl)||0, done:false}];
    setKidsZone(next); setNewKidsItem({name:'',who:'купить',brl:0,zone:kidsTab}); setShowNewKids(false); saveAll({kidsZone:next});
  };

  // Phases
  const deletePhaseItem = (phaseNum, itemIdx) => {
    const next = phasesState.map(p => p.num!==phaseNum ? p : {...p, items:p.items.filter((_,j)=>j!==itemIdx)});
    setPhasesState(next); saveAll({phasesState:next});
  };
  const startPhaseEdit = (phaseNum, idx) => { setEditingPhase({phaseNum,idx}); setPhaseDraft(phasesState.find(p=>p.num===phaseNum).items[idx]); };
  const savePhaseDraft = () => {
    if (!phaseDraft.trim() || !editingPhase) return;
    const {phaseNum,idx} = editingPhase;
    const next = phasesState.map(p => p.num!==phaseNum ? p : {...p, items:p.items.map((x,j)=>j===idx?phaseDraft.trim():x)});
    setPhasesState(next); setEditingPhase(null); saveAll({phasesState:next});
  };
  const movePhaseItem = (fromNum, itemIdx, toNum) => {
    if (fromNum === toNum) return;
    const item = phasesState.find(p=>p.num===fromNum).items[itemIdx];
    const next = phasesState.map(p => {
      if (p.num===fromNum) return {...p, items:p.items.filter((_,j)=>j!==itemIdx)};
      if (p.num===toNum) return {...p, items:[...p.items,item]};
      return p;
    });
    setPhasesState(next); saveAll({phasesState:next});
  };

  // Style
  const deleteStyleItem = (zoneType, zoneIdx, itemIdx) => {
    const next = {...styleState, [zoneType]:styleState[zoneType].map((z,zi)=>zi!==zoneIdx?z:{...z,items:z.items.filter((_,j)=>j!==itemIdx)})};
    setStyleState(next); saveAll({styleState:next});
  };
  const startStyleEdit = (zoneType, zoneIdx, itemIdx) => {
    const item = styleState[zoneType][zoneIdx].items[itemIdx];
    setEditingStyle({zoneType,zoneIdx,itemIdx}); setStyleDraft(item.name); setStyleCostDraft(String(item.cost));
  };
  const saveStyleEdit = () => {
    if (!styleDraft.trim() || !editingStyle) return;
    const {zoneType,zoneIdx,itemIdx} = editingStyle;
    const next = {...styleState, [zoneType]:styleState[zoneType].map((z,zi)=>zi!==zoneIdx?z:{...z,items:z.items.map((x,j)=>j!==itemIdx?x:{...x,name:styleDraft.trim(),cost:Number(styleCostDraft)||0})})};
    setStyleState(next); setEditingStyle(null); saveAll({styleState:next});
  };
  const addStyleItem = () => {
    if (!styleNewItem.name.trim() || !addingStyle) return;
    const {zoneType,zoneIdx} = addingStyle;
    const next = {...styleState, [zoneType]:styleState[zoneType].map((z,zi)=>zi!==zoneIdx?z:{...z,items:[...z.items,{name:styleNewItem.name.trim(),cost:Number(styleNewItem.cost)||0,diy:styleNewItem.diy}]})};
    setStyleState(next); setAddingStyle(null); setStyleNewItem({name:'',cost:0,diy:false}); saveAll({styleState:next});
  };

  // Computed
  const kidsBrl = kidsZone.reduce((a,x) => a+x.brl, 0);
  const kidsDone = kidsZone.filter(x => x.done).length;
  const realisticTotal = revenueStreams.reduce((a,r) => a+r.scenarios[0].brl, 0);
  // style items moved to Бюджет tab

  // Finance key metrics (computed from finInputs)
  const finMetrics = finInputs ? (() => {
    const { workDays=26, capex=300000, capital=350000, launchMonth2=7,
            s1Guests=45, s1Entry=25, s1Drinks=28, s1FoodCost=28,
            s2Guests=75, s2Check=65, s2FoodCost=33,
            acquiring=3, tax=6, rent=8000, utilities=2500,
            marketing=2000, accountant=1200, other=1500,
            staff=[], season=[1,1,1,1,1,1,1,1,1,1,1,1], ramp=[1,1,1,1,1,1,1,1,1,1,1,1] } = finInputs;

    const fot1 = staff.filter(s=>s.stage<=1).reduce((a,s)=>a+Number(s.count)*Number(s.salary)*Number(s.encargos),0);
    const fot2 = staff.filter(s=>s.stage<=2).reduce((a,s)=>a+Number(s.count)*Number(s.salary)*Number(s.encargos),0);
    const fixedNoFot = rent + utilities + marketing + accountant + other;

    const bep = (stage) => {
      const foodPct = stage===1 ? s1FoodCost : s2FoodCost;
      const varPct = foodPct + acquiring + tax;
      const marginPct = 100 - varPct;
      const fot = stage===1 ? fot1 : fot2;
      const totalFixed = fot + fixedNoFot;
      const checkVal = stage===1 ? (s1Entry + s1Drinks) : s2Check;
      const bepGuests = marginPct>0 && checkVal>0 ? totalFixed / (marginPct/100) / checkVal / workDays : null;
      return { bepGuests, marginPct };
    };

    const b1 = bep(1), b2 = bep(2);

    // Min cash (кассовый разрыв)
    let cum = capital;
    let minCash = capital;
    for (let i=0; i<12; i++) {
      const stage = (i+1) < launchMonth2 ? 1 : 2;
      const seas = season[i]||1, rm = ramp[i]||1;
      const baseGuests = stage===1 ? s1Guests : s2Guests;
      const guestsDay = baseGuests*seas*rm;
      const checkVal = stage===1 ? (s1Entry+s1Drinks) : s2Check;
      const revenue = guestsDay*checkVal*workDays;
      const varPct = (stage===1?s1FoodCost:s2FoodCost) + acquiring + tax;
      const margin = revenue*(1-varPct/100);
      const fot = stage===1 ? fot1 : fot2;
      const opProfit = margin - fot - fixedNoFot;
      const capexCost = i===0 ? -capex : 0;
      cum += opProfit + capexCost;
      if (cum < minCash) minCash = cum;
    }

    // Payback — months until cumulative opProfit >= capex
    cum = 0;
    let paybackMonths = null;
    for (let i=0; i<60; i++) {
      const mo = i % 12;
      const stage = (i+1) < launchMonth2 ? 1 : 2;
      const guestsDay = (stage===1?s1Guests:s2Guests) * (season[mo]||1) * Math.min(ramp[mo]||1, 1);
      const checkVal = stage===1 ? (s1Entry+s1Drinks) : s2Check;
      const revenue = guestsDay*checkVal*workDays;
      const varPct = (stage===1?s1FoodCost:s2FoodCost) + acquiring + tax;
      const margin = revenue*(1-varPct/100);
      const fot = stage===1 ? fot1 : fot2;
      const opProfit = margin - fot - fixedNoFot;
      cum += opProfit;
      if (cum >= capex && paybackMonths===null) { paybackMonths = i+1; break; }
    }

    return {
      bep1: b1.bepGuests, bep2: b2.bepGuests,
      marginPct2: b2.marginPct,
      minCash,
      paybackYears: paybackMonths ? paybackMonths/12 : null,
    };
  })() : null;

  return (
    <div style={{ fontFamily:"'Georgia',serif", background:"#faf9f6", minHeight:"100vh", padding:"1rem 1rem 2rem" }}>

      {/* Header */}
      <div style={{ marginBottom: 16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:"0.12em", color:"#999", textTransform:"uppercase", marginBottom:4 }}>Бизнес-план</div>
          <div style={{ fontSize:20, fontWeight:600, color:"#1a1a1a" }}>БЕРЁЗКА — Бизнес-план</div>
        </div>
        <div style={{ fontSize:11, color: syncStatus==="saved"?"#16a34a":syncStatus==="saving"?"#aaa":syncStatus==="error"?"#dc2626":"transparent" }}>
          {syncStatus==="saving"&&"сохранение…"}{syncStatus==="saved"&&"✓ сохранено"}{syncStatus==="error"&&"⚠ ошибка"}
        </div>
      </div>

      {/* Mini dashboard — 4 ключевых метрики */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:20 }}>

        {/* 1. Точка безубыточности */}
        <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>⚖️ Точка безубыточности</div>
          {finMetrics ? (
            <div style={{ fontSize:15, fontWeight:600, color:"#1a1a1a" }}>
              {Math.ceil(finMetrics.bep1)} / {Math.ceil(finMetrics.bep2)} гостей
            </div>
          ) : <div style={{ fontSize:13, color:"#bbb" }}>—</div>}
          <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>Этап 1 / Этап 2 в день</div>
          <div style={{ fontSize:9, color:"#bbb", marginTop:5, lineHeight:1.45 }}>
            Постоянные расходы ÷ маржинальность с чека ÷ средний чек ÷ рабочих дней.<br/>
            Маржинальность = 100% − food cost − эквайринг − налог. Данные из раздела Финансы.
          </div>
        </div>

        {/* 2. Юнит-экономика */}
        <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>📐 Юнит-экономика</div>
          {finMetrics ? (
            <div style={{ fontSize:15, fontWeight:600, color: finMetrics.marginPct2>50?"#16a34a":finMetrics.marginPct2>35?"#ca8a04":"#dc2626" }}>
              {finMetrics.marginPct2.toFixed(1)}%
            </div>
          ) : <div style={{ fontSize:13, color:"#bbb" }}>—</div>}
          <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>Маржинальность с чека (Этап 2)</div>
          <div style={{ fontSize:9, color:"#bbb", marginTop:5, lineHeight:1.45 }}>
            Сколько остаётся с каждого реала выручки после food cost, эквайринга и налога — до аренды и зарплат.<br/>
            Если здесь минус, масштаб только увеличивает убыток.
          </div>
        </div>

        {/* 3. Кассовый разрыв */}
        <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>💸 Мин. остаток на счёте</div>
          {finMetrics ? (
            <div style={{ fontSize:15, fontWeight:600, color: finMetrics.minCash>=0?"#16a34a":"#dc2626" }}>
              {finMetrics.minCash>=0?"+":""}{Math.round(finMetrics.minCash).toLocaleString()} R$
            </div>
          ) : <div style={{ fontSize:13, color:"#bbb" }}>—</div>}
          <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>Низшая точка за первый год</div>
          <div style={{ fontSize:9, color:"#bbb", marginTop:5, lineHeight:1.45 }}>
            Стартовый капитал + все операционные денежные потоки и CAPEX за 12 месяцев нарастающим итогом. Минимум этого ряда.<br/>
            Прибыльное на бумаге кафе закрывается именно здесь.
          </div>
        </div>

        {/* 4. Окупаемость */}
        <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>⏱ Окупаемость</div>
          {finMetrics ? (
            <div style={{ fontSize:15, fontWeight:600, color: (finMetrics.paybackYears||99)<3?"#16a34a":(finMetrics.paybackYears||99)<5?"#ca8a04":"#dc2626" }}>
              {finMetrics.paybackYears ? `${finMetrics.paybackYears.toFixed(1)} лет` : ">5 лет"}
            </div>
          ) : <div style={{ fontSize:13, color:"#bbb" }}>—</div>}
          <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>Ориентир Зарькова — 3 года</div>
          <div style={{ fontSize:9, color:"#bbb", marginTop:5, lineHeight:1.45 }}>
            Количество месяцев, пока накопленная операционная прибыль не покроет CAPEX. Сезонность учтена.<br/>
            &lt; 3 лет — хорошо, &lt; 2 лет — отлично.
          </div>
        </div>

      </div>

      {/* SECTION 1: КОНЦЕПЦИЯ */}
      <Section title="💡 1. Концепция" open={openSections[0]} onToggle={()=>toggleSection(0)}>
        {/* Pillar cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          {pillars.map((p,i)=>(
            <div key={i} style={{ position:"relative", background:"#faf9f6", border:"1px solid #ebebeb", borderRadius:10, padding:"8px 10px 8px 10px" }}>
              <button onClick={()=>{ const next=pillars.filter((_,j)=>j!==i); setPillars(next); saveAll({pillars:next}); }}
                style={{ position:"absolute", top:4, right:6, background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:14, lineHeight:1, padding:0 }}>×</button>
              <div style={{ fontSize:16, marginBottom:3 }}>{p.icon}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"#1a1a1a", marginBottom:2, paddingRight:14 }}>{p.title}</div>
              <div style={{ fontSize:10, color:"#666", lineHeight:1.4 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Add pillar */}
        {showNewPillar ? (
          <div style={{ border:"1px solid #ddd", borderRadius:10, padding:"10px 12px", marginBottom:12, background:"#fff" }}>
            <div style={{ display:"flex", gap:6, marginBottom:6 }}>
              <input value={newPillar.icon} onChange={e=>setNewPillar(p=>({...p,icon:e.target.value}))}
                style={{ width:44, border:"1px solid #ddd", borderRadius:6, padding:"4px 6px", fontFamily:"Georgia,serif", fontSize:16, textAlign:"center" }} />
              <input value={newPillar.title} onChange={e=>setNewPillar(p=>({...p,title:e.target.value}))}
                placeholder="Название блока"
                style={{ flex:1, border:"1px solid #ddd", borderRadius:6, padding:"4px 8px", fontFamily:"Georgia,serif", fontSize:12, outline:"none" }} />
            </div>
            <textarea value={newPillar.desc} onChange={e=>setNewPillar(p=>({...p,desc:e.target.value}))}
              placeholder="Описание..."
              rows={2} style={{ width:"100%", border:"1px solid #ddd", borderRadius:6, padding:"4px 8px", fontFamily:"Georgia,serif", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:6, marginTop:6 }}>
              <button onClick={()=>{
                if (!newPillar.title.trim()) return;
                const next=[...pillars, {...newPillar}];
                setPillars(next); saveAll({pillars:next});
                setNewPillar({icon:"⭐",title:"",desc:""}); setShowNewPillar(false);
              }} style={{ padding:"5px 14px", borderRadius:7, border:"none", background:"#1a1a1a", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Добавить</button>
              <button onClick={()=>setShowNewPillar(false)} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #ddd", background:"#fff", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Отмена</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setShowNewPillar(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, border:"1.5px dashed #ddd", background:"transparent", fontSize:12, color:"#999", cursor:"pointer", marginBottom:14, fontFamily:"Georgia,serif" }}>
            + Добавить блок
          </button>
        )}

        {/* Ideas — compact */}
        <div style={{ fontSize:12, fontWeight:600, color:"#555", marginBottom:6, letterSpacing:"0.05em", textTransform:"uppercase" }}>Идеи</div>
        <div style={{ marginBottom:8 }}>
          {ideas.map((idea,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 0", borderBottom:"0.5px solid #f5f5f5" }}>
              <span style={{ fontSize:8, padding:"1px 5px", borderRadius:99, background:TAG_COLORS[idea.tag]||"#f0f0f0", color:TAG_TEXT[idea.tag]||"#333", flexShrink:0, whiteSpace:"nowrap", lineHeight:"16px" }}>
                {idea.tag}
              </span>
              {editingIdeaIdx===i ? (
                <input autoFocus value={ideaDraft} onChange={e=>setIdeaDraft(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") saveIdeaEdit(i); if(e.key==="Escape") setEditingIdeaIdx(null); }}
                  onBlur={()=>saveIdeaEdit(i)}
                  style={{ flex:1, border:"1px solid #ddd", borderRadius:5, padding:"2px 6px", fontFamily:"Georgia,serif", fontSize:11, outline:"none" }} />
              ) : (
                <span style={{ flex:1, fontSize:11, color:"#333", lineHeight:1.35 }}>{idea.text}</span>
              )}
              <button onClick={()=>startEditIdea(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:11, padding:"0 1px", lineHeight:1 }}>✏️</button>
              <button onClick={()=>deleteIdea(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:14, padding:"0 1px", lineHeight:1 }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          <select value={newIdeaTag} onChange={e=>setNewIdeaTag(e.target.value)}
            style={{ border:"1px solid #ddd", borderRadius:7, padding:"5px 6px", fontFamily:"Georgia,serif", fontSize:11, background:"#faf9f6" }}>
            {Object.keys(TAG_COLORS).map(t=><option key={t}>{t}</option>)}
          </select>
          <input value={newIdea} onChange={e=>setNewIdea(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addIdea()}
            placeholder="Новая идея..." style={{ flex:1, minWidth:100, border:"1px solid #ddd", borderRadius:7, padding:"5px 8px", fontFamily:"Georgia,serif", fontSize:11, outline:"none" }} />
          <button onClick={addIdea} style={{ padding:"5px 12px", borderRadius:7, border:"none", background:"#1a1a1a", color:"#fff", fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>+</button>
        </div>
      </Section>

      {/* SECTION 2: ЭТАПЫ */}
      <Section title="🗓️ 2. Этапы" open={openSections[1]} onToggle={()=>toggleSection(1)}>
        {phasesState.map(p=>(
          <div key={p.num} style={{ border:`2px solid ${p.border}`, borderRadius:12, padding:"12px 14px", marginBottom:12, background:"#fff" }}>
            <div style={{ fontSize:11, background:p.color, color:p.text, padding:"2px 8px", borderRadius:99, display:"inline-block", marginBottom:6 }}>{p.title}</div>
            <div style={{ fontSize:13, color:"#555", marginBottom:10, background:"#f7f7f5", borderRadius:8, padding:"8px 10px" }}>{p.desc}</div>
            {p.items.map((item,ii)=>(
              editingPhase?.phaseNum===p.num && editingPhase?.idx===ii ? (
                <div key={ii} style={{ display:"flex", gap:6, padding:"4px 0", alignItems:"center" }}>
                  <input autoFocus value={phaseDraft} onChange={e=>setPhaseDraft(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") savePhaseDraft(); if(e.key==="Escape") setEditingPhase(null); }}
                    style={{ flex:1, border:"1px solid #ddd", borderRadius:6, padding:"4px 8px", fontFamily:"Georgia,serif", fontSize:12 }} />
                  <button onClick={savePhaseDraft} style={{ background:"none", border:"none", cursor:"pointer", color:"#16a34a", fontSize:14 }}>✓</button>
                  <button onClick={()=>setEditingPhase(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#aaa", fontSize:14 }}>✗</button>
                </div>
              ) : (
                <div key={ii} style={{ display:"flex", gap:6, alignItems:"center", padding:"3px 0", borderBottom: ii<p.items.length-1?"0.5px solid #f0f0f0":"none" }}>
                  <span style={{ color:p.border, fontSize:12, flexShrink:0 }}>→</span>
                  <span style={{ flex:1, fontSize:12, color:"#333", lineHeight:1.4 }}>{item}</span>
                  <button onClick={()=>startPhaseEdit(p.num,ii)} style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", fontSize:11, padding:"0 2px" }}>✏️</button>
                  <select
                    value={p.num}
                    onChange={e=>movePhaseItem(p.num,ii,Number(e.target.value))}
                    style={{ border:"1px solid #e5e7eb", borderRadius:4, fontSize:10, padding:"1px 2px", color:"#888", cursor:"pointer", background:"#faf9f6" }}>
                    <option value={1}>Этап 1</option>
                    <option value={2}>Этап 2</option>
                    <option value={3}>Этап 3</option>
                  </select>
                  <button onClick={()=>deletePhaseItem(p.num,ii)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ddd", fontSize:15, padding:"0 2px", lineHeight:1 }}>×</button>
                </div>
              )
            ))}
          </div>
        ))}
      </Section>

      {/* SECTION 3: СТИЛЬ */}
      <Section title="🎨 3. Стиль" open={openSections[2]} onToggle={()=>toggleSection(2)}>
        <div style={{ background:"#f7f7f5", borderRadius:10, padding:"10px 12px", marginBottom:14, borderLeft:"3px solid #533AB7" }}>
          <div style={{ fontSize:12, color:"#555", lineHeight:1.6 }}>{visualData.vibe}</div>
        </div>
        <div style={{ background:"#EAF3DE", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📋</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#3B6D11", marginBottom:2 }}>Все позиции закупки перенесены в раздел «Бюджет»</div>
            <div style={{ fontSize:11, color:"#555", lineHeight:1.5 }}>
              Зоны: Вход / Фасад, Уличная веранда, Игровая, Огород, Зал, Стойка бариста, Кухня — там же ссылки на MercadoLivre и OLX.
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 4: ДОХОДЫ */}
      <Section title="💰 4. Доходы" open={openSections[3]} onToggle={()=>toggleSection(3)}>
        {revenueStreams.map((r,i)=>(
          <div key={i} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{r.stream}</div>
            <div style={{ fontSize:11, color:"#666", marginBottom:10, lineHeight:1.4 }}>{r.desc}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {r.scenarios.map((s,j)=>(
                <div key={j} style={{ background:j===0?"#f7f7f5":"#EAF3DE", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:10, color:j===0?"#999":"#3B6D11", marginBottom:2, lineHeight:1.3 }}>{s.label}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:j===0?"#555":"#27500A" }}>R${s.brl.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ background:"#1a1a1a", borderRadius:10, padding:"12px 14px", color:"#fff", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#aaa", marginBottom:2 }}>Реалистичный итого/мес</div>
          <div style={{ fontSize:22, fontWeight:600 }}>R${realisticTotal.toLocaleString()}</div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontSize:10, color:"#aaa" }}>
            {finInputs ? "✓ Аренда подтянута из раздела Финансы" : "Аренда задаётся в разделе Финансы"}
          </div>
          <button
            onClick={()=>{ document.dispatchEvent(new CustomEvent('navigate-tab', {detail:'finance'})); }}
            style={{ padding:"4px 12px", borderRadius:6, border:"1px solid #e5e7eb", background:"#fff", color:"#555", fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>
            → в Финансы
          </button>
        </div>
        <KeyMetrics metrics={metrics} setMetrics={m=>{ setMetrics(m); saveAll({metrics:m}); }} finRent={finInputs?.rent} />
        <BDRTable active={bdrScenario} setActive={v=>{ setBdrScenario(v); saveAll({bdrScenario:v}); }} />
      </Section>

      {/* SECTION 5: ДЕТСКАЯ ЗОНА */}
      <Section title="👶 5. Детская зона" open={openSections[4]} onToggle={()=>toggleSection(4)}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontSize:12, color:"#666" }}>Выполнено {kidsDone}/{kidsZone.length}</div>
          <div style={{ fontSize:14, fontWeight:600 }}>R${kidsBrl.toLocaleString()}</div>
        </div>

        <div style={{ marginBottom:12 }}>
          {[
            { key:"outdoor", label:"🌳 Уличная", color:"#3B6D11", bg:"#EAF3DE" },
            { key:"indoor",  label:"🏠 В помещении", color:"#0C447C", bg:"#E6F1FB" },
            { key:"garden",  label:"🌱 Огород", color:"#7B5800", bg:"#FFF8E1" },
          ].map(tab=>(
            <button key={tab.key} onClick={()=>setKidsTab(tab.key)}
              style={{ marginRight:6, padding:"5px 12px", borderRadius:20, border:`1.5px solid ${kidsTab===tab.key?tab.color:"#e5e7eb"}`,
                background:kidsTab===tab.key?tab.bg:"#faf9f6", color:kidsTab===tab.key?tab.color:"#999",
                fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:kidsTab===tab.key?600:400 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {kidsZone.filter(item=>item.zone===kidsTab).map((item)=>{
          const globalIdx = kidsZone.indexOf(item);
          return (
            <div key={globalIdx} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"7px 0", borderBottom:"0.5px solid #ebebeb" }}>
              <div onClick={()=>toggleKids(globalIdx)}
                style={{ width:17, height:17, borderRadius:4, border:item.done?"none":"1.5px solid #ccc",
                  background:item.done?"#185FA5":"transparent", display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, marginTop:1, cursor:"pointer" }}>
                {item.done && <span style={{ color:"white", fontSize:11 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:item.done?"#999":"#1a1a1a", textDecoration:item.done?"line-through":"none" }}>{item.name}</div>
                <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>{item.who} · {item.brl===0?"бесплатно":`R$${item.brl}`}</div>
              </div>
              <button onClick={()=>deleteKidsItem(globalIdx)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ddd", fontSize:15, padding:"0 2px", lineHeight:1, marginTop:1 }}>×</button>
            </div>
          );
        })}
        {kidsZone.filter(item=>item.zone===kidsTab).length===0 && (
          <div style={{ fontSize:12, color:"#aaa", padding:"12px 0" }}>Пусто — добавьте первый элемент</div>
        )}

        {showNewKids ? (
          <div style={{ background:"#f7f7f5", borderRadius:10, padding:"12px", marginTop:10 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <div style={{ gridColumn:"span 2" }}>
                <input placeholder="Название..." value={newKidsItem.name} onChange={e=>setNewKidsItem(x=>({...x,name:e.target.value}))}
                  style={{ width:"100%", boxSizing:"border-box", border:"1px solid #ddd", borderRadius:6, padding:"6px 10px", fontFamily:"Georgia,serif", fontSize:12 }} />
              </div>
              <input placeholder="Кто делает..." value={newKidsItem.who} onChange={e=>setNewKidsItem(x=>({...x,who:e.target.value}))}
                style={{ border:"1px solid #ddd", borderRadius:6, padding:"6px 10px", fontFamily:"Georgia,serif", fontSize:12 }} />
              <input placeholder="R$" type="number" value={newKidsItem.brl} onChange={e=>setNewKidsItem(x=>({...x,brl:e.target.value}))}
                style={{ border:"1px solid #ddd", borderRadius:6, padding:"6px 10px", fontFamily:"Georgia,serif", fontSize:12 }} />
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>{ setNewKidsItem(x=>({...x,zone:kidsTab})); addKidsItem(); }}
                style={{ padding:"6px 14px", borderRadius:6, border:"none", background:"#1a1a1a", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Добавить</button>
              <button onClick={()=>setShowNewKids(false)}
                style={{ padding:"6px 12px", borderRadius:6, border:"1px solid #ccc", background:"#fff", color:"#555", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Отмена</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>{ setShowNewKids(true); setNewKidsItem({name:'',who:'купить',brl:0,zone:kidsTab}); }}
            style={{ marginTop:10, background:"none", border:"1px dashed #ddd", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#aaa", cursor:"pointer", fontFamily:"Georgia,serif" }}>
            + Добавить в {kidsTab==='outdoor'?'Уличную':kidsTab==='indoor'?'В помещении':'Огород'}
          </button>
        )}
      </Section>

    </div>
  );
}
