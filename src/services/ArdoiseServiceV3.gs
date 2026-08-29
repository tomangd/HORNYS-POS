/**
 * HORNYS-POS V3 — customer/company ledger facade.
 * Keeps the legacy Sheets schema while giving the transaction engine one
 * explicit place for deferred payments.
 */
var ArdoiseServiceV3 = (function () {
  'use strict';

  function create(ardoise, actor) {
    Validation.object(ardoise, 'Ardoise');
    Validation.required(ardoise.clientId, 'Compte ardoise');
    var total = Validation.positiveNumber(ardoise.total, 'Montant ardoise');
    if (total <= 0) throw new Error('Le montant de l’ardoise doit être supérieur à 0.');
    var now = ardoise.startDate instanceof Date ? ardoise.startDate : new Date();
    return DataStore.withLock(function () {
      var result = ajouterArdoise({
        clientId: ardoise.clientId,
        employeeName: ardoise.employe || actor || '-',
        total: total,
        paid: Number(ardoise.paid || 0),
        balance: Math.max(0, total - Number(ardoise.paid || 0)),
        startDate: now,
        status: ardoise.status || 'En attente'
      });
      try { AuditLog.record('ARDOISE_CREATE', { clientId: ardoise.clientId, total: total }, actor || 'POS'); } catch (e) {}
      return result;
    });
  }

  return { create: create };
})();
