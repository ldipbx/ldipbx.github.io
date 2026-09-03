// 用維基百科免費的REST API(不需要API key)幫知名地標抓一張縮圖。
// 抓不到(太小眾、頁面沒有圖，或名稱對不上)就靜靜跳過，不會讓版面出現破圖或空白。
// 結果會存進 localStorage，因為地標照片幾乎不會變，直接快取到不會過期。

const WIKI_THUMB_CACHE_KEY = 'au_trip_wiki_thumb_cache_v1';

function readWikiCache() {
  try {
    return JSON.parse(localStorage.getItem(WIKI_THUMB_CACHE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function writeWikiCache(cache) {
  try { localStorage.setItem(WIKI_THUMB_CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* 存不進去就算了 */ }
}

async function getWikiThumbnail(title) {
  const cache = readWikiCache();
  if (Object.prototype.hasOwnProperty.call(cache, title)) return cache[title];

  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const url = (data.thumbnail && data.thumbnail.source) || null;
    cache[title] = url;
    writeWikiCache(cache);
    return url;
  } catch (e) {
    cache[title] = null;
    writeWikiCache(cache);
    return null;
  }
}
