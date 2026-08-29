/**
 * HORNYS-POS V3 — public sale entrypoint.
 *
 * Compatibility layer: the existing business implementation remains the
 * source of truth for pricing, contracts, stock, loyalty and ledger writes,
 * while this entrypoint adds the V3 transactional boundary and idempotency.
 *
 * Frontend payloads may provide requestId. For older clients, orderId is used
 * when available; otherwise a UUID is generated, preserving compatibility.
 */
function enregistrerVenteFormuleV3(venteJSON, requestId) {
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
      // The legacy implementation performs the complete domain operation.
      // It is deliberately called only inside TransactionService.execute(),
      // so duplicate browser submissions receive the cached first response.
      var result = enregistrerVenteFormuleLegacy_(vente);
      return result;
    }
  );
}

/**
 * Temporary compatibility alias used during the V2 -> V3 migration.
 * Keeping it isolated makes the eventual extraction of the domain operation
 * from Code.js safe and reviewable.
 */
function enregistrerVenteFormuleLegacy_(vente) {
  return enregistrerVenteFormule(vente);
}
