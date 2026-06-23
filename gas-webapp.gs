const SHEET_NAME = 'WeatherRecords';

function doPost(e) {
  try {
    const requestBody = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
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
