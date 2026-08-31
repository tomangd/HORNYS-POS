/**
 * HORNYS-POS V3 — stock service.
 *
 * Keeps the existing ARTICLES sheet as the source of truth while recording
 * every adjustment in a dedicated movement journal.
 */
var StockServiceV3 = (function () {
  'use strict';

  var MOVEMENTS_SHEET = 'STOCK_MOVEMENTS';
  var HEADERS = [
    'movement_id', 'article_id', 'article_name', 'quantity',
    'stock_before', 'stock_after', 'reason', 'reference',
    'actor', 'created_at'
  ];

  function ensureSheet_() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MOVEMENTS_SHEET);
    if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(MOVEMENTS_SHEET);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    return sheet;
  }

  function consume(items, actor, reference) {
    Validation.object({ items: items }, 'Mouvements');
    if (!Array.isArray(items) || items.length === 0) throw new Error('Aucun mouvement de stock.');

    var sheet = obtenirFeuille('Articles');
    var rows = sheet.getDataRange().getValues();
    var byRow = {};
    items.forEach(function (item) {
      Validation.object(item, 'Mouvement');
      Validation.required(item.id, 'Article');
      var quantity = Validation.integer(item.quantity, 'Quantité');
      if (quantity <= 0) throw new Error('Quantité de stock invalide.');
      var rowIndex = rows.findIndex(function (row, index) {
        return index > 0 && String(row[0]) === String(item.id);
      });
      if (rowIndex < 1) throw new Error('Article introuvable : ' + item.id);
      byRow[rowIndex] = (byRow[rowIndex] || 0) + quantity;
    });

    var movements = [];
    Object.keys(byRow).forEach(function (key) {
      var rowIndex = Number(key);
      var before = Number(rows[rowIndex][4]) || 0;
      var quantity = byRow[key];
      var after = before - quantity;
      if (after < 0) throw new Error('Stock insuffisant pour ' + rows[rowIndex][1] + '.');
      rows[rowIndex][4] = after;
      movements.push({ rowIndex: rowIndex, id: rows[rowIndex][0], name: rows[rowIndex][1], quantity: -quantity, before: before, after: after });
    });

    var stockValues = rows.slice(1).map(function (row) { return [row[4]]; });
    if (stockValues.length) sheet.getRange(2, 5, stockValues.length, 1).setValues(stockValues);

    var movementSheet = ensureSheet_();
    var startRow = movementSheet.getLastRow() + 1;
    var timestamp = new Date();
    var movementRows = movements.map(function (m) {
      return ['STK-' + Utilities.getUuid(), m.id, m.name, m.quantity, m.before, m.after, 'SALE', reference || '', actor || 'POS', timestamp];
    });
    movementSheet.getRange(startRow, 1, movementRows.length, HEADERS.length).setValues(movementRows);

    return { movements: movements, sheet: 'Articles', movementSheet: MOVEMENTS_SHEET, movementStartRow: startRow, movementCount: movementRows.length };
  }

  function rollback(result) {
    if (!result || !Array.isArray(result.movements)) return;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Articles');
    if (!sheet) return;
    result.movements.forEach(function (movement) {
      sheet.getRange(movement.rowIndex + 1, 5).setValue(movement.before);
    });
    if (result.movementSheet && result.movementStartRow && result.movementCount) {
      var movementSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(result.movementSheet);
      if (movementSheet) movementSheet.deleteRows(result.movementStartRow, Math.min(result.movementCount, movementSheet.getLastRow() - result.movementStartRow + 1));
    }
  }

  return { consume: consume, rollback: rollback };
})();