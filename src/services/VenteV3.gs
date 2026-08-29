/**
 * HORNYS-POS V3 — public sale entrypoint.
 *
 * The existing frontend still calls `enregistrerVenteFormule`. To migrate the
 * live flow without rewriting the large client in one risky change, this file
 * captures the legacy implementation once and replaces the public entrypoint
 * with the V3 transactional wrapper.
 *
 * IMPORTANT: this file must be loaded after Code.js in the Apps Script project
 * so the legacy function has already been parsed before it is captured.
 */

var _hornysLegacyEnregistrerVenteFormule = enregistrerVenteFormule;

var enregistrerVenteFormule = function (venteJSON, requestId) {
  var vente = typeof venteJSON === 'string' ? JSON.parse(venteJSON) : venteJSON;
  Validation.object(vente, 'Vente');
  Validation.required(vente.vendeur, 'Vendeur');
  if (!Array.isArray(vente.articles) || vente.articles.length === 0) {
    throw new Error('Vendeur et commande obligatoires.');
  }

  var operationId = String(
    requestId || vente.requestId || vente.orderId || Utilities.getUuid()
  ).trim();
  Validation.required(operationId, 'Identifiant de transaction');

  return TransactionService.execute(
    operationId,
    String(vente.vendeur),
    function () {
      return _hornysLegacyEnregistrerVenteFormule(vente);
    }
  );
};

/** Explicit V3 endpoint for the next frontend migration step. */
function enregistrerVenteFormuleV3(venteJSON, requestId) {
  return enregistrerVenteFormule(venteJSON, requestId);
}

/** Diagnostic used to verify the live public entrypoint after deployment. */
function verifierPointEntreeVenteV3() {
  return {
    ok: typeof enregistrerVenteFormule === 'function',
    v3: String(enregistrerVenteFormule).indexOf('TransactionService.execute') !== -1,
    legacyCaptured: typeof _hornysLegacyEnregistrerVenteFormule === 'function'
  };
}
