/**
 * HORNYS-POS V3 — transactional primitives.
 *
 * During the V2 -> V3 migration, some legacy domain functions still own
 * their ScriptLock. The transaction service therefore provides idempotency,
 * validation and auditing here, while allowing those legacy functions to
 * retain their existing lock until their internals are extracted.
 */
var TransactionService = (function () {
  'use strict';

  function execute(key, actor, operation) {
    var operationKey = Validation.required(key, 'Clé de transaction');
    var idempotencyKey = 'sale:' + String(operationKey);
    var existing = Idempotency.get(idempotencyKey);
    if (existing) return existing;

    var result = operation();
    var response = result && result.success === false
      ? result
      : Response.ok(result);

    Idempotency.put(idempotencyKey, response, 900);
    try {
      AuditLog.record(
        'TRANSACTION',
        {
          key: operationKey,
          success: response.success === true
        },
        actor || 'POS'
      );
    } catch (auditError) {
      console.error('Audit transaction indisponible', auditError);
    }
    return response;
  }

  function validateCart(cart) {
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error('La commande est vide.');
    }

    return cart.map(function (item) {
      Validation.object(item, 'Article');
      var quantity = Validation.integer(item.quantity, 'Quantité');
      if (quantity <= 0) throw new Error('La quantité doit être supérieure à 0.');
      Validation.required(item.id, 'Article');
      var unitPrice = Validation.positiveNumber(item.prix, 'Prix');
      return {
        id: item.id,
        nom: String(item.nom || '').trim(),
        quantity: quantity,
        prix: Math.round(unitPrice * 100) / 100
      };
    });
  }

  return {
    execute: execute,
    validateCart: validateCart
  };
})();
