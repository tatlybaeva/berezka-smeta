import { useState, useEffect, useRef, Fragment } from "react";
import { supabase } from "./supabase";

const RATE = 5.7;
const fmt$ = (brl) => `$${Math.round(brl / RATE).toLocaleString()}`;
const fmtR = (brl) => `R$${brl.toLocaleString()}`;

// ─── Numeric Input (Finance-style) ──────────────────────────────────────────
function NumInput({ value, onChange, suffix = "" }) {
  const [local, setLocal] = useState(String(value))
  useEffect(() => { setLocal(String(value)) }, [value])
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        style={{
          border: "1.5px solid #D4C4A8", borderRadius: 6, padding: "4px 8px",
          fontFamily: "'Georgia', serif", fontSize: 13, width: 110, textAlign: "right",
          background: "#FDFAF5", outline: "none",
        }}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => {
          const n = parseFloat(local)
          if (!isNaN(n)) onChange(n)
          else setLocal(String(value))
        }}
      />
      {suffix && <span style={{ fontSize: 12, color: "#888" }}>{suffix}</span>}
    </div>
  )
}

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

const ML = (q) => `https://lista.mercadolivre.com.br/${encodeURIComponent(q)}`;
const OLX = (q) => `https://sc.olx.com.br/todos-os-estados-e-cidades?q=${encodeURIComponent(q)}`;

