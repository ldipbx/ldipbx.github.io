// 澳洲旅遊手冊 - 行程資料
// 資料整理自 00 raw data/澳洲.xlsx，並依實際機票日期(9/24晚上出發、10/4晚上回程)校正過。
// 未提供的資訊一律用 status:'tbd' 標記，不自行編造。
// 各活動的 duration(建議停留時間)為常見旅遊時間的概略估計，非Excel原始資料，僅供抓行程節奏參考。

const TRIP = {
  start: '2026-09-24',
  end: '2026-10-05',
  travelers: 6,
};

// status: 'confirmed' 已確定 | 'tbd' 待確認/尚未安排 | 'candidate' 候選方案(尚未定案) | 'action' 待辦事項
const DAYS = [
  {
    day: 1, date: '2026-09-24', weekday: '星期四',
    city: '出發', citySlug: null,
    accommodation: null,
    segments: [
      {
        time: '23:30', type: 'flight', title: '桃園機場 T2 出發（直飛布里斯本）', flightNo: 'CI053',
        duration: '約9小時5分（隔日9/25 10:35直達布里斯本，中途不停站）', status: 'confirmed',
        howTo: '國際線由桃園機場第二航廈出發，建議提前3小時到機場', alternatives: [],
        mapQuery: 'Taoyuan International Airport Terminal 2, Taiwan',
      },
    ],
    notes: ['ETA 電子簽證請務必提前申請，詳見「行前準備清單」，不要拖到出發前才辦'],
  },
  {
    day: 2, date: '2026-09-25', weekday: '星期五',
    city: '布里斯本 → 黃金海岸', citySlug: 'goldcoast',
    accommodation: {
      name: 'Golden Sands on the Beach - Absolute Beachfront Apartments',
      nights: 3, checkin: '2026-09-25', checkout: '2026-09-28',
      bookingUrl: 'https://www.booking.com/hotel/au/golden-sands.zh-tw.html',
      rooms: '3房（6人）', status: 'confirmed',
      mapQuery: 'Golden Sands on the Beach, Gold Coast, Australia',
    },
    segments: [
      { time: '10:35', type: 'flight', title: '抵達布里斯本機場（國際航廈）', flightNo: 'CI053', status: 'confirmed', mapQuery: 'Brisbane Airport, Australia' },
      {
        time: '10:35之後', type: 'transport', title: '入境、購買 Go Card，前往市區', duration: '機場快線約20分鐘到中央車站',
        status: 'confirmed',
        howTo: '機場三樓搭乘 Airtrain 機場快線，最快速方便，直達中央車站',
        alternatives: ['Con-x-ion 機場接駁巴士（約30~45分，可直達飯店，適合住非市中心）', 'Uber / 計程車（適合多人共乘，市中心停車費較高）'],
        mapQuery: 'Brisbane Central Station, Australia',
      },
      {
        time: '白天', type: 'activity', title: '布里斯本市區觀光', status: 'confirmed',
        duration: '約9~10小時（含午餐，直飛抵達當天時間很充足）',
        howTo: '可參考「布里斯本」城市指南安排景點，例如市政廳、皇后街購物中心、南岸公園、故事橋等',
        alternatives: ['搭了一整夜飛機如果比較累，也可以挑少一點景點、留時間休息'],
        mapQuery: 'Brisbane CBD, Australia',
      },
      {
        time: '21:00', type: 'transport', title: '移動到黃金海岸並辦理入住', duration: '車程約1小時多',
        status: 'confirmed', howTo: '建議確認接送方式（租車/Uber/接駁），6人+行李需確認車輛座位數',
        alternatives: [],
      },
    ],
    notes: [
      '直飛布里斯本，中途不經雪梨轉機，9/25上午10:35抵達；布里斯本改成不過夜，晚上直接前往黃金海岸',
    ],
  },
  {
    day: 3, date: '2026-09-26', weekday: '星期六',
    city: '黃金海岸', citySlug: 'goldcoast',
    accommodation: null,
    segments: [
      {
        time: '上午', type: 'activity', title: '（可選）浮潛 / 划橡皮艇', status: 'candidate',
        duration: '約半天（3~4小時）',
        howTo: '可透過 Klook 預訂', alternatives: ['若天候不佳可改為 Pacific Fair 逛街或海灘散步'],
      },
      { time: '10:00', type: 'activity', title: '衝浪者天堂 Surfers Paradise', status: 'confirmed', duration: '建議1~2小時', howTo: '沙灘散步、拍照', mapQuery: 'Surfers Paradise, Gold Coast, Australia' },
      { time: '15:00', type: 'activity', title: 'Pacific Fair Shopping Centre 逛街', status: 'confirmed', duration: '建議1.5~2小時', mapQuery: 'Pacific Fair Shopping Centre, Gold Coast, Australia' },
      { time: '16:00', type: 'activity', title: 'Broadbeach 海灘 & Casino', status: 'confirmed', duration: '建議1~1.5小時', mapQuery: 'Broadbeach, Gold Coast, Australia' },
      { time: '18:00', type: 'activity', title: 'Sky Point Q1大廈 看夜景', duration: '建議1小時', howTo: '77樓高空景觀台', status: 'confirmed', mapQuery: 'SkyPoint Observation Deck, Gold Coast, Australia' },
      {
        time: '晚餐', type: 'meal', title: 'Marios Italian Restaurant', status: 'confirmed', duration: '約1~1.5小時',
        howTo: '好吃的義式餐廳，記得先預約', alternatives: ['Costa D’oro Italian Restaurant（鮮蝦飯好吃）'],
        mapQuery: 'Marios Italian Restaurant, Surfers Paradise, Australia',
      },
    ],
    notes: ['濱海市場只在週三、五、日下午～晚上8點營業，本日是週六不開放'],
  },
  {
    day: 4, date: '2026-09-27', weekday: '星期日',
    city: '黃金海岸', citySlug: 'goldcoast',
    accommodation: null,
    segments: [
      { time: '上午', type: 'activity', title: '可倫賓動物園 Currumbin Wildlife Sanctuary', status: 'confirmed', duration: '建議2~3小時', mapQuery: 'Currumbin Wildlife Sanctuary, Australia' },
      { time: '下午', type: 'activity', title: 'Outlet 逛街', status: 'confirmed', duration: '建議2小時', mapQuery: 'Harbour Town Premium Outlets, Gold Coast, Australia' },
    ],
    notes: [],
  },
  {
    day: 5, date: '2026-09-28', weekday: '星期一',
    city: '黃金海岸 → 雪梨', citySlug: 'sydney',
    accommodation: {
      name: 'Meriton Suites Bondi Junction', nights: 3,
      checkin: '2026-09-28', checkout: '2026-10-01',
      bookingUrl: 'https://www.agoda.com/zh-tw/meriton-suites-bondi-junction/hotel/sydney-au.html',
      rooms: '訂房參數顯示 adults=6 / rooms=1', status: 'confirmed-needs-check',
      note: '房型是否真的能睡下6人請務必再跟訂房網站/飯店確認，Gold Coast 跟墨爾本都是訂3房，這間目前看起來只訂1房',
      mapQuery: 'Meriton Suites Bondi Junction, Sydney, Australia',
    },
    segments: [
      {
        time: '（需自行抓時間）', type: 'transport', title: '退房、前往黃金海岸機場', status: 'tbd',
        warning: 'Excel 上沒有寫退房與前往機場的時間，12:20起飛前建議自己抓足夠的緩衝時間',
        mapQuery: 'Gold Coast Airport, Australia',
      },
      { time: '12:20', type: 'flight', title: '捷星航空 飛雪梨', duration: '約1小時15分（估計，請以實際訂位為準）', status: 'confirmed' },
      { time: '抵達後', type: 'transport', title: '雪梨飯店 Check in', status: 'confirmed' },
      { time: '14:00', type: 'activity', title: '岩石區 The Rocks', status: 'confirmed', duration: '建議1~1.5小時', mapQuery: 'The Rocks, Sydney, Australia' },
      { time: '16:00', type: 'activity', title: '逛環形碼頭，拍雪梨歌劇院', status: 'confirmed', duration: '建議1小時', mapQuery: 'Circular Quay, Sydney, Australia' },
      { time: '18:00', type: 'activity', title: '雪梨歌劇院 + 雪梨港灣大橋', status: 'confirmed', duration: '建議1.5~2小時（含拍照）', howTo: '由北到南走約20分鐘，大橋入口在岩石區的 Argyle Stairs（爬樓梯）或 Bridge Stairs（樓梯/電梯）', mapQuery: 'Sydney Opera House, Australia' },
    ],
    notes: [],
  },
  {
    day: 6, date: '2026-09-29', weekday: '星期二',
    city: '雪梨', citySlug: 'sydney',
    accommodation: null,
    segments: [
      {
        time: '全天', type: 'activity', title: '藍山國家公園一日遊 Blue Mountains', status: 'confirmed',
        duration: '搭火車約2小時，或報名一日遊行程',
        howTo: '主要4個景點可搭纜車俯瞰全景：景觀世界(Scenic World)、回音谷(Echo Point)、巨人階梯(Giant Stairway)、三姊妹岩(Three Sisters)',
        alternatives: [], mapQuery: 'Blue Mountains National Park, Australia',
      },
    ],
    notes: [],
  },
  {
    day: 7, date: '2026-09-30', weekday: '星期三',
    city: '雪梨', citySlug: 'sydney',
    accommodation: null,
    segments: [
      {
        time: '全天', type: 'activity', title: '賞鯨（史蒂芬港出發）', status: 'confirmed',
        warning: '史蒂芬港距離雪梨市區車程約2.5~3小時，來回幾乎是一整天的行程，隔天(Day8)還要前往墨爾本，請確認團體/包車的實際返回時間，避免太晚回到市區影響隔天行程與收拾行李',
        alternatives: ['天候不佳無法出海時，可改為市區內行程（雪梨塔、達令港、海德公園等）'],
        mapQuery: 'Port Stephens, Australia',
      },
    ],
    notes: [],
  },
  {
    day: 8, date: '2026-10-01', weekday: '星期四',
    city: '雪梨 → 墨爾本', citySlug: 'melbourne',
    accommodation: {
      name: 'High-Rise 3-Bed Apartment with Premium Amenities', nights: 3,
      checkin: '2026-10-01', checkout: '2026-10-04',
      bookingUrl: 'https://www.agoda.com/zh-tw/high-rise-3-bed-apartment-with-premium-amenities-h81818592/hotel/melbourne-au.html',
      rooms: '3房（6人）', status: 'confirmed',
    },
    segments: [
      {
        time: '（尚未安排）', type: 'transport', title: '雪梨 → 墨爾本 交通方式', status: 'tbd',
        warning: 'Excel 上完全沒有這段交通的班機或車票資訊，是目前行程最大的缺口',
        howTo: '建議訂購雪梨→墨爾本國內線航班（約1.5~2小時，可比較 Qantas / Jetstar / Virgin Australia），並抓好雪梨退房與墨爾本飯店 check-in 的時間銜接',
        alternatives: [],
      },
      { time: '抵達後', type: 'transport', title: '購買 Myki Card（墨爾本交通卡）', status: 'confirmed' },
    ],
    notes: ['雪梨→墨爾本交通尚未安排，請盡快訂票'],
  },
  {
    day: 9, date: '2026-10-02', weekday: '星期五',
    city: '墨爾本', citySlug: 'melbourne',
    accommodation: null,
    segments: [
      {
        time: '全天（二選一）', type: 'activity', title: '普芬比利蒸汽火車一日遊 Puffing Billy', status: 'candidate',
        howTo: '貝爾格雷夫站（Belgrave）至湖濱車站（Lakeside），需事先訂票，位子建議選前面，不然中間會拍到別人的手',
        duration: '半天～全天，中午可在 Lakeside 站吃午餐',
        alternatives: ['與下方菲利浦島擇一，兩者都是全天行程無法同天完成'],
        mapQuery: 'Puffing Billy Railway, Belgrave, Australia',
      },
      {
        time: '全天（二選一）', type: 'activity', title: '菲利浦島一日遊 Phillip Island', status: 'candidate',
        duration: '全天（含晚上企鵝歸巢）',
        howTo: '彩虹小屋沙灘 Brighton Beach、月光野生動物園、格蘭特岬角及諾比斯、企鵝歸巢（傍晚～晚上才開始，建議晚去晚回）',
        alternatives: ['與上方普芬比利小火車擇一，兩者都是全天行程無法同天完成'],
        mapQuery: 'Phillip Island, Australia',
      },
      {
        time: '晚上（擇一）', type: 'meal', title: '晚餐：亞拉河 Yarra River 畔 / BangPop 泰式料理',
        status: 'candidate', duration: '約1~1.5小時', howTo: '兩個晚餐選項同時列在同一天，建議依當天行程結束地點就近選擇',
        alternatives: ['河邊酒吧看夕陽'],
      },
    ],
    notes: ['本日的一日遊與晚餐都尚未定案，先列出所有候選方案，之後確認後記得回來更新這一頁'],
  },
  {
    day: 10, date: '2026-10-03', weekday: '星期六',
    city: '墨爾本', citySlug: 'melbourne',
    accommodation: null,
    segments: [
      {
        time: '全天', type: 'activity', title: '大洋路一日遊 Great Ocean Road', status: 'confirmed',
        howTo: '起點 Memorial Arch（可停留5分鐘拍照，旁邊有小沙灘）→ Great Otway 國家公園 → 坎貝爾港國家公園 Twelve Apostles 十二使徒岩（風很大）→ Maits Rest Rainforest Walk（約停留30-45分）→ 阿德湖峽',
        alternatives: [], mapQuery: 'Great Ocean Road, Australia',
      },
      { time: '途中', type: 'meal', title: 'The Scalloppie（干貝派，白醬口味）', status: 'confirmed' },
      { time: '途中', type: 'meal', title: 'Dooley’s（巧克力系列冰淇淋）', status: 'confirmed' },
    ],
    notes: ['提醒：明天(10/4)凌晨澳洲會實施夏令節約時間，墨爾本會從快台灣2小時變成快3小時'],
  },
  {
    day: 11, date: '2026-10-04', weekday: '星期日',
    city: '墨爾本', citySlug: 'melbourne',
    accommodation: null,
    segments: [
      { time: '09:00', type: 'activity', title: 'Coffee Laneway 咖啡街', status: 'confirmed', duration: '建議1小時', mapQuery: 'Degraves Street, Melbourne, Australia' },
      { time: '11:00', type: 'activity', title: 'State Library Victoria', status: 'confirmed', duration: '建議1~1.5小時', howTo: '很美的圖書館，10:00-18:00開放', mapQuery: 'State Library Victoria, Australia' },
      { time: '13:00', type: 'activity', title: 'Brighton Beach 彩虹小屋沙灘', status: 'confirmed', duration: '建議1小時', mapQuery: 'Brighton Beach, Melbourne, Australia' },
      { time: '15:00', type: 'activity', title: '搭車回市區逛街', status: 'confirmed', duration: '建議1~2小時（依集合時間彈性調整）', mapQuery: 'Melbourne CBD, Australia' },
      {
        time: '（需自行抓時間）', type: 'transport', title: '前往墨爾本機場', status: 'tbd',
        warning: '今天白天行程排到15:00後才回市區逛街，晚上21:50就要起飛，記得預留足夠時間退房、拿行李、到機場（墨爾本機場離市區車程約30-40分視路況）',
        mapQuery: 'Melbourne Airport, Australia',
      },
      { time: '21:50', type: 'flight', title: '墨爾本機場 T2 出發', flightNo: 'CI058', duration: '約9小時25分', status: 'confirmed', mapQuery: 'Melbourne Airport Terminal 2, Australia' },
    ],
    notes: [
      '⏰ 今天凌晨2點澳洲會實施夏令節約時間，時鐘直接跳到3點（少一小時）。從今天開始墨爾本比台灣快3小時（前幾天是快2小時），手機通常會自動校正，但要留意這個變化，晚上21:50的班機時間已經是校正後的時間，不用再自己換算',
    ],
  },
  {
    day: 12, date: '2026-10-05', weekday: '星期一',
    city: '返抵台灣', citySlug: null,
    accommodation: null,
    segments: [
      { time: '04:15', type: 'flight', title: '抵達桃園機場 T2', status: 'confirmed', mapQuery: 'Taoyuan International Airport Terminal 2, Taiwan' },
    ],
    notes: ['旅程結束，辛苦了！'],
  },
];

