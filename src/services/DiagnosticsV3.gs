/**
 * HORNYS-POS V3 — deployment diagnostics.
 * Run `diagnostiquerVenteV3()` after saving the Apps Script project.
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

  var services = {
    TransactionService: typeof TransactionService !== 'undefined' && typeof TransactionService.execute === 'function',
    VenteServiceV3: typeof VenteServiceV3 !== 'undefined' && typeof VenteServiceV3.execute === 'function',
    StockServiceV3: typeof StockServiceV3 !== 'undefined' && typeof StockServiceV3.consume === 'function',
    PaymentServiceV3: typeof PaymentServiceV3 !== 'undefined' && typeof PaymentServiceV3.validateSale === 'function',
    ContractServiceV3: typeof ContractServiceV3 !== 'undefined' && typeof ContractServiceV3.findActive === 'function' && typeof ContractServiceV3.validateLimits === 'function',
    CustomerServiceV3: typeof CustomerServiceV3 !== 'undefined' && typeof CustomerServiceV3.addPoints === 'function',
    LoyaltyTransactionV3: typeof LoyaltyTransactionV3 !== 'undefined' && typeof LoyaltyTransactionV3.award === 'function' && typeof LoyaltyTransactionV3.redeem === 'function',
    ArdoiseServiceV3: typeof ArdoiseServiceV3 !== 'undefined' && typeof ArdoiseServiceV3.create === 'function',
    CompensationServiceV3: typeof CompensationServiceV3 !== 'undefined' && typeof CompensationServiceV3.run === 'function'
  };

  var sheets = {};
  [
    'Articles', 'Ventes', 'Clients', 'CONTRACT_TRANSACTIONS',
    'CONTRACT_CONSUMPTION', 'REGISTRE_ENTREPRISES', 'INVOICES'
  ].forEach(function (name) {
    var sheet = obtenirFeuille(name);
    sheets[name] = !!sheet;
  });

  var point = verifierPointEntreeVenteV3();
  var missingFunctions = Object.keys(functions).filter(function (key) {
    return !functions[key];
  });
  var missingServices = Object.keys(services).filter(function (key) {
    return !services[key];
  });
  var missingSheets = Object.keys(sheets).filter(function (key) {
    return !sheets[key];
  });

  return {
    ok: point.ok && point.v3 && point.service &&
      missingFunctions.length === 0 &&
      missingServices.length === 0 &&
      missingSheets.length === 0,
    entrypoint: point,
    functions: functions,
    services: services,
    sheets: sheets,
    missingFunctions: missingFunctions,
    missingServices: missingServices,
    missingSheets: missingSheets,
    timestamp: new Date()
  };
}