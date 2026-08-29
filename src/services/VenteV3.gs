/**
 * HORNYS-POS V3 — public sale entrypoint.
 *
 * The sale business logic now lives in VenteServiceV3. This file contains
 * only the stable public API and transaction boundary; it no longer depends
 * on Code.js declaration order or a captured legacy function.
 */

function enregistrerVenteFormule(venteJSON, requestId) {
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
      return VenteServiceV3.execute(vente);
    }
  );
}

/** Explicit V3 endpoint retained for frontend migration and diagnostics. */
function enregistrerVenteFormuleV3(venteJSON, requestId) {
  return enregistrerVenteFormule(venteJSON, requestId);
}

function verifierPointEntreeVenteV3() {
  return {
    ok: typeof enregistrerVenteFormule === 'function',
    v3: true,
    legacyCaptured: false,
    service: typeof VenteServiceV3 !== 'undefined'
  };
}
