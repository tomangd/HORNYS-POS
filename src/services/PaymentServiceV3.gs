/**
 * HORNYS-POS V3 — payment domain validation.
 * Money persistence stays inside the sale transaction.
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
    if (method === 'Fidelite') {
      if (!vente.clientId) throw new Error('Un compte client est obligatoire pour la fidélité.');
      if (!vente.rewardId) throw new Error('Une récompense est obligatoire pour un paiement fidélité.');
    }
    // Facture is independent from enterprise contracts. Contrat is the only
    // settlement mode that requires an enterprise contract.
    if (method === 'Contrat' && !vente.contractId) throw new Error('Un contrat est obligatoire pour ce mode de paiement.');
    if (method === 'Facture' && !vente.clientId) throw new Error('Un compte client est obligatoire pour une facture.');
    if (method === 'Ardoise' && (!vente.ardoise || !vente.ardoise.client)) throw new Error('Un compte est obligatoire pour une ardoise.');
    return { method: method, total: amount };
  }

  return { normalize: normalize, validateSale: validateSale };
})();