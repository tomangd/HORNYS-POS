/** HORNYS-POS V3 — payment-specific checkout rules. */
var CheckoutRulesV3 = (function () {
  'use strict';

  function validate(payload) {
    var payment = PaymentServiceV3.normalize(payload.paiement);
    var hasContract = !!payload.contractId;
    var hasLedger = !!(payload.ardoise && payload.ardoise.client);
    var hasReward = !!payload.rewardId;

    if (payment === 'Facture' && !hasContract) {
      throw new Error('Une facture nécessite un contrat ou un compte de facturation.');
    }
    if (payment === 'Contrat' && !hasContract) {
      throw new Error('Sélectionnez un contrat entreprise.');
    }
    if (payment === 'Ardoise' && !hasLedger) {
      throw new Error('Sélectionnez le compte à créditer.');
    }
    if (payment !== 'Ardoise' && hasLedger) {
      throw new Error('Le compte ardoise ne peut être utilisé qu’avec le paiement Ardoise.');
    }
    if (hasReward && payment !== 'Fidelite') {
      throw new Error('Une récompense fidélité doit être encaissée avec le mode Fidélité.');
    }
    if (payment === 'Fidelite' && !payload.clientId) {
      throw new Error('Sélectionnez un client pour utiliser la fidélité.');
    }
    return { payment: payment, contract: hasContract, ledger: hasLedger, reward: hasReward };
  }

  return { validate: validate };
})();