const CITY_GUIDES = {
  brisbane: {
    name: '布里斯本',
    transportCard: 'Go Card',
    accommodationArea: '中央車站附近',
    airportTransfer: [
      { name: 'Airtrain 機場快線', detail: '最快速且方便，約20分鐘直達中央車站' },
      { name: 'Con-x-ion 機場接駁巴士', detail: '約30~45分鐘，會送達指定飯店門口，適合住宿非市中心的旅客' },
      { name: 'Uber、計程車、租車自駕', detail: '適合多人共乘，但市中心停車費較高，自駕建議搭配住宿附車位使用' },
    ],
    attractions: [
      { name: '市政廳 Brisbane City Hall', howTo: '火車到「Central Station」出站步行5分', desc: '位於喬治國王廣場，是公認「布里斯本最美的建築」之一', mapQuery: 'Brisbane City Hall, Australia' },
      { name: '布里斯本博物館 Museum of Brisbane', howTo: '在市政廳內', desc: '可免費登上「鐘塔」俯瞰廣場美景', mapQuery: 'Museum of Brisbane, Australia' },
      { name: '亞伯特教堂 Albert Street Uniting Church', howTo: '市政廳斜對面', desc: '', mapQuery: 'Albert Street Uniting Church, Brisbane, Australia' },
      { name: '皇后街購物中心', howTo: '市政廳的下一條街，「Central Station」出站步行5分', desc: '最熱鬧也是最好逛的一條街，可買紀念品，附近還有 David Jones、Myer、Wintergarden 等百貨', mapQuery: 'Queen Street Mall, Brisbane, Australia' },
      { name: '南岸公園', howTo: '火車到「South Brisbane」出站步行約4分鐘', desc: '可戲水，市區必去的景點，拍字母地標', mapQuery: 'South Bank Parklands, Brisbane, Australia' },
      { name: '故事橋', howTo: '火車到「Fortitude Valley」下車步行10分', desc: '可搭渡輪（免費/收費都有），河畔有很多餐廳，晚上橋會打燈', mapQuery: 'Story Bridge, Brisbane, Australia' },
      { name: '布里斯本夜市 Eat Street', howTo: '', desc: '週五六日晚上營業，門票$6', mapQuery: 'Eat Street Northshore, Brisbane, Australia' },
      { name: 'West End Market 市集', howTo: '', desc: '週六限定市集，06:00-14:00', mapQuery: 'West End Markets, Brisbane, Australia' },
      { name: '龍柏動物園 Lone Pine Sanctuary', howTo: '火車於「Toowong」轉乘445號公車到動物園前下車', desc: '無尾熊、袋鼠、鴨嘴獸、袋熊等100種澳洲原生種動物', mapQuery: 'Lone Pine Koala Sanctuary, Australia' },
      { name: '摩頓島', howTo: '搭乘渡輪，或直接參加一日遊', desc: '世界第三大沙島，可體驗浮潛、划艇、衝沙、餵食海豚', mapQuery: 'Moreton Island, Australia' },
    ],
    food: [{ name: '一哥麻辣燙（南洋風味）', detail: '皇后街購物中心' }],
    shopping: ['皇后街購物中心（David Jones、Myer、Wintergarden）'],
  },
  goldcoast: {
    name: '黃金海岸',
    climate: '【春】9~11月：16~26度',
    transportCard: 'Go Card',
    accommodationArea: 'Surfers Paradise 衝浪者天堂 / Broadbeach',
    airportTransfer: [
      { name: 'Gold Coast Express', detail: '布里斯本機場三樓搭乘，約2小時' },
      { name: '購買 Go Card', detail: '在購買火車票的櫃檯可直接購買 Go Card，卡片費用AU$10、儲值AU$20，會比直接買票便宜五元；回程時只能在「Cavill Ave車站」退餘額' },
    ],
    attractions: [
      { name: '衝浪者天堂 Surfers Paradise', howTo: '', desc: '週三、五、日，下午～晚上8點可以逛「濱海市場」', mapQuery: 'Surfers Paradise, Gold Coast, Australia' },
      { name: 'Sky Point Q1大廈', howTo: '', desc: '77樓高空景觀台', mapQuery: 'SkyPoint Observation Deck, Gold Coast, Australia' },
      { name: 'Pacific Fair Shopping Centre', howTo: '', desc: '購物商場逛街', mapQuery: 'Pacific Fair Shopping Centre, Gold Coast, Australia' },
      { name: '可倫賓動物園 Currumbin Wildlife Sanctuary', howTo: '', desc: '', mapQuery: 'Currumbin Wildlife Sanctuary, Australia' },
    ],
    food: [
      { name: 'Marios Italian Restaurant', detail: '好吃的義式餐廳，要預約', mapQuery: 'Marios Italian Restaurant, Surfers Paradise, Australia' },
      { name: 'Costa D’oro Italian Restaurant and Pizzeria', detail: '義式餐廳，鮮蝦飯好吃', mapQuery: 'Costa D\'oro Italian Restaurant and Pizzeria, Gold Coast, Australia' },
      { name: 'Pancakes On The Rocks', detail: '澳洲鬆餅名店，必點戰斧肋排', mapQuery: 'Pancakes on the Rocks, Surfers Paradise, Australia' },
      { name: 'Hurricane’s Grill Surfer’s Paradise', detail: '澳洲有名的豬肋排店，必點「火焰燒烤豬」、「羊肋排」', mapQuery: 'Hurricanes Grill Surfers Paradise, Australia' },
    ],
    shopping: ['很多紀念品店', 'Woolworths 超市'],
  },
  sydney: {
    name: '雪梨',
    transportCard: 'Opal Card / 信用卡（可直接感應搭乘）',
    accommodationArea: '中央車站附近',
    attractions: [
      { name: '雪梨歌劇院', howTo: '', desc: '', mapQuery: 'Sydney Opera House, Australia' },
      { name: '環形碼頭', howTo: '歌劇院步行只要10分鐘', desc: '', mapQuery: 'Circular Quay, Sydney, Australia' },
      { name: '雪梨港灣大橋', howTo: '由北到南走約20分鐘，入口在岩石區：Argyle Stairs（爬樓梯）、Bridge Stairs（樓梯/電梯）', desc: '', mapQuery: 'Sydney Harbour Bridge, Australia' },
      { name: '邦迪海灘', howTo: '搭乘333號巴士直達，1小時', desc: '城市海灘，可順遊冰山泳池與邦迪到庫吉海岸步道', mapQuery: 'Bondi Beach, Australia' },
      { name: '賞鯨', howTo: '史蒂芬港出發', desc: '', mapQuery: 'Port Stephens, Australia' },
      { name: '岩石區、假日市集', howTo: '在環形碼頭左邊', desc: '假日市集不一定遇得到', mapQuery: 'The Rocks Markets, Sydney, Australia' },
      { name: '麥奎里夫人石椅 Mrs Macquarie’s Chair', howTo: '', desc: '拍港灣大橋、雪梨歌劇院的絕佳地點', mapQuery: "Mrs Macquarie's Chair, Sydney, Australia" },
      { name: '海德公園 + 聖母主教座堂', howTo: '從雪梨皇家植物園一路散步往南走', desc: '阿齊保噴泉指向教堂', mapQuery: 'Hyde Park, Sydney, Australia' },
      { name: '維多利亞女王大廈', howTo: '喬治街', desc: '購物中心，羅馬風建築', mapQuery: 'Queen Victoria Building, Sydney, Australia' },
      { name: '雪梨塔 Sydney Tower Eye', howTo: '', desc: '有觀景台，也有旋轉餐廳（360 Bar and Dining）', mapQuery: 'Sydney Tower Eye, Australia' },
      { name: '達令港', howTo: '', desc: '', mapQuery: 'Darling Harbour, Sydney, Australia' },
      { name: '塔龍加動物園', howTo: '15分鐘車程', desc: '可看到無尾熊、袋鼠與雪梨港全景', mapQuery: 'Taronga Zoo, Sydney, Australia' },
      { name: '藍山國家公園 Blue Mountain', howTo: '搭乘火車約2小時，或報名一日遊', desc: '主要4個景點：景觀世界、回音谷、巨人階梯、三姊妹岩，可搭纜車俯瞰全景', mapQuery: 'Blue Mountains National Park, Australia' },
    ],
    food: [{ name: 'Hurricane’s Grill 颶風炭烤豬肋排', detail: '環形碼頭分店', mapQuery: 'Hurricanes Grill Circular Quay, Sydney, Australia' }],
    shopping: [],
  },
  melbourne: {
    name: '墨爾本',
    transportCard: 'Myki Card',
    accommodationArea: 'Flinders車站附近',
    airportTransfer: [
      { name: '機場巴士 Skybus', detail: '24小時，便宜，CP值最高' },
      { name: '計程車（Uber）', detail: '約30分鐘，60澳幣' },
      { name: 'Shuttle Bus', detail: '可載到定點飯店，25~35澳幣' },
      { name: 'Metro Bus 轉火車', detail: '' },
    ],
    attractions: [
      { name: '佛林德茲街車站', howTo: 'Flinders St, Melbourne', desc: '白天晚上都可觀賞', mapQuery: 'Flinders Street Station, Melbourne, Australia' },
      { name: 'Degraves Street 咖啡街', howTo: '福林德斯火車站斜對面的步行街', desc: '可吃早午餐', mapQuery: 'Degraves Street, Melbourne, Australia' },
      { name: '聖保羅座堂', howTo: 'Flinders Street、Swanston Street 路口', desc: '8:00-18:00', mapQuery: "St Paul's Cathedral, Melbourne, Australia" },
      { name: '聯邦廣場', howTo: '火車站隔壁', desc: '', mapQuery: 'Federation Square, Melbourne, Australia' },
      { name: '塗鴉巷 Hosier Lane', howTo: '', desc: '', mapQuery: 'Hosier Lane, Melbourne, Australia' },
      { name: '維多利亞女皇市場', howTo: '', desc: '很多紀念品店、穿的、吃的，生蠔、熱狗、漢堡（像餐車）', mapQuery: 'Queen Victoria Market, Melbourne, Australia' },
      { name: '雅拉河畔', howTo: '', desc: '', mapQuery: 'Yarra River, Melbourne, Australia' },
      { name: '維多利亞州立圖書館 State Library Victoria', howTo: '', desc: '很美的圖書館，10:00-18:00', mapQuery: 'State Library Victoria, Australia' },
      { name: 'Melbourne Central', howTo: 'Cnr LaTrobe and Swanston Streets', desc: '百貨公司', mapQuery: 'Melbourne Central, Australia' },
      { name: '維多利亞藝術中心', howTo: '', desc: '', mapQuery: 'Arts Centre Melbourne, Australia' },
      { name: '皇家植物園', howTo: '', desc: '', mapQuery: 'Royal Botanic Gardens Victoria, Melbourne, Australia' },
      { name: '墨爾本戰爭紀念館', howTo: 'Birdwood Ave Melbourne', desc: '10:00-17:00，外觀像希臘神廟', mapQuery: 'Shrine of Remembrance, Melbourne, Australia' },
      { name: '皇家拱廊、街區拱廊', howTo: '', desc: '商店街', mapQuery: 'Royal Arcade, Melbourne, Australia' },
      { name: '科林斯街', howTo: '', desc: '金融重地，很多精品、大飯店', mapQuery: 'Collins Street, Melbourne, Australia' },
      { name: '大洋路 Great Ocean Road', howTo: '', desc: 'Memorial Arch → Great Otway 國家公園 → 坎貝爾港國家公園十二使徒岩 → Maits Rest Rainforest Walk（30-45分）→ 阿德湖峽', mapQuery: 'Great Ocean Road, Australia' },
      { name: '普芬比利小火車 Puffing Billy Railway', howTo: '貝爾格雷夫站至湖濱車站', desc: '需事先訂票，位子選前面較好拍照', mapQuery: 'Puffing Billy Railway, Belgrave, Australia' },
      { name: '菲利浦島一日遊', howTo: '', desc: '彩虹小屋沙灘、月光野生動物園、格蘭特岬角及諾比斯、企鵝歸巢', mapQuery: 'Phillip Island, Australia' },
      { name: '南墨爾本市場', howTo: '搭公車58', desc: '可吃可逛', mapQuery: 'South Melbourne Market, Australia' },
    ],
    food: [
      { name: 'Mary Miller Café', detail: '早餐，咖啡廳', mapQuery: 'Mary Miller Cafe, Melbourne, Australia' },
      { name: '椅子咖啡 Brother Baba Budan', detail: '', mapQuery: 'Brother Baba Budan, Melbourne, Australia' },
      { name: 'Seven Seeds Coffee', detail: '', mapQuery: 'Seven Seeds Coffee, Melbourne, Australia' },
      { name: 'Bratwurst Shop & Co 熱狗堡', detail: '週一、三公休', mapQuery: 'Bratwurst Shop and Co, Melbourne, Australia' },
      { name: 'Hopetoun Tea Rooms', detail: '在拱廊，百年英式茶屋，甜點很美', mapQuery: 'Hopetoun Tea Rooms, Melbourne, Australia' },
      { name: 'Lune', detail: '可頌，Almond口味好吃，16/161 Collins St', mapQuery: 'Lune Croissanterie, Melbourne, Australia' },
      { name: 'The Scalloppie', detail: '干貝派（白醬口味），大洋路途中' },
      { name: 'Dooley’s', detail: '巧克力系列冰淇淋，大洋路途中' },
    ],
    shopping: ['Chemist 藥妝店（澳洲版 olive young）'],
  },
};

