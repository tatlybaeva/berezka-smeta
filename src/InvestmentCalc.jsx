import { useState, useEffect, useRef, Fragment } from "react";
import { supabase } from "./supabase";

const RATE = 5.7;
const fmt$ = (brl) => `$${Math.round(brl / RATE).toLocaleString()}`;
const fmtR = (brl) => `R$${brl.toLocaleString()}`;

// Зона строительства — только для пустого участка
const CONSTRUCTION_ZONE = {
  id: "construction", emoji: "🏗️", name: "Строительство дома",
  items: [
    { name: "Проект / архитектор (упрощённый)", brl: 5000 },
    { name: "Фундамент (плита или свайный)", brl: 25000 },
    { name: "Каркас / стены (деревянный или блок)", brl: 40000 },
    { name: "Кровля (металлочерепица + работа)", brl: 18000 },
    { name: "Окна и двери (входные + внутренние)", brl: 12000 },
    { name: "Электрика (проводка + щиток + подключение)", brl: 8000 },
    { name: "Сантехника (трубы + разводка)", brl: 6000 },
    { name: "Внутренняя отделка (штукатурка, пол)", brl: 15000 },
    { name: "Фасад + внешняя отделка", brl: 8000 },
    { name: "Веранда / терраса (каркас + настил)", brl: 10000 },
    { name: "Согласования / Prefeitura / AVCB", brl: 4000 },
    { name: "Непредвиденные расходы строительства", brl: 10000 },
  ]
};

