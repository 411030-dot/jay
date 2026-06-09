# Google Apps Script 單字提交功能教學

## 目標
讓管理者透過現有表單提交單字資料，並將資料送到後端 Google Apps Script，最後寫入 Google 試算表。

## 1. 前端更新
1. 打開 `script.js`。
2. 在檔案開頭加入後端 URL 常數：

```js
const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_ID/exec';
```

3. 加入 `postWordToBackend` 函式，用於將表單資料送出：

```js
async function postWordToBackend(wordData) {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wordData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '後端回傳錯誤');
  }

  return response.json();
}
```

4. 將 `saveForm` 改為 `async`，並在儲存本機資料後呼叫後端：

```js
try {
  await postWordToBackend(item);
  showMessage(`已儲存「${word}」並送到後端。`);
} catch (error) {
  console.error(error);
  showMessage(`已儲存單字，但後端同步失敗：${error.message}`, true);
}
```

5. 確保表單欄位仍包含：
- 英文單字
- 中文翻譯
- 字根分析
- 例句
- 詞性

## 2. 建立 Google 試算表
1. 建立一個新的 Google 試算表。
2. 取名為你喜歡的名稱，例如 `Vocabulary Words`。
3. 取得試算表 ID，網址格式為：

```text
https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
```

## 3. 建立 Google Apps Script
1. 在 Google 試算表中，點選 `擴充功能` → `Apps Script`。
2. 新增一個 Script 檔案，或使用內建的 `Code.gs`。
3. 將以下程式碼貼到 Apps Script：

```js
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Words';
const SHEET_HEADERS = ['英文單字', '中文翻譯', '字根分析', '例句', '詞性', '建立時間'];

function doGet(e) {
  return createJsonResponse({ success: true, message: 'Google Apps Script Web App 已啟動。' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const requiredFields = ['word', 'translation', 'root', 'example', 'partOfSpeech'];
    const missingFields = requiredFields.filter((key) => !data[key] || typeof data[key] !== 'string');

    if (missingFields.length > 0) {
      return createJsonResponse({
        success: false,
        message: '缺少必要欄位：' + missingFields.join(', '),
      }, 400);
    }

    const sheet = getWordSheet();
    const timestamp = new Date();
    sheet.appendRow([
      data.word,
      data.translation,
      data.root,
      data.example,
      data.partOfSpeech,
      timestamp,
    ]);

    return createJsonResponse({ success: true, message: '單字已寫入試算表。' });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: '處理失敗：' + error.message,
    }, 500);
  }
}

function getWordSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(SHEET_HEADERS);
  }
  return sheet;
}

function createJsonResponse(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  if (statusCode) {
    output.setResponseCode(statusCode);
  }
  return output;
}
```

4. 將 `YOUR_SPREADSHEET_ID` 替換成你的試算表 ID。

## 4. 部署為 Web App
1. 點選右上角 `Deploy` → `New deployment`。
2. 選擇 `Web app`。
3. `Description` 可寫 `Vocabulary backend`。
4. `Execute as` 選 `Me`。
5. `Who has access` 選 `Anyone` 或 `Anyone, even anonymous`（依需求）。
6. 部署後，複製 `Web app URL`。

## 5. 更新前端後端 URL
1. 在 `script.js` 中，將 `BACKEND_URL` 更新為你剛剛取得的 Web App URL。
2. 範例：

```js
const BACKEND_URL = 'https://script.google.com/macros/s/XXXXXXX/exec';
```

## 6. 測試流程
1. 開啟前端頁面。
2. 切換到「管理」頁籤。
3. 輸入
   - 英文單字
   - 中文翻譯
   - 字根分析
   - 例句
   - 詞性
4. 按下 `儲存單字`。
5. 確認前端頁面顯示成功訊息。
6. 開啟 Google 試算表，確認新資料列已寫入 `Words` 工作表。

## 7. 如果有錯誤
- 若顯示後端同步失敗，請檢查 `BACKEND_URL` 是否正確。
- 確認 Apps Script 部署存取權限是否允許「Anyone」訪問。
- 確認試算表 ID 已正確填寫。

## 8. 檔案說明
- `script.js`：前端送出單字資料到 Google Apps Script。
- `google-apps-script.gs`：Google Apps Script 後端程式範例，負責接收 POST 請求並寫入試算表。
- `GAS-word-submit-setup.md`：本教學文件。
