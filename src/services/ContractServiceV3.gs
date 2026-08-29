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

  return {
    findActive: findActive,
    validateProducts: validateProducts,
    validateEmployee: validateEmployee
  };
})();
