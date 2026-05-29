import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const CATS = [
  { name:"Концепция и стратегия", emoji:"🎯", kbAnchor:"kb-value-design", tasks:[
    {id:1, task:"Развитие концепции Берёзки", hrs:2},
    {id:2, task:"Цели, KPI, контроль результатов", hrs:2},
    {id:3, task:"Запуск новых направлений (йога, ивенты, магазин)", hrs:3},
    {id:4, task:"Ключевые партнёрства и договорённости", hrs:2},
  ]},
  { name:"Финансы и учёт", emoji:"💰", kbAnchor:"kb-financial-model", tasks:[
    {id:5, task:"Бюджет — план vs факт каждую неделю", hrs:2},
    {id:6, task:"Учёт доходов и расходов (дневная выручка)", hrs:3},
    {id:7, task:"Платежи: PIX, SumUp, аренда, поставщики", hrs:2},
    {id:8, task:"Зарплаты + encargos сотрудников", hrs:2},
    {id:9, task:"Работа с бухгалтером (contabilidade)", hrs:1},
    {id:10, task:"Пересмотр ценообразования меню", hrs:1},
  ]},
  { name:"Кухня и заготовки", emoji:"🥟", tasks:[
    {id:11, task:"Разработка и корректировка рецептур", hrs:2},
    {id:12, task:"Заготовки: пельмени, вареники, супы, выпечка", hrs:5},
    {id:13, task:"Контроль качества блюд в сервисе", hrs:2},
    {id:14, task:"Закупки продуктов (Atacadão, CEASA, feira)", hrs:3},
    {id:15, task:"Инвентаризация кухни и холодильника", hrs:1},
    {id:16, task:"Сезонные блюда и спецпредложения", hrs:1},
  ]},
  { name:"Кофе и напитки", emoji:"☕", tasks:[
    {id:17, task:"Кофейная карта — выбор зерна, поставщик", hrs:1},
    {id:18, task:"Закупки: кофе, чай, матча, напитки", hrs:1},
    {id:19, task:"Обучение бариста стандартам Берёзки", hrs:2},
    {id:20, task:"Контроль качества напитков на смене", hrs:1},
  ]},
  { name:"Зал и сервис", emoji:"🍽️", tasks:[
    {id:21, task:"Стандарты сервиса и подачи", hrs:2},
    {id:22, task:"Составление расписания смен", hrs:2},
    {id:23, task:"Контроль работы персонала в зале", hrs:4},
    {id:24, task:"Работа с жалобами и сложными гостями", hrs:1},
    {id:25, task:"Открытие и закрытие кафе", hrs:3},
  ]},
  { name:"Детская зона", emoji:"👶", tasks:[
    {id:26, task:"Безопасность и обслуживание площадки", hrs:3},
    {id:27, task:"Мастер-классы по выходным (R$20/ребёнок)", hrs:4},
    {id:28, task:"Куры, огород — уход и контент", hrs:2},
    {id:29, task:"Коммуникация с родителями и мамами", hrs:2},
  ]},
  { name:"Маркетинг и SMM", emoji:"📱", kbAnchor:"kb-value-design", tasks:[
    {id:30, task:"Instagram / TikTok — съёмка и монтаж", hrs:5},
    {id:31, task:"Посты, сторис, Reels — каждый день", hrs:4},
    {id:32, task:"Реклама: таргет, Google, локальные группы", hrs:2},
    {id:33, task:"Коллаборации с блогерами Флорипа", hrs:2},
    {id:34, task:"Отзывы на Google Maps и iFood", hrs:1},
    {id:35, task:"Трафарет, стикеры, оффлайн-промо", hrs:1},
  ]},
  { name:"Ивенты и аренда", emoji:"🎉", tasks:[
    {id:36, task:"Йога-классы для мам (расписание, инструктор)", hrs:2},
    {id:37, task:"Живая музыка пт-сб (поиск, договор, оплата)", hrs:2},
    {id:38, task:"Аренда под мероприятия (R$2 500–3 000)", hrs:3},
    {id:39, task:"Детские дни рождения — организация", hrs:3},
    {id:40, task:"Корпоративы и закрытые вечеринки", hrs:2},
  ]},
  { name:"HR и команда", emoji:"👥", kbAnchor:"kb-metrics", tasks:[
    {id:41, task:"Найм: повар, бариста, auxiliar, заготовщик", hrs:3},
    {id:42, task:"Обучение и адаптация новых сотрудников", hrs:3},
    {id:43, task:"Мотивация, атмосфера в команде", hrs:2},
    {id:44, task:"Разрешение конфликтов внутри команды", hrs:1},
  ]},
  { name:"Юридическое и документы", emoji:"📋", tasks:[
    {id:45, task:"CNPJ, Alvará, Alvará sanitário", hrs:2},
    {id:46, task:"Виза и иммиграционные вопросы", hrs:2},
    {id:47, task:"Договор аренды (переговоры, продление)", hrs:1},
    {id:48, task:"Договоры с поставщиками и подрядчиками", hrs:1},
  ]},
  { name:"Закупки и операции", emoji:"⚙️", tasks:[
    {id:49, task:"Основные поставщики продуктов", hrs:2},
    {id:50, task:"Расходники: упаковка, уборка, гигиена", hrs:1},
    {id:51, task:"Техника и оборудование — ремонт", hrs:1},
    {id:52, task:"IT: Wi-Fi, касса SumUp, камеры, сайт", hrs:1},
  ]},
  { name:"Пространство и дизайн", emoji:"🪵", tasks:[
    {id:53, task:"Интерьер зала и веранды — декор", hrs:2},
    {id:54, task:"Фотозоны: типи, огород, вывеска", hrs:2},
    {id:55, task:"Магазин эко-игрушек — закупка, выкладка", hrs:2},
    {id:56, task:"Сезонное оформление (Новый год, Масленица...)", hrs:2},
  ]},
];

