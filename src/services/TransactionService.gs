/**
 * HORNYS-POS V3 — transactional primitives.
 *
 * The V3 sale engine is now self-contained, so the transaction boundary can
 * safely use the global ScriptLock. This prevents two different cashiers from
 * racing on the same stock rows or generating conflicting transaction ids.
 */
var TransactionService = (function () {
  'use strict';

  function execute(key, actor, operation) {
    var operationKey = Validation.required(key, 'Clé de transaction');
    var idempotencyKey = 'sale:' + String(operationKey);
    var existing = Idempotency.get(idempotencyKey);
    if (existing) return existing;

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) {
      throw new Error('Une transaction est déjà en cours. Réessayez dans quelques secondes.');
    }

    try {
      existing = Idempotency.get(idempotencyKey);
      if (existing) return existing;

      var result = operation();
      if (!result || typeof result !== 'object') {
        throw new Error('La transaction n’a retourné aucun résultat valide.');
      }

      var response = Object.assign({}, result, {
        success: result.success !== false,
        v3: true,
        requestId: operationKey
      });

      Idempotency.put(idempotencyKey, response, 900);
      try {
        AuditLog.record(
          'TRANSACTION',
          {
            key: operationKey,
            success: response.success === true,
            transactionId: response.transactionId || ''
          },
          actor || 'POS'
        );
      } catch (auditError) {
        console.error('Audit transaction indisponible', auditError);
      }

      return response;
    } finally {
      lock.releaseLock();
    }
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
