/**
 * HORNYS-POS — server-side idempotency guard for critical operations.
 * Uses CacheService so a repeated browser submission cannot immediately
 * execute the same operation twice.
 */
var Idempotency = (function () {
  'use strict';

  var PREFIX = 'HORNYS_IDEMPOTENCY_';

  function key(operation, requestId) {
    if (!requestId) throw new Error('Identifiant de requête manquant.');
    return PREFIX + String(operation || 'operation') + '_' + String(requestId);
  }

  function claim(operation, requestId, ttlSeconds) {
    var cache = CacheService.getScriptCache();
    var cacheKey = key(operation, requestId);
    if (cache.get(cacheKey)) return false;
    cache.put(cacheKey, '1', Number(ttlSeconds) || 120);
    return true;
  }

  function get(compositeKey) {
    if (!compositeKey) return null;
    var raw = CacheService.getScriptCache().get(String(compositeKey));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function put(compositeKey, value, ttlSeconds) {
    if (!compositeKey) throw new Error('Clé d’idempotence manquante.');
    CacheService.getScriptCache().put(
      String(compositeKey),
      JSON.stringify(value),
      Number(ttlSeconds) || 300
    );
    return value;
  }

  return { claim: claim, get: get, put: put };
})();