const PARTNER_COLORS = ['#3A5A94','#8B3A2A','#4A6340','#7A5C8A','#C4873A','#2A7A7A'];
const DEFAULT_PARTNERS = [
  { id: 'r', name: 'Регина', color: '#3A5A94' },
  { id: 'e', name: 'Елена',  color: '#8B3A2A' },
];

const HRS_OPTS = [0.5,1,2,3,4,5,6,8,10];

const ALL = CATS.flatMap(c => c.tasks);
const TASK_MAP = Object.fromEntries(ALL.map(t => [t.id, t.task]));
const INIT_HRS = Object.fromEntries(ALL.map(t => [t.id, t.hrs]));

function initAsgn(partners) {
  const asgn = {};
  const ids = partners.map(p => p.id);
  ALL.forEach((t, i) => {
    asgn[t.id] = ids[i % ids.length];
  });
  return asgn;
}

function diffStates(oldA, oldH, newA, newH) {
  const changes = [];
  const ids = new Set([...Object.keys(oldA), ...Object.keys(newA), ...Object.keys(oldH), ...Object.keys(newH)]);
  ids.forEach(id => {
    const tid = Number(id);
    const oldP = oldA[id]; const newP = newA[id];
    const oldHr = oldH[id]; const newHr = newH[id];
    const taskName = TASK_MAP[tid] || `Задача ${id}`;
    if (oldP !== newP) {
      changes.push({ task: taskName, field: "кому", from: oldP ?? "—", to: newP ?? "—" });
    }
    if (oldHr !== newHr && oldHr != null && newHr != null) {
      changes.push({ task: taskName, field: "часы", from: `${oldHr}ч`, to: `${newHr}ч` });
    }
  });
  return changes;
}

