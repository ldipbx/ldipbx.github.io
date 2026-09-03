// 天氣資料：用 Open-Meteo（免費、不需 API key）
// 訂票日距離出發還很遠時，預報API還抓不到那麼久以後的資料，
// 這種情況會改抓「去年同一天」的歷史天氣當作參考，等日期進入預報範圍(約未來16天)後會自動變成真正的預報。

const CITY_COORDS = {
  brisbane: { lat: -27.4698, lon: 153.0251 },
  goldcoast: { lat: -28.0167, lon: 153.4000 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  melbourne: { lat: -37.8136, lon: 144.9631 },
};

const WEATHER_CODES = {
  0: { icon: '☀️', label: '晴朗' },
  1: { icon: '🌤️', label: '晴時多雲' },
  2: { icon: '⛅', label: '多雲時晴' },
  3: { icon: '☁️', label: '陰天' },
  45: { icon: '🌫️', label: '有霧' },
  48: { icon: '🌫️', label: '有霧' },
  51: { icon: '🌦️', label: '毛毛雨' },
  53: { icon: '🌦️', label: '毛毛雨' },
  55: { icon: '🌦️', label: '毛毛雨' },
  56: { icon: '🌧️', label: '凍雨' },
  57: { icon: '🌧️', label: '凍雨' },
  61: { icon: '🌧️', label: '下雨' },
  63: { icon: '🌧️', label: '下雨' },
  65: { icon: '🌧️', label: '大雨' },
  66: { icon: '🌧️', label: '凍雨' },
  67: { icon: '🌧️', label: '凍雨' },
  71: { icon: '🌨️', label: '下雪' },
  73: { icon: '🌨️', label: '下雪' },
  75: { icon: '🌨️', label: '大雪' },
  77: { icon: '🌨️', label: '下雪' },
  80: { icon: '🌦️', label: '陣雨' },
  81: { icon: '🌦️', label: '陣雨' },
  82: { icon: '🌦️', label: '強陣雨' },
  85: { icon: '🌨️', label: '陣雪' },
  86: { icon: '🌨️', label: '陣雪' },
  95: { icon: '⛈️', label: '雷雨' },
  96: { icon: '⛈️', label: '雷雨（冰雹）' },
  99: { icon: '⛈️', label: '雷雨（冰雹）' },
};

function weatherMeta(code) {
  return WEATHER_CODES[code] || { icon: '🌡️', label: '' };
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(a, b) {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / 86400000);
}

async function fetchDaily(baseUrl, lat, lon, startDate, endDate) {
  const url = `${baseUrl}?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`);
  return res.json();
}

async function fetchCityWeather(slug, dates) {
  const coords = CITY_COORDS[slug];
  if (!coords || !dates.length) return {};

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const forecastDates = dates.filter((d) => daysBetween(todayStr, d) >= 0 && daysBetween(todayStr, d) <= 15);
  const pastDates = dates.filter((d) => !forecastDates.includes(d));

  const result = {};

  try {
    if (forecastDates.length) {
      const start = forecastDates.reduce((a, b) => (a < b ? a : b));
      const end = forecastDates.reduce((a, b) => (a > b ? a : b));
      const data = await fetchDaily('https://api.open-meteo.com/v1/forecast', coords.lat, coords.lon, start, end);
      (data.daily?.time || []).forEach((date, i) => {
        result[date] = {
          code: data.daily.weathercode[i],
          tMax: data.daily.temperature_2m_max[i],
          tMin: data.daily.temperature_2m_min[i],
          isForecast: true,
        };
      });
    }
  } catch (e) {
    // 抓不到就算了，畫面上不顯示這幾天的天氣
  }

  try {
    if (pastDates.length) {
      // 用「去年同一天」的歷史天氣當參考
      const refDates = pastDates.map((d) => addDays(d, -365));
      const start = refDates.reduce((a, b) => (a < b ? a : b));
      const end = refDates.reduce((a, b) => (a > b ? a : b));
      const data = await fetchDaily('https://archive-api.open-meteo.com/v1/archive', coords.lat, coords.lon, start, end);
      const byRefDate = {};
      (data.daily?.time || []).forEach((date, i) => {
        byRefDate[date] = {
          code: data.daily.weathercode[i],
          tMax: data.daily.temperature_2m_max[i],
          tMin: data.daily.temperature_2m_min[i],
          isForecast: false,
        };
      });
      pastDates.forEach((d) => {
        const ref = addDays(d, -365);
        if (byRefDate[ref]) result[d] = byRefDate[ref];
      });
    }
  } catch (e) {
    // 同上，抓不到就跳過
  }

  return result;
}

// 天氣快取6小時：同一天內在首頁/各Day頁之間切換只會真的打一次API，
// 其餘都直接讀快取，避免每次點開行程就重新抓一次天氣。
const WEATHER_CACHE_KEY = 'au_trip_weather_cache_v1';
const WEATHER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const WeatherStore = {
  _promise: null,
  _fetchedAt: null,

  async _fetchFresh() {
    const byCity = {};
    DAYS.forEach((d) => {
      if (!d.citySlug) return;
      (byCity[d.citySlug] = byCity[d.citySlug] || []).push(d.date);
    });
    const entries = await Promise.all(
      Object.keys(byCity).map((slug) => fetchCityWeather(slug, byCity[slug])),
    );
    const map = Object.assign({}, ...entries);
    const fetchedAt = Date.now();
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ map, fetchedAt }));
    } catch (e) {
      // 存不進去（例如無痕模式）就算了，不影響這次畫面顯示
    }
    this._fetchedAt = fetchedAt;
    return map;
  },

  getAll() {
    if (this._promise) return this._promise;
    this._promise = (async () => {
      try {
        const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY));
        if (cached && Date.now() - cached.fetchedAt < WEATHER_CACHE_TTL_MS) {
          this._fetchedAt = cached.fetchedAt;
          return cached.map;
        }
      } catch (e) {
        // 沒有快取或快取壞掉，往下重新抓
      }
      return this._fetchFresh();
    })();
    return this._promise;
  },

  // 強制略過快取重新抓一次，給「重新整理」按鈕用
  refresh() {
    this._promise = this._fetchFresh();
    return this._promise;
  },

  getFetchedAt() {
    return this._fetchedAt;
  },
};

function renderWeatherChip(info) {
  if (!info) return '';
  const meta = weatherMeta(info.code);
  const range = `${Math.round(info.tMin)}°–${Math.round(info.tMax)}°`;
  const tag = info.isForecast ? '' : ' <span class="wx-tag">去年同日參考</span>';
  return `<span class="wx-icon">${meta.icon}</span><span class="wx-temp">${range}</span>${tag}`;
}
