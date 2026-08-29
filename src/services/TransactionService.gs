/**
 * HORNYS-POS V3 — transactional primitives.
 * The global ScriptLock owns the transaction boundary and idempotency prevents duplicate execution.
 */
var TransactionService = (function () {
  'use strict';

  function execute(key, actor, operation) {
    var operationKey = Validation.required(key, 'Clé de transaction');
    var idempotencyKey = 'sale:' + String(operationKey);
    var existing = Idempotency.get(idempotencyKey);
    if (existing) return existing;

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error('Une transaction est déjà en cours. Réessayez dans quelques secondes.');
    try {
      existing = Idempotency.get(idempotencyKey);
      if (existing) return existing;
      var result = operation();
      if (!result || typeof result !== 'object') throw new Error('La transaction n’a retourné aucun résultat valide.');
      var response = Object.assign({}, result, { success: result.success !== false, v3: true, requestId: operationKey });
      Idempotency.put(idempotencyKey, response, 900);
      try { AuditLog.record('TRANSACTION', { key: operationKey, success: response.success === true, transactionId: response.transactionId || '' }, actor || 'POS'); }
      catch (auditError) { console.error('Audit transaction indisponible', auditError); }
      return response;
    } finally {
      lock.releaseLock();
    }
  }

  function validateCart(cart) {
    if (!Array.isArray(cart) || cart.length === 0) throw new Error('La commande est vide.');
    var byId = {};
    cart.forEach(function (item) {
      Validation.object(item, 'Article');
      Validation.required(item.id, 'Article');
      var quantity = Validation.integer(item.quantity, 'Quantité');
      if (quantity <= 0) throw new Error('La quantité doit être supérieure à 0.');
      var id = String(item.id);
      if (!byId[id]) byId[id] = { id: item.id, nom: String(item.nom || '').trim(), quantity: 0, prix: null };
      byId[id].quantity += quantity;
      // Client prices are optional and never become the server price of record.
      if (item.prix !== undefined && item.prix !== null && String(item.prix).trim() !== '') {
        var price = Validation.positiveNumber(item.prix, 'Prix');
        byId[id].prix = Math.round(price * 100) / 100;
      }
    });
    return Object.keys(byId).map(function (id) { return byId[id]; });
  }

  return { execute: execute, validateCart: validateCart };
})();
