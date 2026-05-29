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
      { name: "Freezer б/у", brl: 1000, url: OLX("freezer horizontal comercial usado") },
      { name: "Mesa inox + Pia inox dupla б/у", brl: 1700, url: OLX("mesa pia inox dupla cozinha comercial") },
      { name: "Exaustor (вытяжка)", brl: 1200, url: ML("exaustor coifa industrial cozinha") },
      { name: "Forno de convecção б/у", brl: 1500, url: OLX("forno convecção eletrico usado comercial") },
      { name: "Batedeira + panelas inox набор", brl: 1200, url: ML("batedeira industrial panela inox kit") },
      { name: "Мясорубка профессиональная б/у", brl: 650, url: OLX("moedor de carne elétrico profissional usado") },
      { name: "Fritadeira (фритюрница) б/у", brl: 500, url: OLX("fritadeira elétrica comercial usado") },
      { name: "Блинные сковороды × 3", brl: 150, url: ML("frigideira crepe bliny antiaderente") },
      { name: "Кастрюли большие × 3 + средние × 3", brl: 500, url: ML("panela inox caldeirão grande conjunto") },
      { name: "Посудомоечная машина б/у", brl: 2000, url: OLX("lava louça industrial comercial usado") },
      { name: "Ремонт кухни (плитка, стены, под VISA)", brl: 2000, url: "" },
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

const FOOD_COST_PCT = 0.30;
const TAX_PCT = 0.08;

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
  // BEP editable inputs
  const [avgCheck, setAvgCheck] = useState(52);
  const [beStaff, setBeStaff] = useState({ 1: 8500, 2: 15000, 3: 15000 });   // ФОТ по этапам
  const [beOther, setBeOther] = useState({ 1: 3500, 2: 5000,  3: 6000 });    // прочие расходы по этапам
  const saveTimer = useRef(null);
  const isRemoteUpdate = useRef(false);

  const buildState = (rt, r, d, wc, res, ez, ei, q, p, bp, cd, names, extras, urls, ac, bst, bot) => ({ rentType: rt, rent: r, depositMonths: d, workingCapMonths: wc, reserve: res, enabledZones: ez, enabledItems: ei, quantities: q, prices: p, bePhase: bp, currentChecksDay: cd, itemNames: names, extraItems: extras, itemUrls: urls, avgCheck: ac, beStaff: bst, beOther: bot });

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
    if (s.itemUrls) setItemUrls(s.itemUrls);
    if (s.avgCheck !== undefined) setAvgCheck(s.avgCheck);
    if (s.beStaff) setBeStaff(s.beStaff);
    if (s.beOther) setBeOther(s.beOther);
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
    scheduleSave(buildState(rentType, rent, depositMonths, workingCapMonths, reserve, enabledZones, enabledItems, quantities, prices, bePhase, currentChecksDay, itemNames, extraItems, itemUrls, avgCheck, beStaff, beOther));
  }, [rentType, rent, depositMonths, workingCapMonths, reserve, enabledZones, enabledItems, quantities, prices, bePhase, currentChecksDay, itemNames, extraItems, itemUrls, avgCheck, beStaff, beOther]);

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
                  const itemUrl = getUrl(key, item);
                  return (
                    <div key={i} style={{ borderBottom: "1px solid #f5f5f5", opacity: on ? 1 : 0.35 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
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
                {(extraItems[zone.id] || []).map((ex, j) => {
                  const xKey = `${zone.id}_x${j}`;
                  const xOn = enabledItems[xKey] !== false;
                  const xQty = quantities[xKey] || 1;
                  const xPrice = prices[xKey] ?? ex.brl;
                  const isEditingExtra = editingName?.zoneId === zone.id && editingName?.idx === j && editingName?.extra;
                  const xUrl = itemUrls[xKey] || "";
                  return (
                    <div key={`x${j}`} style={{ borderBottom: "1px solid #f5f5f5", opacity: xOn ? 1 : 0.35 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
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
