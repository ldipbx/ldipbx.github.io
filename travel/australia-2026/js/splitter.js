// 分帳記帳工具：團員名單、花費紀錄、結算試算
// 所有資料都存在這台裝置的 localStorage，不會同步到別人手機上，
// 純粹是給付錢的那個人自己記帳、旅程結束後大家核對用。

const SPLIT_MEMBERS_KEY = 'au_trip_split_members_v1';
const SPLIT_EXPENSES_KEY = 'au_trip_split_expenses_v1';
const DEFAULT_MEMBERS = ['旅伴1', '旅伴2', '旅伴3', '旅伴4', '旅伴5', '旅伴6'];

function getMembers() {
  try {
    const saved = JSON.parse(localStorage.getItem(SPLIT_MEMBERS_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) { /* 用預設值 */ }
  return DEFAULT_MEMBERS.slice();
}

function saveMembers(members) {
  try { localStorage.setItem(SPLIT_MEMBERS_KEY, JSON.stringify(members)); } catch (e) { /* 存不進去就算了 */ }
}

function getExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(SPLIT_EXPENSES_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* 用空陣列 */ }
  return [];
}

function saveExpenses(expenses) {
  try { localStorage.setItem(SPLIT_EXPENSES_KEY, JSON.stringify(expenses)); } catch (e) { /* 存不進去就算了 */ }
}

function addExpense(expense) {
  const expenses = getExpenses();
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
