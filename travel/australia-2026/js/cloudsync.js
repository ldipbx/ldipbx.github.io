// 用 Firebase Firestore 做多裝置即時同步（分帳資料 + 行前清單勾選狀態）。
// 需要頁面先載入 Firebase compat SDK 的 <script> 才能用（見 currency.html / checklist.html）。
//
// 運作方式：
// - 沒有輸入「旅遊代碼」之前，資料只存在這台裝置的 localStorage，跟原本行為一樣。
// - 輸入旅遊代碼並連線後，資料改存進 Firestore 的 trips/{旅遊代碼} 這份文件，
//   所有輸入過同一組代碼的裝置都會即時看到彼此的更新。
// - 旅遊代碼是自己取的一串文字，不會出現在程式碼裡，只有輸入過的裝置知道，
//   安全性靠這組代碼保密（不是帳號密碼等級的保護，但對家庭旅遊資料來說已經足夠）。

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyArftU9EBvT8YS9LGTioerGltnnBJ00iJM',
  authDomain: 'troyyan-site.firebaseapp.com',
  projectId: 'troyyan-site',
  storageBucket: 'troyyan-site.firebasestorage.app',
  messagingSenderId: '212534936996',
  appId: '1:212534936996:web:a8a749331fd41cac612d31',
  measurementId: 'G-XME5YMS4ZK',
};

const TRIP_CODE_KEY = 'au_trip_cloud_code';
const MY_NAME_KEY = 'au_trip_my_name';
const LOCAL_FALLBACK_KEY = 'au_trip_local_data_v1';

function defaultTripData() {
  return {
    members: ['旅伴1', '旅伴2', '旅伴3', '旅伴4', '旅伴5', '旅伴6'],
    expenses: [],
    checklists: {},
  };
}

let firestoreDb = null;
let authReadyPromise = null;
let tripCache = null;
const changeListeners = [];
let syncing = false;

function readLocalFallback() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_FALLBACK_KEY));
    if (saved) return { ...defaultTripData(), ...saved };
  } catch (e) { /* 用預設值 */ }
  return defaultTripData();
}

function writeLocalFallback(data) {
  try { localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(data)); } catch (e) { /* 存不進去就算了 */ }
}

function getTripCode() {
  try { return localStorage.getItem(TRIP_CODE_KEY) || ''; } catch (e) { return ''; }
}

function setTripCode(code) {
  try { localStorage.setItem(TRIP_CODE_KEY, code); } catch (e) { /* 存不進去就算了 */ }
}

function getMyName() {
  try { return localStorage.getItem(MY_NAME_KEY) || ''; } catch (e) { return ''; }
}

function setMyName(name) {
  try { localStorage.setItem(MY_NAME_KEY, name); } catch (e) { /* 存不進去就算了 */ }
}

// 資料變動時（不管是自己改的還是雲端推來的）都會呼叫這裡註冊的callback
function onTripDataChange(callback) {
  changeListeners.push(callback);
  if (tripCache) callback(tripCache); // 已經有資料的話立刻給一次
}

function notifyListeners() {
  changeListeners.forEach((cb) => cb(tripCache));
}

function getCachedTripData() {
  if (!tripCache) tripCache = readLocalFallback();
  return tripCache;
}

function isCloudConnected() {
  return syncing && !!getTripCode();
}

// 開始連線同步；沒有旅遊代碼時只會用本機資料，不會嘗試連線
// 允許使用者換一組旅遊代碼重新連線（否則 startSync 發現已經連線過就不會重來）
function syncingReset() {
  syncing = false;
}

function startSync(onStatus) {
  const code = getTripCode();
  if (!code) {
    tripCache = readLocalFallback();
    notifyListeners();
    return;
  }
  if (syncing) return;
  syncing = true;

  if (onStatus) onStatus('連線中…');

  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    firestoreDb = firebase.firestore();
    authReadyPromise = firebase.auth().signInAnonymously();
  } catch (e) {
    if (onStatus) onStatus('連線失敗，改用本機資料');
    syncing = false;
    tripCache = readLocalFallback();
    notifyListeners();
    return;
  }

  authReadyPromise.then(() => {
    const docRef = firestoreDb.collection('trips').doc(code);
    docRef.onSnapshot((snap) => {
      if (snap.exists) {
        tripCache = { ...defaultTripData(), ...snap.data() };
      } else {
        tripCache = defaultTripData();
        docRef.set(tripCache);
      }
      notifyListeners();
      if (onStatus) onStatus('✓ 已連線同步');
    }, () => {
      if (onStatus) onStatus('同步發生問題，請確認網路連線');
    });
  }).catch(() => {
    if (onStatus) onStatus('連線失敗，改用本機資料');
    syncing = false;
    tripCache = readLocalFallback();
    notifyListeners();
  });
}

// 更新資料：先讓這台裝置立刻反應，再視情況寫回雲端或本機
function updateTripData(partial) {
  tripCache = { ...getCachedTripData(), ...partial };
  notifyListeners();

  const code = getTripCode();
  if (code && syncing && firestoreDb) {
    firestoreDb.collection('trips').doc(code).set(partial, { merge: true });
  } else {
    writeLocalFallback(tripCache);
  }
}
