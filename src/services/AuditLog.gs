/**
 * HORNYS-POS — audit trail.
 * Uses the application's existing JOURNAL_ACTIONS sheet schema.
 */
var AuditLog = (function () {
  'use strict';

  var SHEET = 'JOURNAL_ACTIONS';

  function record(action, details, actor, status) {
    return DataStore.withLock(function () {
      DataStore.getSheet(SHEET);
      var id = 'LOG-' + Utilities.getUuid();
      var now = new Date();
      var user = actor || Session.getActiveUser().getEmail() || 'system';
      DataStore.append(SHEET, [
        id,
        String(action || ''),
        String(user),
        JSON.stringify(details || {}),
        status || 'SUCCESS',
        now
      ]);
      return id;
    });
  }

  return { record: record };
})();
