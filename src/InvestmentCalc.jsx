import { useState } from "react";

const RATE = 5.03;
const fmt$ = (brl) => `$${Math.round(brl / RATE).toLocaleString()}`;
const fmtR = (brl) => `R$${brl.toLocaleString()}`;

const ZONES = [
  {
    id: "territory", emoji: "🏠", name: "Территория",
    items: [
      { name: "Ворота на въезд", brl: 2000 },
      { name: "Забор / ограждение", brl: 3000 },
      { name: "Сигнализация (установка)", brl: 1500 },
      { name: "Камеры IP × 4 + DVR", brl: 1400 },
      { name: "Брусчатка / дорожки к входу", brl: 3000 },
      { name: "Фонари вдоль дорожки × 6", brl: 1200 },
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
];

export default function InvestmentCalc() {
  const [rent, setRent] = useState(11000);
  const [depositMonths, setDepositMonths] = useState(3);
  const [workingCapMonths, setWorkingCapMonths] = useState(6);
  const [reserve, setReserve] = useState(15000);
  const [enabledZones, setEnabledZones] = useState(
    Object.fromEntries(ZONES.map(z => [z.id, true]))
  );
  const [enabledItems, setEnabledItems] = useState(
    Object.fromEntries(
      ZONES.flatMap(z => z.items.map((item, i) => [`${z.id}_${i}`, true]))
    )
  );
  const [expanded, setExpanded] = useState({});

  const toggleZone = (id) => {
    const newVal = !enabledZones[id];
    setEnabledZones(prev => ({ ...prev, [id]: newVal }));
    const zone = ZONES.find(z => z.id === id);
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
      ZONES.flatMap(z => z.items.map((_, i) => [`${z.id}_${i}`, 1]))
    )
  );

  const [prices, setPrices] = useState(
    Object.fromEntries(
      ZONES.flatMap(z => z.items.map((item, i) => [`${z.id}_${i}`, item.brl]))
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

  const zoneTotal = (zone) =>
    zone.items.reduce((sum, item, i) => {
      const key = `${zone.id}_${i}`;
      return enabledItems[key] ? sum + (prices[key] ?? item.brl) * (quantities[key] || 1) : sum;
    }, 0);

  const equipTotal = ZONES.reduce((sum, z) => sum + (enabledZones[z.id] ? zoneTotal(z) : 0), 0);
  const depositTotal = rent * depositMonths;
  const opsMonthly = rent + 21900;
  const workingCap = opsMonthly * workingCapMonths;
  const grandTotal = equipTotal + depositTotal + workingCap + reserve;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh", padding: "1rem" }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Конструктор инвестиций</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>БЕРЁЗКА — Смета по зонам</div>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "16px 18px", marginBottom: 20, color: "white" }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>Итого инвестиций</div>
        <div style={{ fontSize: 32, fontWeight: 600 }}>{fmt$(grandTotal)}</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{fmtR(grandTotal)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
          {[
            { l: "Оборудование", v: fmt$(equipTotal) },
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

      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: "1px solid #ebebeb" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 12 }}>⚙️ Параметры аренды и капитала</div>
        {[
          { label: "Аренда/мес", val: rent, set: setRent, min: 5000, max: 20000, step: 500 },
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
          <input type="range" min={0} max={50000} step={1000} value={reserve}
            onChange={e => setReserve(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#1a1a1a" }} />
          <div style={{ fontSize: 13, fontWeight: 500, minWidth: 80, textAlign: "right" }}>R${reserve.toLocaleString()}</div>
        </div>
        <div style={{ marginTop: 10, padding: "8px 10px", background: "#f7f7f5", borderRadius: 8, fontSize: 11, color: "#888" }}>
          Оборотный кап: R${opsMonthly.toLocaleString()}/мес × {workingCapMonths} = {fmtR(workingCap)} ({fmt$(workingCap)})
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 10 }}>🏗️ Зоны — включай / выключай</div>
      {ZONES.map(zone => {
        const total = zoneTotal(zone);
        const isOn = enabledZones[zone.id];
        const isExp = expanded[zone.id];
        return (
          <div key={zone.id} style={{
            background: "#fff", borderRadius: 12, marginBottom: 8,
            border: `1px solid ${isOn ? "#e0e0e0" : "#f0f0f0"}`,
            opacity: isOn ? 1 : 0.55,
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 10, cursor: "pointer" }}
              onClick={() => setExpanded(p => ({ ...p, [zone.id]: !p[zone.id] }))}>
              <input type="checkbox" checked={isOn} onChange={() => toggleZone(zone.id)}
                onClick={e => e.stopPropagation()}
                style={{ width: 16, height: 16, accentColor: "#1a1a1a", cursor: "pointer" }} />
              <span style={{ fontSize: 16 }}>{zone.emoji}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{zone.name}</span>
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
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0",
                      borderBottom: i < zone.items.length - 1 ? "1px solid #f5f5f5" : "none",
                      opacity: on ? 1 : 0.35 }}>
                      <input type="checkbox" checked={on} onChange={() => toggleItem(zone.id, i)}
                        style={{ width: 14, height: 14, accentColor: "#1a1a1a", cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: "#444", lineHeight: 1.3 }}>{item.name}</span>
                      {/* qty stepper */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => setQty(zone.id, i, qty - 1)}
                          style={{ width: 20, height: 20, border: "1px solid #ddd", borderRadius: 4,
                            background: "#f7f7f5", cursor: "pointer", fontSize: 12, lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <input type="number" value={qty} min={0} max={99}
                          onChange={e => setQty(zone.id, i, e.target.value)}
                          style={{ width: 32, textAlign: "center", border: "1px solid #ddd",
                            borderRadius: 4, fontSize: 12, padding: "2px 0", background: "#fff" }} />
                        <button onClick={() => setQty(zone.id, i, qty + 1)}
                          style={{ width: 20, height: 20, border: "1px solid #ddd", borderRadius: 4,
                            background: "#f7f7f5", cursor: "pointer", fontSize: 12, lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      </div>
                      {/* editable price */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, minWidth: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                          <input type="number" value={price} min={0}
                            onChange={e => setPrice(zone.id, i, e.target.value)}
                            style={{ width: 60, textAlign: "right", border: "1px solid #ddd",
                              borderRadius: 4, fontSize: 12, padding: "2px 4px", background: "#fff",
                              color: price !== item.brl ? "#b45309" : "#333" }} />
                        </div>
                        {qty > 1 && (
                          <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
                            = {fmtR(lineTotal)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8,
                  fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
                  Итого зона: {fmtR(total)} / {fmt$(total)}
                </div>
              </div>
            )}
          </div>
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
