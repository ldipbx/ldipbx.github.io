# troyyan.com

Troy Yan 的個人網站 repo（`ldipbx.github.io`），純靜態 HTML/CSS/JS，沒有任何建置流程。

## 網站結構

```
/                       個人首頁（目前是佔位頁）
/travel/                旅遊區：列出所有行程
/travel/australia-2026/ 2026/9/23–10/5 澳洲行動裝置友善旅遊手冊
```

之後如果有新行程，就在 `travel/` 底下新增一個資料夾（例如 `travel/japan-2027/`），再到 `travel/index.html` 加一張卡片連過去即可。

## 本機預覽

全站都是相對路徑、資料用 `<script src="...">` 內嵌成 JS 變數，不需要啟動伺服器，直接雙擊任何一層的 `index.html` 就能在瀏覽器打開。

如果想用本機伺服器預覽（例如要用手機開發者工具做 RWD 測試）：

```bash
cd website
python -m http.server 8080
# 瀏覽器開 http://localhost:8080
```

## 怎麼更新澳洲行程

所有行程、住宿、城市指南、行前清單資料都在 [travel/australia-2026/js/data.js](travel/australia-2026/js/data.js) 裡，是一般的 JS 陣列/物件，直接編輯即可：

- `DAYS`：13天的每日行程，每天有 `segments`（時間軸項目），每個 segment 有 `status`（`confirmed` 已確定 / `tbd` 待確認 / `candidate` 候選方案 / `action` 待辦）
- `CITY_GUIDES`：四個城市的交通卡、機場交通、景點、美食、購物參考清單
- `CHECKLIST`：行前準備清單
- `OPEN_ISSUES`：目前還沒確定的行程缺口，會顯示在首頁跟行前準備頁最上方

改完存檔、重新整理頁面就會生效，不需要重新build。

## 部署到 GitHub Pages

這個 repo 名稱就是 `<帳號>.github.io`，屬於 GitHub 的「使用者網站」，push 到 `main` branch 之後會自動發布，不需要額外去 Settings → Pages 選分支（但可以進去確認狀態、設定 custom domain）。

```bash
cd website
git add .
git commit -m "說明這次改了什麼"
git push
```

## 接自己的網域：troyyan.com

因為 `troyyan.com` 是裸網域（apex domain，沒有 www 或其他子網域前綴），DNS 設定要用 **4筆 A record**（apex 不能直接用 CNAME）：

1. 專案根目錄已經有 `CNAME` 檔案，內容是 `troyyan.com`，push 上去後 GitHub 就知道要把這個網域對應到這個 repo
2. 到網域的 DNS 管理後台，把 `troyyan.com`（通常填 `@`）的 DNS 設定改成 4 筆 `A` record，指向 GitHub Pages 目前公告的 IP：
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   （這組 IP 已經用很多年沒變過，但正式設定前建議到 GitHub 官方文件 [Managing a custom domain for your GitHub Pages site] 再核對一次最新清單）
3. 如果也想要 `www.troyyan.com` 可以訪問，額外加一筆 `CNAME` record：`www` → `ldipbx.github.io`
4. 都設定好、且 DNS 生效後，到 repo 的 **Settings → Pages**，Custom domain 欄位填入 `troyyan.com` 並儲存，GitHub 會自動幫你申請 HTTPS 憑證
5. 憑證生效後記得把 Settings → Pages 裡的 **Enforce HTTPS** 打開

DNS 設定完成後，之後只要 `git push` 新的 commit，`troyyan.com` 就會自動更新內容，不需要重新設定 DNS 或網域。
