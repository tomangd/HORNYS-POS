/**
 * HORNYS-POS V3 — customer and loyalty domain helpers.
 */
var CustomerServiceV3 = (function () {
  'use strict';

  function find(clientId) {
    if (!clientId) return null;
    return trouverClientParId(clientId);
  }

  function requireLoyalty(clientId) {
    var client = find(clientId);
    if (!client) throw new Error('Client introuvable.');
    if (String(client.type || '').toLowerCase() !== 'particulier') {
      throw new Error('Le compte sélectionné ne possède pas de fidélité particulier.');
    }
    return client;
  }

  function addPoints(clientId, amount) {
    var client = requireLoyalty(clientId);
    var value = Validation.positiveNumber(amount, 'Montant fidélité');
    if (value > 0) ajouterPointsClient(client.id, value);
    return value;
  }

  function redeem(clientId, rewardId) {
    requireLoyalty(clientId);
    Validation.required(rewardId, 'Récompense');
    var result = utiliserOffreClient(clientId, rewardId);
    if (!result || result.ok !== true) {
      throw new Error(result && result.message ? result.message : 'Impossible d’utiliser la récompense.');
    }
    return result;
  }

  function applyCheckoutEffects(orderId, clientId, total, rewardId) {
    if (!clientId) return { points: null, reward: null };
    if (!orderId) throw new Error('Identifiant de commande obligatoire pour la fidélité.');
    if (rewardId) return { points: null, reward: LoyaltyTransactionV3.redeem(orderId, clientId, rewardId) };
    return { points: LoyaltyTransactionV3.award(orderId, clientId, total), reward: null };
  }

  return { find: find, requireLoyalty: requireLoyalty, addPoints: addPoints, redeem: redeem, applyCheckoutEffects: applyCheckoutEffects };
})();