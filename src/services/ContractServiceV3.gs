/**
 * HORNYS-POS V3 — enterprise contract domain helpers.
 * Read-only validation layer for contract sales. Persistence remains owned by
 * VenteServiceV3 so the whole sale stays inside one transaction boundary.
 */
var ContractServiceV3 = (function () {
  'use strict';

  function findActive(contractId, now) {
    Validation.required(contractId, 'Contrat');
    var contracts = contratsEntreprises();
    var contract = contracts.find(function (item) {
      return String(item.id) === String(contractId);
    });
    if (!contract) throw new Error('Contrat introuvable.');
    if (!contract.actif) throw new Error('Contrat suspendu ou inactif.');
    if (contract.endDate instanceof Date && contract.endDate < now) {
      throw new Error('Contrat expiré.');
    }
    return contract;
  }

  function list(value) {
    return String(value || '').split(',').map(function (v) {
      return v.trim();
    }).filter(Boolean);
  }

  function validateProducts(contract, articles) {
    var allowed = list(contract.allowedProducts);
    var forbidden = list(contract.forbiddenProducts);
    if (allowed.length && articles.some(function (a) {
      return allowed.indexOf(String(a.id)) === -1;
    })) throw new Error('Un article n’est pas autorisé par le contrat.');
    if (articles.some(function (a) {
      return forbidden.indexOf(String(a.id)) !== -1;
    })) throw new Error('Un article est interdit par le contrat.');
  }

  function validateEmployee(contract, employeeId) {
    Validation.required(employeeId, 'Employé');
    var employee = lireEmployes(contract.companyId).find(function (item) {
      return String(item.id) === String(employeeId);
    });
    if (!employee || String(employee.status).toUpperCase() !== 'ACTIF') {
      throw new Error('Employé obligatoire ou non autorisé.');
    }
    var allowed = list(contract.allowedEmployees);
    if (allowed.length && allowed.indexOf(String(employee.id)) === -1 &&
        allowed.indexOf(String(employee.identifier)) === -1) {
      throw new Error('Cet employé n’est pas autorisé par le contrat.');
    }
    return employee;
  }

  function validateLimits(contract, employee, articles, now) {
    var txSheet = obtenirFeuille('CONTRACT_TRANSACTIONS');
    var txRows = txSheet && txSheet.getLastRow() >= 2
      ? txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 18).getValues()
      : [];
    var dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var todayRows = txRows.filter(function (row) {
      return String(row[1]) === String(contract.id) &&
        String(row[3]) === String(employee.id) &&
        row[15] instanceof Date && row[15] >= dayStart;
    });
    if (contract.dailyLimitEnabled && Number(contract.dailyLimitTransactions) > 0 &&
        todayRows.length >= Number(contract.dailyLimitTransactions)) {
      throw new Error('La limite quotidienne de transactions est atteinte.');
    }
    var requestedAmount = articles.reduce(function (sum, item) {
      return sum + Number(item.prix) * Number(item.quantity);
    }, 0);
    var consumedToday = todayRows.reduce(function (sum, row) {
      return sum + Number(row[10] || 0);
    }, 0);
    if (contract.dailyLimitEnabled && Number(contract.dailyLimitAmount) > 0 &&
        consumedToday + requestedAmount > Number(contract.dailyLimitAmount)) {
      throw new Error('La limite quotidienne du contrat est atteinte.');
    }
    if (contract.type === 'HEBDOMADAIRE_FIXE' &&
        Number(contract.includedQuantity) > 0 && !contract.allowedOverage) {
      var weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      var sheet = obtenirFeuille('CONTRACT_CONSUMPTION');
      var rows = sheet && sheet.getLastRow() >= 2
        ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues()
        : [];
      var consumed = rows.filter(function (row) {
        return String(row[1]) === String(contract.id) &&
          row[8] instanceof Date && row[8] >= weekStart;
      }).reduce(function (sum, row) {
        return sum + Number(row[6] || 0);
      }, 0);
      var requested = articles.reduce(function (sum, item) {
        return sum + Number(item.quantity);
      }, 0);
      if (consumed + requested > Number(contract.includedQuantity)) {
        throw new Error('Le quota hebdomadaire du contrat est dépassé.');
      }
    }
    return true;
  }

  return {
    findActive: findActive,
    validateProducts: validateProducts,
    validateEmployee: validateEmployee,
    validateLimits: validateLimits
  };
})();