function fmtDt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function ResponsibilityCalc({ onNavigate }) {
  const [partners, setPartners]   = useState(DEFAULT_PARTNERS);
  const [asgn, setAsgn]           = useState(() => initAsgn(DEFAULT_PARTNERS));
  const [hrs, setHrs]             = useState(INIT_HRS);
  const [open, setOpen]           = useState({});
  const [loaded, setLoaded]       = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [filter, setFilter]       = useState("all");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastAt, setLastAt]       = useState(null);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const saveTimer   = useRef(null);
  const prevState   = useRef({ asgn: {}, hrs: INIT_HRS, partners: DEFAULT_PARTNERS });
  const isRemote    = useRef(false);

  const applyState = (s) => {
    if (!s) return;
    isRemote.current = true;
    if (s.asgn)     setAsgn(s.asgn);
    if (s.hrs)      setHrs(s.hrs);
    if (s.partners) setPartners(s.partners);
    setTimeout(() => { isRemote.current = false; }, 0);
  };

  const loadHistory = async () => {
    const { data } = await supabase.from("resp_history").select("*").order("changed_at", { ascending: false }).limit(30);
    if (data) setHistory(data);
  };

  useEffect(() => {
    supabase.from("resp_state").select("state,updated_at").eq("id","main").maybeSingle()
      .then(({ data }) => {
        if (data?.state) {
          applyState(data.state);
          prevState.current = data.state;
          setLastAt(data.updated_at);
        }
        setLoaded(true);
      });

    loadHistory();

    const ch = supabase.channel("resp_realtime")
      .on("postgres_changes", { event:"*", schema:"public", table:"resp_state" }, (payload) => {
        if (payload.new?.state) {
          applyState(payload.new.state);
          setLastAt(payload.new.updated_at);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  useEffect(() => {
    if (!loaded || isRemote.current) return;
    setSyncStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const state = { asgn, hrs, partners };
      const changes = diffStates(prevState.current.asgn || {}, prevState.current.hrs || INIT_HRS, asgn, hrs);

      const { error } = await supabase.from("resp_state").upsert({ id:"main", state, updated_at: new Date().toISOString() });
      if (!error) {
        if (changes.length > 0) {
          await supabase.from("resp_history").insert({ changes, changed_at: new Date().toISOString() });
          loadHistory();
        }
        prevState.current = state;
        setLastAt(new Date().toISOString());
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } else {
        setSyncStatus("error");
      }
    }, 800);
  }, [asgn, hrs, partners, loaded]);

  const getPartner = (pid) => partners.find(p => p.id === pid);

  const cyclePartner = (taskId) => {
    const currentPid = asgn[taskId];
    const idx = partners.findIndex(p => p.id === currentPid);
    const nextIdx = (idx + 1) % partners.length;
    setAsgn(prev => ({ ...prev, [taskId]: partners[nextIdx].id }));
  };

  const unassign = (taskId) => {
    setAsgn(prev => { const next = {...prev}; delete next[taskId]; return next; });
  };

  const changeH = (id, dir) => setHrs(p => {
    const i = HRS_OPTS.indexOf(p[id] ?? 2);
    const next = i + dir;
    if (next < 0 || next >= HRS_OPTS.length) return p;
    return { ...p, [id]: HRS_OPTS[next] };
  });

  const addPartner = () => {
    const name = newPartnerName.trim();
    if (!name) return;
    const usedColors = partners.map(p => p.color);
    const color = PARTNER_COLORS.find(c => !usedColors.includes(c)) || PARTNER_COLORS[partners.length % PARTNER_COLORS.length];
    const id = 'p' + Date.now();
    setPartners(prev => [...prev, { id, name, color }]);
    setNewPartnerName('');
  };

  const removePartner = (pid) => {
    if (partners.length <= 2) return;
    const fallbackId = partners.find(p => p.id !== pid)?.id;
    setPartners(prev => prev.filter(p => p.id !== pid));
    setAsgn(prev => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => { next[k] = v === pid ? fallbackId : v; });
      return next;
    });
  };

  // Totals
  const partnerHrs = {};
  const partnerCount = {};
  partners.forEach(p => { partnerHrs[p.id] = 0; partnerCount[p.id] = 0; });
  ALL.forEach(t => {
    const pid = asgn[t.id];
    if (pid && partnerHrs[pid] != null) {
      partnerHrs[pid] += hrs[t.id] || 1;
      partnerCount[pid]++;
    }
  });

  const done = ALL.filter(t => asgn[t.id] != null).length;

  const visibleCats = CATS.map(cat => {
    const tasks = filter === "done"
      ? cat.tasks.filter(t => asgn[t.id] != null)
      : filter === "todo"
      ? cat.tasks.filter(t => asgn[t.id] == null)
      : cat.tasks;
    return { ...cat, tasks };
  }).filter(cat => cat.tasks.length > 0);

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#F5F0E8",minHeight:"100vh",maxWidth:500,margin:"0 auto"}}>

      {/* STICKY HEADER */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(245,240,232,0.97)",backdropFilter:"blur(12px)",borderBottom:"1.5px solid #EBE2D3",padding:"14px 16px 12px"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#1A1410",letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1}}>
              БЕРЁЗКА
            </div>
            <div style={{fontSize:10,color:"#B8B0A8",letterSpacing:"0.14em",textTransform:"uppercase",marginTop:2}}>
              Распределение задач
            </div>
          </div>
          <div style={{background:done===ALL.length?"#DCF5E0":"#EDE9E3",color:done===ALL.length?"#166534":"#999",borderRadius:20,padding:"4px 11px",fontSize:12,fontWeight:700,transition:"all 0.3s",border:done===ALL.length?"1.5px solid #BBF7D0":"1.5px solid transparent"}}>
            {done}/{ALL.length} {done===ALL.length?"✓":""}
          </div>
        </div>

        {/* Partner summary bar */}
        <div style={{height:9,borderRadius:9,overflow:"hidden",display:"flex",background:"#E5DED4"}}>
          {partners.map(p => {
            const total = Object.values(partnerHrs).reduce((a,b) => a+b, 0);
            const pct = total > 0 ? (partnerHrs[p.id] || 0) / total : 1 / partners.length;
            return <div key={p.id} style={{width:`${pct*100}%`,background:p.color,transition:"width 0.35s cubic-bezier(.4,0,.2,1)"}} />;
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,flexWrap:"wrap",gap:6}}>
          {partners.map(p => {
            const total = Object.values(partnerHrs).reduce((a,b) => a+b, 0);
            const pct = total > 0 ? Math.round((partnerHrs[p.id] || 0) / total * 100) : Math.round(100/partners.length);
            return (
              <span key={p.id} style={{fontSize:12,fontWeight:700,color:p.color}}>
                {p.name} {pct}%
                <span style={{fontWeight:400,fontSize:11,color:"#B0A898",marginLeft:4}}>{Math.round((partnerHrs[p.id]||0)*10)/10} ч</span>
              </span>
            );
          })}
        </div>

        <div style={{display:"flex",gap:4,marginTop:10}}>
          {[["all","Все"],["todo","Без назначения"],["done","Назначены"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:filter===v?"#3A2E22":"#EDE8DE",color:filter===v?"#F5F0E8":"#A09880",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* PARTNERS MANAGEMENT */}
      <div style={{margin:"12px 10px 0",background:"#fff",borderRadius:16,boxShadow:"0 2px 10px rgba(58,46,34,0.07)",overflow:"hidden",border:"1.5px solid #EBE2D3"}}>
        <button onClick={() => setShowPartners(p => !p)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 15px",background:"transparent",border:"none",cursor:"pointer"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#2D2820",fontFamily:"'Outfit',sans-serif"}}>👥 Партнёры</span>
          <span style={{fontSize:10,color:"#D0C8BC",transform:showPartners?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>
        </button>
        {showPartners && (
          <div style={{borderTop:"1px solid #F4EFE8",padding:"10px 15px 14px"}}>
            {partners.map(p => (
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{width:12,height:12,borderRadius:"50%",background:p.color,flexShrink:0,display:"inline-block"}} />
                <span style={{fontSize:13,fontWeight:600,color:"#2D2820",flex:1}}>{p.name}</span>
                <span style={{fontSize:11,color:"#B0A898"}}>{partnerCount[p.id]} задач · {Math.round((partnerHrs[p.id]||0)*10)/10} ч</span>
                {partners.length > 2 && (
                  <button onClick={() => removePartner(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#D0C8BC",fontSize:16,lineHeight:1,padding:0}}>×</button>
                )}
              </div>
            ))}
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <input
                value={newPartnerName}
                onChange={e => setNewPartnerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPartner()}
                placeholder="Имя партнёра"
                style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1.5px solid #EBE2D3",fontSize:12,fontFamily:"'Outfit',sans-serif",outline:"none"}}
              />
              <button onClick={addPartner} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#3A2E22",color:"#F5F0E8",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                + Добавить
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{padding:"10px 14px 6px",fontSize:10,color:"#C5BDB5"}}>
        💡 нажмите на имя партнёра чтобы переназначить задачу · долгое нажатие снимает назначение
      </div>

      {/* CATEGORIES */}
      <div style={{padding:"0 10px 24px",display:"flex",flexDirection:"column",gap:8}}>
        {visibleCats.map(cat => {
          const catDone = cat.tasks.filter(t => asgn[t.id] != null).length;
          const allDone = catDone === cat.tasks.length;
          const isOpen  = !!open[cat.name];

          // Per-zone distribution bar
          const catPartnerHrs = {};
          partners.forEach(p => { catPartnerHrs[p.id] = 0; });
          cat.tasks.forEach(t => {
            const pid = asgn[t.id];
            if (pid && catPartnerHrs[pid] != null) catPartnerHrs[pid] += hrs[t.id] || 1;
          });
          const catTotal = Object.values(catPartnerHrs).reduce((a,b) => a+b, 0);

          return (
            <div key={cat.name} style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 10px rgba(58,46,34,0.07)",overflow:"hidden",border:allDone?"1.5px solid #C8F5D4":"1.5px solid transparent",transition:"border 0.3s"}}>

              <button onClick={() => setOpen(p => ({...p,[cat.name]:!p[cat.name]}))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 15px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22,lineHeight:1,flexShrink:0}}>{cat.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,color:"#1A1410",lineHeight:1.2}}>{cat.name}</span>
                    {cat.kbAnchor && onNavigate && (
                      <button
                        onClick={e => { e.stopPropagation(); onNavigate('kb', cat.kbAnchor); }}
                        title="Открыть в Базе знаний"
                        style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:0,lineHeight:1,opacity:0.6}}
                      >📖</button>
                    )}
                  </div>
                  <div style={{fontSize:10,marginTop:2,fontWeight:600,color:allDone?"#16A34A":catDone>0?"#92400E":"#C5BDB5"}}>
                    {allDone?"✓ все назначены":catDone>0?`${catDone} из ${cat.tasks.length} назначено`:`${cat.tasks.length} задач`}
                  </div>
                  {/* Mini bar */}
                  {catTotal > 0 && (
                    <div style={{display:"flex",height:4,borderRadius:4,overflow:"hidden",marginTop:5,gap:1}}>
                      {partners.map(p => {
                        const pct = catPartnerHrs[p.id] / catTotal * 100;
                        return pct > 0 ? <div key={p.id} style={{width:`${pct}%`,background:p.color,borderRadius:4}} /> : null;
                      })}
                    </div>
                  )}
                </div>
                <span style={{fontSize:10,color:"#D0C8BC",transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}>▼</span>
              </button>

              {isOpen && (
                <div style={{borderTop:"1px solid #F4EFE8"}}>
                  {cat.tasks.map((t, ti) => {
                    const assignedPid = asgn[t.id];
                    const assignedPartner = assignedPid ? getPartner(assignedPid) : null;
                    return (
                      <div key={t.id} style={{padding:"11px 13px",borderTop:ti>0?"1px solid #F4EFE8":"none",background:assignedPid?"#FAFFFC":"#fff",transition:"background 0.2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:"#2D2820",flex:1,lineHeight:1.4}}>{t.task}</div>
                          <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                            <button onClick={() => changeH(t.id,-1)} disabled={HRS_OPTS.indexOf(hrs[t.id])===0} style={{width:26,height:26,borderRadius:6,border:"none",background:HRS_OPTS.indexOf(hrs[t.id])===0?"#F5F2ED":"#F0EBE2",color:HRS_OPTS.indexOf(hrs[t.id])===0?"#D8D0C8":"#8A7D6E",fontSize:14,fontWeight:800,cursor:HRS_OPTS.indexOf(hrs[t.id])===0?"default":"pointer",lineHeight:1,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                            <span style={{fontSize:11,fontWeight:700,color:"#8A7D6E",minWidth:28,textAlign:"center"}}>{hrs[t.id]} ч</span>
                            <button onClick={() => changeH(t.id,+1)} disabled={HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1} style={{width:26,height:26,borderRadius:6,border:"none",background:HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1?"#F5F2ED":"#F0EBE2",color:HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1?"#D8D0C8":"#8A7D6E",fontSize:14,fontWeight:800,cursor:HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1?"default":"pointer",lineHeight:1,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                          </div>
                        </div>

                        {/* Partner assignment chips */}
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {partners.map(p => {
                            const sel = assignedPid === p.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => setAsgn(prev => ({ ...prev, [t.id]: p.id }))}
                                style={{
                                  padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",
                                  fontSize:11,fontWeight:sel?800:500,
                                  background:sel ? p.color : `${p.color}18`,
                                  color:sel ? "#fff" : p.color,
                                  transition:"all 0.15s",
                                  transform:sel?"scale(1.05)":"scale(1)",
                                  boxShadow:sel?"0 2px 6px rgba(0,0,0,0.15)":"none",
                                  fontFamily:"'Outfit',sans-serif",
                                }}
                              >
                                {p.name}
                              </button>
                            );
                          })}
                          {assignedPid && (
                            <button
                              onClick={() => unassign(t.id)}
                              title="Снять назначение"
                              style={{padding:"5px 8px",borderRadius:20,border:"1px solid #E5DDD4",background:"transparent",cursor:"pointer",fontSize:10,color:"#C5BDB5",fontFamily:"'Outfit',sans-serif"}}
                            >✕</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* SUMMARY */}
        {done === ALL.length && (
          <div style={{background:"linear-gradient(135deg,#1A1410 0%,#3A2E22 100%)",borderRadius:18,padding:"20px 18px",color:"#F5F0E8",textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>БЕРЁЗКА</div>
            <div style={{fontSize:11,opacity:0.4,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2}}>Café · Campeche · Florianópolis</div>
            <div style={{marginTop:16,display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              {partners.map((p, i) => {
                const total = Object.values(partnerHrs).reduce((a,b) => a+b, 0);
                const pct = total > 0 ? Math.round((partnerHrs[p.id]||0) / total * 100) : Math.round(100/partners.length);
                return (
                  <div key={p.id}>
                    {i > 0 && <div style={{width:1,background:"rgba(255,255,255,0.1)",display:"none"}} />}
                    <div style={{fontSize:30,fontWeight:800,color:p.color}}>{pct}%</div>
                    <div style={{fontSize:11,opacity:0.55,marginTop:2}}>{p.name}</div>
                    <div style={{fontSize:11,opacity:0.35}}>{Math.round(partnerHrs[p.id]||0)} ч/нед</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ИСТОРИЯ ИЗМЕНЕНИЙ */}
        <div style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 10px rgba(58,46,34,0.07)",overflow:"hidden",border:"1.5px solid #EBE2D3"}}>
          <button onClick={() => setShowHistory(h => !h)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#2D2820",fontFamily:"'Outfit',sans-serif"}}>
                {syncStatus === "saving" && <span style={{color:"#aaa"}}>сохранение…</span>}
                {syncStatus === "saved"  && <span style={{color:"#16a34a"}}>✓ сохранено</span>}
                {syncStatus === "error"  && <span style={{color:"#dc2626"}}>⚠ ошибка</span>}
                {syncStatus === "idle"   && <span style={{color:"#888"}}>История изменений</span>}
              </div>
              {lastAt && <div style={{fontSize:11,color:"#C5BDB5",marginTop:2}}>последнее: {fmtDt(lastAt)}</div>}
            </div>
            <span style={{fontSize:10,color:"#D0C8BC",transform:showHistory?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>
          </button>

          {showHistory && (
            <div style={{borderTop:"1px solid #F4EFE8",padding:"8px 0 4px"}}>
              {history.length === 0 ? (
                <div style={{padding:"12px 16px",fontSize:12,color:"#C5BDB5"}}>Изменений пока нет</div>
              ) : history.map((entry, ei) => (
                <div key={entry.id} style={{padding:"10px 16px",borderBottom:ei<history.length-1?"1px solid #F4EFE8":"none"}}>
                  <div style={{fontSize:11,color:"#B0A898",marginBottom:6,fontWeight:600}}>{fmtDt(entry.changed_at)}</div>
                  {entry.changes.map((ch, ci) => (
                    <div key={ci} style={{display:"flex",alignItems:"baseline",gap:6,fontSize:12,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{color:"#2D2820",fontWeight:600,flex:"1 1 160px",minWidth:0}}>{ch.task}</span>
                      <span style={{color:"#C5BDB5",flexShrink:0}}>{ch.field}:</span>
                      <span style={{background:"#FFF0ED",color:"#9A3412",borderRadius:4,padding:"1px 6px",fontSize:11,flexShrink:0}}>{ch.from}</span>
                      <span style={{color:"#C5BDB5",flexShrink:0}}>→</span>
                      <span style={{background:"#F0FDF4",color:"#166534",borderRadius:4,padding:"1px 6px",fontSize:11,flexShrink:0}}>{ch.to}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} style={{background:"transparent",border:"1.5px solid #E5DDD4",borderRadius:12,padding:"11px",fontSize:12,color:"#C5BDB5",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>
            Сбросить все назначения
          </button>
        ) : (
          <div style={{background:"#FFF5F0",borderRadius:14,padding:14,border:"1.5px solid #FFD5C0"}}>
            <div style={{fontSize:13,color:"#9A3412",fontWeight:700,marginBottom:12,textAlign:"center"}}>Сбросить все назначения?</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setConfirmReset(false)} style={{flex:1,padding:"10px",borderRadius:9,border:"1.5px solid #E5DDD4",background:"#fff",fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,color:"#888"}}>Отмена</button>
              <button onClick={() => {setAsgn({});setConfirmReset(false);}} style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:"#8B3A2A",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Сбросить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
