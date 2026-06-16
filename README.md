# 單字管理前後端整合

本專案包含：

- `index.html`：管理頁面與學習頁面
- `script.js`：前端 JavaScript，負責送出單字資料到後端
- `google-apps-script.gs`：Google Apps Script 後端，接收資料並寫入 Google 試算表

## 功能

- 管理者在表單中輸入：英文單字、中文翻譯、詞性、例句、字根分析
- 點擊「儲存單字」後，前端會透過 `fetch` 將資料以 JSON POST 到 GAS 後端
- GAS 後端接收資料後，寫入指定試算表工作表 `Words`

## 設定步驟

1. 打開 Google Apps Script 編輯器，建立新的專案，將 `google-apps-script.gs` 的內容貼上。
2. 將 `google-apps-script.gs` 中的 `SPREADSHEET_ID` 替換成你的試算表 ID。
3. 部署 GAS 專案為 Web App，執行者選擇「我自己」，存取權限選擇「任何人，包括匿名使用者」。
4. 部署完成後，複製 Web App URL，貼到 `script.js` 的 `BACKEND_URL`。

## 前端注意事項

- 單字表單欄位：`word`, `translation`, `partOfSpeech`, `example`, `root`
- `save-word` 按鈕會觸發 `saveForm()`，並呼叫 `postWordToBackend()` 將資料送出
- 若後端同步失敗，前端仍會保留本機儲存（LocalStorage）資料

## Google 試算表格式

`Words` 工作表會自動建立標題列：

- 英文單字
- 中文翻譯
- 字根分析
- 例句
- 詞性
- 建立時間
