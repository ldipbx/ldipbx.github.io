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

// 把行程裡的時間字串換算成當天的分鐘數，抓不到明確時間的（上午/傍晚/途中/抵達後...）
// 就用常見的時段對應，或沿用前一個項目的時間，讓「現在進行到哪」的判斷有個合理依據。
function parseSegmentMinutes(timeStr, fallback) {
  const m = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const keywords = [
    ['凌晨', 3 * 60], ['早上', 8 * 60], ['上午', 9 * 60], ['中午', 12 * 60],
    ['午餐', 12 * 60], ['下午', 14 * 60], ['傍晚', 17 * 60], ['晚餐', 19 * 60],
    ['晚上', 19 * 60], ['深夜', 23 * 60],
  ];
  const hit = keywords.find(([kw]) => timeStr.includes(kw));
  return hit ? hit[1] : fallback;
}

function badge(status) {
  const label = STATUS_LABEL[status] || status;
  return `<span class="badge ${status}">${label}</span>`;
}

function formatRelativeTime(ts) {
  if (!ts) return '未知';
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return '剛剛';
  if (diffMin < 60) return `${diffMin}分鐘前`;
  return `${Math.round(diffMin / 60)}小時前`;
}

// 顯示「天氣更新於 X」文字，實際的重新整理動作統一交給標題列右上角的
// 全域「🔄 更新」按鈕負責，按下去之後會透過 window.onTripDataRefreshed 通知這裡重畫
function setupWeatherStatus(statusElId, applyFn) {
  const statusEl = document.getElementById(statusElId);

  function renderStatus() {
    if (statusEl) statusEl.innerHTML = `<span class="wx-status-text">天氣更新於 ${formatRelativeTime(WeatherStore.getFetchedAt())}</span>`;
  }

  function load() {
    WeatherStore.getAll().then((map) => {
      applyFn(map);
      renderStatus();
    });
  }

  load();
  window.onTripDataRefreshed = load;
}

function dayCardHtml(d, badgeClass, isToday, hasIssue) {
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
}

function mapLink(query) {
  if (!query) return '';
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return `<a class="map-link" href="${url}" target="_blank" rel="noopener">📍 在地圖上查看</a>`;
}

