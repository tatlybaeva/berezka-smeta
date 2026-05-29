import { useState, useEffect } from "react";

const CATS = [
  { name:"Концепция и стратегия", emoji:"🎯", tasks:[
    {id:1, task:"Развитие концепции Берёзки", hrs:2},
    {id:2, task:"Цели, KPI, контроль результатов", hrs:2},
    {id:3, task:"Запуск новых направлений (йога, ивенты, магазин)", hrs:3},
    {id:4, task:"Ключевые партнёрства и договорённости", hrs:2},
  ]},
  { name:"Финансы и учёт", emoji:"💰", tasks:[
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
  { name:"Маркетинг и SMM", emoji:"📱", tasks:[
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
  { name:"HR и команда", emoji:"👥", tasks:[
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

const SPLITS = [
  { label:"Р",     desc:"Только Регина", r:1.0, e:0.0 },
  { label:"70·30", desc:"Больше Регина",  r:0.7, e:0.3 },
  { label:"50·50", desc:"Пополам",        r:0.5, e:0.5 },
  { label:"30·70", desc:"Больше Елена",   r:0.3, e:0.7 },
  { label:"Е",     desc:"Только Елена",   r:0.0, e:1.0 },
];

const HRS_OPTS = [0.5,1,2,3,4,5,6,8,10];
const R_COL = [58,90,148];
const E_COL = [139,58,42];

function lerp(t) {
  return [0,1,2].map(i => Math.round(R_COL[i] + (E_COL[i] - R_COL[i]) * t));
}
function bgColor(t, sel) {
  const [r,g,b] = lerp(t);
  return sel ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},0.10)`;
}
function fgColor(t, sel) {
  if (sel) return "#fff";
  const [r,g,b] = lerp(t);
  return `rgb(${r},${g},${b})`;
}

const ALL = CATS.flatMap(c => c.tasks);
const INIT_HRS = Object.fromEntries(ALL.map(t => [t.id, t.hrs]));
const LS_KEY = "berezka-resp-v1";

export default function ResponsibilityCalc() {
  const [asgn, setAsgn]   = useState({});
  const [hrs, setHrs]     = useState(INIT_HRS);
  const [open, setOpen]   = useState({ "Концепция и стратегия": true });
  const [loaded, setLoaded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [filter, setFilter] = useState("all");

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.asgn) setAsgn(d.asgn);
        if (d.hrs)  setHrs(d.hrs);
      }
    } catch(e) {}
    setLoaded(true);
  }, []);

  // save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ asgn, hrs })); } catch(e) {}
  }, [asgn, hrs, loaded]);

  let tR = 0, tE = 0;
  ALL.forEach(t => {
    const si = asgn[t.id];
    if (si == null) return;
    const h = hrs[t.id] || 1;
    tR += SPLITS[si].r * h;
    tE += SPLITS[si].e * h;
  });
  const den = tR + tE;
  const pR  = den > 0 ? tR / den : 0.5;
  const pE  = den > 0 ? tE / den : 0.5;
  const done = ALL.filter(t => asgn[t.id] != null).length;

  const toggle  = (id, si) => setAsgn(p => ({ ...p, [id]: p[id] === si ? undefined : si }));
  const changeH = (id, dir) => setHrs(p => {
    const i = HRS_OPTS.indexOf(p[id] ?? 2);
    const next = i + dir;
    if (next < 0 || next >= HRS_OPTS.length) return p;
    return { ...p, [id]: HRS_OPTS[next] };
  });

  const rColor = `rgb(${R_COL.join(",")})`;
  const eColor = `rgb(${E_COL.join(",")})`;

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

        <div style={{height:9,borderRadius:9,overflow:"hidden",display:"flex",background:"#E5DED4"}}>
          <div style={{width:`${pR*100}%`,background:rColor,transition:"width 0.35s cubic-bezier(.4,0,.2,1)"}}/>
          <div style={{width:`${pE*100}%`,background:eColor,transition:"width 0.35s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5,alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:800,color:rColor}}>
            Регина {Math.round(pR*100)}%
            <span style={{fontWeight:400,fontSize:11,color:"#B0A898",marginLeft:4}}>{Math.round(tR*10)/10} ч/нед</span>
          </span>
          <span style={{fontSize:10,color:"#C5BDB5"}}>нагрузка</span>
          <span style={{fontSize:13,fontWeight:800,color:eColor}}>
            <span style={{fontWeight:400,fontSize:11,color:"#B0A898",marginRight:4}}>{Math.round(tE*10)/10} ч/нед</span>
            Елена {Math.round(pE*100)}%
          </span>
        </div>

        <div style={{display:"flex",gap:4,marginTop:10}}>
          {[["all","Все"],["todo","Без назначения"],["done","Назначены"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:filter===v?"#3A2E22":"#EDE8DE",color:filter===v?"#F5F0E8":"#A09880",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div style={{padding:"12px 14px 0",display:"flex",gap:4,flexWrap:"wrap"}}>
        {SPLITS.map((sp, si) => (
          <span key={si} style={{padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:700,background:bgColor(si/4,true),color:"#fff",letterSpacing:0.1}}>
            {sp.label} — {sp.desc}
          </span>
        ))}
      </div>
      <div style={{padding:"5px 16px 10px",fontSize:10,color:"#C5BDB5"}}>
        ⏱ нажмите ± чтобы изменить трудозатраты
      </div>

      {/* CATEGORIES */}
      <div style={{padding:"0 10px 24px",display:"flex",flexDirection:"column",gap:8}}>
        {visibleCats.map(cat => {
          const catDone = cat.tasks.filter(t => asgn[t.id] != null).length;
          const allDone = catDone === cat.tasks.length;
          const isOpen  = !!open[cat.name];
          return (
            <div key={cat.name} style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 10px rgba(58,46,34,0.07)",overflow:"hidden",border:allDone?"1.5px solid #C8F5D4":"1.5px solid transparent",transition:"border 0.3s"}}>

              <button onClick={() => setOpen(p => ({...p,[cat.name]:!p[cat.name]}))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 15px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22,lineHeight:1,flexShrink:0}}>{cat.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,color:"#1A1410",lineHeight:1.2}}>{cat.name}</div>
                  <div style={{fontSize:10,marginTop:2,fontWeight:600,color:allDone?"#16A34A":catDone>0?"#92400E":"#C5BDB5"}}>
                    {allDone?"✓ все назначены":catDone>0?`${catDone} из ${cat.tasks.length} назначено`:`${cat.tasks.length} задач`}
                  </div>
                </div>
                <span style={{fontSize:10,color:"#D0C8BC",transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}>▼</span>
              </button>

              {isOpen && (
                <div style={{borderTop:"1px solid #F4EFE8"}}>
                  {cat.tasks.map((t, ti) => (
                    <div key={t.id} style={{padding:"11px 13px",borderTop:ti>0?"1px solid #F4EFE8":"none",background:asgn[t.id]!=null?"#FAFFFC":"#fff",transition:"background 0.2s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7,gap:8}}>
                        <div style={{fontSize:12.5,fontWeight:600,color:"#2D2820",flex:1,lineHeight:1.4}}>{t.task}</div>
                        <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                          <button onClick={() => changeH(t.id,-1)} disabled={HRS_OPTS.indexOf(hrs[t.id])===0} style={{width:26,height:26,borderRadius:6,border:"none",background:HRS_OPTS.indexOf(hrs[t.id])===0?"#F5F2ED":"#F0EBE2",color:HRS_OPTS.indexOf(hrs[t.id])===0?"#D8D0C8":"#8A7D6E",fontSize:14,fontWeight:800,cursor:HRS_OPTS.indexOf(hrs[t.id])===0?"default":"pointer",lineHeight:1,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{fontSize:11,fontWeight:700,color:"#8A7D6E",minWidth:28,textAlign:"center"}}>{hrs[t.id]} ч</span>
                          <button onClick={() => changeH(t.id,+1)} disabled={HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1} style={{width:26,height:26,borderRadius:6,border:"none",background:HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1?"#F5F2ED":"#F0EBE2",color:HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1?"#D8D0C8":"#8A7D6E",fontSize:14,fontWeight:800,cursor:HRS_OPTS.indexOf(hrs[t.id])===HRS_OPTS.length-1?"default":"pointer",lineHeight:1,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:3}}>
                        {SPLITS.map((sp, si) => {
                          const sel = asgn[t.id] === si;
                          const tv  = si / 4;
                          return (
                            <button key={si} onClick={() => toggle(t.id, si)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:bgColor(tv,sel),color:fgColor(tv,sel),fontWeight:sel?800:600,fontSize:11,cursor:"pointer",transition:"all 0.15s ease",transform:sel?"scale(1.07)":"scale(1)",boxShadow:sel?"0 2px 7px rgba(0,0,0,0.13)":"none",fontFamily:"'Outfit',sans-serif"}}>
                              {sp.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {done === ALL.length && (
          <div style={{background:"linear-gradient(135deg,#1A1410 0%,#3A2E22 100%)",borderRadius:18,padding:"20px 18px",color:"#F5F0E8",textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>БЕРЁЗКА</div>
            <div style={{fontSize:11,opacity:0.4,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2}}>Café · Campeche · Florianópolis</div>
            <div style={{marginTop:16,display:"flex",justifyContent:"center",gap:28}}>
              <div>
                <div style={{fontSize:30,fontWeight:800,color:rColor}}>{Math.round(pR*100)}%</div>
                <div style={{fontSize:11,opacity:0.55,marginTop:2}}>Регина</div>
                <div style={{fontSize:11,opacity:0.35}}>{Math.round(tR)} ч/нед</div>
              </div>
              <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
              <div>
                <div style={{fontSize:30,fontWeight:800,color:eColor}}>{Math.round(pE*100)}%</div>
                <div style={{fontSize:11,opacity:0.55,marginTop:2}}>Елена</div>
                <div style={{fontSize:11,opacity:0.35}}>{Math.round(tE)} ч/нед</div>
              </div>
            </div>
          </div>
        )}

        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} style={{background:"transparent",border:"1.5px solid #E5DDD4",borderRadius:12,padding:"11px",fontSize:12,color:"#C5BDB5",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>
            Сбросить все назначения
          </button>
        ) : (
          <div style={{background:"#FFF5F0",borderRadius:14,padding:14,border:"1.5px solid #FFD5C0"}}>
            <div style={{fontSize:13,color:"#9A3412",fontWeight:700,marginBottom:12,textAlign:"center"}}>Сбросить все назначения?</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setConfirmReset(false)} style={{flex:1,padding:"10px",borderRadius:9,border:"1.5px solid #E5DDD4",background:"#fff",fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,color:"#888"}}>Отмена</button>
              <button onClick={() => {setAsgn({});setConfirmReset(false);}} style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:eColor,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Сбросить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
