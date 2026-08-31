/**
 * HORNYS-POS V3 — checkout orchestration.
 * One canonical payload builder for the caisse and a single server entry point.
 */
var CheckoutServiceV3 = (function () {
  'use strict';

  function normalize(payload) {
    Validation.object(payload, 'Encaissement');
    var articles = TransactionService.validateCart(payload.articles);
    if (!articles.length) throw new Error('Le panier est vide.');
    var normalized = Object.assign({}, payload);
    normalized.articles = articles;
    normalized.vendeur = String(payload.vendeur || '').trim();
    if (!normalized.vendeur) throw new Error('Vendeur non identifié.');
    normalized.paiement = PaymentServiceV3.normalize(payload.paiement);
    normalized.orderId = String(payload.orderId || '').trim();
    if (!normalized.orderId) throw new Error('Identifiant de commande manquant.');
    CheckoutRulesV3.validate(normalized);
    return normalized;
  }

  function execute(payload) {
    return VenteServiceV3.execute(normalize(payload));
  }

  return { normalize: normalize, execute: execute };
})();