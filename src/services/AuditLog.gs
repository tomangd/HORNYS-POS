/**
 * HORNYS-POS — lightweight audit trail.
 * The existing application can call AuditLog.record() without coupling
 * business logic to a particular sheet layout.
 */
var AuditLog = (function () {
  'use strict';

  var SHEET = 'AUDIT_LOG';

  function record(action, details, actor) {
    return DataStore.withLock(function () {
      var timestamp = new Date();
      var user = actor || Session.getActiveUser().getEmail() || 'system';
      DataStore.append(SHEET, [timestamp, user, String(action || ''), JSON.stringify(details || {})]);
      return true;
    });
  }

  return { record: record };
})();
