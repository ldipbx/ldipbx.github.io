// 共用渲染邏輯，讀取 data.js 裡的 TRIP / DAYS / CITY_GUIDES / CHECKLIST / OPEN_ISSUES

const STATUS_LABEL = {
  confirmed: '已確定',
  tbd: '待確認',
  candidate: '候選方案',
  action: '待辦',
  'confirmed-needs-check': '需再確認',
};

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function findTodayDay() {
  const t = todayStr();
  return DAYS.find((d) => d.date === t) || null;
}

function badge(status) {
  const label = STATUS_LABEL[status] || status;
  return `<span class="badge ${status}">${label}</span>`;
}

function renderHeader(active) {
  const el = document.getElementById('app-header');
  if (!el) return;
  const tabs = [
    { href: 'index.html', label: '總覽' },
    { href: 'checklist.html', label: '行前準備' },
    { href: 'city.html?c=brisbane', label: '布里斯本' },
    { href: 'city.html?c=goldcoast', label: '黃金海岸' },
    { href: 'city.html?c=sydney', label: '雪梨' },
    { href: 'city.html?c=melbourne', label: '墨爾本' },
  ];
  el.innerHTML = `
    <h1>澳洲旅遊手冊</h1>
    <div class="trip-range">${TRIP.start} ~ ${TRIP.end}｜${TRIP.travelers}人</div>
    <nav class="nav-tabs">
      ${tabs.map((t) => `<a href="${t.href}" class="${t.href.startsWith(active) ? 'active' : ''}">${t.label}</a>`).join('')}
    </nav>
  `;
}

function renderOpenIssuesList(container, issues) {
  container.innerHTML = issues.map((i) => `
    <div class="issue-card">
      <div class="issue-title">Day${i.day}：${i.issue}</div>
      <div class="issue-suggestion">${i.suggestion || ''}</div>
      <a href="day.html?d=${i.day}">前往 Day${i.day} 查看 →</a>
    </div>
  `).join('');
}

// ---- index.html ----
function renderIndexPage() {
  renderHeader('index.html');

  const today = findTodayDay();
  const bannerEl = document.getElementById('today-banner');
  if (today) {
    bannerEl.innerHTML = `
      <div class="today-banner">
        <div class="label">今天是 Day${today.day}・${today.date}</div>
        <div class="headline">目前在：${today.city}</div>
        <a href="day.html?d=${today.day}">查看今天完整行程 →</a>
      </div>
    `;
  } else {
    bannerEl.innerHTML = '';
  }

  const issuesEl = document.getElementById('open-issues');
  document.getElementById('open-issues-title').style.display = OPEN_ISSUES.length ? '' : 'none';
  renderOpenIssuesList(issuesEl, OPEN_ISSUES);

  // 依 citySlug 把連續的天數分組成一段一段的行程（沒有 slug 的出發/返程日各自獨立成一組）
  const legs = [];
  DAYS.forEach((d) => {
    const key = d.citySlug || `solo-${d.day}`;
    const last = legs[legs.length - 1];
    if (last && last.key === key) {
      last.days.push(d);
    } else {
      const label = d.citySlug ? CITY_GUIDES[d.citySlug].name : d.city;
      legs.push({ key, slug: d.citySlug, label, days: [d] });
    }
  });

  const listEl = document.getElementById('day-list');
  listEl.innerHTML = legs.map((leg) => {
    const nightsDay = leg.days.find((d) => d.accommodation);
    const meta = nightsDay ? `${nightsDay.accommodation.nights}晚` : '';
    const dotClass = leg.slug ? `dot-${leg.slug}` : 'dot-neutral';
    const badgeClass = leg.slug ? `badge-${leg.slug}` : 'badge-neutral';

    const cards = leg.days.map((d) => {
      const isToday = today && today.day === d.day;
      const hasIssue = OPEN_ISSUES.some((i) => i.day === d.day);
      return `
        <a class="day-card ${isToday ? 'today' : ''}" href="day.html?d=${d.day}">
          <div class="day-badge ${badgeClass}"><span>Day</span><span class="num">${d.day}</span></div>
          <div class="day-body">
            <div class="day-date">${d.date}（${d.weekday}）</div>
            <div class="day-city">${d.city}</div>
            ${hasIssue ? '<div class="day-issue">⚠ 這天有資料待確認</div>' : ''}
          </div>
          ${d.citySlug ? `<div class="day-wx" data-date="${d.date}">…</div>` : ''}
          <div class="chevron">›</div>
        </a>
      `;
    }).join('');

    return `
      <div class="leg-group">
        <div class="leg-header">
          <span class="leg-dot ${dotClass}"></span>
          <span class="leg-name">${leg.label}</span>
          ${meta ? `<span class="leg-meta">・${meta}</span>` : ''}
        </div>
        ${cards}
      </div>
    `;
  }).join('');

  WeatherStore.getAll().then((map) => {
    document.querySelectorAll('.day-wx[data-date]').forEach((el) => {
      el.innerHTML = renderWeatherChip(map[el.dataset.date]);
    });
  });
}

