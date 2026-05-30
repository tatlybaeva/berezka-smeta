/*
-- create table if not exists rental_options (
--   id uuid primary key default gen_random_uuid(),
--   created_at timestamptz default now(),
--   updated_at timestamptz default now(),
--   data jsonb not null
-- );
-- alter table rental_options enable row level security;
-- create policy "public read"   on rental_options for select using (true);
-- create policy "public insert" on rental_options for insert with check (true);
-- create policy "public update" on rental_options for update using (true);
-- create policy "public delete" on rental_options for delete using (true);
*/

import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const BASELINE_REVENUE = 35000;

const STATUS_COLORS = {
  "рассматриваем": { bg: "#eff6ff", color: "#1d4ed8" },
  "отказали":       { bg: "#fef2f2", color: "#dc2626" },
  "выбрали":        { bg: "#f0fdf4", color: "#16a34a" },
  "архив":          { bg: "#f3f4f6", color: "#6b7280" },
};

const CONDITION_OPTIONS = ["с ремонтом", "под ремонт", "хорошее", "требует работ"];
const STATUS_OPTIONS    = ["рассматриваем", "отказали", "выбрали", "архив"];

const emptyForm = {
  name: "", address: "", area: "", rent: "", deposit: "",
  condition: "хорошее", parking: false, outdoor: false, kids_zone: false,
  contract_years: "", notes: "", score: 5, status: "рассматриваем",
  contact: "", link: "", maps_link: "",
};

const QUESTIONS = [
  "Можно ли завести кур?",
  "Можно ли делать ремонт и какой?",
  "Можно ли сносить стены, чтобы объединить комнаты?",
  "Можно ли сажать растения в землю на территории?",
  "Разрешено ли коммерческое использование (alvará de funcionamento) по этому адресу?",
  "Электрическая мощность (carga elétrica) — хватит ли на кофемашину/кухню?",
  "Канализация и жироуловитель (caixa de gordura) — есть или можно установить?",
  "Кто платит IPTU и кондоминиум?",
  "Срок договора и индексация (reajuste — IGPM/IPCA)?",
  "Можно ли вывеску/фасад (letreiro/fachada)?",
];

function Stars({ score, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <span
          key={n}
          onClick={() => onChange && onChange(n)}
          style={{ cursor: onChange ? "pointer" : "default", fontSize: 14, color: n <= score ? "#f59e0b" : "#d1d5db" }}
        >★</span>
      ))}
    </div>
  );
}

function Badge({ text }) {
  const s = STATUS_COLORS[text] || { bg: "#f3f4f6", color: "#333" };
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600 }}>
      {text}
    </span>
  );
}

function FeatureBadge({ label, yes }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99,
      background: yes ? "#f0fdf4" : "#f3f4f6",
      color: yes ? "#16a34a" : "#9ca3af",
    }}>
      {yes ? "✓" : "✗"} {label}
    </span>
  );
}

function RentalForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14,
      padding: "20px 18px", marginBottom: 20,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 14 }}>
        {initial ? "Изменить вариант" : "Новый вариант"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Name */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Название</label>
          <input style={inputStyle} value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Вариант Кампеше центр" />
        </div>
        {/* Address */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Адрес</label>
          <input style={inputStyle} value={form.address} onChange={e => upd("address", e.target.value)} placeholder="Rua das Flores, 123" />
        </div>
        {/* Area */}
        <div>
          <label style={labelStyle}>Площадь (м²)</label>
          <input style={inputStyle} type="number" value={form.area} onChange={e => upd("area", e.target.value)} placeholder="200" />
        </div>
        {/* Rent */}
        <div>
          <label style={labelStyle}>Аренда (R$/мес)</label>
          <input style={inputStyle} type="number" value={form.rent} onChange={e => upd("rent", e.target.value)} placeholder="8000" />
        </div>
        {/* Deposit */}
        <div>
          <label style={labelStyle}>Залог (месяцев)</label>
          <input style={inputStyle} type="number" value={form.deposit} onChange={e => upd("deposit", e.target.value)} placeholder="2" />
        </div>
        {/* Contract years */}
        <div>
          <label style={labelStyle}>Срок договора (лет)</label>
          <input style={inputStyle} type="number" value={form.contract_years} onChange={e => upd("contract_years", e.target.value)} placeholder="2" />
        </div>
        {/* Condition */}
        <div>
          <label style={labelStyle}>Состояние</label>
          <select style={inputStyle} value={form.condition} onChange={e => upd("condition", e.target.value)}>
            {CONDITION_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Status */}
        <div>
          <label style={labelStyle}>Статус</label>
          <select style={inputStyle} value={form.status} onChange={e => upd("status", e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Checkboxes */}
        <div style={{ gridColumn: "span 2", display: "flex", gap: 16, alignItems: "center" }}>
          {[["parking", "Парковка"], ["outdoor", "Терраса"], ["kids_zone", "Детская зона"]].map(([k, lbl]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={!!form[k]} onChange={e => upd(k, e.target.checked)} />
              {lbl}
            </label>
          ))}
        </div>
        {/* Score */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Оценка ({form.score}/10)</label>
          <Stars score={form.score} onChange={v => upd("score", v)} />
        </div>
        {/* Contact */}
        <div>
          <label style={labelStyle}>Контакт</label>
          <input style={inputStyle} value={form.contact} onChange={e => upd("contact", e.target.value)} placeholder="+55 48 99999-9999" />
        </div>
        {/* Link */}
        <div>
          <label style={labelStyle}>Ссылка</label>
          <input style={inputStyle} value={form.link} onChange={e => upd("link", e.target.value)} placeholder="https://..." />
        </div>
        {/* Google Maps */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Google Maps</label>
          <input style={inputStyle} value={form.maps_link || ""} onChange={e => upd("maps_link", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        </div>
        {/* Notes */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Заметки</label>
          <textarea style={{ ...inputStyle, height: 72, resize: "vertical" }} value={form.notes} onChange={e => upd("notes", e.target.value)} placeholder="Комментарии..." />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={() => onSave(form)} style={btnPrimary}>Сохранить</button>
        <button onClick={onCancel} style={btnSecondary}>Отмена</button>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 10, color: "#999", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" };
const inputStyle = {
  fontFamily: "'Georgia', serif", fontSize: 13, width: "100%", boxSizing: "border-box",
  border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", background: "#faf9f6", color: "#1a1a1a",
};
const btnPrimary   = { fontFamily: "'Georgia', serif", fontSize: 13, padding: "7px 18px", borderRadius: 8, border: "none", background: "#1a1a1a", color: "#fff", cursor: "pointer" };
const btnSecondary = { fontFamily: "'Georgia', serif", fontSize: 13, padding: "7px 18px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", color: "#555", cursor: "pointer" };

export default function RentalOptions() {
  const [options, setOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [selectedId, setSelectedId] = useState(null);
  const qSaveTimer = useRef(null);

  const loadAll = async () => {
    const { data } = await supabase
      .from("rental_options")
      .select("id, data, created_at, updated_at")
      .order("created_at");
    if (data) setOptions(data);
  };

  useEffect(() => {
    loadAll();
    const channel = supabase.channel("rental_options_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_options" }, () => {
        loadAll();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleAdd = async (formData) => {
    setSyncStatus("saving");
    const { error } = await supabase.from("rental_options").insert({ data: formData });
    setSyncStatus(error ? "error" : "saved");
    if (!error) {
      setShowForm(false);
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };

  const handleUpdate = async (id, formData) => {
    setSyncStatus("saving");
    const { error } = await supabase.from("rental_options")
      .update({ data: formData, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSyncStatus(error ? "error" : "saved");
    if (!error) {
      setEditingId(null);
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить этот вариант?")) return;
    if (selectedId === id) setSelectedId(null);
    await supabase.from("rental_options").delete().eq("id", id);
  };

  const activeOptions = options.filter(o => o.data.status !== "архив");

  // Compute best values per row for comparison table
  const compRows = [
    { key: "area",        label: "Площадь (м²)",          fmt: v => v ? `${v} м²` : "—",        better: "max" },
    { key: "rent",        label: "Аренда/мес (R$)",        fmt: v => v ? `R$${Number(v).toLocaleString()}` : "—", better: "min" },
    { key: "deposit_brl", label: "Залог (R$)",             fmt: v => v ? `R$${Number(v).toLocaleString()}` : "—", better: "min" },
    { key: "rent_pct",    label: `Аренда % выручки (R$${BASELINE_REVENUE.toLocaleString()})`, fmt: v => v ? `${v}%` : "—", better: "min" },
    { key: "parking",     label: "Парковка",               fmt: v => v ? "✓" : "✗",              better: "bool" },
    { key: "outdoor",     label: "Терраса",                fmt: v => v ? "✓" : "✗",              better: "bool" },
    { key: "kids_zone",   label: "Детская зона",           fmt: v => v ? "✓" : "✗",              better: "bool" },
    { key: "score",       label: "Оценка",                 fmt: v => v ? `${v}/10` : "—",        better: "max" },
  ];

  const getVal = (o, key) => {
    const d = o.data;
    if (key === "deposit_brl") return d.deposit && d.rent ? Number(d.deposit) * Number(d.rent) : null;
    if (key === "rent_pct") return d.rent ? Math.round((Number(d.rent) / BASELINE_REVENUE) * 100) : null;
    return d[key] ?? null;
  };

  const bestFor = (row) => {
    const vals = activeOptions.map((o, i) => ({ i, v: getVal(o, row.key) })).filter(x => x.v !== null);
    if (!vals.length) return new Set();
    if (row.better === "max") { const m = Math.max(...vals.map(x => x.v)); return new Set(vals.filter(x => x.v === m).map(x => x.i)); }
    if (row.better === "min") { const m = Math.min(...vals.map(x => x.v)); return new Set(vals.filter(x => x.v === m).map(x => x.i)); }
    if (row.better === "bool") { return new Set(vals.filter(x => x.v).map(x => x.i)); }
    return new Set();
  };

  // Selected option for detail panel
  const selectedOption = selectedId ? options.find(o => o.id === selectedId) : null;

  const handleQAnswerChange = (optionId, data, idx, field, value) => {
    const prevAnswers = data.qAnswers || {};
    const updatedAnswers = {
      ...prevAnswers,
      [idx]: { ...(prevAnswers[idx] || {}), [field]: value },
    };
    // Update local state immediately for responsiveness
    setOptions(prev => prev.map(o =>
      o.id === optionId ? { ...o, data: { ...o.data, qAnswers: updatedAnswers } } : o
    ));
    // Debounced save
    clearTimeout(qSaveTimer.current);
    qSaveTimer.current = setTimeout(() => {
      handleUpdate(optionId, { ...data, qAnswers: updatedAnswers });
    }, 600);
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh", padding: "1rem 1rem 2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Варианты аренды</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>🏠 Варианты аренды</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: syncStatus === "saved" ? "#16a34a" : syncStatus === "saving" ? "#aaa" : syncStatus === "error" ? "#dc2626" : "transparent" }}>
            {syncStatus === "saving" && "сохранение…"}
            {syncStatus === "saved" && "✓ сохранено"}
            {syncStatus === "error" && "⚠ ошибка"}
          </div>
          <button
            onClick={() => { setCompareMode(v => !v); }}
            style={{ ...btnSecondary, fontSize: 12 }}
          >{compareMode ? "📋 Карточки" : "📊 Сравнить"}</button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ ...btnPrimary, fontSize: 12 }}
          >+ Добавить вариант</button>
        </div>
      </div>

      {/* Add form */}
      {showForm && !editingId && (
        <RentalForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {/* Compare mode */}
      {compareMode ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={thStyle}>Показатель</th>
                {activeOptions.map(o => (
                  <th key={o.id} style={{
                    ...thStyle,
                    borderTop: o.data.status === "выбрали" ? "3px solid #f59e0b" : undefined,
                    background: o.data.status === "выбрали" ? "#fffbeb" : "#f9fafb",
                  }}>
                    {o.data.name || "—"}
                    {o.data.status === "выбрали" && <div style={{ fontSize: 9, color: "#f59e0b" }}>★ выбрали</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compRows.map(row => {
                const best = bestFor(row);
                return (
                  <tr key={row.key}>
                    <td style={tdStyle}>{row.label}</td>
                    {activeOptions.map((o, i) => {
                      const v = getVal(o, row.key);
                      const isBest = best.has(i) && v !== null;
                      return (
                        <td key={o.id} style={{
                          ...tdStyle,
                          background: isBest ? "#f0fdf4" : undefined,
                          color: isBest ? "#16a34a" : undefined,
                          fontWeight: isBest ? 600 : undefined,
                          textAlign: "center",
                        }}>
                          {row.fmt(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards view */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {options.map(o => {
              const d = o.data;
              const isSelected = d.status === "выбрали";
              const isDetailOpen = selectedId === o.id;
              return editingId === o.id ? (
                <div key={o.id} style={{ gridColumn: "span 2" }}>
                  <RentalForm
                    initial={d}
                    onSave={form => handleUpdate(o.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div
                  key={o.id}
                  onClick={() => setSelectedId(id => id === o.id ? null : o.id)}
                  style={{
                    background: "#fff",
                    border: isDetailOpen
                      ? "2px solid #5C3D1E"
                      : isSelected
                        ? "2px solid #f59e0b"
                        : "1px solid #ebebeb",
                    borderRadius: 12,
                    padding: "14px 14px",
                    boxShadow: isDetailOpen
                      ? "0 0 0 3px rgba(92,61,30,0.12)"
                      : isSelected
                        ? "0 0 0 3px #fef9c3"
                        : undefined,
                    cursor: "pointer",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", flex: 1, marginRight: 8 }}>{d.name || "Без названия"}</div>
                    <Badge text={d.status} />
                  </div>
                  <Stars score={d.score} />
                  {/* Address + area + rent */}
                  {d.address && <div style={{ fontSize: 11, color: "#777", marginTop: 6 }}>{d.address}</div>}
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
                    {d.area ? `${d.area} м²` : ""}
                    {d.area && d.rent ? " · " : ""}
                    {d.rent ? `R$${Number(d.rent).toLocaleString()}/мес` : ""}
                    {d.deposit ? ` · залог ${d.deposit} мес` : ""}
                    {d.condition ? ` · ${d.condition}` : ""}
                  </div>
                  {/* Feature badges */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                    <FeatureBadge label="Парковка" yes={d.parking} />
                    <FeatureBadge label="Терраса" yes={d.outdoor} />
                    <FeatureBadge label="Дет. зона" yes={d.kids_zone} />
                  </div>
                  {d.notes && <div style={{ fontSize: 11, color: "#888", marginTop: 6, lineHeight: 1.4, borderTop: "1px solid #f3f4f6", paddingTop: 6 }}>{d.notes}</div>}
                  {/* Actions — stop propagation so card click doesn't fire */}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditingId(o.id)} style={{ ...btnSecondary, fontSize: 11, padding: "4px 12px" }}>Изменить</button>
                    <button onClick={() => handleDelete(o.id)} style={{ ...btnSecondary, fontSize: 11, padding: "4px 10px", color: "#dc2626", borderColor: "#fecaca" }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedOption && (() => {
            const o = selectedOption;
            const d = o.data;
            const qAnswers = d.qAnswers || {};
            return (
              <div style={{
                background: "#fff",
                border: "1.5px solid #EBE2D3",
                borderRadius: 14,
                padding: "20px 18px",
                marginTop: 14,
              }}>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>{d.name || "Без названия"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge text={d.status} />
                      <Stars score={d.score} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{ ...btnSecondary, fontSize: 12, padding: "4px 14px" }}
                  >Закрыть</button>
                </div>

                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                  {[
                    ["Площадь", d.area ? `${d.area} м²` : "—"],
                    ["Аренда", d.rent ? `R$${Number(d.rent).toLocaleString()}/мес` : "—"],
                    ["Залог", d.deposit ? `${d.deposit} мес` : "—"],
                    ["Состояние", d.condition || "—"],
                    ["Контакт", d.contact || "—"],
                    ["Срок договора", d.contract_years ? `${d.contract_years} лет` : "—"],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: "#faf9f6", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Links row */}
                {(d.maps_link || d.link) && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                    {d.maps_link && (
                      <a
                        href={d.maps_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "#4285F4", color: "#fff",
                          fontSize: 12, fontFamily: "'Georgia', serif",
                          padding: "6px 14px", borderRadius: 8,
                          textDecoration: "none", fontWeight: 500,
                        }}
                      >
                        📍 Google Maps
                      </a>
                    )}
                    {d.link && (
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "#fff", color: "#2563eb",
                          fontSize: 12, fontFamily: "'Georgia', serif",
                          padding: "6px 14px", borderRadius: 8,
                          border: "1px solid #bfdbfe",
                          textDecoration: "none", fontWeight: 500,
                        }}
                      >
                        🔗 Объявление
                      </a>
                    )}
                  </div>
                )}

                {/* Questions section */}
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
                  🏡 Вопросы по помещению
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
                  Список вопросов для переговоров с арендодателем
                </div>

                {QUESTIONS.map((q, idx) => {
                  const a = qAnswers[idx] || {};
                  const hasAnswer = !!(a.answer && a.answer.trim());
                  return (
                    <div key={idx} style={{
                      display: "flex", flexDirection: "column", gap: 6,
                      padding: "10px 0",
                      borderBottom: idx < QUESTIONS.length - 1 ? "1px solid #EBE2D3" : "none",
                    }}>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!a.done}
                          onChange={e => handleQAnswerChange(o.id, d, idx, "done", e.target.checked)}
                          style={{ marginTop: 2, accentColor: "#5C3D1E", flexShrink: 0 }}
                        />
                        <span style={{
                          fontSize: 13, color: a.done ? "#aaa" : "#1a1a1a",
                          textDecoration: a.done ? "line-through" : "none",
                          lineHeight: 1.5, fontFamily: "'Georgia', serif",
                        }}>
                          {q}
                        </span>
                      </label>
                      <div style={{
                        marginLeft: 24,
                        borderLeft: hasAnswer ? "3px solid #16a34a" : "none",
                        paddingLeft: hasAnswer ? 8 : 0,
                        transition: "border-left 0.15s",
                      }}>
                        <input
                          type="text"
                          value={a.answer || ""}
                          onChange={e => handleQAnswerChange(o.id, d, idx, "answer", e.target.value)}
                          placeholder="Ответ арендодателя..."
                          style={{
                            fontFamily: "'Georgia', serif", fontSize: 12,
                            border: "1px solid #EBE2D3", borderRadius: 8,
                            padding: "5px 10px", background: "#fff", color: "#1a1a1a",
                            outline: "none", width: "100%", boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Close button at bottom */}
                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{ ...btnSecondary, fontSize: 12 }}
                  >Закрыть</button>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {options.length === 0 && !showForm && (
        <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: 13 }}>
          Вариантов пока нет. Нажмите «+ Добавить вариант»
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#555", background: "#f9fafb", border: "1px solid #e5e7eb" };
const tdStyle  = { padding: "7px 10px", fontSize: 12, border: "1px solid #e5e7eb", color: "#1a1a1a" };