const ZONES = [
  {
    id: "territory", emoji: "🏠", name: "Территория",
    items: [
      { name: "Ворота на въезд", brl: 2000, url: ML("portão de entrada residencial") },
      { name: "Забор / ограждение", brl: 3000, url: ML("cerca tela alambrado") },
      { name: "Сигнализация (установка)", brl: 1500, url: ML("alarme residencial kit instalação") },
      { name: "Камеры IP (8 шт.) × R$280/шт.", brl: 2240, url: ML("câmera ip externa 4mp kit 8") },
      { name: "NVR-регистратор + HDD 2TB", brl: 1200, url: ML("nvr gravador câmera ip hd 2tb") },
      { name: "Монтаж системы видеонаблюдения", brl: 800, url: "" },
      { name: "Брусчатка/дорожки — 20 м² × R$100/м²", brl: 2000, url: ML("piso intertravado pedra portuguesa") },
      { name: "Фонари садовые — 8 шт. × R$200/шт.", brl: 1600, url: ML("luminária jardim solar poste") },
      { name: "Озеленение (гортензии, горшки)", brl: 1500, url: ML("hortênsia vaso grande planta") },
      { name: "Вывеска БЕРЁЗКА (деревянная)", brl: 1500, url: ML("placa madeira personalizada letreiro") },
    ]
  },
  {
    id: "facade", emoji: "🏛️", name: "Фасад здания",
    items: [
      { name: "Покраска фасада (фасадная краска, 2 слоя) — ~80 м²", brl: 3200, url: ML("tinta fachada externa látex acrílico galão") },
      { name: "Работа маляра — фасад", brl: 2000, url: "" },
      { name: "Облицовка колонн деревом (вагонка/декор-рейки) — 6 шт.", brl: 3600, url: ML("ripa madeira pinus revestimento coluna") },
      { name: "Монтаж облицовки — 6 колонн", brl: 1200, url: "" },
      { name: "Пропитка/лак для защиты дерева снаружи", brl: 400, url: ML("verniz impregnante externo madeira proteção") },
    ]
  },
  {
    id: "entry", emoji: "🚪", name: "Вход / первое впечатление",
    items: [
      { name: "Деревянная арка или перголa у входа", brl: 1200, url: ML("pérgola madeira jardim") },
      { name: "Меловая доска с меню у входа", brl: 300, url: ML("quadro negro lousa menu restaurante") },
      { name: "Скамейка у входа (б/у)", brl: 400, url: OLX("banco madeira jardim") },
      { name: "Таблички (часы работы, Wi-Fi и т.д.)", brl: 200, url: ML("placa informativa acrílico restaurante") },
      { name: "Белые распашные окна (janela de abrir) — marceneiro", brl: 2400, url: ML("janela de abrir madeira marceneiro") },
      { name: "Резные наличники — деревянный декор на окна", brl: 800, url: ML("moldura janela madeira entalhada decorativa") },
    ]
  },
  {
    id: "terrace", emoji: "🌿", name: "Уличная веранда",
    items: [
      { name: "Деревянный дек (материалы)", brl: 4000, url: ML("deck madeira eucalipto tratado") },
      { name: "6 столиков + стулья б/у", brl: 3600, url: OLX("mesa cadeira bar restaurante usado") },
      { name: "Гирлянды Edison × 3 нити", brl: 900, url: ML("cordão luzes festão Edison vintage") },
      { name: "Гамак × 2", brl: 600, url: ML("rede descanso algodão") },
      { name: "Горшки с растениями × 6", brl: 900, url: ML("vaso grande plantas externo") },
      { name: "Навес / тент (от дождя)", brl: 2000, url: ML("tenda gazebo impermeável") },
    ]
  },
  {
    id: "playground", emoji: "👶", name: "Игровая зона (улица)",
    items: [
      { name: "Типи (бамбук + ткань + фонарики) — фото-зона", brl: 400, url: ML("cabana bambu tecido infantil") },
      { name: "Меловая стена + ростомер с подсолнухом", brl: 550, url: ML("régua crescimento infantil parede") },
      { name: "Грязевая кухня (поддоны)", brl: 500, url: ML("cozinha de lama brinquedo madeira") },
      { name: "Пни-ступеньки разной высоты", brl: 600, url: ML("toco madeira pinus decoração jardim") },
      { name: "Слэклайн между деревьями", brl: 150, url: ML("slackline iniciante 15m") },
      { name: "Качели на дерево (верёвка + доска)", brl: 170, url: ML("balanço madeira corda árvore") },
      { name: "Водный жёлоб из бамбука", brl: 0, url: ML("bambu calha artesanal") },
      { name: "Песок + контейнер", brl: 500, url: ML("caixa de areia infantil madeira") },
      { name: "Детские инструменты (лопата, грабли, лейка)", brl: 250, url: ML("kit jardinagem infantil brinquedo") },
      { name: "Ограждение игровой зоны — 20 пог. м × R$120/пог.м", brl: 2400, url: ML("cerca madeira jardim rustica") },
      { name: "Ограждение огорода — 15 пог. м × R$120/пог.м", brl: 1800, url: ML("cerca bambu rustica horta") },
    ]
  },
  {
    id: "garden", emoji: "🐔", name: "Детский огород + куры",
    items: [
      { name: "Курятник + 4 куры + ограждение", brl: 1800, url: ML("galinheiro madeira kit") },
      { name: "Вертикальный огород (поддоны)", brl: 300, url: ML("horta vertical palete madeira") },
      { name: "Грядки + семена + земля", brl: 600, url: ML("terra adubada horta sementes kit") },
      { name: "Компостер из поддонов", brl: 200, url: ML("composteira caseira madeira") },
      { name: "Таблички с названиями растений", brl: 150, url: ML("placa identificação plantas horta madeira") },
    ]
  },
  {
    id: "indoor_play", emoji: "🎨", name: "Игровая под крышей",
    items: [
      { name: "Покраска стен (белый + меловая стена)", brl: 600, url: ML("tinta lousa parede quadro negro") },
      { name: "Деревянные полки монтессори", brl: 800, url: ML("prateleira montessori madeira criança") },
      { name: "Низкий стол + стулья детские", brl: 600, url: ML("mesa cadeira infantil madeira") },
      { name: "Плетёный круглый ковёр", brl: 400, url: ML("tapete redondo trançado juta") },
      { name: "Мини дачная кухня-игрушка", brl: 500, url: ML("cozinha brinquedo madeira infantil") },
      { name: "Подушки + книги + пуфики", brl: 400, url: ML("puff infantil almofada leitura") },
      { name: "Деревянные игрушки монтессори", brl: 800, url: ML("brinquedo educativo madeira montessori") },
      { name: "Кондиционер 9000 BTU + установка", brl: 2800, url: ML("ar condicionado 9000 BTU inverter instalação") },
    ]
  },
  {
    id: "hall", emoji: "🍽️", name: "Зал",
    items: [
      { name: "Покраска стен (белый)", brl: 800, url: ML("tinta látex branco fosco galão") },
      { name: "Мебель б/у — 6 столов + разные стулья", brl: 4320, url: OLX("mesa cadeira restaurante madeira usado") },
      { name: "Персидские ковры б/у × 4", brl: 600, url: OLX("tapete persa vintage") },
      { name: "Льняные скатерти × 12", brl: 480, url: ML("toalha mesa linho rústica") },
      { name: "Светильники чёрные × 6", brl: 720, url: ML("luminária pendente industrial preta") },
      { name: "Открытые полки с посудой", brl: 300, url: ML("prateleira madeira rústica parede") },
      { name: "Печь-муляж (гипсокартон)", brl: 2500, url: ML("lareira decorativa gesso drywall") },
      { name: "Декор (горшки, вазы, картины)", brl: 800, url: ML("decoração rústica vaso artesanato") },
      { name: "Тюль белый на окна", brl: 300, url: ML("cortina voil branco janela") },
      { name: "Декоративные дрова + медный чайник б/у", brl: 300, url: OLX("chaleira cobre decorativa lenha decorativa") },
      { name: "Кресло-качалка б/у", brl: 400, url: OLX("cadeira balanço madeira usado") },
      { name: "Кондиционер 12000 BTU + установка", brl: 3500, url: ML("ar condicionado 12000 BTU inverter instalação") },
    ]
  },
  {
    id: "bar", emoji: "☕", name: "Стойка бариста",
    items: [
      { name: "Кофемашина Этап 1 б/у (De'Longhi/Saeco)", brl: 1200, url: OLX("máquina café espresso usado DeLonghi Saeco") },
      { name: "Кофемашина Этап 2 б/у (Gaggia/Rancilio)", brl: 4500, url: OLX("máquina café profissional Gaggia Rancilio usado") },
      { name: "Фильтр-кофейник + капучинатор", brl: 750, url: ML("cafeteira filtro coado espumador leite") },
      { name: "Холодильник витринный б/у", brl: 1500, url: OLX("geladeira expositor bebidas usado") },
      { name: "Термосы для подачи × 2", brl: 300, url: ML("garrafa térmica café inox 1 litro") },
      { name: "Стойка/прилавок б/у", brl: 1000, url: OLX("balcão atendimento madeira usado") },
    ]
  },
  {
    id: "kitchen", emoji: "🍳", name: "Кухня",
    items: [
      { name: "Fogão industrial 4 bocas + forno б/у", brl: 2200, url: OLX("fogão industrial 4 bocas usado") },
      { name: "Geladeira comercial б/у", brl: 2000, url: OLX("geladeira comercial 4 portas usado") },
      { name: "Batedeira + panelas inox набор", brl: 1200, url: ML("batedeira industrial panela inox kit") },
      { name: "Блинные сковороды × 3", brl: 150, url: ML("frigideira crepe bliny antiaderente") },
      { name: "Кастрюли большие × 3 + средние × 3", brl: 500, url: ML("panela inox caldeirão grande conjunto") },
      { name: "Посудомоечная машина б/у", brl: 2000, url: OLX("lava louça industrial comercial usado") },
      { name: "Ремонт кухни (плитка, стены, под VISA)", brl: 2000, url: "" },
      { name: "Кондиционер 9000 BTU + установка (кухня)", brl: 2800, url: ML("ar condicionado 9000 BTU inverter instalação") },
    ]
  },
  {
    id: "workshop", emoji: "🏭", name: "Цех (заготовки)",
    items: [
      { name: "Freezer б/у", brl: 1000, url: OLX("freezer horizontal comercial usado") },
      { name: "Mesa inox + Pia inox dupla б/у", brl: 1700, url: OLX("mesa pia inox dupla cozinha comercial") },
      { name: "Exaustor (вытяжка)", brl: 1200, url: ML("exaustor coifa industrial cozinha") },
      { name: "Forno de convecção б/у", brl: 1500, url: OLX("forno convecção eletrico usado comercial") },
      { name: "Мясорубка профессиональная б/у", brl: 650, url: OLX("moedor de carne elétrico profissional usado") },
      { name: "Fritadeira (фритюрница) б/у", brl: 500, url: OLX("fritadeira elétrica comercial usado") },
      { name: "Вакуматор (упаковщик) б/у", brl: 800, url: ML("seladora vacuo alimentos comercial") },
      { name: "Контейнеры GN 1/3 × 20 шт", brl: 400, url: ML("cuba gastronorm 1/3 inox aço") },
      { name: "Маркировочный принтер / этикетки", brl: 300, url: ML("impressora etiqueta rotulo termico") },
    ]
  },
  {
    id: "store", emoji: "🛍️", name: "Магазин эко-игрушек",
    items: [
      { name: "Стеллаж деревянный у выхода", brl: 800, url: ML("estante madeira rústica expositor loja") },
      { name: "Деревянные игрушки и фигурки (стартовый запас)", brl: 1500, url: ML("brinquedo madeira artesanal educativo") },
      { name: "Семена в крафт-пакетах с лого БЕРЁЗКА", brl: 300, url: ML("semente orgânica envelope kraft personalizado") },
      { name: "Тканевые куклы и монтессори-наборы", brl: 800, url: ML("boneca pano artesanal montessori kit") },
    ]
  },
  {
    id: "tech_indoor", emoji: "🔧", name: "Тех. помещение (внутри)",
    items: [
      { name: "Стеллажи для продуктов и инвентаря", brl: 900, url: ML("estante aço industrial prateleira") },
      { name: "Уборочный инвентарь + расходники", brl: 400, url: ML("kit limpeza comercial balde vassoura") },
      { name: "Сейф / ящик для документов", brl: 300, url: ML("cofre documentos pequeno") },
      { name: "Шкафчики для персонала × 3", brl: 600, url: ML("armário vestiário funcionários aço") },
    ]
  },
  {
    id: "tech_outdoor", emoji: "🏚️", name: "Тех. помещение (улица)",
    items: [
      { name: "Хозблок / сарай (материалы или б/у)", brl: 2000, url: OLX("galpão depósito madeira usado") },
      { name: "Стеллажи уличные влагостойкие", brl: 600, url: ML("estante externa aço galvanizado") },
      { name: "Замок + защита", brl: 300, url: ML("cadeado reforçado segurança") },
    ]
  },
  {
    id: "toilets", emoji: "🚽", name: "Туалеты",
    items: [
      { name: "Ремонт (плитка, покраска)", brl: 2000, url: ML("revestimento piso azulejo banheiro") },
      { name: "Сантехника б/у (раковина, унитаз)", brl: 1500, url: OLX("pia banheiro vaso sanitário usado") },
      { name: "Зеркало + полка + свет", brl: 400, url: ML("espelho banheiro iluminado") },
      { name: "Диспенсер мыло + бумага × 2", brl: 200, url: ML("dispenser papel sabonete banheiro comercial") },
      { name: "Декор (растение, рисунок)", brl: 200, url: ML("planta suculenta banheiro decoração") },
    ]
  },
  {
    id: "staff", emoji: "👔", name: "Комната персонала",
    items: [
      { name: "Покраска + небольшой ремонт", brl: 500, url: "" },
      { name: "Шкафчики × 4", brl: 600, url: ML("armário vestiário funcionários metal") },
      { name: "Стол + стулья для перерыва", brl: 400, url: OLX("mesa cadeira copa usado") },
      { name: "Мини-холодильник б/у", brl: 400, url: OLX("frigobar mini geladeira usado") },
    ]
  },
  {
    id: "marketing", emoji: "📣", name: "Маркетинг запуска",
    items: [
      { name: "Трафарет с лого + баллончики (граффити-декор)", brl: 200, url: ML("stencil personalizado spray tinta") },
      { name: "Подарки за сторис с отметкой (первый месяц)", brl: 350, url: "" },
      { name: "Брендированные футболки персонала × 8", brl: 1000, url: ML("camiseta personalizada uniforme bordado") },
      { name: "Pre-launch контент (фотосессия, реквизит)", brl: 600, url: "" },
      { name: "Флаеры / визитки (крафт-бумага)", brl: 250, url: ML("flyer panfleto kraft personalizado") },
      { name: "Google Maps + iFood профиль (фотограф)", brl: 400, url: "" },
      { name: "Реклама Instagram (первые 2 нед)", brl: 500, url: "" },
      { name: "Подарочные карты на открытие × 20", brl: 400, url: ML("vale presente cartão gift card personalizado") },
    ]
  },
];

