const SHEET_NAME = 'WeatherRecords';
// 如果你的 Apps Script 是獨立專案，請將以下 ID 改成你的 Google 試算表 ID。
const SPREADSHEET_ID = '1WLeeLMa9gXtCjGdkK9oa26oDs6HKT5cxU0srquK_tBg';

function getSpreadsheet() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }
  if (SPREADSHEET_ID && !SPREADSHEET_ID.includes('PUT_YOUR_SPREADSHEET_ID_HERE')) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  throw new Error('無法開啟試算表。請在 gas-webapp.gs 中設定 SPREADSHEET_ID，或將 Apps Script 綁定到試算表。');
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const requestBody = JSON.parse(e.postData.contents);
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    const headers = [
      'Timestamp',
      'City',
      'Country',
      'Description',
      'Temperature',
      'Humidity',
      'Wind Speed',
      'Pressure',
      'Weather Code',
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    sheet.appendRow([
      requestBody.timestamp,
      requestBody.city,
      requestBody.country,
      requestBody.description,
      requestBody.temperature,
      requestBody.humidity,
      requestBody.windSpeed,
      requestBody.pressure,
      requestBody.weatherCode,
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message,
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
