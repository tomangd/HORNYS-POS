/** HORNYS-POS V3 — payment domain validation. */
var PaymentServiceV3 = (function () {
  'use strict';

  var METHODS = ['Cash', 'Carte', 'Fidelite', 'Facture', 'Contrat', 'Ardoise'];
  var ALIASES = {
    'cash': 'Cash', 'especes': 'Cash', 'espèces': 'Cash',
    'carte': 'Carte', 'carte bancaire': 'Carte', 'cb': 'Carte',
    'fidelite': 'Fidelite', 'fidélité': 'Fidelite', 'points': 'Fidelite',
    'facture': 'Facture', 'contrat': 'Contrat', 'contrat entreprise': 'Contrat',
    'ardoise': 'Ardoise'
  };

  function normalize(method) {
    var value = String(method || '').trim();
    if (!value) return 'Cash';
    var alias = ALIASES[value.toLowerCase()];
    if (alias) return alias;
    var found = METHODS.find(function (item) { return item.toLowerCase() === value.toLowerCase(); });
    if (!found) throw new Error('Mode de paiement invalide : ' + value + '.');
    return found;
  }

  function validateSale(vente, total) {
    var method = normalize(vente.paiement);
    var amount = Validation.positiveNumber(total, 'Total');
    if (amount <= 0) throw new Error('Le total de la vente doit être supérieur à 0.');
    if (method === 'Fidelite') {
      if (!vente.clientId) throw new Error('Un compte client est obligatoire pour la fidélité.');
      // La récompense est facultative : un client peut payer en fidélité
      // sans utiliser de récompense sur cette vente.
    }
    if (method === 'Contrat' && !vente.contractId) throw new Error('Un contrat est obligatoire pour ce mode de paiement.');
    // Facture is an independent settlement mode; a client is optional.
    if (method === 'Ardoise' && (!vente.ardoise || !vente.ardoise.client)) throw new Error('Un compte est obligatoire pour une ardoise.');
    return { method: method, total: amount };
  }

  return { normalize: normalize, validateSale: validateSale };
})();