const ZONES = [
  {
    id: "territory", emoji: "🏠", name: "Территория",
    items: [
      { name: "Ворота на въезд", brl: 2000 },
      { name: "Забор / ограждение", brl: 3000 },
      { name: "Сигнализация (установка)", brl: 1500 },
      { name: "Камеры IP (8 шт.) × R$280/шт.", brl: 2240 },
      { name: "NVR-регистратор + HDD 2TB", brl: 1200 },
      { name: "Монтаж системы видеонаблюдения", brl: 800 },
      { name: "Брусчатка/дорожки — 20 м² × R$100/м²", brl: 2000 },
      { name: "Фонари садовые — 8 шт. × R$200/шт.", brl: 1600 },
      { name: "Озеленение (гортензии, горшки)", brl: 1500 },
      { name: "Вывеска БЕРЁЗКА (деревянная)", brl: 1500 },
    ]
  },
  {
    id: "entry", emoji: "🚪", name: "Вход / первое впечатление",
    items: [
      { name: "Деревянная арка или перголa у входа", brl: 1200 },
      { name: "Меловая доска с меню у входа", brl: 300 },
      { name: "Скамейка у входа (б/у)", brl: 400 },
      { name: "Таблички (часы работы, Wi-Fi и т.д.)", brl: 200 },
    ]
  },
  {
    id: "terrace", emoji: "🌿", name: "Уличная веранда",
    items: [
      { name: "Деревянный дек (материалы)", brl: 4000 },
      { name: "6 столиков + стулья б/у", brl: 3600 },
      { name: "Гирлянды Edison × 3 нити", brl: 900 },
      { name: "Гамак × 2", brl: 600 },
      { name: "Горшки с растениями × 6", brl: 900 },
      { name: "Навес / тент (от дождя)", brl: 2000 },
    ]
  },
  {
    id: "playground", emoji: "👶", name: "Игровая зона (улица)",
    items: [
      { name: "Типи (бамбук + ткань + фонарики) — фото-зона", brl: 400 },
      { name: "Меловая стена + ростомер с подсолнухом", brl: 550 },
      { name: "Грязевая кухня (поддоны)", brl: 500 },
      { name: "Пни-ступеньки разной высоты", brl: 600 },
      { name: "Слэклайн между деревьями", brl: 150 },
      { name: "Качели на дерево (верёвка + доска)", brl: 170 },
      { name: "Водный жёлоб из бамбука", brl: 0 },
      { name: "Песок + контейнер", brl: 500 },
      { name: "Детские инструменты (лопата, грабли, лейка)", brl: 250 },
      { name: "Ограждение игровой зоны — 20 пог. м × R$120/пог.м", brl: 2400 },
      { name: "Ограждение огорода — 15 пог. м × R$120/пог.м", brl: 1800 },
    ]
  },
  {
    id: "garden", emoji: "🐔", name: "Детский огород + куры",
    items: [
      { name: "Курятник + 4 куры + ограждение", brl: 1800 },
      { name: "Вертикальный огород (поддоны)", brl: 300 },
      { name: "Грядки + семена + земля", brl: 600 },
      { name: "Компостер из поддонов", brl: 200 },
      { name: "Таблички с названиями растений", brl: 150 },
    ]
  },
  {
    id: "indoor_play", emoji: "🎨", name: "Игровая под крышей",
    items: [
      { name: "Покраска стен (белый + меловая стена)", brl: 600 },
      { name: "Деревянные полки монтессори", brl: 800 },
      { name: "Низкий стол + стулья детские", brl: 600 },
      { name: "Плетёный круглый ковёр", brl: 400 },
      { name: "Мини дачная кухня-игрушка", brl: 500 },
      { name: "Подушки + книги + пуфики", brl: 400 },
      { name: "Деревянные игрушки монтессори", brl: 800 },
    ]
  },
  {
    id: "hall", emoji: "🍽️", name: "Зал",
    items: [
      { name: "Покраска стен (белый)", brl: 800 },
      { name: "Мебель б/у — 6 столов + разные стулья", brl: 4320 },
      { name: "Персидские ковры б/у × 4", brl: 600 },
      { name: "Льняные скатерти × 12", brl: 480 },
      { name: "Светильники чёрные × 6", brl: 720 },
      { name: "Открытые полки с посудой", brl: 300 },
      { name: "Печь-муляж (гипсокартон)", brl: 2500 },
      { name: "Декор (горшки, вазы, картины, тюль)", brl: 800 },
      { name: "Кресло-качалка б/у", brl: 400 },
    ]
  },
  {
    id: "bar", emoji: "☕", name: "Стойка бариста",
    items: [
      { name: "Кофемашина Этап 1 б/у (De'Longhi/Saeco)", brl: 1200 },
      { name: "Кофемашина Этап 2 б/у (Gaggia/Rancilio)", brl: 4500 },
      { name: "Фильтр-кофейник + капучинатор", brl: 750 },
      { name: "Холодильник витринный б/у", brl: 1500 },
      { name: "Термосы для подачи × 2", brl: 300 },
      { name: "Стойка/прилавок б/у", brl: 1000 },
    ]
  },
  {
    id: "kitchen", emoji: "🍳", name: "Кухня",
    items: [
      { name: "Fogão industrial 4 bocas + forno б/у", brl: 2200 },
      { name: "Geladeira comercial б/у", brl: 2000 },
      { name: "Freezer б/у", brl: 1000 },
      { name: "Mesa inox + Pia inox dupla б/у", brl: 1700 },
      { name: "Exaustor (вытяжка)", brl: 1200 },
      { name: "Forno de convecção б/у", brl: 1500 },
      { name: "Batedeira + panelas inox набор", brl: 1200 },
      { name: "Мясорубка профессиональная б/у", brl: 650 },
      { name: "Fritadeira (фритюрница) б/у", brl: 500 },
      { name: "Блинные сковороды × 3", brl: 150 },
      { name: "Кастрюли большие × 3 + средние × 3", brl: 500 },
      { name: "Посудомоечная машина б/у", brl: 2000 },
      { name: "Ремонт кухни (плитка, стены, под VISA)", brl: 2000 },
    ]
  },
  {
    id: "store", emoji: "🛍️", name: "Магазин эко-игрушек",
    items: [
      { name: "Стеллаж деревянный у выхода", brl: 800 },
      { name: "Деревянные игрушки и фигурки (стартовый запас)", brl: 1500 },
      { name: "Семена в крафт-пакетах с лого БЕРЁЗКА", brl: 300 },
      { name: "Тканевые куклы и монтессори-наборы", brl: 800 },
    ]
  },
  {
    id: "tech_indoor", emoji: "🔧", name: "Тех. помещение (внутри)",
    items: [
      { name: "Стеллажи для продуктов и инвентаря", brl: 900 },
      { name: "Уборочный инвентарь + расходники", brl: 400 },
      { name: "Сейф / ящик для документов", brl: 300 },
      { name: "Шкафчики для персонала × 3", brl: 600 },
    ]
  },
  {
    id: "tech_outdoor", emoji: "🏚️", name: "Тех. помещение (улица)",
    items: [
      { name: "Хозблок / сарай (материалы или б/у)", brl: 2000 },
      { name: "Стеллажи уличные влагостойкие", brl: 600 },
      { name: "Замок + защита", brl: 300 },
    ]
  },
  {
    id: "toilets", emoji: "🚽", name: "Туалеты",
    items: [
      { name: "Ремонт (плитка, покраска)", brl: 2000 },
      { name: "Сантехника б/у (раковина, унитаз)", brl: 1500 },
      { name: "Зеркало + полка + свет", brl: 400 },
      { name: "Диспенсер мыло + бумага × 2", brl: 200 },
      { name: "Декор (растение, рисунок)", brl: 200 },
    ]
  },
  {
    id: "staff", emoji: "👔", name: "Комната персонала",
    items: [
      { name: "Покраска + небольшой ремонт", brl: 500 },
      { name: "Шкафчики × 4", brl: 600 },
      { name: "Стол + стулья для перерыва", brl: 400 },
      { name: "Мини-холодильник б/у", brl: 400 },
    ]
  },
  {
    id: "marketing", emoji: "📣", name: "Маркетинг запуска",
    items: [
      { name: "Трафарет с лого + баллончики (граффити-декор)", brl: 200 },
      { name: "Подарки за сторис с отметкой (первый месяц)", brl: 350 },
      { name: "Брендированные футболки персонала × 8", brl: 1000 },
      { name: "Pre-launch контент (фотосессия, реквизит)", brl: 600 },
      { name: "Флаеры / визитки (крафт-бумага)", brl: 250 },
      { name: "Google Maps + iFood профиль (фотограф)", brl: 400 },
      { name: "Реклама Instagram (первые 2 нед)", brl: 500 },
      { name: "Подарочные карты на открытие × 20", brl: 400 },
    ]
  },
];

