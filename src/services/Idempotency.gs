/**
 * HORNYS-POS — server-side idempotency guard for critical operations.
 * Uses CacheService so a repeated browser submission cannot immediately
 * execute the same operation twice.
 */
var Idempotency = (function () {
  'use strict';

  function key(operation, requestId) {
    if (!requestId) throw new Error('Identifiant de requête manquant.');
    return 'HORNYS_IDEMPOTENCY_' + String(operation || 'operation') + '_' + String(requestId);
  }

  function claim(operation, requestId, ttlSeconds) {
    var cache = CacheService.getScriptCache();
    var cacheKey = key(operation, requestId);
    if (cache.get(cacheKey)) return false;
    cache.put(cacheKey, '1', Number(ttlSeconds) || 120);
    return true;
  }

  return { claim: claim };
})();
