/**
 * HORNYS-POS — Data access helpers.
 * Centralises Google Sheets reads/writes and avoids cell-by-cell operations.
 */
var DataStore = (function () {
  'use strict';

  function getSheet_(sheetName) {
    if (!sheetName) throw new Error('Nom de feuille manquant.');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error('Feuille introuvable : ' + sheetName);
    return sheet;
  }

  function readAll(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    if (lastRow === 0 || lastColumn === 0) return [];
    return sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  }

  function append(sheetName, row) {
    if (!Array.isArray(row)) throw new Error('La ligne à ajouter doit être un tableau.');
    var sheet = getSheet_(sheetName);
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
  }

  function withLock(callback, timeoutMs) {
    var lock = LockService.getScriptLock();
    var timeout = Number(timeoutMs) || 10000;
    if (!lock.tryLock(timeout)) {
      throw new Error('Le système est momentanément occupé. Réessayez dans quelques secondes.');
    }
    try {
      return callback();
    } finally {
      lock.releaseLock();
    }
  }

  return {
    getSheet: getSheet_,
    readAll: readAll,
    append: append,
    withLock: withLock
  };
})();
