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
  { name: "Меловая стена (краска + мелки)", who: "сама", brl: 400, done: false },
  { name: "Ростомер (краска + кисти)", who: "сама", brl: 150, done: false },
  { name: "Типи (бамбук + ткань + фонарики) — ФОТО-ЗОНА ДЛЯ МАМ 📸", who: "сама", brl: 400, done: false },
  { name: "Фонарики outdoor IP44 × 2 набора", who: "купить", brl: 400, done: false },
  { name: "Удлинитель уличный влагозащищённый", who: "купить", brl: 150, done: false },
  { name: "Грязевая кухня (поддоны)", who: "сама", brl: 500, done: false },
  { name: "Посуда для кухни (металл б/у)", who: "купить", brl: 200, done: false },
  { name: "Детские инструменты (лопата, грабли, лейка)", who: "купить", brl: 250, done: false },
  { name: "Ящики с природными материалами", who: "сама", brl: 200, done: false },
  { name: "Детский огород + семена", who: "сама", brl: 300, done: false },
  { name: "Пни-ступеньки", who: "купить (OLX)", brl: 600, done: false },
  { name: "Водный жёлоб из бамбука", who: "сама (бесплатно)", brl: 0, done: false },
  { name: "Песок", who: "купить", brl: 300, done: false },
  { name: "Пропитка для дерева", who: "купить", brl: 150, done: false },
  { name: "Контейнер для хранения", who: "купить", brl: 200, done: false },
  { name: "Крестики-нолики (камни + пень)", who: "сама", brl: 0, done: false },
  { name: "Забор детской зоны", who: "сама", brl: 0, done: false },
  { name: "Слэклайн между деревьями", who: "купить (MercadoLivre)", brl: 150, done: false },
  { name: "Качели на дерево (доска + верёвка + ленты)", who: "сама (если ветка позволяет)", brl: 170, done: false },
  { name: "Куры (3–4 штуки)", who: "купить (feira/OLX)", brl: 400, done: false },
  { name: "Кормушка + поилка", who: "купить", brl: 150, done: false },
  { name: "Вертикальный огород из поддонов", who: "сама", brl: 300, done: false },
  { name: "Горшки + земля + семена трав", who: "купить", brl: 300, done: false },
];

const initialStaff = [
  { role: "Повар на смене", status: "2 человека — сменный график", visa: "Местный найм", notes: "5 дней через 2, или через день. Разогревает супы, жарит блины/сырники, собирает тарелки. Не нужен русский шеф — заготовки сделаны заранее. Зарплата R$2 800 × 1.7 = R$4 760 каждый → R$9 520/мес", urgent: false },
  { role: "Бариста + официант", status: "2 человека — сменный график", visa: "Местный найм", notes: "Кофе, подача, касса, общение с гостями. Желательно базовый английский или русский. Зарплата R$2 200 × 1.7 = R$3 740 каждый → R$7 480/мес", urgent: false },
  { role: "Заготовщик", status: "1 человек — 3 дня/нед", visa: "Местный найм", notes: "Лепит пельмени/вареники, варит супы, делает котлеты, готовит выпечку. Приходит 3 дня в неделю на 4–5 часов. Зарплата R$2 000 × 1.7 = R$3 400/мес. Может быть Регина на старте.", urgent: false },
  { role: "Auxiliar geral (посуда + уборка)", status: "1 человек", visa: "Местный найм", notes: "Моет посуду во время сервиса + убирает зал и кухню после закрытия + помогает на заготовках. С промышленной посудомоечной машиной справляется один. Зарплата R$1 800 × 1.7 = R$3 060/мес", urgent: false },
  { role: "Бухгалтер онлайн (contabilidade)", status: "Аутсорс", visa: "—", notes: "Считает налоги, подаёт декларации, рассчитывает зарплаты с encargos. ~R$700/мес. Найти в Кампеше или онлайн.", urgent: true },
];

