import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const RATE = 5.03;

const initialSections = [
  {
    id: "drinks",
    title: "☕ Напитки — весь день",
    color: "#FAEEDA",
    text: "#854F0B",
    items: [
      { name: "Фильтр-кофе", cost: 3, price: 14, note: "" },
      { name: "Капучино", cost: 5, price: 18, note: "" },
      { name: "Матча латте", cost: 7, price: 22, note: "" },
      { name: "Чай Малина+мята (концентрат+заварка)", cost: 3, price: 14, note: "заготовка цеха" },
      { name: "Чай Имбирный с пряностями", cost: 3, price: 14, note: "заготовка цеха" },
      { name: "Чай Ромашка свежий", cost: 2, price: 12, note: "" },
      { name: "Чай Мятный свежий", cost: 2, price: 12, note: "" },
      { name: "Água com gás", cost: 2, price: 8, note: "из холодильника" },
      { name: "Água sem gás", cost: 1, price: 6, note: "из холодильника" },
      { name: "Suco / Refrigerante", cost: 4, price: 9, note: "из холодильника" },
    ]
  },
  {
    id: "breakfast",
    title: "☀️ Только утром 8:00–11:00",
    color: "#EAF3DE",
    text: "#3B6D11",
    items: [
      { name: "Каша дружба (свежая)", cost: 6, price: 20, note: "варится утром" },
      { name: "Каша рисовая молочная (свежая)", cost: 5, price: 18, note: "варится утром" },
      { name: "Каша овсяная (свежая)", cost: 4, price: 16, note: "варится утром" },
    ]
  },
  {
    id: "allday_main",
    title: "🍽️ Весь день — горячее из заготовок",
    color: "#E6F1FB",
    text: "#0C447C",
    items: [
      { name: "Сырники × 3 + ягодный соус + сметана", cost: 10, price: 35, note: "жарим на месте" },
      { name: "Блины × 3 (жарим на месте)", cost: 8, price: 28, note: "тесто — заготовка цеха" },
    ]
  },
  {
    id: "lunch",
    title: "🥣 Обед 11:00–18:00 — супы",
    color: "#FFF0E6",
    text: "#8B3A00",
    items: [
      { name: "Борщ (без картошки) + свежая картошка", cost: 12, price: 38, note: "бульон+зажарка+свёкла — цех; картошка варим на месте" },
      { name: "Суп лапша куриная (лапша свежая)", cost: 10, price: 32, note: "бульон+мясо — цех; лапша варим на месте" },
      { name: "Уха (без картошки) + свежая картошка + сливки + зелень", cost: 15, price: 42, note: "рыбный бульон+рыба — цех; финиш на месте" },
    ]
  },
  {
    id: "dumplings",
    title: "🥟 Весь день — вареники и пельмени",
    color: "#EEEDFE",
    text: "#3C3489",
    items: [
      { name: "Пельмени с курицей + песто соус", cost: 18, price: 52, note: "из заморозки цеха; варим 6 мин + соус" },
      { name: "Пельмени с говядиной + грибной соус", cost: 22, price: 58, note: "из заморозки цеха" },
      { name: "Пельмени с лососем + сливочный соус", cost: 25, price: 65, note: "из заморозки цеха" },
      { name: "Вареники с картошкой + зелень + сметана", cost: 12, price: 42, note: "из заморозки цеха" },
      { name: "Вареники с творогом + зелень + сметана", cost: 12, price: 42, note: "из заморозки цеха" },
    ]
  },
  {
    id: "salads",
    title: "🥗 Салат дня",
    color: "#F0F7ED",
    text: "#2d5a27",
    items: [
      { name: "Капустный салат (салат дня)", cost: 5, price: 22, note: "заготовка цеха, утро" },
      { name: "Винегрет (салат дня)", cost: 6, price: 24, note: "заготовка цеха, утро" },
      { name: "Шуба с лососем (салат дня)", cost: 15, price: 42, note: "заготовка цеха, утро" },
      { name: "Овощной салат (салат дня)", cost: 5, price: 20, note: "заготовка цеха, утро" },
    ]
  },
  {
    id: "baking",
    title: "🥐 Выпечка — каждый день свежая",
    color: "#FEF6E4",
    text: "#7A4700",
    items: [
      { name: "Пирожок с капустой/яйцом", cost: 4, price: 14, note: "высокая маржа" },
      { name: "Пирожок с яблоком", cost: 3, price: 12, note: "" },
      { name: "Медовик (кусок)", cost: 10, price: 38, note: "" },
      { name: "Наполеон (кусок)", cost: 10, price: 35, note: "" },
    ]
  },
];

