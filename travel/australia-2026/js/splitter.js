// 分帳記帳工具：團員名單、花費紀錄、結算試算
// 實際的資料存取（本機 or 雲端）都交給 js/cloudsync.js 處理，這裡只管邏輯。

function getMembers() {
  return getCachedTripData().members;
}

function saveMembers(members) {
  updateTripData({ members });
}

function getExpenses() {
  return getCachedTripData().expenses;
}

function saveExpenses(expenses) {
  updateTripData({ expenses });
}

function addExpense(expense) {
  const expenses = getExpenses().slice();
  expenses.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...expense });
  saveExpenses(expenses);
  return expenses;
}

function removeExpense(id) {
  const expenses = getExpenses().filter((e) => e.id !== id);
  saveExpenses(expenses);
  return expenses;
}

// 把所有花費統一換算成AUD基準，算出每個人的淨結餘：正=別人欠他，負=他欠別人
function computeBalances(expenses, members, audToTwdRate) {
  const balance = {};
  members.forEach((m) => { balance[m] = 0; });

  expenses.forEach((e) => {
    if (!(e.payer in balance)) return; // 成員改過名字對不上，安全跳過
    const amountAud = e.currency === 'TWD' ? e.amount / audToTwdRate : e.amount;
    const validParticipants = e.participants.filter((p) => p in balance);
    if (!validParticipants.length) return;
    const share = amountAud / validParticipants.length;
    balance[e.payer] += amountAud;
    validParticipants.forEach((p) => { balance[p] -= share; });
  });

  return balance;
}

// 貪心法把「誰欠誰」簡化成最少的轉帳筆數
function simplifyDebts(balance) {
  const creditors = [];
  const debtors = [];
  Object.entries(balance).forEach(([name, amount]) => {
    if (amount > 0.01) creditors.push({ name, amount });
    else if (amount < -0.01) debtors.push({ name, amount: -amount });
  });
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transactions.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }
  return transactions;
}

// 行前清單狀態：每個人用自己的名字分開存，放在 tripData.checklists[名字] 底下
function getChecklistState() {
  const name = getMyName() || '_local';
  const data = getCachedTripData();
  return (data.checklists && data.checklists[name]) || {};
}

function saveChecklistState(state) {
  const name = getMyName() || '_local';
  const data = getCachedTripData();
  const checklists = { ...(data.checklists || {}), [name]: state };
  updateTripData({ checklists });
}
