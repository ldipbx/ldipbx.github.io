// AUD <-> TWD 匯率換算，用免費、不需 API key 的 open.er-api.com
// 這個API本身一天只更新一次匯率，所以我們也只在快取超過12小時才會重新抓，
// 平常直接吃快取秒開；使用者也可以按重新整理按鈕強制抓最新的。
// 如果剛好沒網路(例如在店裡收訊不好)，會改用上一次成功抓到的快取並標示「非即時」。

const CURRENCY_CACHE_KEY = 'au_trip_aud_twd_rate_v1';
const CURRENCY_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function readCurrencyCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CURRENCY_CACHE_KEY));
    return cached && cached.rate ? cached : null;
  } catch (e) {
    return null;
  }
}

async function fetchFreshRate() {
  const res = await fetch('https://open.er-api.com/v6/latest/AUD');
  if (!res.ok) throw new Error(`bad status ${res.status}`);
  const data = await res.json();
  const rate = data.rates && data.rates.TWD;
  if (!rate) throw new Error('no TWD rate in response');
  const info = {
    rate,
    updatedAt: data.time_last_update_utc || new Date().toISOString(),
    fetchedAt: Date.now(),
    stale: false,
  };
  try { localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(info)); } catch (e) { /* 存不進去就算了 */ }
  return info;
}

async function getAudToTwdRate(forceRefresh) {
  if (!forceRefresh) {
    const cached = readCurrencyCache();
    if (cached && Date.now() - cached.fetchedAt < CURRENCY_CACHE_TTL_MS) {
      return { ...cached, stale: false };
    }
  }
  try {
    return await fetchFreshRate();
  } catch (e) {
    const cached = readCurrencyCache();
    return cached ? { ...cached, stale: true } : null;
  }
}
