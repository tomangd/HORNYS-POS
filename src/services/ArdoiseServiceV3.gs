/**
 * HORNYS-POS V3 — customer/company ledger facade.
 * The transaction boundary is owned by TransactionService; this service must
 * never acquire a nested ScriptLock during a sale.
 */
var ArdoiseServiceV3 = (function () {
  'use strict';

  function create(ardoise, actor) {
    Validation.object(ardoise, 'Ardoise');
    Validation.required(ardoise.clientId, 'Compte ardoise');
    var total = Validation.positiveNumber(ardoise.total, 'Montant ardoise');
    if (total <= 0) throw new Error('Le montant de l’ardoise doit être supérieur à 0.');
    var paid = Validation.positiveNumber(ardoise.paid || 0, 'Montant payé');
    if (paid > total) throw new Error('Le montant payé ne peut pas dépasser le total.');
    var now = ardoise.startDate instanceof Date ? ardoise.startDate : new Date();
    var result = ajouterArdoise({
      clientId: ardoise.clientId,
      employeeName: ardoise.employe || actor || '-',
      total: total,
      paid: paid,
      balance: Math.max(0, total - paid),
      startDate: now,
      status: ardoise.status || (paid >= total ? 'Payée' : 'En attente')
    });
    try { AuditLog.record('ARDOISE_CREATE', { clientId: ardoise.clientId, total: total }, actor || 'POS'); } catch (e) {}
    return result;
  }

  return { create: create };
})();