// ---- day.html ----
function renderDayPage() {
  renderHeader('index.html');
  const dayNum = parseInt(qs('d') || '1', 10);
  const day = DAYS.find((d) => d.day === dayNum) || DAYS[0];

  document.title = `Day${day.day}｜${day.city}｜澳洲旅遊手冊`;

  const prev = DAYS.find((d) => d.day === day.day - 1);
  const next = DAYS.find((d) => d.day === day.day + 1);

  document.getElementById('day-nav-top').innerHTML = `
    <div class="ctx-day">Day${day.day}・${day.city}</div>
    <div class="ctx-date">${day.date}（${day.weekday}）</div>
    ${day.citySlug ? `<div class="ctx-wx" id="ctx-wx">天氣讀取中…</div>` : ''}
  `;

  if (day.citySlug) {
    WeatherStore.getAll().then((map) => {
      const el = document.getElementById('ctx-wx');
      if (!el) return;
      const info = map[day.date];
      el.innerHTML = info ? renderWeatherChip(info) : '目前查不到這天的天氣資料';
    });
  }

  document.getElementById('day-nav-bottom').innerHTML = `
    ${prev ? `<a href="day.html?d=${prev.day}">← Day${prev.day}</a>` : '<span class="disabled">← 第一天</span>'}
    ${next ? `<a href="day.html?d=${next.day}">Day${next.day} →</a>` : '<span class="disabled">最後一天 →</span>'}
  `;

  const accEl = document.getElementById('accommodation');
  if (day.accommodation) {
    const a = day.accommodation;
    accEl.innerHTML = `
      <div class="accommodation-card">
        <div class="badge-row">${badge(a.status)}</div>
        <h3>${a.name}</h3>
        <div class="meta">入住 ${a.checkin} → 退房 ${a.checkout}（共${a.nights}晚）${a.rooms ? `｜${a.rooms}` : ''}</div>
        ${a.note ? `<div class="note">⚠ ${a.note}</div>` : ''}
        ${a.bookingUrl ? `<a class="booking-link" href="${a.bookingUrl}" target="_blank" rel="noopener">訂房連結 →</a>` : ''}
      </div>
    `;
  } else {
    accEl.innerHTML = '';
  }

  const notesEl = document.getElementById('day-notes');
  if (day.notes && day.notes.length) {
    notesEl.innerHTML = `<div class="notes-box"><strong>提醒</strong><ul>${day.notes.map((n) => `<li>${n}</li>`).join('')}</ul></div>`;
  } else {
    notesEl.innerHTML = '';
  }

  const durationLabel = (type) => (type === 'activity' || type === 'meal' ? '建議停留' : '預估時間');

  const timelineEl = document.getElementById('timeline');
  timelineEl.innerHTML = day.segments.map((s) => `
    <div class="segment">
      <div class="seg-rail">
        <span class="seg-dot dot-${s.status}"></span>
      </div>
      <div class="seg-content">
        <div class="seg-time">${s.time}</div>
        <div class="seg-top">
          <span class="seg-title">${s.title}${s.flightNo ? `（${s.flightNo}）` : ''}</span>
          ${badge(s.status)}
        </div>
        ${s.duration ? `<div class="seg-duration">${durationLabel(s.type)}：${s.duration}</div>` : ''}
        ${s.howTo ? `<div class="seg-detail">🚌 ${s.howTo}</div>` : ''}
        ${s.warning ? `<div class="seg-warning">⚠ ${s.warning}</div>` : ''}
        ${s.alternatives && s.alternatives.length ? `<div class="seg-alt">備案：<ul>${s.alternatives.map((a) => `<li>${a}</li>`).join('')}</ul></div>` : ''}
      </div>
    </div>
  `).join('');
}