function LgpdNote() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8, borderRadius: 8, border: "1px solid #F0E4B0", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 12px", background: "#FFFBF0", border: "none", cursor: "pointer",
          fontFamily: "Georgia,serif", fontSize: 11, color: "#6B5B1E", textAlign: "left",
        }}
      >
        <span>📋 Политика видеонаблюдения (LGPD)</span>
        <span style={{ fontSize: 10, opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
      </button>
      {open && (
        <div style={{ background: "#FFFBF0", padding: "8px 12px 10px", borderTop: "1px solid #F0E4B0", fontSize: 11, color: "#6B5B1E", lineHeight: 1.6 }}>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li><b>Таблички</b> «Ambiente monitorado por câmeras» — обязательны на входе и в зонах съёмки</li>
            <li><b>Хранение записей</b> — 30–90 дней, затем безопасное удаление</li>
            <li><b>Доступ</b> — только владелец/ответственный. Передача третьим лицам — только по запросу полиции/суда</li>
            <li><b>Без аудио</b> — только видео (аудио повышает юридический риск)</li>
            <li><b>Туалеты/раздевалки</b> — камеры запрещены</li>
            <li><b>Детская зона</b> — общий обзор допустим; информировать родителей. Публикация кадров с детьми — только с согласия</li>
            <li><b>Штраф ANPD</b> до 2% оборота — закрывается табличками и политикой</li>
          </ul>
        </div>
      )}
    </div>
  );
}


const FOOD_COST_PCT = 0.30;
const TAX_PCT = 0.08;

const DEFAULT_LEGAL_ITEMS = [
  { name: "Contrato social / registro (нотариус)", brl: 800 },
  { name: "Alvará de funcionamento (лицензия)", brl: 500 },
  { name: "VISA sanitária (санитарная лицензия)", brl: 1500 },
  { name: "Бухгалтер — открытие (сопровождение)", brl: 2000 },
  { name: "Прочие юр. и регистрационные расходы", brl: 200 },
]

function computeBEP(rent, avgCheck, staff, other, phase) {
  const foodCost = phase === 1 ? 0.15 : FOOD_COST_PCT; // этап 1: только напитки 15%, этап 2+: еда 30%
  const fixed = rent + staff + other;
  const netPerCheck = Math.round(avgCheck * (1 - foodCost - TAX_PCT));
  const checksPerMonth = netPerCheck > 0 ? Math.ceil(fixed / netPerCheck) : 0;
  const checksPerDay = Math.ceil(checksPerMonth / 30);
  return { fixed, netPerCheck, checksPerMonth, checksPerDay };
}

