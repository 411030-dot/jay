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