function renderHeader(active) {
  const el = document.getElementById('app-header');
  if (!el) return;
  // 匯率換算是隨時可能會用到的工具，跟「看哪個城市行程」是不同性質的操作，
  // 拉出捲動列表、改放固定不動的快捷按鈕，不管在哪一頁都不用滑動就能點到
  const tabs = [
    { href: 'index.html', label: '總覽' },
    { href: 'checklist.html', label: '行前準備' },
    { href: 'city.html?c=brisbane', label: '布里斯本' },
    { href: 'city.html?c=goldcoast', label: '黃金海岸' },
    { href: 'city.html?c=sydney', label: '雪梨' },
    { href: 'city.html?c=melbourne', label: '墨爾本' },
  ];
  el.innerHTML = `
    <div class="app-header-top">
      <div>
        <h1>澳洲旅遊手冊</h1>
        <div class="trip-range">${TRIP.start} ~ ${TRIP.end}｜${TRIP.travelers}人</div>
      </div>
      <div class="header-actions">
        <div class="icon-btn-slot">
          <button type="button" class="icon-btn" id="header-refresh-btn" title="更新天氣與匯率資料">
            <span class="icon-emoji">↻</span>
            <span class="icon-label">更新</span>
          </button>
        </div>
        <a href="currency.html" class="icon-btn ${active === 'currency.html' ? 'active' : ''}" title="匯率換算">
          <span class="icon-emoji">⇄</span>
          <span class="icon-label">匯率</span>
        </a>
      </div>
    </div>
    <nav class="nav-tabs">
      ${tabs.map((t) => `<a href="${t.href}" class="${t.href.startsWith(active) ? 'active' : ''}">${t.label}</a>`).join('')}
    </nav>
  `;

  // 每次換頁tab bar都會重置捲動位置，如果目前頁籤在最右邊會被擋在畫面外，
  // 這裡把它捲進可視範圍內，不用使用者自己再手動滑過去找
  const activeTab = el.querySelector('.nav-tabs a.active');
  if (activeTab) {
    activeTab.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  document.getElementById('header-refresh-btn').addEventListener('click', async (e) => {
    dismissRefreshCoachmark();
    const btn = e.currentTarget;
    const labelEl = btn.querySelector('.icon-label');
    if (btn.classList.contains('spinning')) return; // 避免連續點擊重複觸發
    const original = labelEl.textContent;
    btn.classList.add('spinning');
    labelEl.textContent = '更新中';
    await refreshAllData();
    btn.classList.remove('spinning');
    labelEl.textContent = '完成';
    setTimeout(() => { labelEl.textContent = original; }, 1500);
  });

  showRefreshCoachmarkOnce(el);
}

// 第一次來訪時，在「更新」按鈕旁邊冒出一個小提示說明這是做什麼用的，
// 點過一次（或看過幾秒後自動消失）就會記住，之後不會再顯示
const REFRESH_HINT_SEEN_KEY = 'au_trip_seen_refresh_hint_v1';

function dismissRefreshCoachmark() {
  const mark = document.getElementById('refresh-coachmark');
  if (mark) mark.remove();
  try { localStorage.setItem(REFRESH_HINT_SEEN_KEY, '1'); } catch (e) { /* 存不進去就算了 */ }
}

function showRefreshCoachmarkOnce(headerEl) {
  let seen = true;
  try { seen = !!localStorage.getItem(REFRESH_HINT_SEEN_KEY); } catch (e) { /* 讀不到就當作沒看過 */ }
  if (seen) return;

  const slot = headerEl.querySelector('.icon-btn-slot');
  if (!slot) return;

  const mark = document.createElement('div');
  mark.className = 'coachmark';
  mark.id = 'refresh-coachmark';
  mark.textContent = '點這裡可以更新天氣預報跟匯率資料';
  slot.appendChild(mark);

  mark.addEventListener('click', dismissRefreshCoachmark);
  setTimeout(dismissRefreshCoachmark, 6000);
}

// 不管目前在哪一頁，強制重新抓天氣+匯率並更新快取；
// 如果當頁有顯示天氣/匯率，會呼叫 window.onTripDataRefreshed 讓那一頁的畫面也跟著更新
async function refreshAllData() {
  const tasks = [];
  if (typeof WeatherStore !== 'undefined') tasks.push(WeatherStore.refresh());
  if (typeof getAudToTwdRate === 'function') tasks.push(getAudToTwdRate(true));
  await Promise.allSettled(tasks);
  if (typeof window.onTripDataRefreshed === 'function') window.onTripDataRefreshed();
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
      return dayCardHtml(d, badgeClass, isToday, hasIssue);
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

  setupWeatherStatus('wx-status', (map) => {
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
    ${day.citySlug ? `<div class="ctx-wx" id="ctx-wx">天氣讀取中…</div><div class="wx-status" id="ctx-wx-status"></div>` : ''}
  `;

  if (day.citySlug) {
    setupWeatherStatus('ctx-wx-status', (map) => {
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
        <div class="acc-links">
          ${a.bookingUrl ? `<a class="booking-link" href="${a.bookingUrl}" target="_blank" rel="noopener">訂房連結 →</a>` : ''}
          ${mapLink(a.mapQuery)}
        </div>
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

  // 只有在瀏覽「今天」這一頁時才需要標出目前進行到哪個項目
  const isToday = day.date === todayStr();
  let currentIdx = -1;
  let nowMinutes = -1;
  let last = 0;
  const minutesList = day.segments.map((s) => (last = parseSegmentMinutes(s.time, last)));
  if (isToday) {
    const now = new Date();
    nowMinutes = now.getHours() * 60 + now.getMinutes();
    minutesList.forEach((mins, i) => { if (mins <= nowMinutes) currentIdx = i; });
    if (currentIdx === -1) currentIdx = 0; // 今天但還沒到第一個項目的時間，標出「接下來」
  }

  const timelineEl = document.getElementById('timeline');
  timelineEl.innerHTML = day.segments.map((s, i) => {
    const isCurrent = i === currentIdx;
    const nowLabel = isCurrent ? (nowMinutes >= minutesList[i] ? '現在' : '接下來') : '';
    return `
    <div class="segment ${isCurrent ? 'is-current' : ''}">
      <div class="seg-rail">
        <span class="seg-dot dot-${s.status}"></span>
      </div>
      <div class="seg-content">
        <div class="seg-time">${s.time}${nowLabel ? `<span class="now-badge">● ${nowLabel}</span>` : ''}</div>
        <div class="seg-top">
          <span class="seg-title">${s.title}${s.flightNo ? `（${s.flightNo}）` : ''}</span>
          ${badge(s.status)}
        </div>
        ${s.duration ? `<div class="seg-duration">${durationLabel(s.type)}：${s.duration}</div>` : ''}
        ${s.howTo ? `<div class="seg-detail">🚌 ${s.howTo}</div>` : ''}
        ${s.warning ? `<div class="seg-warning">⚠ ${s.warning}</div>` : ''}
        ${s.alternatives && s.alternatives.length ? `<div class="seg-alt">備案：<ul>${s.alternatives.map((a) => `<li>${a}</li>`).join('')}</ul></div>` : ''}
        ${s.mapQuery ? `<div class="seg-map">${mapLink(s.mapQuery)}</div>` : ''}
      </div>
    </div>
  `;
  }).join('');

  if (isToday) {
    const els = timelineEl.querySelectorAll('.segment');
    const target = els[currentIdx];
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }
}

// ---- city.html ----
function renderCityPage() {
  const slug = qs('c') || 'brisbane';
  renderHeader(`city.html?c=${slug}`);
  const guide = CITY_GUIDES[slug];
  if (!guide) {
    document.getElementById('city-content').innerHTML = '<p>找不到這個城市的資料</p>';
    return;
  }
  document.title = `${guide.name}｜城市指南｜澳洲旅遊手冊`;
  document.getElementById('city-title').innerHTML = `<span class="dot dot-${slug}"></span>${guide.name}`;

  // 先找有沒有天數是「住宿/主要停留」在這個城市；像布里斯本這種當天來回、
  // 沒有citySlug對應到它的情況，就退回用城市名稱比對(例如Day2的「布里斯本 → 黃金海岸」)
  let cityDays = DAYS.filter((d) => d.citySlug === slug);
  if (!cityDays.length) {
    cityDays = DAYS.filter((d) => d.city.includes(guide.name));
  }
  const badgeClass = `badge-${slug}`;
  const cityDaysEl = document.getElementById('city-days');
  if (cityDaysEl) {
    cityDaysEl.innerHTML = cityDays.length
      ? cityDays.map((d) => dayCardHtml(d, badgeClass, false, OPEN_ISSUES.some((i) => i.day === d.day))).join('')
      : '<p style="font-size:13px;color:var(--text-muted)">目前行程沒有安排在這裡過夜，只是路過而已</p>';

    setupWeatherStatus('city-wx-status', (map) => {
      cityDaysEl.querySelectorAll('.day-wx[data-date]').forEach((el) => {
        el.innerHTML = renderWeatherChip(map[el.dataset.date]);
      });
    });
  }

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

// ---- currency.html ----
function renderCurrencyPage() {
  renderHeader('currency.html');

  const audInput = document.getElementById('aud-input');
  const twdInput = document.getElementById('twd-input');
  const rateInfoEl = document.getElementById('rate-info');

  function bindInputs(rate) {
    audInput.oninput = () => {
      const v = parseFloat(audInput.value);
      twdInput.value = Number.isNaN(v) ? '' : Math.round(v * rate);
    };
    twdInput.oninput = () => {
      const v = parseFloat(twdInput.value);
      audInput.value = Number.isNaN(v) ? '' : (v / rate).toFixed(2);
    };
  }

  // 重新整理統一交給標題列右上角的「🔄 更新」按鈕，這裡只負責顯示、
  // 並在 window.onTripDataRefreshed 被呼叫時重新讀一次（已經是快取好的新資料，不會再打一次API）
  function load() {
    getAudToTwdRate().then((info) => {
      if (!info) {
        rateInfoEl.textContent = '目前抓不到匯率資料，且沒有先前的快取，請確認網路連線';
        return;
      }
      const { rate } = info;
      const updated = new Date(info.updatedAt);
      const updatedText = Number.isNaN(updated.getTime()) ? info.updatedAt : updated.toLocaleString('zh-TW');
      rateInfoEl.innerHTML = `
        1 AUD ≈ ${rate.toFixed(2)} TWD${info.stale ? '<span class="rate-stale">（離線快取，非即時）</span>' : ''}
        <div class="rate-updated">匯率資料時間：${updatedText}（提供方每天只更新一次，不會跟著重新整理變動）</div>
        <div class="rate-updated">上次幫你重新整理：${formatRelativeTime(info.fetchedAt)}</div>
        <div class="rate-hint">想拿最新匯率可以點右上角的「🔄 更新」</div>
      `;
      bindInputs(rate);
    });
  }

  load();
  window.onTripDataRefreshed = load;
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