const margin = (cost, price) => Math.round((1 - cost / price) * 100);
const marginColor = (m) => m >= 65 ? "#3B6D11" : m >= 45 ? "#854F0B" : "#A32D2D";
const marginBg = (m) => m >= 65 ? "#EAF3DE" : m >= 45 ? "#FAEEDA" : "#FCEBEB";

export default function MenuPricing() {
  const [sections, setSections] = useState(initialSections);
  const [editing, setEditing] = useState({});
  const [syncStatus, setSyncStatus] = useState("idle");
  const saveTimer = useRef(null);
  const isRemoteUpdate = useRef(false);

  // Supabase load + realtime
  useEffect(() => {
    supabase.from("menu_state").select("state").eq("id", "main").maybeSingle()
      .then(({ data }) => {
        if (!data?.state) return;
        isRemoteUpdate.current = true;
        applySections(data.state.sections);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      });

    const channel = supabase.channel("menu_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_state" }, (payload) => {
        if (!payload.new?.state) return;
        isRemoteUpdate.current = true;
        applySections(payload.new.state.sections);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const applySections = (incoming) => {
    if (!incoming) return;
    setSections(prev => prev.map(sec => {
      const inc = incoming.find(s => s.id === sec.id);
      if (!inc) return sec;
      return {
        ...sec,
        items: sec.items.map((item, i) => ({
          ...item,
          price: inc.items[i]?.price ?? item.price,
          cost: inc.items[i]?.cost ?? item.cost,
        }))
      };
    }));
  };

  const scheduleSave = (secs) => {
    if (isRemoteUpdate.current) return;
    setSyncStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const state = {
        sections: secs.map(s => ({
          id: s.id,
          items: s.items.map(item => ({ price: item.price, cost: item.cost }))
        }))
      };
      const { error } = await supabase.from("menu_state").upsert({ id: "main", state, updated_at: new Date().toISOString() });
      setSyncStatus(error ? "error" : "saved");
      if (!error) setTimeout(() => setSyncStatus("idle"), 2000);
    }, 800);
  };

  const updateItem = (secIdx, itemIdx, field, val) => {
    const n = Math.max(0, Number(val) || 0);
    const next = sections.map((sec, si) => si !== secIdx ? sec : {
      ...sec,
      items: sec.items.map((item, ii) => ii !== itemIdx ? item : { ...item, [field]: n })
    });
    setSections(next);
    scheduleSave(next);
  };

  const allItems = sections.flatMap(s => s.items);
  const avgMargin = Math.round(allItems.reduce((a, item) => a + margin(item.cost, item.price), 0) / allItems.length);
  const avgCheck = Math.round(allItems.reduce((a, item) => a + item.price, 0) / allItems.length);
  const totalItems = allItems.length;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh", padding: "1rem 1rem 2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Ценообразование</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>БЕРЁЗКА — Меню и цены</div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>Флорианополис 2026</div>
        </div>
        <div style={{ fontSize: 11, marginTop: 6, color: syncStatus === "saved" ? "#16a34a" : syncStatus === "saving" ? "#aaa" : syncStatus === "error" ? "#dc2626" : "transparent" }}>
          {syncStatus === "saving" && "сохранение…"}
          {syncStatus === "saved" && "✓ сохранено"}
          {syncStatus === "error" && "⚠ ошибка сохранения"}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Средняя маржа", value: `${avgMargin}%`, warn: avgMargin < 55 },
          { label: "Средний чек позиции", value: `R$${avgCheck}` },
          { label: "Позиций в меню", value: `${totalItems}` },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#999", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: s.warn ? "#A32D2D" : "#1a1a1a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {sections.map((section, si) => {
        const isEdit = editing[section.id];
        const sectionMargin = Math.round(section.items.reduce((a, item) => a + margin(item.cost, item.price), 0) / section.items.length);

        return (
          <div key={section.id} style={{ marginBottom: 16, background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: section.color }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: section.text }}>{section.title}</div>
                <div style={{ fontSize: 10, color: section.text, opacity: 0.75, marginTop: 2 }}>
                  {section.items.length} позиций · средняя маржа {sectionMargin}%
                </div>
              </div>
              <button
                onClick={() => setEditing(p => ({ ...p, [section.id]: !p[section.id] }))}
                style={{
                  fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                  border: isEdit ? "1px solid #1a1a1a" : "1px solid #ccc",
                  background: isEdit ? "#1a1a1a" : "rgba(255,255,255,0.7)",
                  color: isEdit ? "#fff" : "#444",
                  fontFamily: "'Georgia', serif",
                }}
              >
                {isEdit ? "✓ Готово" : "Изменить"}
              </button>
            </div>

            <div style={{ padding: "8px 14px 12px" }}>
              {section.items.map((item, ii) => {
                const m = margin(item.cost, item.price);
                return (
                  <div key={ii} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: ii < section.items.length - 1 ? "0.5px solid #ebebeb" : "none", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#1a1a1a" }}>{item.name}</div>
                      {item.note && <div style={{ fontSize: 11, color: "#A32D2D", marginTop: 1 }}>⚠️ {item.note}</div>}
                    </div>

                    {isEdit ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 10, color: "#aaa" }}>себест.</span>
                          <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                          <input
                            type="number"
                            value={item.cost}
                            min={0}
                            onChange={e => updateItem(si, ii, "cost", e.target.value)}
                            style={{ width: 50, textAlign: "right", border: "1px solid #ddd", borderRadius: 5, fontSize: 12, padding: "3px 4px", fontFamily: "'Georgia', serif" }}
                          />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 10, color: "#aaa" }}>цена</span>
                          <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                          <input
                            type="number"
                            value={item.price}
                            min={0}
                            onChange={e => updateItem(si, ii, "price", e.target.value)}
                            style={{ width: 50, textAlign: "right", border: "1px solid #ddd", borderRadius: 5, fontSize: 12, padding: "3px 4px", fontFamily: "'Georgia', serif" }}
                          />
                        </div>
                        <div style={{ background: marginBg(m), color: marginColor(m), fontSize: 12, fontWeight: 600, padding: "3px 7px", borderRadius: 99, minWidth: 36, textAlign: "center" }}>
                          {m}%
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "#999" }}>себест.</div>
                          <div style={{ fontSize: 12, color: "#555" }}>R${item.cost}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "#999" }}>цена</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>R${item.price}</div>
                        </div>
                        <div style={{ background: marginBg(m), color: marginColor(m), fontSize: 12, fontWeight: 600, padding: "3px 7px", borderRadius: 99, minWidth: 36, textAlign: "center" }}>
                          {m}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ background: "#f7f7f5", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
        🟢 65%+ — отличная маржа · 🟡 45–64% — нормально · 🔴 &lt;45% — пересмотреть<br />
        ⚠️ Пельмени из закупа R$90/кг — невыгодно. Лепить самим = маржа вырастет до 65%+
      </div>
    </div>
  );
}
