/**
 * HORNYS-POS V3 — payment domain validation.
 * This service validates the selected settlement mode without changing the
 * legacy meaning of Facture, Contrat and Ardoise in the POS.
 */
var PaymentServiceV3 = (function () {
  'use strict';

  var METHODS = ['Cash', 'Carte', 'Fidelite', 'Facture', 'Contrat', 'Ardoise'];

  function normalize(method) {
    var value = String(method || '').trim();
    if (!value) return 'Cash';
    var found = METHODS.find(function (item) { return item.toLowerCase() === value.toLowerCase(); });
    if (!found) throw new Error('Mode de paiement invalide : ' + value + '.');
    return found;
  }

  function validateSale(vente, total) {
    var method = normalize(vente.paiement);
    var amount = Validation.positiveNumber(total, 'Total');
    if (method === 'Fidelite' && !vente.rewardId) throw new Error('Une récompense est obligatoire pour un paiement fidélité.');
    // Facture is a normal settlement mode. Contrat is the enterprise-contract
    // mode and therefore requires an active contract. Ardoise requires a target account.
    if (method === 'Contrat' && !vente.contractId) throw new Error('Un contrat est obligatoire pour ce mode de paiement.');
    if (method === 'Ardoise' && (!vente.ardoise || !vente.ardoise.client)) throw new Error('Un compte est obligatoire pour une ardoise.');
    return { method: method, total: amount };
  }

  return { normalize: normalize, validateSale: validateSale };
})();