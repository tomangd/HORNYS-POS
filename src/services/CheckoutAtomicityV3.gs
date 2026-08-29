/** HORNYS-POS V3 — compensating transaction helpers for Sheets persistence. */
var CheckoutAtomicityV3 = (function () {
  'use strict';

  /**
   * Google Sheets has no database transaction/rollback primitive.
   * Keep rollback metadata so callers can compensate writes when a later
   * operation fails. This is deliberately small and auditable.
   */
  function snapshotCell_(sheet, row, column) {
    return { sheet: sheet.getName(), row: row, column: column, value: sheet.getRange(row, column).getValue() };
  }

  function restore(snapshot) {
    if (!snapshot || !snapshot.sheet) return;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(snapshot.sheet);
    if (sheet) sheet.getRange(snapshot.row, snapshot.column).setValue(snapshot.value);
  }

  return { snapshotCell: snapshotCell_, restore: restore };
})();