// ---- city.html ----
function renderCityPage() {
  renderHeader('city.html');
  const slug = qs('c') || 'brisbane';
  const guide = CITY_GUIDES[slug];
  if (!guide) {
    document.getElementById('city-content').innerHTML = '<p>找不到這個城市的資料</p>';
    return;
  }
  document.title = `${guide.name}｜城市指南｜澳洲旅遊手冊`;
  document.getElementById('city-title').innerHTML = `<span class="dot dot-${slug}"></span>${guide.name}`;

  const parts = [];

  parts.push(`<div class="guide-section"><h2>交通卡</h2><p>${guide.transportCard || '—'}</p>${guide.climate ? `<p>${guide.climate}</p>` : ''}</div>`);

  if (guide.airportTransfer && guide.airportTransfer.length) {
    parts.push(`
      <div class="guide-section">
        <h2>機場前往市區</h2>
        ${guide.airportTransfer.map((t) => `<div class="attraction"><div class="name">${t.name}</div><div class="desc">${t.detail}</div></div>`).join('')}
      </div>
    `);
  }

  if (guide.accommodationArea) {
    parts.push(`<div class="guide-section"><h2>住宿推薦地區</h2><p>${guide.accommodationArea}</p></div>`);
  }

  if (guide.attractions && guide.attractions.length) {
    parts.push(`
      <div class="guide-section">
        <h2>景點</h2>
        ${guide.attractions.map((a) => `
          <div class="attraction">
            <div class="name">${a.name}</div>
            ${a.howTo ? `<div class="howto">🚌 ${a.howTo}</div>` : ''}
            ${a.desc ? `<div class="desc">${a.desc}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `);
  }

  if (guide.food && guide.food.length) {
    parts.push(`
      <div class="guide-section">
        <h2>吃的</h2>
        ${guide.food.map((f) => `<div class="attraction"><div class="name">${f.name}</div>${f.detail ? `<div class="desc">${f.detail}</div>` : ''}</div>`).join('')}
      </div>
    `);
  }

  if (guide.shopping && guide.shopping.length) {
    parts.push(`
      <div class="guide-section">
        <h2>買的</h2>
        ${guide.shopping.map((s) => `<div class="attraction"><div class="desc">${s}</div></div>`).join('')}
      </div>
    `);
  }

  document.getElementById('city-content').innerHTML = parts.join('');

  const otherCities = Object.keys(CITY_GUIDES).filter((s) => s !== slug);
  document.getElementById('city-switch').innerHTML = otherCities.map((s) => `
    <a class="city-tile tile-${s}" href="city.html?c=${s}">${CITY_GUIDES[s].name}</a>
  `).join('');
}

// ---- checklist.html ----
function renderChecklistPage() {
  renderHeader('checklist.html');

  document.getElementById('checklist').innerHTML = CHECKLIST.map((c) => `
    <label class="checklist-item">
      <input type="checkbox" />
      <span class="item-text">
        <div class="title">${c.item}</div>
        ${c.detail ? `<div class="detail">${c.detail}</div>` : ''}
      </span>
    </label>
  `).join('');

  renderOpenIssuesList(document.getElementById('open-issues'), OPEN_ISSUES);
}
