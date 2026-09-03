// AUD <-> TWD 匯率換算，用免費、不需 API key 的 open.er-api.com
// 每次成功抓到最新匯率都會存進 localStorage，之後如果剛好沒網路(例如在店裡收訊不好)，
// 會改用上一次成功抓到的快取，並註明「非即時」，讓工具在離線時仍堪用。

const CURRENCY_CACHE_KEY = 'au_trip_aud_twd_rate_v1';

async function getAudToTwdRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/AUD');
    if (!res.ok) throw new Error(`bad status ${res.status}`);
    const data = await res.json();
    const rate = data.rates && data.rates.TWD;
    if (rate) {
      const info = { rate, updatedAt: data.time_last_update_utc || new Date().toISOString(), stale: false };
      try { localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(info)); } catch (e) { /* 存不進去就算了 */ }
      return info;
    }
  } catch (e) {
    // 抓不到就往下用快取
  }
  try {
    const cached = JSON.parse(localStorage.getItem(CURRENCY_CACHE_KEY));
    if (cached && cached.rate) return { ...cached, stale: true };
  } catch (e) { /* 沒有快取 */ }
  return null;
}
