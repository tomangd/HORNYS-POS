/** HORNYS-POS V3 — idempotent loyalty side effects. */
var LoyaltyTransactionV3 = (function () {
  'use strict';
  var PREFIX = 'LOYALTY_TX:';

  function key(orderId, action) {
    return PREFIX + String(orderId) + ':' + String(action);
  }

  function done(orderId, action) {
    return Boolean(CacheService.getScriptCache().get(key(orderId, action)));
  }

  function mark(orderId, action) {
    CacheService.getScriptCache().put(key(orderId, action), '1', 21600);
  }

  function award(orderId, clientId, amount) {
    if (done(orderId, 'AWARD')) return { applied: false, reason: 'ALREADY_APPLIED' };
    var points = CustomerServiceV3.addPoints(clientId, amount);
    mark(orderId, 'AWARD');
    return { applied: true, points: points };
  }

  function redeem(orderId, clientId, rewardId) {
    if (done(orderId, 'REDEEM')) return { applied: false, reason: 'ALREADY_APPLIED' };
    var result = CustomerServiceV3.redeem(clientId, rewardId);
    mark(orderId, 'REDEEM');
    return { applied: true, result: result };
  }

  return { award: award, redeem: redeem };
})();