export default function InvestmentCalc() {
  const [rentType, setRentType] = useState("house"); // "house" | "land"
  const [rent, setRent] = useState(11000);
  const [rentWorkshop, setRentWorkshop] = useState(0);
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
  const [itemUrls, setItemUrls] = useState({});      // { key: "https://..." } overrides
  const dragState = useRef(null); // { zoneId, idx, isExtra } — no re-render during drag
  const [dropIndicator, setDropIndicator] = useState(null); // { zoneId, beforeIdx } for visual line
  const [zoneOrder, setZoneOrder] = useState(() =>
    Object.fromEntries([...ZONES, CONSTRUCTION_ZONE].map(z => [z.id, z.items.map((_, i) => i)]))
  );
  const [extraOrder, setExtraOrder] = useState({}); // { zoneId: [0, 1, 2, ...] }
  // BEP editable inputs
  const [avgCheck, setAvgCheck] = useState(52);
  const [beStaff, setBeStaff] = useState({ 1: 8500, 2: 15000, 3: 15000 });   // ФОТ по этапам
  const [beOther, setBeOther] = useState({ 1: 3500, 2: 5000,  3: 6000 });    // прочие расходы по этапам
  const [calcProperties, setCalcProperties] = useState([]); // rental options with status "в расчёте"
  const [activePropId, setActivePropId] = useState(null);   // currently selected property ID
  const [finMonthly, setFinMonthly] = useState(7200); // utilities+marketing+accountant+other from Finance
  const [itemTags, setItemTags] = useState({})         // { key: 'labor' | 'purchase' }
  const [legalItems, setLegalItems] = useState(DEFAULT_LEGAL_ITEMS)
  const [legalExpanded, setLegalExpanded] = useState(false)
  const [legalEditing, setLegalEditing] = useState(false)
  const [legalNewDraft, setLegalNewDraft] = useState(null)
  const [rentHolidayEnabled, setRentHolidayEnabled] = useState(false)
  const [rentHolidayMonths, setRentHolidayMonths] = useState(3)
  const [rentHolidayAmount, setRentHolidayAmount] = useState(9000)
  const saveTimer = useRef(null);
  const globalSaveTimer = useRef(null);
  const isRemoteUpdate = useRef(false);
  const isSelfSaving = useRef(false); // игнорируем собственное эхо из smeta realtime

  const buildState = (rt, r, rw, d, wc, res, ez, ei, q, p, bp, cd, names, extras, urls, ac, bst, bot, gt, zo, eo) => ({ rentType: rt, rent: r, rentWorkshop: rw, depositMonths: d, workingCapMonths: wc, reserve: res, enabledZones: ez, enabledItems: ei, quantities: q, prices: p, bePhase: bp, currentChecksDay: cd, itemNames: names, extraItems: extras, itemUrls: urls, avgCheck: ac, beStaff: bst, beOther: bot, grandTotal: gt, zoneOrder: zo, extraOrder: eo });

  const applyState = (s) => {
    if (!s) return;
    isRemoteUpdate.current = true;
    if (s.rentType) setRentType(s.rentType);
    if (s.rent !== undefined) setRent(s.rent);
    if (s.rentWorkshop !== undefined) setRentWorkshop(s.rentWorkshop);
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
    if (s.itemUrls) setItemUrls(s.itemUrls);
    if (s.avgCheck !== undefined) setAvgCheck(s.avgCheck);
    if (s.beStaff) setBeStaff(s.beStaff);
    if (s.beOther) setBeOther(s.beOther);
    if (s.zoneOrder) setZoneOrder(s.zoneOrder);
    if (s.extraOrder) setExtraOrder(s.extraOrder);
    if (s.itemTags) setItemTags(s.itemTags);
    if (s.legalItems) setLegalItems(s.legalItems);
    if (s.rentHolidayEnabled !== undefined) setRentHolidayEnabled(s.rentHolidayEnabled);
    if (s.rentHolidayMonths !== undefined) setRentHolidayMonths(s.rentHolidayMonths);
    if (s.rentHolidayAmount !== undefined) setRentHolidayAmount(s.rentHolidayAmount);
    setTimeout(() => { isRemoteUpdate.current = false; }, 0);
  };

  const applyPropertyState = (s) => {
    if (!s) return;
    isRemoteUpdate.current = true;
    if (s.rentType) setRentType(s.rentType);
    if (s.rent !== undefined) setRent(s.rent);
    if (s.rentWorkshop !== undefined) setRentWorkshop(s.rentWorkshop);
    if (s.depositMonths !== undefined) setDepositMonths(s.depositMonths);
    if (s.workingCapMonths !== undefined) setWorkingCapMonths(s.workingCapMonths);
    if (s.reserve !== undefined) setReserve(s.reserve);
    if (s.enabledZones) setEnabledZones(s.enabledZones);
    if (s.enabledItems) setEnabledItems(s.enabledItems);
    if (s.quantities) setQuantities(s.quantities);
    // Merge local extras with existing global extras
    if (s.extraItems) {
      setExtraItems(prev => {
        const merged = {};
        const allZones = new Set([...Object.keys(prev), ...Object.keys(s.extraItems)]);
        allZones.forEach(zoneId => {
          const globalItems = (prev[zoneId] || []).filter(it => it.global);
          const localItems = s.extraItems[zoneId] || [];
          merged[zoneId] = [...globalItems, ...localItems];
        });
        return merged;
      });
    }
    if (s.avgCheck !== undefined) setAvgCheck(s.avgCheck);
    if (s.beStaff) setBeStaff(s.beStaff);
    if (s.beOther !== undefined) setBeOther(s.beOther);
    if (s.bePhase !== undefined) setBePhase(s.bePhase);
    if (s.currentChecksDay !== undefined) setCurrentChecksDay(s.currentChecksDay);
    if (s.zoneOrder) setZoneOrder(s.zoneOrder);
    if (s.extraOrder) setExtraOrder(s.extraOrder);
    if (s.itemTags) setItemTags(s.itemTags);
    if (s.legalItems) setLegalItems(s.legalItems);
    if (s.rentHolidayEnabled !== undefined) setRentHolidayEnabled(s.rentHolidayEnabled);
    if (s.rentHolidayMonths !== undefined) setRentHolidayMonths(s.rentHolidayMonths);
    if (s.rentHolidayAmount !== undefined) setRentHolidayAmount(s.rentHolidayAmount);
    setTimeout(() => { isRemoteUpdate.current = false; }, 0);
  };

  useEffect(() => {
    const init = async () => {
      // 1. Load "в расчёте" properties
      const { data: rentalData } = await supabase.from('rental_options').select('id, data').order('created_at');
      const inCalc = (rentalData || []).filter(o => o.data?.status === 'в расчёте');
      setCalcProperties(inCalc);

      // 2. Load global item definitions
      const { data: globalData } = await supabase
        .from("smeta_state").select("state").eq("id", "_global").maybeSingle();
      if (globalData?.state) {
        const g = globalData.state;
        if (g.itemNames) setItemNames(g.itemNames);
        if (g.prices) setPrices(g.prices);
        if (g.itemUrls) setItemUrls(g.itemUrls);
        if (g.extraItems) {
          setExtraItems(prev => {
            const merged = { ...prev };
            Object.entries(g.extraItems).forEach(([zoneId, items]) => {
              merged[zoneId] = [...(merged[zoneId] || []).filter(it => !it.global), ...items];
            });
            return merged;
          });
        }
      }

      // 3. Determine which state to load
      const targetId = inCalc[0]?.id || 'main';
      setActivePropId(targetId);

      // 4. Load smeta state for target
      const { data } = await supabase.from("smeta_state").select("state").eq("id", targetId).maybeSingle();
      if (data?.state) {
        applyPropertyState(data.state);
      } else if (inCalc[0]?.data?.rent) {
        // No saved state yet — auto-set rent from property card
        setRent(Number(inCalc[0].data.rent));
      }

      // Load Finance recurring expenses
      const { data: finData } = await supabase.from('finance_state').select('data').eq('id', 'main').maybeSingle();
      if (finData?.data?.inputs) {
        const fi = finData.data.inputs;
        const monthly = (fi.utilities || 0) + (fi.marketing || 0) + (fi.accountant || 0) + (fi.other || 0);
        if (monthly > 0) setFinMonthly(monthly);
      }

      isRemoteUpdate.current = false;
    };

    isRemoteUpdate.current = true;
    init();

    // Realtime for smeta_state
    const channel = supabase.channel("smeta_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "smeta_state" }, (payload) => {
        if (payload.new?.id === '_global') {
          const g = payload.new?.state;
          if (!g) return;
          if (g.itemNames) setItemNames(g.itemNames);
          if (g.prices) setPrices(g.prices);
          if (g.itemUrls) setItemUrls(g.itemUrls);
          return;
        }
        if (payload.new?.id !== activePropId) return;
        // Игнорируем собственное эхо — мы сами только что сохранили это
        if (isSelfSaving.current) { isSelfSaving.current = false; return; }
        isRemoteUpdate.current = true;
        applyPropertyState(payload.new?.state);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      })
      .subscribe();

    // Realtime for rental_options
    const rentalChannel = supabase.channel('rental_for_budget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_options' }, async () => {
        const { data } = await supabase.from('rental_options').select('id, data').order('created_at');
        const inCalc = (data || []).filter(o => o.data?.status === 'в расчёте');
        setCalcProperties(inCalc);
      })
      .subscribe();

    const finChannel = supabase.channel('finance_for_budget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_state' }, (payload) => {
        const fi = payload.new?.data?.inputs;
        if (!fi) return;
        const monthly = (fi.utilities || 0) + (fi.marketing || 0) + (fi.accountant || 0) + (fi.other || 0);
        if (monthly > 0) setFinMonthly(monthly);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(rentalChannel);
      supabase.removeChannel(finChannel);
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!activePropId) return;
    supabase.from("smeta_state").select("state").eq("id", activePropId).maybeSingle()
      .then(({ data }) => {
        isRemoteUpdate.current = true;
        if (data?.state) {
          applyPropertyState(data.state);
        } else {
          // No saved state for this property — use defaults but set rent from card
          const prop = calcProperties.find(p => p.id === activePropId);
          if (prop?.data?.rent) {
            setRent(Number(prop.data.rent));
          }
        }
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      });
  }, [activePropId]); // eslint-disable-line

  const scheduleSave = (state) => {
    if (isRemoteUpdate.current) return;
    setSyncStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const saveId = activePropId || 'main';
      isSelfSaving.current = true; // помечаем: следующий realtime-эхо — наш
      const { error } = await supabase.from("smeta_state").upsert({ id: saveId, state, updated_at: new Date().toISOString() });
      setSyncStatus(error ? "error" : "saved");
      if (!error) setTimeout(() => setSyncStatus("idle"), 2000);
    }, 800);
  };

  const scheduleGlobalSave = (globalState) => {
    clearTimeout(globalSaveTimer.current);
    globalSaveTimer.current = setTimeout(async () => {
      await supabase.from("smeta_state").upsert({
        id: '_global',
        state: globalState,
        updated_at: new Date().toISOString()
      });
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

  // Effect A — global save
  useEffect(() => {
    if (isRemoteUpdate.current) return;
    const globalExtras = {};
    Object.entries(extraItems).forEach(([zoneId, items]) => {
      const g = items.filter(it => it.global);
      if (g.length > 0) globalExtras[zoneId] = g;
    });
    scheduleGlobalSave({ itemNames, prices, itemUrls, extraItems: globalExtras });
  }, [itemNames, prices, itemUrls, extraItems]); // eslint-disable-line

  // Effect B — per-property save
  useEffect(() => {
    if (!activePropId) return;
    const localExtras = {};
    Object.entries(extraItems).forEach(([zoneId, items]) => {
      const l = items.filter(it => !it.global);
      if (l.length > 0) localExtras[zoneId] = l;
    });
    const propertyState = {
      rentType, rent, rentWorkshop, depositMonths, workingCapMonths, reserve,
      enabledZones, enabledItems, quantities,
      extraItems: localExtras,
      avgCheck, beStaff, beOther, bePhase, currentChecksDay,
      grandTotal, zoneOrder, extraOrder,
      itemTags, legalItems, rentHolidayEnabled, rentHolidayMonths, rentHolidayAmount,
      equipOnlyTotal, laborTotal, legalTotal, capexTotal,
    };
    scheduleSave(propertyState);
  }, [rentType, rent, rentWorkshop, depositMonths, workingCapMonths, reserve, enabledZones, enabledItems, quantities, prices, extraItems, avgCheck, beStaff, beOther, bePhase, currentChecksDay, activePropId, zoneOrder, extraOrder, itemTags, legalItems, rentHolidayEnabled, rentHolidayMonths, rentHolidayAmount]); // eslint-disable-line

  // Ensure zoneOrder has entries for all zones (e.g. after new zones are added)
  const getZoneOrder = (zoneId, itemsLen) => {
    const order = zoneOrder[zoneId];
    if (order && order.length === itemsLen) return order;
    return Array.from({ length: itemsLen }, (_, i) => i);
  };
  const getExtraOrder = (zoneId, extrasLen) => {
    const order = extraOrder[zoneId];
    if (order && order.length === extrasLen) return order;
    return Array.from({ length: extrasLen }, (_, i) => i);
  };

  // Drag handlers for built-in items (reorder within zone only)
  const handleDragStartBuiltin = (zoneId, orderedIdx) => {
    dragState.current = { zoneId, orderedIdx, isExtra: false };
  };
  const handleDragOverBuiltin = (e, zoneId, orderedIdx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicator({ zoneId, beforeIdx: orderedIdx, isExtra: false });
  };
  const handleDropBuiltin = (e, zoneId, targetOrderedIdx, itemsLen) => {
    e.preventDefault();
    const ds = dragState.current;
    if (!ds || ds.isExtra) { setDropIndicator(null); return; }
    if (ds.zoneId !== zoneId) { setDropIndicator(null); return; } // no cross-zone for built-ins
    const order = [...getZoneOrder(zoneId, itemsLen)];
    const fromIdx = ds.orderedIdx;
    if (fromIdx === targetOrderedIdx) { setDropIndicator(null); return; }
    const [moved] = order.splice(fromIdx, 1);
    order.splice(targetOrderedIdx, 0, moved);
    setZoneOrder(p => ({ ...p, [zoneId]: order }));
    dragState.current = null;
    setDropIndicator(null);
  };
  const handleDragEndBuiltin = () => {
    dragState.current = null;
    setDropIndicator(null);
  };

  // Drag handlers for extra items (allow cross-zone)
  const handleDragStartExtra = (zoneId, orderedIdx) => {
    dragState.current = { zoneId, orderedIdx, isExtra: true };
  };
  const handleDragOverExtra = (e, zoneId, orderedIdx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicator({ zoneId, beforeIdx: orderedIdx, isExtra: true });
  };
  const handleDropExtra = (e, targetZoneId, targetOrderedIdx) => {
    e.preventDefault();
    const ds = dragState.current;
    if (!ds || !ds.isExtra) { setDropIndicator(null); return; }
    const srcZoneId = ds.zoneId;
    const srcOrderedIdx = ds.orderedIdx;
    setExtraItems(prev => {
      const srcExtras = [...(prev[srcZoneId] || [])];
      const srcOrder = getExtraOrder(srcZoneId, srcExtras.length);
      const realSrcIdx = srcOrder[srcOrderedIdx];
      const movedItem = srcExtras[realSrcIdx];
      if (!movedItem) return prev;

      if (srcZoneId === targetZoneId) {
        // Same zone — just reorder
        const newOrder = [...srcOrder];
        newOrder.splice(srcOrderedIdx, 1);
        newOrder.splice(targetOrderedIdx, 0, realSrcIdx);
        setExtraOrder(p => ({ ...p, [srcZoneId]: newOrder }));
        return prev;
      } else {
        // Cross-zone: remove from src, add to target
        const newSrcExtras = srcExtras.filter((_, i) => i !== realSrcIdx);
        const tgtExtras = [...(prev[targetZoneId] || []), movedItem];
        setExtraOrder(p => {
          const newSrcOrder = getExtraOrder(srcZoneId, srcExtras.length)
            .filter(i => i !== realSrcIdx)
            .map(i => i > realSrcIdx ? i - 1 : i);
          const newTgtOrder = [...getExtraOrder(targetZoneId, tgtExtras.length - 1), tgtExtras.length - 1];
          return { ...p, [srcZoneId]: newSrcOrder, [targetZoneId]: newTgtOrder };
        });
        return { ...prev, [srcZoneId]: newSrcExtras, [targetZoneId]: tgtExtras };
      }
    });
    dragState.current = null;
    setDropIndicator(null);
  };
  const handleDragEndExtra = () => {
    dragState.current = null;
    setDropIndicator(null);
  };

  const getUrl = (key, item) => itemUrls[key] !== undefined ? itemUrls[key] : (item?.url || "");
  const setUrl = (key, val) => setItemUrls(p => ({ ...p, [key]: val }));

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
  const opsMonthly = rent + rentWorkshop + finMonthly;
  const workingCap = opsMonthly * workingCapMonths;
  const grandTotal = equipTotal + depositTotal + workingCap + reserve;

  // Labor items (tagged 'labor') summed across all active zones
  const laborTotal = ALL_ZONES.reduce((sum, z) => {
    if (!enabledZones[z.id]) return sum;
    const base = z.items.reduce((s, item, i) => {
      const key = `${z.id}_${i}`;
      return (enabledItems[key] && itemTags[key] === 'labor')
        ? s + (prices[key] ?? item.brl) * (quantities[key] || 1) : s;
    }, 0);
    const extras = (extraItems[z.id] || []).reduce((s, ex, j) => {
      const key = `${z.id}_x${j}`;
      return (enabledItems[key] !== false && itemTags[key] === 'labor')
        ? s + (prices[key] ?? ex.brl) * (quantities[key] || 1) : s;
    }, 0);
    return sum + base + extras;
  }, 0);
  const equipOnlyTotal = equipTotal - laborTotal;
  const legalTotal = legalItems.reduce((s, it) => s + (it.brl || 0), 0);
  // CAPEX = оснащение (закупки) + залог аренды
  const capexTotal = equipOnlyTotal + depositTotal;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh", padding: "1rem 1rem 2rem" }}>

      {calcProperties.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
          overflowX: 'auto', paddingBottom: 4,
          borderBottom: '1px solid #ebebeb'
        }}>
          {calcProperties.map(prop => {
            const isActive = activePropId === prop.id;
            return (
              <button
                key={prop.id}
                onClick={() => setActivePropId(prop.id)}
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: 12,
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: isActive ? 'none' : '1px solid #e5e7eb',
                  background: isActive ? '#1a1a1a' : '#fff',
                  color: isActive ? '#fff' : '#666',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {prop.data.name || 'Объект'}
                {prop.data.rent ? ` · R$${Number(prop.data.rent).toLocaleString()}` : ''}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Конструктор инвестиций</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>БЕРЁЗКА — Инвестиционный бюджет по зонам</div>
          {activePropId && activePropId !== 'main' && (() => {
            const prop = calcProperties.find(p => p.id === activePropId);
            return prop ? (
              <div style={{ fontSize: 11, color: '#854d0e', background: '#fef9c3', borderRadius: 8, padding: '4px 12px', display: 'inline-block', marginTop: 8 }}>
                Расчёт для: {prop.data.name} · аренда R${Number(prop.data.rent||0).toLocaleString()}/мес
              </div>
            ) : null;
          })()}
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
        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>CAPEX (оснащение + залог)</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{fmt$(capexTotal)}</div>
            <div style={{ fontSize: 10, color: "#aaa" }}>{fmtR(capexTotal)}</div>
          </div>
          <div style={{ fontSize: 10, color: "#555", textAlign: "right", lineHeight: 1.6 }}>
            <div>оснащение {fmtR(equipOnlyTotal)}</div>
            <div>+ залог {fmtR(depositTotal)}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          {[
            ...(rentType === "land" && constructionTotal > 0 ? [{ l: "Стройка", v: fmt$(constructionTotal) }] : []),
            { l: "Оснащение (закупки)", v: fmt$(equipOnlyTotal - (rentType === "land" ? constructionTotal : 0)) },
            ...(laborTotal > 0 ? [{ l: "Ремонтные работы", v: fmt$(laborTotal) }] : []),
            ...(legalTotal > 0 ? [{ l: "Юр. расходы", v: fmt$(legalTotal) }] : []),
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
        <div style={{ fontSize: 12, fontWeight: 600, color: "#5C3D1E", marginBottom: 12, letterSpacing: 0.3 }}>⚙️ Параметры аренды и капитала</div>
        {[
          { label: "Аренда помещения/мес, R$",  val: rent,          set: setRent,          suffix: "" },
          { label: "Аренда цеха/мес, R$",       val: rentWorkshop,  set: setRentWorkshop,  suffix: "" },
          { label: "Залог (кол-во месяцев)",     val: depositMonths, set: setDepositMonths, suffix: " мес" },
          { label: "Оборотный капитал, мес", val: workingCapMonths, set: setWorkingCapMonths, suffix: " мес" },
          { label: "Резерв, R$",             val: reserve,          set: setReserve,          suffix: "" },
        ].map(({ label, val, set, suffix }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#444", minWidth: 240, flex: "0 0 240px" }}>{label}</div>
            <NumInput value={val} onChange={v => set(Math.max(0, v))} suffix={suffix} />
          </div>
        ))}
        {/* Арендные каникулы */}
        <div style={{ marginTop: 10, padding: "10px 12px", background: rentHolidayEnabled ? "#f0f7ed" : "#f7f7f5", borderRadius: 8, border: `1px solid ${rentHolidayEnabled ? "#b8d9b8" : "#e8e0d4"}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: rentHolidayEnabled ? 10 : 0 }}>
            <input type="checkbox" checked={rentHolidayEnabled} onChange={e => setRentHolidayEnabled(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: "#1a4f1a", cursor: "pointer" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: rentHolidayEnabled ? "#1a4f1a" : "#666" }}>
              🎁 Арендные каникулы
            </span>
          </label>
          {rentHolidayEnabled && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: "#444", minWidth: 200, flex: "0 0 200px" }}>Первые N месяцев, мес</div>
                <NumInput value={rentHolidayMonths} onChange={v => setRentHolidayMonths(Math.max(0, v))} suffix=" мес" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 12, color: "#444", minWidth: 200, flex: "0 0 200px" }}>Аренда в период каникул, R$</div>
                <NumInput value={rentHolidayAmount} onChange={v => setRentHolidayAmount(Math.max(0, v))} />
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
                Первые {rentHolidayMonths} мес × R${rentHolidayAmount.toLocaleString()}, затем R${rent.toLocaleString()}/мес
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, padding: "8px 10px", background: "#f7f7f5", borderRadius: 8, fontSize: 11, color: "#888" }}>
          <div>Ежемес. расходы: R${rent.toLocaleString()} аренда{rentWorkshop > 0 ? ` + R$${rentWorkshop.toLocaleString()} цех` : ""} + R${finMonthly.toLocaleString()} (из Финансов) = R${opsMonthly.toLocaleString()}/мес</div>
          <div style={{ marginTop: 2 }}>Оборотный кап: R${opsMonthly.toLocaleString()} × {workingCapMonths} мес = {fmtR(workingCap)} ({fmt$(workingCap)})</div>
        </div>
      </div>

      {/* ─── Юридическая смета ─── */}
      <div style={{ background: "#fff", borderRadius: 12, marginBottom: 12, border: `1px solid ${legalExpanded ? "#b8cfe0" : "#ebebeb"}` }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 10, cursor: "pointer" }}
          onClick={() => setLegalExpanded(p => !p)}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>Юридические и регистрационные расходы</span>
          <button onClick={e => { e.stopPropagation(); setLegalExpanded(true); setLegalEditing(p => !p); }}
            style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, cursor: "pointer",
              border: legalEditing ? "1px solid #1a1a1a" : "1px solid #ddd",
              background: legalEditing ? "#1a1a1a" : "#f7f7f5",
              color: legalEditing ? "#fff" : "#666", flexShrink: 0 }}>
            {legalEditing ? "✓ Готово" : "Изменить"}
          </button>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{fmt$(legalTotal)}</span>
          <span style={{ fontSize: 11, color: "#bbb", marginLeft: 4 }}>{legalExpanded ? "▲" : "▼"}</span>
        </div>
        {legalExpanded && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px 14px 12px" }}>
            {legalItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ flex: 1, fontSize: 12, color: "#444" }}>{item.name}</span>
                {legalEditing ? (
                  <>
                    <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                    <input type="number" value={item.brl} min={0}
                      onChange={e => setLegalItems(p => p.map((x,j) => j===i ? {...x, brl: Math.max(0,Number(e.target.value)||0)} : x))}
                      style={{ width: 70, textAlign: "right", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, padding: "2px 4px", MozAppearance: "textfield" }} />
                    <button onClick={() => setLegalItems(p => p.filter((_,j) => j!==i))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 15, padding: "0 2px", lineHeight: 1 }}>×</button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#333", minWidth: 80, textAlign: "right" }}>{fmtR(item.brl)}</span>
                )}
              </div>
            ))}
            {legalEditing && (
              legalNewDraft !== null ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                  <input autoFocus placeholder="Название..." value={legalNewDraft.name || ""}
                    onChange={e => setLegalNewDraft(p => ({...p, name: e.target.value}))}
                    onKeyDown={e => { if (e.key === "Escape") setLegalNewDraft(null) }}
                    style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "4px 8px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                  <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                  <input type="number" placeholder="0" value={legalNewDraft.brl || ""}
                    onChange={e => setLegalNewDraft(p => ({...p, brl: Number(e.target.value)||0}))}
                    style={{ width: 70, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px", fontFamily: "Georgia,serif", fontSize: 12, MozAppearance: "textfield" }} />
                  <button onClick={() => { if (!legalNewDraft.name?.trim()) return; setLegalItems(p => [...p, {name: legalNewDraft.name.trim(), brl: legalNewDraft.brl||0}]); setLegalNewDraft(null); }}
                    style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 12, cursor: "pointer" }}>+</button>
                  <button onClick={() => setLegalNewDraft(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14 }}>✗</button>
                </div>
              ) : (
                <button onClick={() => setLegalNewDraft({name: "", brl: 0})}
                  style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, border: "1.5px dashed #ddd", background: "transparent", fontSize: 11, color: "#999", cursor: "pointer" }}>
                  + добавить строку
                </button>
              )
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1a3a5f" }}>
                Итого: {fmtR(legalTotal)} / {fmt$(legalTotal)}
              </div>
            </div>
          </div>
        )}
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
                {getZoneOrder(zone.id, zone.items.length).map((i, orderedIdx) => {
                  const item = zone.items[i];
                  const key = `${zone.id}_${i}`;
                  const on = enabledItems[key];
                  const qty = quantities[key] || 1;
                  const price = prices[key] ?? item.brl;
                  const lineTotal = price * qty;
                  const displayName = itemNames[key] ?? item.name;
                  const isEditingThisName = editingName?.zoneId === zone.id && editingName?.idx === i && !editingName?.extra;
                  const itemUrl = getUrl(key, item);
                  const isDropTarget = dropIndicator?.zoneId === zone.id && dropIndicator?.beforeIdx === orderedIdx && !dropIndicator?.isExtra;
                  return (
                    <div key={i}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; handleDragStartBuiltin(zone.id, orderedIdx); }}
                      onDragOver={(e) => handleDragOverBuiltin(e, zone.id, orderedIdx)}
                      onDrop={(e) => handleDropBuiltin(e, zone.id, orderedIdx, zone.items.length)}
                      onDragEnd={handleDragEndBuiltin}
                      style={{ borderBottom: "1px solid #f5f5f5", opacity: on ? 1 : 0.35, borderTop: isDropTarget ? "2px solid #3b82f6" : undefined }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
                      <span title="Перетащить" style={{ cursor: 'grab', opacity: 0.3, userSelect: 'none', paddingRight: 2, fontSize: 13, flexShrink: 0 }}>⋮⋮</span>
                      <input type="checkbox" checked={on} onChange={() => toggleItem(zone.id, i)}
                        style={{ width: 14, height: 14, accentColor: "#1a1a1a", cursor: "pointer", flexShrink: 0 }} />
                      {isEdit && isEditingThisName ? (
                        <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                          onBlur={() => { setItemNames(p => ({ ...p, [key]: nameDraft })); setEditingName(null); }}
                          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setItemNames(p => ({ ...p, [key]: nameDraft })); setEditingName(null); } }}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "2px 6px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                      ) : (
                        <span onClick={() => isEdit && (setEditingName({ zoneId: zone.id, idx: i }), setNameDraft(displayName))}
                          style={{ flex: 1, fontSize: 12, color: "#444", lineHeight: 1.3, cursor: isEdit ? "text" : "default" }}>
                          {displayName}
                          {!isEdit && itemUrl && (
                            <a href={itemUrl} target="_blank" rel="noopener noreferrer"
                              style={{ marginLeft: 5, fontSize: 11, color: "#3b82f6", textDecoration: "none" }}>🔗</a>
                          )}
                        </span>
                      )}

                      {isEdit ? (
                        <>
                          <select value={itemTags[key] || 'purchase'}
                            onChange={e => setItemTags(p => ({ ...p, [key]: e.target.value }))}
                            style={{ fontSize: 10, border: "1px solid #ddd", borderRadius: 4, padding: "2px 4px", background: itemTags[key] === 'labor' ? "#fef9ed" : "#f0f7ed", color: itemTags[key] === 'labor' ? "#92400e" : "#1a4f1a", cursor: "pointer", flexShrink: 0 }}>
                            <option value="purchase">закупка</option>
                            <option value="labor">работа</option>
                          </select>
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
                          {itemTags[key] === 'labor' && (
                            <div style={{ fontSize: 9, color: "#92400e", background: "#fef9ed", borderRadius: 3, padding: "1px 5px", marginBottom: 2, display: "inline-block" }}>работа</div>
                          )}
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
                    {isEdit && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 20, paddingBottom: 5 }}>
                        <span style={{ fontSize: 10, color: "#bbb" }}>🔗</span>
                        <input
                          value={itemUrls[key] !== undefined ? itemUrls[key] : (item.url || "")}
                          onChange={e => setUrl(key, e.target.value)}
                          placeholder="ссылка на покупку (MercadoLivre, OLX…)"
                          style={{ flex: 1, border: "1px solid #ebebeb", borderRadius: 4, padding: "2px 6px", fontFamily: "Georgia,serif", fontSize: 10, color: "#666", outline: "none", background: "#fafafa" }}
                        />
                      </div>
                    )}
                    </div>
                  );
                })}

                {/* Extra items added by user */}
                {getExtraOrder(zone.id, (extraItems[zone.id] || []).length).map((j, orderedIdx) => {
                  const ex = (extraItems[zone.id] || [])[j];
                  if (!ex) return null;
                  const xKey = `${zone.id}_x${j}`;
                  const xOn = enabledItems[xKey] !== false;
                  const xQty = quantities[xKey] || 1;
                  const xPrice = prices[xKey] ?? ex.brl;
                  const isEditingExtra = editingName?.zoneId === zone.id && editingName?.idx === j && editingName?.extra;
                  const xUrl = itemUrls[xKey] || "";
                  const isDropTarget = dropIndicator?.zoneId === zone.id && dropIndicator?.beforeIdx === orderedIdx && dropIndicator?.isExtra;
                  return (
                    <div key={`x${j}`}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; handleDragStartExtra(zone.id, orderedIdx); }}
                      onDragOver={(e) => handleDragOverExtra(e, zone.id, orderedIdx)}
                      onDrop={(e) => handleDropExtra(e, zone.id, orderedIdx)}
                      onDragEnd={handleDragEndExtra}
                      style={{ borderBottom: "1px solid #f5f5f5", opacity: xOn ? 1 : 0.35, borderTop: isDropTarget ? "2px solid #3b82f6" : undefined }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
                      <span title="Перетащить" style={{ cursor: 'grab', opacity: 0.3, userSelect: 'none', paddingRight: 2, fontSize: 13, flexShrink: 0 }}>⋮⋮</span>
                      <input type="checkbox" checked={xOn} onChange={() => setEnabledItems(p => ({ ...p, [xKey]: !xOn }))}
                        style={{ width: 14, height: 14, accentColor: "#1a1a1a", cursor: "pointer", flexShrink: 0 }} />
                      {isEdit && isEditingExtra ? (
                        <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                          onBlur={() => { setExtraItems(p => ({ ...p, [zone.id]: (p[zone.id]||[]).map((x,jj)=>jj===j?{...x,name:nameDraft}:x) })); setEditingName(null); }}
                          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setExtraItems(p => ({ ...p, [zone.id]: (p[zone.id]||[]).map((x,jj)=>jj===j?{...x,name:nameDraft}:x) })); setEditingName(null); } }}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "2px 6px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                      ) : (
                        <span onClick={() => isEdit && (setEditingName({ zoneId: zone.id, idx: j, extra: true }), setNameDraft(ex.name))}
                          style={{ flex: 1, fontSize: 12, color: "#444", cursor: isEdit ? "text" : "default" }}>
                          {ex.name}
                          {!isEdit && xUrl && (
                            <a href={xUrl} target="_blank" rel="noopener noreferrer"
                              style={{ marginLeft: 5, fontSize: 11, color: "#3b82f6", textDecoration: "none" }}>🔗</a>
                          )}
                        </span>
                      )}
                      {isEdit ? (
                        <>
                          <select value={itemTags[xKey] || 'purchase'}
                            onChange={e => setItemTags(p => ({ ...p, [xKey]: e.target.value }))}
                            style={{ fontSize: 10, border: "1px solid #ddd", borderRadius: 4, padding: "2px 4px", background: itemTags[xKey] === 'labor' ? "#fef9ed" : "#f0f7ed", color: itemTags[xKey] === 'labor' ? "#92400e" : "#1a4f1a", cursor: "pointer", flexShrink: 0 }}>
                            <option value="purchase">закупка</option>
                            <option value="labor">работа</option>
                          </select>
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
                          {itemTags[xKey] === 'labor' && (
                            <div style={{ fontSize: 9, color: "#92400e", background: "#fef9ed", borderRadius: 3, padding: "1px 5px", marginBottom: 2, display: "inline-block" }}>работа</div>
                          )}
                          {xPrice === 0 ? <span style={{ fontSize: 11, color: "#999" }}>бесплатно</span>
                            : <div style={{ fontSize: 12, fontWeight: 500 }}>{fmtR(xPrice * xQty)}</div>}
                        </div>
                      )}
                    </div>
                    {isEdit && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 20, paddingBottom: 5 }}>
                        <span style={{ fontSize: 10, color: "#bbb" }}>🔗</span>
                        <input
                          value={xUrl}
                          onChange={e => setUrl(xKey, e.target.value)}
                          placeholder="ссылка на покупку…"
                          style={{ flex: 1, border: "1px solid #ebebeb", borderRadius: 4, padding: "2px 6px", fontFamily: "Georgia,serif", fontSize: 10, color: "#666", outline: "none", background: "#fafafa" }}
                        />
                      </div>
                    )}
                    </div>
                  );
                })}

                {/* Add row */}
                {isEdit && (
                  newRowDraft[zone.id] !== undefined ? (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input autoFocus placeholder="Название строки..." value={newRowDraft[zone.id]?.name || ""}
                          onChange={e => setNewRowDraft(p => ({ ...p, [zone.id]: { ...p[zone.id], name: e.target.value } }))}
                          onKeyDown={e => { if (e.key === "Escape") setNewRowDraft(p => { const n={...p}; delete n[zone.id]; return n; }); }}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "4px 8px", fontFamily: "Georgia,serif", fontSize: 12, outline: "none" }} />
                        <select value={newRowDraft[zone.id]?.tag || 'purchase'}
                          onChange={e => setNewRowDraft(p => ({ ...p, [zone.id]: { ...p[zone.id], tag: e.target.value } }))}
                          style={{ fontSize: 11, border: "1px solid #ddd", borderRadius: 5, padding: "3px 5px", background: newRowDraft[zone.id]?.tag === 'labor' ? "#fef9ed" : "#f0f7ed", color: newRowDraft[zone.id]?.tag === 'labor' ? "#92400e" : "#1a4f1a", cursor: "pointer" }}>
                          <option value="purchase">закупка</option>
                          <option value="labor">работа</option>
                        </select>
                        <span style={{ fontSize: 10, color: "#aaa" }}>R$</span>
                        <input type="number" placeholder="0" value={newRowDraft[zone.id]?.brl || ""}
                          onChange={e => setNewRowDraft(p => ({ ...p, [zone.id]: { ...p[zone.id], brl: Number(e.target.value)||0 } }))}
                          style={{ width: 70, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px", fontFamily: "Georgia,serif", fontSize: 12, MozAppearance: "textfield" }} />
                        <button onClick={() => {
                          const row = newRowDraft[zone.id];
                          if (!row?.name?.trim()) return;
                          const newExtras = [...(extraItems[zone.id]||[]), { name: row.name.trim(), brl: row.brl||0, global: row.global || false }];
                          const newIdx = newExtras.length - 1;
                          const xKey = `${zone.id}_x${newIdx}`;
                          if (row.tag === 'labor') setItemTags(p => ({ ...p, [xKey]: 'labor' }));
                          setExtraItems(p => ({ ...p, [zone.id]: newExtras }));
                          setNewRowDraft(p => { const n={...p}; delete n[zone.id]; return n; });
                        }} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 12, cursor: "pointer" }}>+</button>
                        <button onClick={() => setNewRowDraft(p => { const n={...p}; delete n[zone.id]; return n; })}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14 }}>✗</button>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', marginTop: 4 }}>
                        <input
                          type="checkbox"
                          checked={newRowDraft[zone.id]?.global || false}
                          onChange={e => setNewRowDraft(p => ({ ...p, [zone.id]: { ...p[zone.id], global: e.target.checked } }))}
                        />
                        Для всех объектов
                      </label>
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

                {zone.id === "territory" && <LgpdNote />}
              </div>
            )}
          </div>
          </Fragment>
        );
      })}

      <div style={{ marginTop: 8, padding: "12px 14px", background: "#1a1a1a", borderRadius: 12, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: laborTotal > 0 || legalTotal > 0 ? 8 : 0 }}>
          <div style={{ fontSize: 12, color: "#aaa" }}>Оснащение + работы по зонам</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{fmt$(equipTotal)} / {fmtR(equipTotal)}</div>
        </div>
        {(laborTotal > 0 || legalTotal > 0) && (
          <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
            <span style={{ color: "#aaa" }}>закупки: <b style={{ color: "#fff" }}>{fmtR(equipOnlyTotal)}</b></span>
            {laborTotal > 0 && <span style={{ color: "#aaa" }}>работы: <b style={{ color: "#f0d97a" }}>{fmtR(laborTotal)}</b></span>}
            {legalTotal > 0 && <span style={{ color: "#aaa" }}>юр.: <b style={{ color: "#b8cfe0" }}>{fmtR(legalTotal)}</b></span>}
            <span style={{ color: "#aaa" }}>буфер 10%: <b style={{ color: "#cfb8e0" }}>{fmtR(Math.round(equipTotal * 0.1))}</b></span>
          </div>
        )}
      </div>
    </div>
  );
}
