// ================================================================
// Medit Marcom Request Bot — Google Apps Script
// 역할: Google Sheets 저장 전용 (Gemini는 프론트에서 직접 호출)
// ================================================================

const SHEET_NAME = 'Requests';

function doGet(e) {
  const param = e.parameter.body;
  if (param) {
    try {
      const body = JSON.parse(decodeURIComponent(param));
      if (body.action === 'save') return handleSave(body);
    } catch(err) {
      return makeResponse({ error: err.message });
    }
  }
  return makeResponse({ status: 'ok' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'save') return handleSave(body);
    return makeResponse({ error: 'Unknown action' });
  } catch (err) {
    return makeResponse({ error: err.message });
  }
}

function makeResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSave(body) {
  const { row } = body;
  if (!row || typeof row !== 'object') return makeResponse({ error: 'Missing row data' });

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = Object.keys(row);
  const values  = Object.values(row).map(v => v || '');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const hr = sheet.getRange(1, 1, 1, headers.length);
    hr.setBackground('#1a56db');
    hr.setFontColor('#ffffff');
    hr.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(values);
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, headers.length).setBackground('#f0f4ff');
  }
  sheet.autoResizeColumns(1, headers.length);

  return makeResponse({ success: true, row: lastRow });
}