const initialTodos = [
  { text: "Записаться на осмотр помещения — Santa Ilha (48) 3206-4700", tag: "🏠 Помещение", done: true },
  { text: "На просмотре: проверить газ, вытяжку, зонирование, IPTU, разрешение на реформы и кур", tag: "🏠 Помещение", done: false },
  { text: "После выбора: подписать договор через юриста (залог + R$1 500 юрист)", tag: "🏠 Помещение", done: false },
  { text: "Установить камеры × 4 + DVR до открытия", tag: "🏠 Помещение", done: false },
  { text: "Спросить арендодателя: разрешено ли держать кур на участке?", tag: "🐔 Деревня", done: false },
  { text: "Выбрать правовую форму — ME (Microempresa): доход до R$360 000/год, можно сотрудников, Simples Nacional. Обсудить с contabilidade.", tag: "📋 Документы", done: false },
  { text: "Найти contabilidade в Кампеше — приоритет сразу после помещения", tag: "📋 Документы", done: false },
  { text: "День 1: открыть CNPJ онлайн через Receita Federal (1–3 дня)", tag: "📋 Документы", done: false },
  { text: "Мес 1: подать на Alvará de Funcionamento в Prefeitura (срок 1–3 мес)", tag: "📋 Документы", done: false },
  { text: "Мес 1–4: подать на VISA (Vigilância Sanitária) — параллельно с ремонтом (срок 3–6 мес, критический путь!)", tag: "📋 Документы", done: false },
  { text: "Мес 2: подать на Alvará Bombeiros после получения Alvará de Funcionamento (срок 1–2 мес)", tag: "📋 Документы", done: false },
  { text: "Перед открытием: оформить COMCAP (вывоз мусора, 5–10 дней)", tag: "📋 Документы", done: false },
  { text: "Перед открытием: зарегистрироваться в ECAD (лицензия музыка, ~R$200/мес)", tag: "📋 Документы", done: false },
  { text: "Купить Seguro Empresarial с включённой responsabilidade civil — покрывает имущество + клиентов + детскую зону. Porto Seguro / Bradesco / Tokio Marine. ~R$300–500/мес", tag: "⚠️ Риски", done: false },
  { text: "Нанять бариста/официанта × 2 (сменный график) — за 2 нед до открытия", tag: "👤 Сотрудники", done: false },
  { text: "Нанять auxiliar geral (посуда + уборка) — за 1 нед до открытия", tag: "👤 Сотрудники", done: false },
  { text: "Нанять заготовщика (3 дня/нед) — к Этапу 2", tag: "👤 Сотрудники", done: false },
  { text: "Нанять поваров × 2 (сменный) — к открытию кухни (Этап 2)", tag: "👤 Сотрудники", done: false },
  { text: "Составить рецептурные карты: точная себестоимость каждого блюда", tag: "🍳 Кухня", done: false },
  { text: "Протестировать все блюда меню дома — зафиксировать время готовки и себестоимость", tag: "🍳 Кухня", done: false },
  { text: "Написать Kaska Playgrounds (12) 98149-6772 — запрос 3D проекта детской зоны", tag: "👶 Детская зона", done: false },
  { text: "Найти бамбук бесплатно — группы WhatsApp Campeche / OLX", tag: "👶 Детская зона", done: false },
  { text: "Найти курятник (OLX или мастер) + 4 курицы", tag: "🐔 Деревня", done: false },
  { text: "Составить расписание мастер-классов и форму записи через Instagram", tag: "👶 Детская зона", done: false },
  { text: "Выбрать название: Dacha / Berezka / Avul / Ert", tag: "💡 Концепция", done: false },
  { text: "Изучить конкурентов: Sehat (Campeche) и другие кафе с детской зоной — цены, трафик", tag: "💡 Концепция", done: false },
  { text: "Создать Instagram @[название].floripa — публиковать контент до открытия", tag: "📸 Instagram", done: false },
  { text: "Написать в русскоязычные чаты Флорипы о скором открытии", tag: "📸 Instagram", done: false },
];

