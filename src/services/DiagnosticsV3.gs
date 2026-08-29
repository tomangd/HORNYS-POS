/**
 * HORNYS-POS V3 — deployment diagnostics.
 * Run `diagnostiquerVenteV3()` once after saving the Apps Script project.
 */
function diagnostiquerVenteV3() {
  var requiredFunctions = [
    'obtenirFeuille',
    'verifierPermission',
    'prochainIdentifiant',
    'contratsEntreprises',
    'lireEmployes',
    'ajouterConsommation',
    'ajouterEntreeLedger',
    'ajouterArdoise',
    'ajouterPointsClient',
    'utiliserOffreClient',
    'getClientRewardsCatalog'
  ];
  var functions = {};
  requiredFunctions.forEach(function (name) {
    functions[name] = typeof this[name] === 'function';
  }, this);

  var sheets = {};
  [
    'Articles', 'Ventes', 'CONTRACT_TRANSACTIONS',
    'CONTRACT_CONSUMPTION', 'REGISTRE_ENTREPRISES'
  ].forEach(function (name) {
    var sheet = obtenirFeuille(name);
    sheets[name] = !!sheet;
  });

  var point = verifierPointEntreeVenteV3();
  var missingFunctions = Object.keys(functions).filter(function (key) {
    return !functions[key];
  });
  var missingSheets = Object.keys(sheets).filter(function (key) {
    return !sheets[key];
  });

  return {
    ok: point.ok && point.v3 && point.service &&
      missingFunctions.length === 0 && missingSheets.length === 0,
    entrypoint: point,
    missingFunctions: missingFunctions,
    missingSheets: missingSheets,
    timestamp: new Date()
  };
}
