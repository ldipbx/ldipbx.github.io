# 澳洲旅遊手冊

9/23–10/5 澳洲行（布里斯本 → 黃金海岸 → 雪梨 → 墨爾本）的行動裝置友善旅遊手冊。純靜態 HTML/CSS/JS，沒有任何建置流程。

## 本機預覽

因為資料是用 `<script src="js/data.js">` 內嵌成 JS 變數（不是用 `fetch` 讀 JSON），可以直接雙擊 `index.html` 在瀏覽器打開，不需要啟動伺服器。

如果想用本機伺服器預覽（例如要用手機開發者工具做 RWD 測試）：

```bash
cd website
python -m http.server 8080
# 瀏覽器開 http://localhost:8080
```

## 怎麼更新行程

所有行程、住宿、城市指南、行前清單資料都在 [js/data.js](js/data.js) 裡，是一般的 JS 陣列/物件，直接編輯即可：

- `DAYS`：13天的每日行程，每天有 `segments`（時間軸項目），每個 segment 有 `status`（`confirmed` 已確定 / `tbd` 待確認 / `candidate` 候選方案 / `action` 待辦）
- `CITY_GUIDES`：四個城市的交通卡、機場交通、景點、美食、購物參考清單
- `CHECKLIST`：行前準備清單
- `OPEN_ISSUES`：目前還沒確定的行程缺口，會顯示在首頁跟行前準備頁最上方

改完存檔、重新整理頁面就會生效，不需要重新build。

## 部署到 GitHub Pages

這個專案要推到 `https://github.com/ldipbx/ldipbx.github.io`，因為 repo 名稱就是 `<帳號>.github.io`，屬於 GitHub 的「使用者網站」，push 到 `main` branch 之後會自動發布在 `https://ldipbx.github.io/`，不需要額外去 Settings → Pages 選分支（但可以進去確認狀態）。

```bash
cd website
git init
git add .
git commit -m "init: 澳洲旅遊手冊"
git branch -M main
git remote add origin https://github.com/ldipbx/ldipbx.github.io.git
git push -u origin main
```

push 完，幾分鐘內 `https://ldipbx.github.io/` 就會看到網站。

## 接自己的網域：troyyan.com

因為 `troyyan.com` 是裸網域（apex domain，沒有 www 或其他子網域前綴），DNS 設定要用 **4筆 A record**（apex 不能直接用 CNAME）：

1. 專案根目錄已經幫你加好 `CNAME` 檔案，內容是 `troyyan.com`，push 上去後 GitHub 就知道要把這個網域對應到這個 repo
2. 到你買網域的 DNS 管理後台（Namecheap / Cloudflare / GoDaddy 等），把 `troyyan.com`（通常填 `@`）的 DNS 設定改成 4 筆 `A` record，指向 GitHub Pages 目前公告的 IP：
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   （這組 IP 已經用很多年沒變過，但正式設定前建議到 GitHub 官方文件 [Managing a custom domain for your GitHub Pages site] 再核對一次最新清單）
3. 如果之後也想要 `www.troyyan.com` 可以訪問，額外加一筆 `CNAME` record：`www` → `ldipbx.github.io`
4. 都設定好、且 DNS 生效後（可能要等幾分鐘到幾小時），到 repo 的 **Settings → Pages**，Custom domain 欄位填入 `troyyan.com` 並儲存，GitHub 會自動幫你申請 HTTPS 憑證
5. 憑證生效後記得把 Settings → Pages 裡的 **Enforce HTTPS** 打開

DNS 設定完成後，之後只要 `git push` 新的 commit，`troyyan.com` 就會自動更新內容。
