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
    var movements = [];

    items.forEach(function (item) {
      var rowIndex = rows.findIndex(function (row, index) {
        return index > 0 && String(row[0]) === String(item.id);
      });
      if (rowIndex < 1) throw new Error('Article introuvable : ' + item.id);
      var before = Number(rows[rowIndex][4]) || 0;
      var quantity = Number(item.quantity) || 0;
      if (quantity <= 0 || Math.floor(quantity) !== quantity) {
        throw new Error('Quantité de stock invalide pour ' + rows[rowIndex][1] + '.');
      }
      var after = before - quantity;
      if (after < 0) throw new Error('Stock insuffisant pour ' + rows[rowIndex][1] + '.');
      rows[rowIndex][4] = after;
      movements.push({
        id: rows[rowIndex][0], name: rows[rowIndex][1],
        quantity: -quantity, before: before, after: after
      });
    });

    // One write for the stock column instead of one write per item.
    var stockValues = rows.slice(1).map(function (row) { return [row[4]]; });
    if (stockValues.length) sheet.getRange(2, 5, stockValues.length, 1).setValues(stockValues);

    var movementSheet = ensureSheet_();
    var timestamp = new Date();
    var movementRows = movements.map(function (m) {
      return [
        'STK-' + Utilities.getUuid(), m.id, m.name, m.quantity,
        m.before, m.after, 'SALE', reference || '', actor || 'POS', timestamp
      ];
    });
    movementSheet.getRange(movementSheet.getLastRow() + 1, 1, movementRows.length, HEADERS.length)
      .setValues(movementRows);

    return movements;
  }

  return { consume: consume };
})();
