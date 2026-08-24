function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function getSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Feuille introuvable : " + sheetName);
  }

  return sheet;
}

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  return sheet.getDataRange().getValues();
}

function generateId() {
  return Date.now();
}

function getDiscordWebhook() {
  const params = getParametres();

  return params.WEBHOOK_DISCORD ||
    CONFIG.WEBHOOK_DISCORD ||
    "";
}