const COSTS_PHASE1_FIXED = 7480 + 3060 + 700 + 1500 + 430 + 600 + 200 + 120 + 200 + 800; // without rent placeholder
const COSTS_PHASE3_FIXED = 9520 + 7480 + 3400 + 3060 + 700 + 2500 + 600 + 200 + 120 + 250; // without rent placeholder

const AVG_CHECK = 52;
const FOOD_COST_PCT = 0.30;
const TAX_PCT = 0.08;

function breakEven(rent, phase) {
  const costs_fixed = (phase === 1 ? COSTS_PHASE1_FIXED : COSTS_PHASE3_FIXED) + rent;
  const netPerCheck = AVG_CHECK * (1 - (phase >= 2 ? FOOD_COST_PCT : 0.15) - TAX_PCT);
  const checksPerMonth = Math.ceil(costs_fixed / netPerCheck);
  const checksPerDay = Math.ceil(checksPerMonth / 30);
  return { fixed: costs_fixed, netPerCheck: Math.round(netPerCheck), checksPerMonth, checksPerDay };
}

export default function InvestmentCalc() {
  const [rentType, setRentType] = useState("house"); // "house" | "land"
  const [rent, setRent] = useState(11000);
  const [depositMonths, setDepositMonths] = useState(3);
  const [workingCapMonths, setWorkingCapMonths] = useState(6);
  const [reserve, setReserve] = useState(15000);
  const ALL_ZONES = [...ZONES, CONSTRUCTION_ZONE];

  const [enabledZones, setEnabledZones] = useState(
    Object.fromEntries(ALL_ZONES.map(z => [z.id, true]))
  );
  const [enabledItems, setEnabledItems] = useState(
    Object.fromEntries(
      ALL_ZONES.flatMap(z => z.items.map((item, i) => [`${z.id}_${i}`, true]))
    )
  );
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState({});
  const [beOpen, setBeOpen] = useState(false);
  const [bePhase, setBePhase] = useState(1);
  const [currentChecksDay, setCurrentChecksDay] = useState(10);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | saving | saved | error
  const [itemNames, setItemNames] = useState({});   // { "zone_idx": "custom name" }
  const [extraItems, setExtraItems] = useState({}); // { zoneId: [{name, brl}] }
  const [editingName, setEditingName] = useState(null); // { zoneId, idx, extra? }
  const [nameDraft, setNameDraft] = useState("");
  const [newRowDraft, setNewRowDraft] = useState({}); // { zoneId: {name, brl} }
  const saveTimer = useRef(null);
  const isRemoteUpdate = useRef(false);

  const buildState = (rt, r, d, wc, res, ez, ei, q, p, bp, cd, names, extras) => ({ rentType: rt, rent: r, depositMonths: d, workingCapMonths: wc, reserve: res, enabledZones: ez, enabledItems: ei, quantities: q, prices: p, bePhase: bp, currentChecksDay: cd, itemNames: names, extraItems: extras });

  const applyState = (s) => {
    if (!s) return;
    isRemoteUpdate.current = true;
    if (s.rentType) setRentType(s.rentType);
    if (s.rent !== undefined) setRent(s.rent);
    if (s.depositMonths !== undefined) setDepositMonths(s.depositMonths);
    if (s.workingCapMonths !== undefined) setWorkingCapMonths(s.workingCapMonths);
    if (s.reserve !== undefined) setReserve(s.reserve);
    if (s.enabledZones) setEnabledZones(s.enabledZones);
    if (s.enabledItems) setEnabledItems(s.enabledItems);
    if (s.quantities) setQuantities(s.quantities);
    if (s.prices) setPrices(s.prices);
    if (s.bePhase !== undefined) setBePhase(s.bePhase);
    if (s.currentChecksDay !== undefined) setCurrentChecksDay(s.currentChecksDay);
    if (s.itemNames) setItemNames(s.itemNames);
    if (s.extraItems) setExtraItems(s.extraItems);
    setTimeout(() => { isRemoteUpdate.current = false; }, 0);
  };

  useEffect(() => {
    supabase.from("smeta_state").select("state").eq("id", "main").maybeSingle()
      .then(({ data }) => { if (data?.state) applyState(data.state); });

    const channel = supabase.channel("smeta_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "smeta_state" }, (payload) => {
        if (payload.new?.state) applyState(payload.new.state);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const scheduleSave = (state) => {
    if (isRemoteUpdate.current) return;
    setSyncStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("smeta_state").upsert({ id: "main", state, updated_at: new Date().toISOString() });
      setSyncStatus(error ? "error" : "saved");
      if (!error) setTimeout(() => setSyncStatus("idle"), 2000);
    }, 800);
  };

  const toggleZone = (id) => {
    const newVal = !enabledZones[id];
    setEnabledZones(prev => ({ ...prev, [id]: newVal }));
    const zone = ALL_ZONES.find(z => z.id === id);
    const updates = {};
    zone.items.forEach((_, i) => { updates[`${id}_${i}`] = newVal; });
    setEnabledItems(prev => ({ ...prev, ...updates }));
  };

  const toggleItem = (zoneId, itemIdx) => {
    const key = `${zoneId}_${itemIdx}`;
    setEnabledItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [quantities, setQuantities] = useState(
    Object.fromEntries(
      ALL_ZONES.flatMap(z => z.items.map((_, i) => [`${z.id}_${i}`, 1]))
    )
  );

  const [prices, setPrices] = useState(
    Object.fromEntries(
      ALL_ZONES.flatMap(z => z.items.map((item, i) => [`${z.id}_${i}`, item.brl]))
    )
  );

  const setQty = (zoneId, itemIdx, val) => {
    const key = `${zoneId}_${itemIdx}`;
    const n = Math.max(0, Math.min(99, Number(val) || 0));
    setQuantities(prev => ({ ...prev, [key]: n }));
  };

  const setPrice = (zoneId, itemIdx, val) => {
    const key = `${zoneId}_${itemIdx}`;
    const n = Math.max(0, Number(val) || 0);
    setPrices(prev => ({ ...prev, [key]: n }));
  };

  useEffect(() => {
    scheduleSave(buildState(rentType, rent, depositMonths, workingCapMonths, reserve, enabledZones, enabledItems, quantities, prices, bePhase, currentChecksDay, itemNames, extraItems));
  }, [rentType, rent, depositMonths, workingCapMonths, reserve, enabledZones, enabledItems, quantities, prices, bePhase, currentChecksDay, itemNames, extraItems]);

  const zoneTotal = (zone) => {
    const base = zone.items.reduce((sum, item, i) => {
      const key = `${zone.id}_${i}`;
      return enabledItems[key] ? sum + (prices[key] ?? item.brl) * (quantities[key] || 1) : sum;
    }, 0);
    const extras = (extraItems[zone.id] || []).reduce((sum, ex, j) => {
      const key = `${zone.id}_x${j}`;
      return enabledItems[key] !== false ? sum + (prices[key] ?? ex.brl) * (quantities[key] || 1) : sum;
    }, 0);
    return base + extras;
  };

  const constructionTotal = rentType === "land" ? (enabledZones["construction"] ? zoneTotal(CONSTRUCTION_ZONE) : 0) : 0;
  const equipTotal = ZONES.reduce((sum, z) => sum + (enabledZones[z.id] ? zoneTotal(z) : 0), 0) + constructionTotal;
  const depositTotal = rent * depositMonths;
  const opsMonthly = rent + 21900;
  const workingCap = opsMonthly * workingCapMonths;
  const grandTotal = equipTotal + depositTotal + workingCap + reserve;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh", padding: "1rem 1rem 2rem" }}>

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Конструктор инвестиций</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>БЕРЁЗКА — Инвестиционный бюджет по зонам</div>
        </div>
        <div style={{ fontSize: 11, marginTop: 6, color: syncStatus === "saved" ? "#16a34a" : syncStatus === "saving" ? "#aaa" : syncStatus === "error" ? "#dc2626" : "transparent" }}>
          {syncStatus === "saving" && "сохранение…"}
          {syncStatus === "saved" && "✓ сохранено"}
          {syncStatus === "error" && "⚠ ошибка сохранения"}
        </div>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "16px 18px", marginBottom: 20, color: "white" }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>Итого инвестиций</div>
        <div style={{ fontSize: 32, fontWeight: 600 }}>{fmt$(grandTotal)}</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{fmtR(grandTotal)}</div>
        <div style={{ display: "grid", gridTemplateColumns: rentType === "land" ? "1fr 1fr 1fr 1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
          {[
            ...(rentType === "land" ? [{ l: "Стройка", v: fmt$(constructionTotal) }] : []),
            { l: "Оснащение", v: fmt$(equipTotal - constructionTotal) },
            { l: "Залог аренды", v: fmt$(depositTotal) },
            { l: "Оборотный кап.", v: fmt$(workingCap) },
            { l: "Резерв", v: fmt$(reserve) },
          ].map(({ l, v }) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: "#888", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BREAK-EVEN SECTION */}
      {(() => {
        const be = breakEven(rent, bePhase);
        const progress = Math.min(1, currentChecksDay / be.checksPerDay);
        return (
          <div style={{ background: "#fff", borderRadius: 12, marginBottom: 12, border: "1px solid #ebebeb", overflow: "hidden" }}>
            <div
              onClick={() => setBeOpen(p => !p)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer" }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>📉 Точка безубыточности</div>
              <span style={{ fontSize: 12, color: "#bbb" }}>{beOpen ? "▲" : "▼"}</span>
            </div>
            {beOpen && (
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 16px" }}>
                {/* Phase selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[
                    { phase: 1, label: "Этап 1 (кофе)" },
                    { phase: 3, label: "Этап 3 (полный)" },
                  ].map(opt => (
                    <button
                      key={opt.phase}
                      onClick={() => setBePhase(opt.phase)}
                      style={{
                        flex: 1, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                        border: "none",
                        background: bePhase === opt.phase ? "#1a1a1a" : "#f4f3f0",
                        color: bePhase === opt.phase ? "#fff" : "#555",
                        fontSize: 12, fontFamily: "'Georgia', serif", fontWeight: bePhase === opt.phase ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  <div style={{ background: "#f7f7f5", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>Постоянные расходы/мес</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>R${be.fixed.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>~${Math.round(be.fixed / RATE).toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#f7f7f5", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>Чистая прибыль с чека</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>R${be.netPerCheck}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>после food cost + налог</div>
                  </div>
                  <div style={{ background: "#f7f7f5", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>Чеков/месяц для БУ</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{be.checksPerMonth.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#EAF3DE", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#3B6D11", marginBottom: 2 }}>Чеков/день для БУ</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#27500A" }}>{be.checksPerDay} чек/день</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#666" }}>Фактических чеков/день сейчас:</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => setCurrentChecksDay(v => Math.max(0, v - 1))}
                        style={{ width: 22, height: 22, border: "1px solid #ddd", borderRadius: 4, background: "#f7f7f5", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <input type="number" value={currentChecksDay} min={0} max={200}
                        onChange={e => setCurrentChecksDay(Math.max(0, Number(e.target.value) || 0))}
                        style={{ width: 48, textAlign: "center", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, padding: "2px 4px", fontFamily: "'Georgia',serif" }} />
                      <button onClick={() => setCurrentChecksDay(v => v + 1)}
                        style={{ width: 22, height: 22, border: "1px solid #ddd", borderRadius: 4, background: "#f7f7f5", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      <span style={{ fontSize: 11, color: "#aaa" }}>из {be.checksPerDay} нужных</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11, color: "#666" }}></div>
                  <div style={{ height: 10, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${progress * 100}%`,
                      background: progress >= 1 ? "#3B6D11" : progress >= 0.6 ? "#BA7517" : "#A32D2D",
                      borderRadius: 99,
                      transition: "width 0.3s",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                    {progress >= 1 ? "✅ Уже выше точки безубыточности!" : `${Math.round(progress * 100)}% от нужного трафика`}
                  </div>
                </div>

                <div style={{ marginTop: 10, fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>
                  💡 Средний чек R${AVG_CHECK} · Food cost {bePhase >= 2 ? "30" : "15"}% · Налог 8%
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* RENT TYPE SWITCHER */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: "1px solid #ebebeb" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 10 }}>🏡 Тип аренды</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "house", label: "🏠 Участок с домом", desc: "Готовое здание, только ремонт и оснащение" },
            { id: "land",  label: "🌿 Пустой участок",  desc: "Нужно построить дом — добавляется раздел строительства" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setRentType(opt.id)} style={{
              flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              background: rentType === opt.id ? "#1a1a1a" : "#f4f3f0",
              color: rentType === opt.id ? "#fff" : "#555",
              textAlign: "left", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
              <div style={{ fontSize: 10, marginTop: 3, color: rentType === opt.id ? "#aaa" : "#999", lineHeight: 1.4 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
        {rentType === "land" && (
          <div style={{ marginTop: 10, padding: "8px 10px", background: "#fef9ed", border: "1px solid #f3d97a", borderRadius: 8, fontSize: 11, color: "#8a6a00" }}>
            ⚠️ При аренде пустого участка добавляется раздел <b>Строительство дома</b> (~R${CONSTRUCTION_ZONE.items.reduce((s,i)=>s+i.brl,0).toLocaleString()} базово). Включи/выключи нужные позиции ниже.
          </div>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: "1px solid #ebebeb" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 12 }}>⚙️ Параметры аренды и капитала</div>
        {[
          { label: "Аренда/мес", val: rent, set: setRent, min: 5000, max: 30000, step: 500 },
          { label: "Залог (мес)", val: depositMonths, set: setDepositMonths, min: 1, max: 6, step: 1, suffix: " мес" },
          { label: "Оборотный кап. (мес)", val: workingCapMonths, set: setWorkingCapMonths, min: 2, max: 12, step: 1, suffix: " мес" },
        ].map(({ label, val, set, min, max, step, suffix }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#666", minWidth: 150 }}>{label}</div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#1a1a1a" }} />
            <div style={{ fontSize: 13, fontWeight: 500, minWidth: 80, textAlign: "right" }}>
              {label === "Аренда/мес" ? `R$${val.toLocaleString()}` : `${val}${suffix || ""}`}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#666", minWidth: 150 }}>Резерв (R$)</div>
          <input type="range" min={0} max={30000} step={1000} value={reserve}
            onChange={e => setReserve(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#1a1a1a" }} />
          <div style={{ fontSize: 13, fontWeight: 500, minWidth: 80, textAlign: "right" }}>R${reserve.toLocaleString()}</div>
        </div>
        <div style={{ marginTop: 10, padding: "8px 10px", background: "#f7f7f5", borderRadius: 8, fontSize: 11, color: "#888" }}>
          Оборотный кап: R${opsMonthly.toLocaleString()}/мес × {workingCapMonths} = {fmtR(workingCap)} ({fmt$(workingCap)})
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 10 }}>🏗️ Зоны — включай / выключай</div>
      {(rentType === "land" ? [CONSTRUCTION_ZONE, ...ZONES] : ZONES).map((zone, zIdx) => {
        const total = zoneTotal(zone);
        const isOn = enabledZones[zone.id];
        const isExp = expanded[zone.id];
        const isEdit = editing[zone.id];
        return (
          <Fragment key={zone.id}>
          {zone.id === "territory" && rentType === "land" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 8px" }}>
              <div style={{ flex: 1, height: 1, background: "#e8e0d4" }} />
              <span style={{ fontSize: 10, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" }}>Оснащение и ремонт</span>
              <div style={{ flex: 1, height: 1, background: "#e8e0d4" }} />
            </div>
          )}
          <div style={{
            background: "#fff", borderRadius: 12, marginBottom: 8,
            border: `1px solid ${zone.id === "construction" ? (isOn ? "#d4c5a9" : "#ede8df") : (isOn ? "#e0e0e0" : "#f0f0f0")}`,
            opacity: isOn ? 1 : 0.55,
            ...(zone.id === "construction" ? { background: "#fffdf7" } : {}),
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 10, cursor: "pointer" }}
              onClick={() => setExpanded(p => ({ ...p, [zone.id]: !p[zone.id] }))}>
              <input type="checkbox" checked={isOn} onChange={() => toggleZone(zone.id)}
                onClick={e => e.stopPropagation()}
                style={{ width: 16, height: 16, accentColor: "#1a1a1a", cursor: "pointer" }} />
              <span style={{ fontSize: 16 }}>{zone.emoji}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{zone.name}</span>
              {zone.id === "construction" && (
                <span style={{ fontSize: 9, background: "#f3d97a", color: "#7a5a00", borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>стройка</span>
              )}
              <button
                onClick={e => { e.stopPropagation(); setExpanded(p => ({ ...p, [zone.id]: true })); setEditing(p => ({ ...p, [zone.id]: !p[zone.id] })); }}
                style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 5, cursor: "pointer",
                  border: isEdit ? "1px solid #1a1a1a" : "1px solid #ddd",
                  background: isEdit ? "#1a1a1a" : "#f7f7f5",
                  color: isEdit ? "#fff" : "#666",
                  flexShrink: 0,
                }}>
                {isEdit ? "✓ Готово" : "Изменить"}
              </button>
              <span style={{ fontSize: 13, fontWeight: 500, color: isOn ? "#1a1a1a" : "#aaa" }}>{fmt$(total)}</span>
              <span style={{ fontSize: 11, color: "#bbb", marginLeft: 4 }}>{isExp ? "▲" : "▼"}</span>
            </div>
            {isExp && (
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px 14px 12px" }}>
                {zone.items.map((item, i) => {
                  const key = `${zone.id}_${i}`;
                  const on = enabledItems[key];
                  const qty = quantities[key] || 1;
                  const price = prices[key] ?? item.brl;
                  const lineTotal = price * qty;
                  const displayName = itemNames[key] ?? item.name;
                  const isEditingThisName = editingName?.zoneId === zone.id && editingName?.idx === i && !editingName?.extra;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0",
                      borderBottom: "1px solid #f5f5f5", opacity: on ? 1 : 0.35 }}>
                      <input type="checkbox" checked={on} onChange={() => toggleItem(zone.id, i)}
                        style={{ width: 14, height: 14, accentColor: "#1a1a1a", cursor: "pointer", flexShrink: 0 }} />
                      {isEdit && isEditingThisName ? (
                        <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                          onBlur={() => { setItemNames(p => ({ ...p, [key]: nameDraft })); setEditingName(null); }}
                          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setItemNames(p => ({ ...p, [key]: nameDraft })); setEditingName(null); } }}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "2px 6px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                      ) : (
                        <span onClick={() => isEdit && (setEditingName({ zoneId: zone.id, idx: i }), setNameDraft(displayName))}
                          style={{ flex: 1, fontSize: 12, color: "#444", lineHeight: 1.3, cursor: isEdit ? "text" : "default" }}>{displayName}</span>
                      )}

                      {isEdit ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                            <button onClick={() => setQty(zone.id, i, qty - 1)}
                              style={{ width: 20, height: 20, border: "1px solid #ddd", borderRadius: 4, background: "#f7f7f5", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ width: 24, textAlign: "center", fontSize: 12 }}>{qty}</span>
                            <button onClick={() => setQty(zone.id, i, qty + 1)}
                              style={{ width: 20, height: 20, border: "1px solid #ddd", borderRadius: 4, background: "#f7f7f5", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                            <input type="number" value={price} min={0}
                              onChange={e => setPrice(zone.id, i, e.target.value)}
                              style={{ width: 60, textAlign: "right", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, padding: "2px 4px",
                                color: price !== item.brl ? "#b45309" : "#333", MozAppearance: "textfield" }} />
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                          {price === 0
                            ? <span style={{ fontSize: 11, color: "#999" }}>бесплатно</span>
                            : <>
                                <div style={{ fontSize: 12, fontWeight: 500, color: price !== item.brl ? "#b45309" : "#333" }}>{fmtR(lineTotal)}</div>
                                {qty > 1 && <div style={{ fontSize: 10, color: "#aaa" }}>{fmtR(price)}/шт × {qty}</div>}
                              </>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Extra items added by user */}
                {(extraItems[zone.id] || []).map((ex, j) => {
                  const xKey = `${zone.id}_x${j}`;
                  const xOn = enabledItems[xKey] !== false;
                  const xQty = quantities[xKey] || 1;
                  const xPrice = prices[xKey] ?? ex.brl;
                  const isEditingExtra = editingName?.zoneId === zone.id && editingName?.idx === j && editingName?.extra;
                  return (
                    <div key={`x${j}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "1px solid #f5f5f5", opacity: xOn ? 1 : 0.35 }}>
                      <input type="checkbox" checked={xOn} onChange={() => setEnabledItems(p => ({ ...p, [xKey]: !xOn }))}
                        style={{ width: 14, height: 14, accentColor: "#1a1a1a", cursor: "pointer", flexShrink: 0 }} />
                      {isEdit && isEditingExtra ? (
                        <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                          onBlur={() => { setExtraItems(p => ({ ...p, [zone.id]: (p[zone.id]||[]).map((x,jj)=>jj===j?{...x,name:nameDraft}:x) })); setEditingName(null); }}
                          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setExtraItems(p => ({ ...p, [zone.id]: (p[zone.id]||[]).map((x,jj)=>jj===j?{...x,name:nameDraft}:x) })); setEditingName(null); } }}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "2px 6px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                      ) : (
                        <span onClick={() => isEdit && (setEditingName({ zoneId: zone.id, idx: j, extra: true }), setNameDraft(ex.name))}
                          style={{ flex: 1, fontSize: 12, color: "#444", cursor: isEdit ? "text" : "default" }}>{ex.name}</span>
                      )}
                      {isEdit ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                            <button onClick={() => setQuantities(p => ({ ...p, [xKey]: Math.max(0, (p[xKey]||1)-1) }))}
                              style={{ width: 20, height: 20, border: "1px solid #ddd", borderRadius: 4, background: "#f7f7f5", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ width: 24, textAlign: "center", fontSize: 12 }}>{xQty}</span>
                            <button onClick={() => setQuantities(p => ({ ...p, [xKey]: (p[xKey]||1)+1 }))}
                              style={{ width: 20, height: 20, border: "1px solid #ddd", borderRadius: 4, background: "#f7f7f5", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                            <input type="number" value={xPrice} min={0}
                              onChange={e => setPrices(p => ({ ...p, [xKey]: Math.max(0, Number(e.target.value)||0) }))}
                              style={{ width: 60, textAlign: "right", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, padding: "2px 4px", MozAppearance: "textfield" }} />
                          </div>
                          <button onClick={() => setExtraItems(p => ({ ...p, [zone.id]: (p[zone.id]||[]).filter((_,jj)=>jj!==j) }))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 15, padding: "0 2px", lineHeight: 1 }}>×</button>
                        </>
                      ) : (
                        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                          {xPrice === 0 ? <span style={{ fontSize: 11, color: "#999" }}>бесплатно</span>
                            : <div style={{ fontSize: 12, fontWeight: 500 }}>{fmtR(xPrice * xQty)}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add row */}
                {isEdit && (
                  newRowDraft[zone.id] !== undefined ? (
                    <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                      <input autoFocus placeholder="Название строки..." value={newRowDraft[zone.id]?.name || ""}
                        onChange={e => setNewRowDraft(p => ({ ...p, [zone.id]: { ...p[zone.id], name: e.target.value } }))}
                        onKeyDown={e => { if (e.key === "Escape") setNewRowDraft(p => { const n={...p}; delete n[zone.id]; return n; }); }}
                        style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "4px 8px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                      <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                      <input type="number" placeholder="0" value={newRowDraft[zone.id]?.brl || ""}
                        onChange={e => setNewRowDraft(p => ({ ...p, [zone.id]: { ...p[zone.id], brl: Number(e.target.value)||0 } }))}
                        style={{ width: 70, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px", fontFamily: "Georgia,serif", fontSize: 12, MozAppearance: "textfield" }} />
                      <button onClick={() => {
                        const row = newRowDraft[zone.id];
                        if (!row?.name?.trim()) return;
                        setExtraItems(p => ({ ...p, [zone.id]: [...(p[zone.id]||[]), { name: row.name.trim(), brl: row.brl||0 }] }));
                        setNewRowDraft(p => { const n={...p}; delete n[zone.id]; return n; });
                      }} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 12, cursor: "pointer" }}>+</button>
                      <button onClick={() => setNewRowDraft(p => { const n={...p}; delete n[zone.id]; return n; })}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14 }}>✗</button>
                    </div>
                  ) : (
                    <button onClick={() => setNewRowDraft(p => ({ ...p, [zone.id]: { name: "", brl: 0 } }))}
                      style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, border: "1.5px dashed #ddd", background: "transparent", fontSize: 11, color: "#999", cursor: "pointer" }}>
                      + добавить строку
                    </button>
                  )
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
                    Итого: {fmtR(total)} / {fmt$(total)}
                  </div>
                </div>
                {zone.id === "territory" && (
                  <div style={{ background: "#FFFBF0", border: "1px solid #F0E4B0", borderRadius: 8, padding: "12px 14px", marginTop: 8, fontSize: 11, color: "#6B5B1E", lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>📋 Политика видеонаблюдения (LGPD)</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      <li><b>Таблички</b> «Ambiente monitorado por câmeras» — обязательны на входе и в зонах съёмки</li>
                      <li><b>Хранение записей</b> — 30–90 дней, затем безопасное удаление</li>
                      <li><b>Доступ</b> — только владелец/ответственный. Передача третьим лицам — только по официальному запросу (полиция, суд)</li>
                      <li><b>Без аудио</b> — только видео (аудио повышает юридический риск)</li>
                      <li><b>Туалеты/раздевалки</b> — камеры запрещены</li>
                      <li><b>Детская зона</b> — общий обзор допустим; информировать родителей (табличка + правила зоны). Публикация кадров с детьми — только с согласия</li>
                      <li><b>Штраф ANPD</b> до 2% оборота — риск реальный, но закрывается табличками и политикой</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          </Fragment>
        );
      })}

      <div style={{ marginTop: 8, padding: "12px 14px", background: "#1a1a1a", borderRadius: 12,
        color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#aaa" }}>Только оборудование по зонам</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{fmt$(equipTotal)} / {fmtR(equipTotal)}</div>
      </div>
    </div>
  );
}
