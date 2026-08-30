/**
 * HORNYS-POS — Google Sheets name compatibility.
 *
 * Legacy installations can contain tabs named "Articles" while V3 maps
 * that logical sheet to "ARTICLES". Prefer the mapped tab when it contains
 * data, but transparently fall back to the legacy/case-insensitive tab when
 * the mapped tab is empty or absent.
 */
function obtenirFeuille(nom) {
  var requested = String(nom || '').trim();
  var mapped = (typeof NOMS_ONGLETS !== 'undefined' && NOMS_ONGLETS[requested])
    ? String(NOMS_ONGLETS[requested]).trim()
    : requested;

  var sheets = SHEET.getSheets();
  var exact = function (name) {
    var target = String(name || '').trim();
    if (!target) return null;
    return sheets.find(function (sheet) {
      return sheet.getName().trim() === target;
    }) || null;
  };
  var insensitive = function (name) {
    var target = String(name || '').trim().toLowerCase();
    if (!target) return null;
    return sheets.find(function (sheet) {
      return sheet.getName().trim().toLowerCase() === target;
    }) || null;
  };

  var mappedSheet = exact(mapped) || insensitive(mapped);
  var requestedSheet = exact(requested);

  if (mappedSheet && requestedSheet && mappedSheet.getSheetId() !== requestedSheet.getSheetId()) {
    var mappedRows = mappedSheet.getLastRow();
    var requestedRows = requestedSheet.getLastRow();
    if (mappedRows <= 1 && requestedRows > 1) return requestedSheet;
  }

  return mappedSheet || requestedSheet || insensitive(requested) || null;
}

/** Diagnostic helper: shows which physical sheet is used for the Articles key. */
function diagnostiquerCatalogueArticlesV3() {
  var candidates = SHEET.getSheets().map(function (sheet) {
    return {
      name: sheet.getName(),
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    };
  });
  var selected = obtenirFeuille('Articles');
  return {
    selected: selected ? selected.getName() : null,
    candidates: candidates,
    timestamp: new Date()
  };
}