const CHECKLIST = [
  { item: '申請 ETA 電子簽證', detail: '建議出發前及早申請完成，Excel 上寫的費用（400元）幣別待確認' },
  { item: '確認雪梨 → 墨爾本交通', detail: 'Day8（10/1）目前完全沒有安排，建議盡快訂國內線機票' },
  { item: '確認雪梨 Meriton Suites 房型', detail: '訂房參數顯示 adults=6/rooms=1，需跟訂房網站或飯店再次確認房間是否住得下6人' },
  { item: '決定 Day9 墨爾本行程', detail: '普芬比利小火車 / 菲利浦島企鵝歸巢，兩者皆全天行程，需擇一' },
  { item: '確認 Day5 黃金海岸退房→機場銜接時間', detail: '12:20的捷星航班，退房與到機場的時間目前沒有明確安排' },
  { item: '確認 Day11 墨爾本返程銜接時間', detail: '21:50起飛，白天行程排到15:00才回市區，記得預留退房、拿行李、到機場的時間' },
  { item: '準備各城市交通卡儲值金', detail: 'Go Card（布里斯本/黃金海岸）、Opal Card（雪梨）、Myki Card（墨爾本）' },
  { item: '國際旅遊保險', detail: '' },
  { item: '網卡 / 漫遊 / Wifi 分享器', detail: '' },
  { item: '澳洲電源轉接頭', detail: '' },
];

const OPEN_ISSUES = [
  { day: 8, issue: '雪梨→墨爾本交通尚未安排', suggestion: '建議訂國內線班機，約1.5~2小時（Qantas / Jetstar / Virgin Australia）' },
  { day: 9, issue: '普芬比利小火車 / 菲利浦島企鵝歸巢 尚未定案', suggestion: '兩者皆全天行程，需擇一；同一天的兩個晚餐選項也需要收斂成一個' },
  { day: 5, issue: '雪梨 Meriton Suites 房型可能不足6人', suggestion: '訂房連結參數是 adults=6/rooms=1，跟其他城市訂3房不同，建議再次確認' },
];
