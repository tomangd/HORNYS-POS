/** HORNYS-POS V3 — best-effort compensation for Google Sheets writes. */
var CompensationServiceV3 = (function () {
  'use strict';

  function restoreCell_(snapshot) {
    if (!snapshot || !snapshot.sheet) return;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(snapshot.sheet);
    if (sheet && snapshot.row > 0 && snapshot.column > 0) {
      sheet.getRange(snapshot.row, snapshot.column).setValue(snapshot.value);
    }
  }

  function removeAppendedRows_(sheetName, startRow, count) {
    if (!sheetName || !startRow || !count) return;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return;
    var last = sheet.getLastRow();
    var end = Math.min(last, startRow + count - 1);
    if (end >= startRow) sheet.deleteRows(startRow, end - startRow + 1);
  }

  function run(actions) {
    if (!Array.isArray(actions)) return;
    var errors = [];
    actions.slice().reverse().forEach(function (action) {
      try {
        if (action.type === 'cell') restoreCell_(action.snapshot);
        else if (action.type === 'rows') removeAppendedRows_(action.sheet, action.startRow, action.count);
      } catch (e) { errors.push(String(e && e.message || e)); }
    });
    if (errors.length) throw new Error('Compensation partielle : ' + errors.join(' | '));
  }

  return { run: run };
})();
