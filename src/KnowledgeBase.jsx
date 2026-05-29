import { useState } from 'react'

const p = { fontSize: 14, lineHeight: 1.75, color: '#3D3530', marginBottom: 12 }
const h3 = { fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 700, color: '#2D2820', marginTop: 20, marginBottom: 8 }
const ul = { fontSize: 14, lineHeight: 1.75, color: '#3D3530', paddingLeft: 20, marginBottom: 12 }
const ol = { ...ul, paddingLeft: 24 }
const hr = { border: 'none', borderTop: '1px solid #EBE2D3', margin: '20px 0' }

function Section({ id, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} style={{ marginBottom: 10, borderRadius: 10, border: '1.5px solid #EBE2D3', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', background: open ? '#F5F0E8' : '#FDFCFA',
        border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 700, color: '#1A1410', flex: 1 }}>{title}</span>
        <span style={{ fontSize: 11, color: '#C5BDB5', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: '14px 16px 18px', borderTop: '1px solid #EBE2D3' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── ZARKOV ARTICLE ──────────────────────────────────────────────────────────
function ZarkovContent({ scrollToAnchor }) {
  return (
    <div>
      <p style={{ ...p, fontStyle: 'italic', color: '#888' }}>
        По мотивам интервью с Борисом Зарьковым (White Rabbit Family). Это не пересказ, а рабочая инструкция: что делать по шагам, на что смотреть, какие ошибки не повторять.
      </p>

      <Section id="kb-value-design" title="Шаг 1 · Проектирование ценности" defaultOpen={true}>
        <p style={p}>Самая частая ошибка начинающего ресторатора — концепция-«Франкенштейн»: берётся кусок из одного ресторана, кусок из другого, всё это склеивается в нечто без внутренней логики. Гость это чувствует, даже если не может объяснить почему.</p>
        <h3 style={h3}>Ошибка «Франкенштейн»</h3>
        <p style={p}>Когда концепция собрана из чужих кусков — меню «как в суши-баре», интерьер «как в Starbucks», цены «как у соседей» — ресторан не имеет собственного голоса. Гость не понимает, зачем идти именно к вам.</p>
        <h3 style={h3}>Метод тапочек</h3>
        <p style={p}>Зарьков рекомендует буквально «надеть тапочки гостя»: провести один полный день с целевой аудиторией. Куда они идут утром? Что едят? Где сидят с ноутбуком? Какие слова используют? Всё это питает концепцию настоящими смыслами.</p>
        <h3 style={h3}>Персона аудитории</h3>
        <ul style={ul}>
          <li>Возраст, профессия, ритм жизни</li>
          <li>Где уже бывает — и почему возвращается</li>
          <li>Что раздражает в других местах</li>
          <li>Какой «работой» нанимает ресторан (lunch, свидание, работа с ноутом, детский день рождения)</li>
        </ul>
        <h3 style={h3}>Архетип бренда</h3>
        <p style={p}>Выберите один архетип и держитесь его: Мудрец, Заботливый, Бунтарь, Творец, Герой, Шут. Берёзка — Заботливый + Невинный (уют, тепло, детство, природа). Все решения — меню, декор, тон в сторис — проверяются через этот архетип.</p>
        <h3 style={h3}>Дизайн-мышление на практике</h3>
        <ul style={ul}>
          <li>Empathize → Define → Ideate → Prototype → Test</li>
          <li>Не запускайте блюдо без теста на 5 реальных гостях</li>
          <li>Прототип меню — распечатка, не полиграфия</li>
        </ul>
      </Section>

      <Section id="kb-financial-model" title="Шаг 2 · Финансовая модель">
        <p style={p}>Большинство ресторанов закрываются не из-за плохой кухни, а из-за того, что основатели не считали деньги до открытия. Финансовая модель — это не Excel для инвестора, это ваш компас.</p>
        <h3 style={h3}>Инвестиционный бюджет</h3>
        <ul style={ul}>
          <li>Ремонт + мебель + оборудование</li>
          <li>Залог + первые 3 месяца аренды</li>
          <li>Запас на кассовый разрыв (3–6 месяцев операционных расходов)</li>
          <li>Маркетинг запуска (часто забывают)</li>
        </ul>
        <h3 style={h3}>БДР на 5 лет</h3>
        <p style={p}>Стройте бюджет доходов и расходов минимум на 5 лет — пессимистичный, реалистичный, оптимистичный сценарий. Зарьков настаивает: если даже оптимистичный сценарий показывает окупаемость дольше 5 лет — не заходите.</p>
        <h3 style={h3}>Ориентир окупаемости</h3>
        <p style={p}>Хороший ресторан в Бразилии — окупаемость 2–4 года. Если горизонт 6+ лет без весомых стратегических причин — пересмотрите концепцию или локацию.</p>
        <h3 style={h3}>Книга</h3>
        <p style={p}>«Нескучные финансы» (Михаил Шарыпов) — лучший вводный курс финансового управления для малого бизнеса на русском языке. Прочитать до открытия обязательно.</p>
        <h3 style={h3}>Ключевые метрики</h3>
        <ul style={ul}>
          <li>Food cost: цель 28–32% от выручки</li>
          <li>Labor cost: цель 25–30%</li>
          <li>Аренда: не более 10–12% выручки</li>
          <li>EBITDA margin: цель 15–20%</li>
          <li>Средний чек × оборот столика × посадочные места = максимальная выручка дня</li>
        </ul>
      </Section>

      <Section id="kb-location" title="Шаг 3 · Локация">
        <p style={p}>Локация — единственная ошибка, которую нельзя исправить после открытия. Всё остальное — меню, команда, цены — можно поменять. Адрес — нет.</p>
        <h3 style={h3}>Что проверить перед подписанием договора</h3>
        <ul style={ul}>
          <li>Пешеходный трафик в часы пик (стойте у входа и считайте)</li>
          <li>Конкуренты в радиусе 500 м — угроза или синергия?</li>
          <li>Парковка: критично для формата «семья с детьми»</li>
          <li>Видимость вывески с дороги</li>
          <li>История места: почему закрылся предыдущий арендатор?</li>
          <li>Планы застройки района на 5 лет</li>
          <li>Alvará sanitário — получить ДО подписания, не после</li>
        </ul>
        <h3 style={h3}>Правило Зарькова</h3>
        <p style={p}>«Лучше маленький ресторан на хорошем месте, чем большой на плохом». Метраж можно нарастить позже. Трафик — нет.</p>
        <h3 style={h3}>Специфика Флорианополис / Камpeche</h3>
        <ul style={ul}>
          <li>Семейный трафик в выходные — утро и обед, а не вечер</li>
          <li>Туристический сезон декабрь–март даёт 2–3x к выручке</li>
          <li>В несезон нужен план удержания локальной аудитории</li>
          <li>Веранда / открытое пространство = конкурентное преимущество</li>
        </ul>
      </Section>

      <hr style={hr} />

      <Section id="kb-atmosphere" title="Шаг 4 · Атмосфера">
        <p style={p}>Атмосфера — это не декор. Это то, что гость чувствует через 10 секунд после входа: запах, звук, температура воздуха, улыбка хостес, чистота столов. Декор — лишь один слой.</p>
        <h3 style={h3}>Сценография пространства</h3>
        <ul style={ul}>
          <li>Маршрут гостя от входа до стола — спроектируйте каждый шаг</li>
          <li>«Wow-момент» — что гость сфотографирует в первые 2 минуты?</li>
          <li>Звук: громкость музыки, эхо, шум кухни</li>
          <li>Свет: разные сценарии для утра, обеда, вечера</li>
          <li>Запах: натуральный (выпечка, кофе) бьёт любой ароматизатор</li>
        </ul>
        <h3 style={h3}>Условия труда = атмосфера для гостей</h3>
        <p style={p}>Зарьков жёстко: «Если на кухне воняет и жарко — это выйдет в зал. Либо через настроение повара, либо буквально». Инвестиции в кондиционер на кухне окупаются снижением текучки и ростом качества блюд.</p>
        <h3 style={h3}>Деградация по умолчанию</h3>
        <p style={p}>Любое пространство деградирует без внимания. Введите правило: ничто не ухудшается без явного решения владельца. Облупилась краска → немедленный ремонт, не «потом». Сломалась лампа → замена в тот же день.</p>
      </Section>

      <Section id="kb-hospitality" title="Шаг 5 · Гостеприимство">
        <p style={p}>Гостеприимство — это не скрипты. Это дух места, который чувствуется даже когда что-то пошло не так. Гость прощает ошибку, если видит, что вам не всё равно.</p>
        <h3 style={h3}>Дух места</h3>
        <ul style={ul}>
          <li>Гость должен чувствовать себя желанным, а не обслуживаемым</li>
          <li>Запомните имена постоянных гостей — это работает лучше любой карты лояльности</li>
          <li>«Маленькие неожиданности»: комплиментарный чай ожидающему гостю, рисунок на капучино для ребёнка</li>
        </ul>
        <h3 style={h3}>Итоговая пятёрка КФУ</h3>
        <ol style={ol}>
          <li>Проектирование ценности (концепция)</li>
          <li>Финансовая модель</li>
          <li>Локация</li>
          <li>Атмосфера</li>
          <li>Гостеприимство</li>
        </ol>
        <p style={p}>Все пять должны работать одновременно. Отличная кухня не спасёт плохую локацию. Лучший сервис не вытащит провальные финансы.</p>
      </Section>

      <hr style={hr} />

      <Section id="kb-metrics" title="Управление через метрики">
        <p style={p}>«Что не измеряется — не управляется». Зарьков строит управление через еженедельные числа, а не через ощущения.</p>
        <div id="kb-cci">
          <h3 style={h3}>CCI — индекс жалоб</h3>
          <p style={p}>CCI = (жалобы, на которые ответили за 24 ч) / (всего жалоб) × 100%. Цель: 100%. Каждая необработанная жалоба — минус ~10 потенциальных гостей.</p>
          <ul style={ul}>
            <li>Настройте алерт в Telegram-боте на каждый новый отзыв (Google Maps, iFood)</li>
            <li>Стандарт ответа: в течение 24 часов, искренне, с предложением решения</li>
            <li>Плохой отзыв + хороший ответ = лучше, чем тишина</li>
          </ul>
        </div>
        <div id="kb-turnover">
          <h3 style={h3}>Текучка кадров</h3>
          <p style={p}>Каждый уволившийся сотрудник стоит 1–3 его месячных зарплат (поиск, найм, обучение, потери от неопытности новичка).</p>
          <ul style={ul}>
            <li>Норма для ресторана: до 5% в месяц. Выше — что-то системно не так</li>
            <li>Exit interview: всегда спрашивайте, почему уходят</li>
          </ul>
        </div>
      </Section>

      <Section id="kb-delegation" title="Делегирование">
        <p style={p}>Ресторатор, который делает всё сам — это не ресторатор, это повар-кассир-уборщик. Делегирование — навык, которому нужно учиться.</p>
        <h3 style={h3}>Алгоритм (4 шага)</h3>
        <ol style={ol}>
          <li><strong>Объясни задачу</strong> — не «как делать», а «что должно получиться»</li>
          <li><strong>Убедись, что понял</strong> — попроси пересказать своими словами</li>
          <li><strong>Дай ресурсы и полномочия</strong> — без них это приказ без инструментов</li>
          <li><strong>Установи контрольные точки</strong> — не микроменеджмент, а чекин в ключевые моменты</li>
        </ol>
        <h3 style={h3}>SMART для задач</h3>
        <p style={p}>Не «займись соцсетями», а «публикуй 1 Reels в день, в 12:00 или 18:00, минимум 3 000 просмотров за первую неделю — проверим в пятницу».</p>
      </Section>

      <Section id="kb-feedback" title="Обратная связь">
        <p style={p}>«Недовольный гость, который сказал вам об этом — это подарок». Большинство рестораторов боятся обратной связи или игнорируют её.</p>
        <h3 style={h3}>QR-коды на столах</h3>
        <p style={p}>Короткая форма (Google Form): 3 вопроса максимум. Блюдо, сервис, что улучшить. Разбирайте с командой еженедельно.</p>
        <h3 style={h3}>Стенд «Вы сказали — мы сделали»</h3>
        <ul style={ul}>
          <li>Публичный статус каждого предложения: получили → разбираемся → сделали</li>
          <li>Простые вещи (крючок в туалете, зарядка на столе) — делайте мгновенно</li>
          <li>Ведите в Instagram Stories в том же формате</li>
        </ul>
      </Section>

      <hr style={hr} />

      <Section id="kb-mistakes" title="Типичные ошибки начинающего ресторатора">
        <ol style={{ ...ol, lineHeight: 2.1 }}>
          <li><strong>Открываться без подушки безопасности.</strong> Минимум 3 месяца операционных расходов в резерве. Лучше 6.</li>
          <li><strong>Слишком большое меню.</strong> 20 блюд, которые вы делаете идеально, лучше 60 посредственных.</li>
          <li><strong>Нанимать «за харизму», а не за навык.</strong> Симпатичный человек без опыта работы с кофе не станет бариста за неделю.</li>
          <li><strong>Не считать food cost ежедневно.</strong> Потери на кухне съедают маржу незаметно. Инвентаризация — раз в неделю минимум.</li>
          <li><strong>Игнорировать локальные сети.</strong> Мамские группы WhatsApp, форумы района — самый дешёвый маркетинг.</li>
          <li><strong>Экономить на вентиляции кухни.</strong> Это прямо влияет на качество работы персонала и блюд.</li>
          <li><strong>Открываться без тестового периода.</strong> Минимум 2 недели soft open. Лучше ошибиться на друзьях.</li>
        </ol>
      </Section>

      <Section id="kb-checklist" title="Чек-лист перед открытием">
        <ul style={{ ...ul, lineHeight: 2 }}>
          <li>☐ Концепция сформулирована в одном предложении</li>
          <li>☐ Финансовая модель на 3 года (3 сценария)</li>
          <li>☐ Локация: трафик, конкуренты, документы</li>
          <li>☐ Alvará sanitário получен</li>
          <li>☐ CNPJ открыт, contabilidade нанята</li>
          <li>☐ Меню протестировано на 20+ людях вне команды</li>
          <li>☐ Команда нанята и обучена стандартам</li>
          <li>☐ Soft open проведён (минимум 1 неделя)</li>
          <li>☐ QR-коды обратной связи + Telegram-алерт настроены</li>
          <li>☐ Google Maps / iFood профиль заполнен с фото</li>
          <li>☐ Instagram ведётся за 2+ недели до открытия</li>
          <li>☐ Резерв: 3 месяца операционных расходов</li>
        </ul>
        <p style={{ ...p, fontStyle: 'italic', color: '#8A7D6E', marginTop: 16 }}>
          Берёзка — это про тепло, уют и настоящее. Делайте так, чтобы гость уходил с улыбкой и хотел вернуться. Всё остальное — следствие.
        </p>
      </Section>
    </div>
  )
}

// ─── EXPERTS LIST ─────────────────────────────────────────────────────────────
const EXPERTS = [
  {
    id: 'zarkov',
    name: 'Борис Зарьков',
    role: 'White Rabbit Family',
    emoji: '🍽️',
    tags: ['концепция', 'финансы', 'управление', 'КФУ'],
    component: ZarkovContent,
  },
  // Будущие эксперты добавляются сюда
]

export default function KnowledgeBase({ onNavigate }) {
  const [openExpert, setOpenExpert] = useState('zarkov')
  const [pendingAnchor, setPendingAnchor] = useState(null)

  const handleOpen = (id) => {
    setOpenExpert(prev => prev === id ? null : id)
  }

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf9f6', minHeight: '100vh', padding: '20px 16px 48px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: 4 }}>База знаний</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>Эксперты</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Инструкции и опыт рестораторов — собранные, структурированные, под рукой</div>
        </div>

        {/* Experts */}
        {EXPERTS.map(expert => {
          const isOpen = openExpert === expert.id
          const Content = expert.component
          return (
            <div key={expert.id} style={{
              background: '#fff',
              borderRadius: 14,
              border: `1.5px solid ${isOpen ? '#d4c5a9' : '#ebebeb'}`,
              marginBottom: 12,
              overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}>
              {/* Expert header — always visible */}
              <button
                onClick={() => handleOpen(expert.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', background: isOpen ? '#F5F0E8' : '#fff',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: isOpen ? '#1a1a1a' : '#f0ede8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, transition: 'all 0.15s',
                }}>{expert.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{expert.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{expert.role}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {expert.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 4,
                        background: '#F5F0E8', color: '#8A7D6E',
                        border: '1px solid #EBE2D3', letterSpacing: '0.04em',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{
                  fontSize: 18, color: '#C5BDB5',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s',
                  flexShrink: 0,
                }}>▼</div>
              </button>

              {/* Expert content — collapsible */}
              {isOpen && (
                <div style={{ borderTop: '1.5px solid #EBE2D3', padding: '20px 20px 24px', background: '#fff' }}>
                  <Content onNavigate={onNavigate} />
                </div>
              )}
            </div>
          )
        })}

        {/* Add expert placeholder */}
        <div style={{
          borderRadius: 14, border: '1.5px dashed #ddd',
          padding: '20px', textAlign: 'center',
          color: '#bbb', fontSize: 13,
        }}>
          + Добавить эксперта
        </div>
      </div>
    </div>
  )
}