const initialAdmin = [
  {
    id: "finance", emoji: "💰", title: "Финансы",
    items: [
      { text: "Открыть Conta PJ — Nubank / Inter / Sicoob (нужен CNPJ)", done: false, urgent: true },
      { text: "Настроить SumUp/InfinitePay — регистрация + интеграция с NF-e", done: false, urgent: true },
      { text: "Настроить NF-e (nota fiscal) через contabilidade", done: false, urgent: true },
      { text: "Создать таблицу ежедневного учёта выручки и расходов", done: false, urgent: false },
      { text: "Настроить раздельный учёт по зонам (кафе / детская зона / мастер-классы)", done: false, urgent: false },
      { text: "Открыть резервный фонд R$15 000 — не трогать без форс-мажора", done: false, urgent: false },
    ]
  },
  {
    id: "hr", emoji: "👤", title: "Персонал",
    items: [
      { text: "Все сотрудники кто касается еды — курс Manipulador de Alimentos (онлайн, R$50–80)", done: false, urgent: true },
      { text: "Выбрать форму договора: CLT vs PJ для каждой позиции — обсудить с contabilidade", done: false, urgent: true },
      { text: "Составить описание обязанностей для каждой роли", done: false, urgent: false },
      { text: "Написать SOP — стандарты открытия и закрытия кафе", done: false, urgent: false },
      { text: "Написать SOP — кухня: заготовки, хранение, разморозка, списание", done: false, urgent: false },
      { text: "Написать SOP — детская зона: уборка, безопасность, инциденты", done: false, urgent: false },
      { text: "Составить расписание смен на первый месяц", done: false, urgent: false },
    ]
  },
  {
    id: "safety", emoji: "🔒", title: "Безопасность",
    items: [
      { text: "Огнетушители — купить и разместить по плану Bombeiros (мин. 2 шт)", done: false, urgent: true },
      { text: "Аптечка первой помощи — укомплектовать по ANVISA", done: false, urgent: true },
      { text: "Доступность для инвалидов (acessibilidade) — пандус, туалет, проходы", done: false, urgent: true },
      { text: "Placas de saída de emergência (таблички аварийного выхода)", done: false, urgent: true },
      { text: "Составить план эвакуации и разместить на стенах", done: false, urgent: false },
      { text: "Процедура при несчастном случае с ребёнком — кто звонит, куда везут", done: false, urgent: false },
    ]
  },
  {
    id: "brand", emoji: "🎨", title: "Бренд",
    items: [
      { text: "Выбрать название: Dacha / Berezka / Avul / Ert", done: false, urgent: true },
      { text: "Создать логотип — шрифт Cormorant/Playfair + минимальный символ (лист, колосок)", done: false, urgent: true },
      { text: "Определить цветовую палитру (кремовый / тёмно-коричневый / зелёный / терракот)", done: false, urgent: false },
      { text: "Дизайн физического меню — двуязычное PT/RU, формат A4 или доска", done: false, urgent: false },
      { text: "Дизайн семян в крафт-пакетах с лого Берёзки", done: false, urgent: false },
      { text: "Брендированные футболки персонала × 8 шт", done: false, urgent: false },
      { text: "Шаблоны Stories для Instagram (5–7 форматов)", done: false, urgent: false },
    ]
  },
  {
    id: "ops", emoji: "⚙️", title: "Операции",
    items: [
      { text: "Настроить Wi-Fi — отдельная сеть для гостей и для работы", done: false, urgent: true },
      { text: "Составить рецептурные карты — граммовки + себестоимость каждого блюда", done: false, urgent: true },
      { text: "Система учёта продуктов — таблица: приход / расход / остаток", done: false, urgent: false },
      { text: "Система бронирований столиков — WhatsApp + Google Calendar", done: false, urgent: false },
      { text: "Система аренды под мероприятия — договор + чеклист", done: false, urgent: false },
      { text: "Ежедневный чеклист кафе — открытие / закрытие / уборка", done: false, urgent: false },
      { text: "Политика детской зоны — возраст, правила, ответственность родителей", done: false, urgent: false },
      { text: "График мастер-классов — расписание, запись, оплата", done: false, urgent: false },
    ]
  },
  {
    id: "marketing", emoji: "📱", title: "Маркетинг",
    items: [
      { text: "Создать Instagram @[название].floripa — начать постить за 4–6 нед до открытия", done: false, urgent: true },
      { text: "Зарегистрировать кафе в Google Maps (Google Meu Negócio)", done: false, urgent: true },
      { text: "Написать в русскоязычные чаты Флорипы — анонс открытия", done: false, urgent: false },
      { text: "Pre-launch контент — 9 постов: стройка, концепция, меню, команда, дети", done: false, urgent: false },
      { text: "Программа лояльности — карточка '6 кофе = 1 бесплатно'", done: false, urgent: false },
      { text: "Сайт — простая landing page (joinmoms.app / berezka.com.br)", done: false, urgent: false },
      { text: "Партнёрство с Moms App — кафе как точка сбора аудитории", done: false, urgent: false },
      { text: "Блогеры за депозит на еду — пригласить на закрытый предпросмотр", done: false, urgent: false },
      { text: "Решить: будет ли доставка iFood / Rappi?", done: false, urgent: false },
    ]
  },
  {
    id: "accounting", emoji: "📊", title: "Бухгалтерия",
    items: [
      { text: "Выбрать и нанять contabilidade — встреча, проверка цены (~R$700/мес)", done: false, urgent: true },
      { text: "Зарегистрироваться в Simples Nacional через contabilidade", done: false, urgent: true },
      { text: "Настроить ежемесячную отчётность: выручка / расходы / налог DAS", done: false, urgent: false },
      { text: "Понять: как правильно платить зарплаты и encargos (FGTS, INSS, férias)", done: false, urgent: false },
      { text: "Настроить хранение документов — договоры, накладные, NF-e", done: false, urgent: false },
    ]
  },
  {
    id: "legal", emoji: "⚖️", title: "Юридические вопросы",
    items: [
      { text: "Выбрать правовую форму: ME — проверить лимиты и ответственность", done: false, urgent: true },
      { text: "Проверить договор аренды с юристом перед подписанием", done: false, urgent: true },
      { text: "Зарегистрировать CNPJ онлайн через gov.br", done: false, urgent: true },
      { text: "Политика детской зоны — правила использования, возраст, ответственность", done: false, urgent: false },
      { text: "Политика аренды под мероприятия — договор + депозит + условия отмены", done: false, urgent: false },
      { text: "Политика возврата — оплата, отмена брони, жалобы", done: false, urgent: false },
      { text: "LGPD (защита данных) — если собираешь контакты в Instagram/WhatsApp", done: false, urgent: false },
      { text: "Seguro Empresarial (страховка) — Porto Seguro / Bradesco ~R$400/мес", done: false, urgent: false },
    ]
  },
];

const pillars = [
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

// ── БДР 5 ЛЕТ ────────────────────────────────────────────────────────────────
const BDR_SCENARIOS = [
  {
    id: 'pessimistic',
    label: 'Пессимистичный',
    emoji: '📉',
    color: '#dc2626', bg: '#fef2f2', border: '#fca5a5',
    // Среднемесячная выручка по годам (R$)
    rev:   [15000, 25000, 34000, 40000, 45000],
    // Среднемесячные постоянные расходы по годам (аренда + зарплаты + оверхед, без food cost и налога)
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

function BDRTable() {
  const [active, setActive] = useState('realistic');
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
      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: '#e8e0d4' }} />
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa' }}>БДР · 5 лет</span>
        <div style={{ flex: 1, height: 1, background: '#e8e0d4' }} />
      </div>

      {/* Scenario tabs */}
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

      {/* Scenario note */}
      <div style={{ fontSize: 11, color: '#888', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 14, lineHeight: 1.5 }}>
        {sc.note}
      </div>

      {/* Table */}
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
            {/* Cumulative profit row */}
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

      {/* Okupaemost */}
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

      {/* Monthly breakdown hint */}
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
    num: 1, title: "Этап 1 (месяц 1-2)", color: "#EAF3DE", border: "#639922", text: "#3B6D11",
    desc: "Кофе + напитки + детская зона платная. Кухня не открыта.",
    items: ["Specialty кофе, матча, фильтр с первого дня", "Платный вход в детскую зону R$18/ребёнок", "Запас кофе + напитки ~R$2 000", "CNPJ + базовый alvará (~R$1 500)", "Касса SumUp/InfinitePay (бесплатно)"],
  },
  {
    num: 2, title: "Этап 2 (месяц 3-5)", color: "#E6F1FB", border: "#185FA5", text: "#0C447C",
    desc: "Открытие кухни. Завтраки + обеды. Детская зона бесплатно.",
    items: ["Полное меню: борщ, пельмени, сырники, блины", "Детская зона бесплатно — на трафик", "Alvará sanitário + полная команда поваров", "Кофемашина Gaggia/Rancilio б/у"],
  },
  {
    num: 3, title: "Этап 3 (месяц 6+)", color: "#FAEEDA", border: "#BA7517", text: "#7A4F0E",
    desc: "Полный формат. Мастер-классы, живая музыка, аренда.",
    items: ["Мастер-классы R$20/ребёнок по выходным", "Живая музыка пятница-суббота", "Аренда кафе под мероприятия R$2 500–3 000", "Магазин эко-игрушек у выхода", "Йога для мам на деревянном деке"],
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

const staffMonthly = 9520 + 7480 + 3400 + 3060 + 700;

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
  const [openSections, setOpenSections] = useState({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });
  const [ideas, setIdeas] = useState(initialIdeas);
  const [newIdea, setNewIdea] = useState("");
  const [kidsZone, setKidsZone] = useState(initialKidsZone);
  const [staff, setStaff] = useState(initialStaff);
  const [todos, setTodos] = useState(initialTodos);
  const [admin, setAdmin] = useState(initialAdmin);
  const [syncStatus, setSyncStatus] = useState("idle");
  const saveTimer = useRef(null);
  const isRemoteUpdate = useRef(false);

  const toggleSection = (idx) => setOpenSections(p => ({ ...p, [idx]: !p[idx] }));

  // Supabase load + realtime
  useEffect(() => {
    supabase.from("business_plan_state").select("state").eq("id", "main").maybeSingle()
      .then(({ data }) => {
        if (!data?.state) return;
        isRemoteUpdate.current = true;
        const s = data.state;
        if (s.ideas) setIdeas(s.ideas);
        if (s.kidsZone) setKidsZone(s.kidsZone);
        if (s.staff) setStaff(s.staff);
        if (s.todos) setTodos(s.todos);
        if (s.admin) setAdmin(s.admin);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      });

    const channel = supabase.channel("biz_plan_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "business_plan_state" }, (payload) => {
        if (!payload.new?.state) return;
        isRemoteUpdate.current = true;
        const s = payload.new.state;
        if (s.ideas) setIdeas(s.ideas);
        if (s.kidsZone) setKidsZone(s.kidsZone);
        if (s.staff) setStaff(s.staff);
        if (s.todos) setTodos(s.todos);
        if (s.admin) setAdmin(s.admin);
        setTimeout(() => { isRemoteUpdate.current = false; }, 0);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
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
    scheduleSave({ ideas, kidsZone, staff, todos, admin, ...overrides });
  };

  const addIdea = () => {
    if (!newIdea.trim()) return;
    const next = [...ideas, { text: newIdea.trim(), tag: "💡 Концепция" }];
    setIdeas(next);
    setNewIdea("");
    saveAll({ ideas: next });
  };

  const toggleKids = (i) => {
    const next = kidsZone.map((item, j) => j === i ? { ...item, done: !item.done } : item);
    setKidsZone(next);
    saveAll({ kidsZone: next });
  };

  const updateStaffNotes = (i, notes) => {
    const next = staff.map((s, j) => j === i ? { ...s, notes } : s);
    setStaff(next);
    saveAll({ staff: next });
  };

  const toggleTodo = (i) => {
    const next = todos.map((t, j) => j === i ? { ...t, done: !t.done } : t);
    setTodos(next);
    saveAll({ todos: next });
  };

  const toggleAdminItem = (sectionId, itemIdx) => {
    const next = admin.map(sec => sec.id !== sectionId ? sec : {
      ...sec,
      items: sec.items.map((item, j) => j === itemIdx ? { ...item, done: !item.done } : item)
    });
    setAdmin(next);
    saveAll({ admin: next });
  };

  const kidsBrl = kidsZone.reduce((a, x) => a + x.brl, 0);
  const kidsDone = kidsZone.filter(x => x.done).length;
  const todosDone = todos.filter(t => t.done).length;
  const realisticTotal = revenueStreams.reduce((a, r) => a + r.scenarios[0].brl, 0);

  // Group todos by tag
  const todosByTag = todos.reduce((acc, t) => {
    if (!acc[t.tag]) acc[t.tag] = [];
    acc[t.tag].push(t);
    return acc;
  }, {});

  const sections = [
    { title: "💡 1. Концепция" },
    { title: "🗓️ 2. Этапы" },
    { title: "🎨 3. Стиль" },
    { title: "💰 4. Доходы" },
    { title: "👶 5. Детская зона" },
    { title: "👔 6. Сотрудники" },
    { title: "✅ 7. Админ + Задачи" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#faf9f6", minHeight: "100vh", padding: "1rem 1rem 2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Бизнес-план</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>БЕРЁЗКА — Бизнес-план</div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>Флорианополис · 200 м² · R$8 000/мес</div>
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
          { label: "Реалистичный доход/мес", value: `R$${realisticTotal.toLocaleString()}` },
          { label: "Задач выполнено", value: `${todosDone}/${todos.length}` },
          { label: "Детская зона", value: `R$${kidsBrl.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#999", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: КОНЦЕПЦИЯ ── */}
      <Section title={sections[0].title} open={openSections[0]} onToggle={() => toggleSection(0)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ background: "#faf9f6", border: "1px solid #ebebeb", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 3 }}>{p.title}</div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>Идеи</div>
          {ideas.map((idea, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ marginBottom: 5 }}>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: TAG_COLORS[idea.tag] || "#f0f0f0", color: TAG_TEXT[idea.tag] || "#333" }}>
                  {idea.tag}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>{idea.text}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              value={newIdea}
              onChange={e => setNewIdea(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addIdea()}
              placeholder="Новая идея..."
              style={{ flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", fontFamily: "'Georgia', serif", fontSize: 13, outline: "none" }}
            />
            <button
              onClick={addIdea}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" }}
            >
              Добавить идею
            </button>
          </div>
        </div>
      </Section>

      {/* ── SECTION 2: ЭТАПЫ ── */}
      <Section title={sections[1].title} open={openSections[1]} onToggle={() => toggleSection(1)}>
        {phases.map((p) => (
          <div key={p.num} style={{ border: `2px solid ${p.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12, background: "#fff" }}>
            <div style={{ fontSize: 11, background: p.color, color: p.text, padding: "2px 8px", borderRadius: 99, display: "inline-block", marginBottom: 6 }}>
              {p.title}
            </div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 10, background: "#f7f7f5", borderRadius: 8, padding: "8px 10px" }}>{p.desc}</div>
            {p.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 0", borderBottom: i < p.items.length - 1 ? "0.5px solid #ebebeb" : "none" }}>
                <span style={{ color: p.border, fontSize: 12, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </Section>

      {/* ── SECTION 3: СТИЛЬ ── */}
      <Section title={sections[2].title} open={openSections[2]} onToggle={() => toggleSection(2)}>
        <div style={{ background: "#f7f7f5", borderRadius: 10, padding: "10px 12px", marginBottom: 14, borderLeft: "3px solid #533AB7" }}>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{visualData.vibe}</div>
        </div>

        {[...visualData.exterior, ...visualData.interior, ...visualData.kids].map((section, si) => (
          <div key={si} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>{section.zone}</div>
            {section.items.map((item, ii) => (
              <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid #ebebeb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {item.diy && <span style={{ fontSize: 9, background: "#EAF3DE", color: "#3B6D11", padding: "1px 5px", borderRadius: 99 }}>сама</span>}
                  <span style={{ fontSize: 12, color: "#1a1a1a" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, flexShrink: 0, marginLeft: 8 }}>
                  {item.cost === 0 ? "✅ есть/бесплатно" : `R$${item.cost.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        ))}
      </Section>

      {/* ── SECTION 4: ДОХОДЫ ── */}
      <Section title={sections[3].title} open={openSections[3]} onToggle={() => toggleSection(3)}>
        {revenueStreams.map((r, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{r.stream}</div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 10, lineHeight: 1.4 }}>{r.desc}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {r.scenarios.map((s, j) => (
                <div key={j} style={{ background: j === 0 ? "#f7f7f5" : "#EAF3DE", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: j === 0 ? "#999" : "#3B6D11", marginBottom: 2, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: j === 0 ? "#555" : "#27500A" }}>R${s.brl.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: j === 0 ? "#aaa" : "#3B6D11" }}>~${Math.round(s.brl / RATE).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "12px 14px", color: "#fff" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Реалистичный итого/мес</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>R${realisticTotal.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: "#888" }}>~${Math.round(realisticTotal / RATE).toLocaleString()}/мес</div>
        </div>
        <BDRTable />
      </Section>

      {/* ── SECTION 5: ДЕТСКАЯ ЗОНА ── */}
      <Section title={sections[4].title} open={openSections[4]} onToggle={() => toggleSection(4)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Выполнено {kidsDone}/{kidsZone.length}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>R${kidsBrl.toLocaleString()} <span style={{ fontSize: 11, color: "#999" }}>/ ~${Math.round(kidsBrl / RATE)}</span></div>
        </div>
        {kidsZone.map((item, i) => (
          <div key={i} onClick={() => toggleKids(i)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "0.5px solid #ebebeb", cursor: "pointer" }}>
            <div style={{ width: 17, height: 17, borderRadius: 4, border: item.done ? "none" : "1.5px solid #ccc", background: item.done ? "#185FA5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {item.done && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: item.done ? "#999" : "#1a1a1a", textDecoration: item.done ? "line-through" : "none" }}>{item.name}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{item.who} · {item.brl === 0 ? "бесплатно" : `R$${item.brl}`}</div>
            </div>
          </div>
        ))}
      </Section>

      {/* ── SECTION 6: СОТРУДНИКИ ── */}
      <Section title={sections[5].title} open={openSections[5]} onToggle={() => toggleSection(5)}>
        <div style={{ background: "#f7f7f5", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#666" }}>Ежемесячно (с encargos × 1.7)</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>R${staffMonthly.toLocaleString()}/мес</span>
        </div>
        {staff.map((s, i) => (
          <div key={i} style={{ background: "#fff", border: s.urgent ? "2px solid #185FA5" : "1px solid #ebebeb", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            {s.urgent && <div style={{ fontSize: 10, background: "#E6F1FB", color: "#0C447C", padding: "2px 7px", borderRadius: 99, display: "inline-block", marginBottom: 6 }}>Приоритет</div>}
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{s.role}</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>Статус: {s.status}</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Найм: {s.visa}</div>
            <textarea
              value={s.notes}
              onChange={e => updateStaffNotes(i, e.target.value)}
              rows={3}
              style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: 8, padding: "7px 10px", fontFamily: "'Georgia', serif", fontSize: 12, color: "#444", lineHeight: 1.5, resize: "vertical", background: "#faf9f6", boxSizing: "border-box" }}
            />
          </div>
        ))}
      </Section>

      {/* ── SECTION 7: АДМИН + ЗАДАЧИ ── */}
      <Section title={sections[6].title} open={openSections[6]} onToggle={() => toggleSection(6)}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>
          Задачи ({todosDone}/{todos.length} выполнено)
        </div>

        {Object.entries(todosByTag).map(([tag, tagTodos]) => (
          <div key={tag} style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: TAG_COLORS[tag] || "#f0f0f0", color: TAG_TEXT[tag] || "#333" }}>{tag}</span>
            </div>
            {tagTodos.map((t) => {
              const globalIdx = todos.indexOf(t);
              return (
                <div key={globalIdx} onClick={() => toggleTodo(globalIdx)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "0.5px solid #ebebeb", cursor: "pointer" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, border: t.done ? "none" : "1.5px solid #ccc", background: t.done ? "#185FA5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {t.done && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 12, color: t.done ? "#aaa" : "#333", textDecoration: t.done ? "line-through" : "none", lineHeight: 1.4 }}>{t.text}</span>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ height: 1, background: "#e0e0e0", margin: "18px 0 14px" }} />

        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>Административные задачи</div>
        {admin.map((section) => {
          const done = section.items.filter(item => item.done).length;
          const urgentCount = section.items.filter(item => item.urgent && !item.done).length;
          return (
            <div key={section.id} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{section.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{section.title}</span>
                {urgentCount > 0 && (
                  <span style={{ background: "#FCEBEB", color: "#A32D2D", fontSize: 10, padding: "2px 6px", borderRadius: 99 }}>{urgentCount} срочно</span>
                )}
                <span style={{ fontSize: 11, color: "#aaa" }}>{done}/{section.items.length}</span>
              </div>
              {section.items.map((item, i) => (
                <div key={i} onClick={() => toggleAdminItem(section.id, i)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 14px", borderBottom: i < section.items.length - 1 ? "1px solid #f7f7f5" : "none", background: item.done ? "#fafafa" : "#fff", cursor: "pointer" }}>
                  <div style={{ marginTop: 1, width: 14, height: 14, border: "1.5px solid #ccc", borderRadius: 3, background: item.done ? "#1a1a1a" : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.done && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 12, color: item.done ? "#aaa" : "#333", textDecoration: item.done ? "line-through" : "none", lineHeight: 1.4 }}>{item.text}</span>
                  {item.urgent && !item.done && (
                    <span style={{ fontSize: 9, background: "#FCEBEB", color: "#A32D2D", padding: "2px 5px", borderRadius: 99, flexShrink: 0, marginTop: 2 }}>срочно</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </Section>
    </div>
  );
}
