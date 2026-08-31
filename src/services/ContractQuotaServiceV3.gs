/** HORNYS-POS V3 — per-employee/per-article contract quotas. */
var ContractQuotaServiceV3 = (function () {
  'use strict';

  var HEADERS = ['ID', 'Contract ID', 'Employee ID', 'Article ID', 'Active', 'Quota', 'Period', 'Created At', 'Updated At'];

  function sheet_() {
    return assurerFeuilleAvecEntetes('CONTRACT_EMPLOYEE_ARTICLES', HEADERS);
  }

  function normPeriod_(value) {
    var p = String(value || 'DAY').trim().toUpperCase();
    if (p === 'JOUR' || p === 'DAILY') return 'DAY';
    if (p === 'SEMAINE' || p === 'WEEKLY') return 'WEEK';
    return p === 'WEEK' ? 'WEEK' : 'DAY';
  }

  function rows_() {
    var sheet = sheet_();
    if (sheet.getLastRow() < 2) return [];
    return sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  }

  function list(contractId, employeeId) {
    return rows_().filter(function (r) {
      return String(r[1]) === String(contractId) && (!employeeId || String(r[2]) === String(employeeId));
    }).map(function (r) {
      return { id: r[0], contractId: r[1], employeeId: r[2], articleId: r[3], active: r[4] === true || String(r[4]).toUpperCase() === 'TRUE', quota: Number(r[5]) || 0, period: normPeriod_(r[6]), createdAt: r[7], updatedAt: r[8] };
    });
  }

  function save(contractId, employeeId, rules, vendeurId) {
    if (vendeurId) verifierPermission(vendeurId, 'contrats');
    if (!contractId || !employeeId) throw new Error('Contrat et employé sont obligatoires.');
    var contract = contratsEntreprises().find(function (c) { return String(c.id) === String(contractId); });
    if (!contract) throw new Error('Contrat introuvable.');
    var employee = lireEmployes(contract.companyId).find(function (e) { return String(e.id) === String(employeeId); });
    if (!employee) throw new Error('Employé introuvable pour cette entreprise.');
    var sheet = sheet_();
    var existing = rows_();
    var now = new Date();
    var incoming = Array.isArray(rules) ? rules : [];
    var keep = incoming.filter(Boolean).map(function (r) {
      var quota = Number(r.quota);
      if (!Number.isFinite(quota) || quota < 0) throw new Error('Chaque quota doit être un nombre positif ou nul.');
      return { articleId: String(r.articleId || '').trim(), active: r.active !== false, quota: Math.floor(quota), period: normPeriod_(r.period) };
    }).filter(function (r) { return r.articleId; });
    var rowsToDelete = [];
    existing.forEach(function (r, i) {
      if (String(r[1]) === String(contractId) && String(r[2]) === String(employeeId)) rowsToDelete.push(i + 2);
    });
    rowsToDelete.reverse().forEach(function (rowNumber) { sheet.deleteRow(rowNumber); });
    keep.forEach(function (r) {
      var id = prochainIdentifiant(sheet, 'CQA', now.getFullYear());
      sheet.appendRow([id, contractId, employeeId, r.articleId, r.active, r.quota, r.period, now, now]);
    });
    return list(contractId, employeeId);
  }

  function getRule(rules, contractId, employeeId, articleId) {
    var found = (rules || []).find(function (r) {
      return String(r.contractId) === String(contractId) && String(r.employeeId) === String(employeeId) && String(r.articleId) === String(articleId) && r.active !== false;
    });
    return found ? { quota: Number(found.quota) || 0, period: normPeriod_(found.period) } : null;
  }

  function periodStart_(now, period) {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'WEEK') {
      var day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
    }
    return d;
  }

  function consumed(contractId, employeeId, articleId, period, now) {
    var start = periodStart_(now || new Date(), normPeriod_(period));
    var sheet = obtenirFeuille('CONTRACT_TRANSACTIONS');
    if (!sheet || sheet.getLastRow() < 2) return 0;
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.min(18, sheet.getLastColumn())).getValues();
    return rows.reduce(function (total, row) {
      if (String(row[1]) !== String(contractId) || String(row[3]) !== String(employeeId) || !(row[15] instanceof Date) || row[15] < start) return total;
      var articles = [];
      try { articles = JSON.parse(row[14] || '[]'); } catch (e) { articles = []; }
      var item = articles.find(function (a) { return String(a.id) === String(articleId); });
      return total + (item ? Number(item.quantity) || 0 : 0);
    }, 0);
  }

  function validate(contract, employee, articles, now) {
    var rules = list(contract.id, employee.id).filter(function (r) { return r.active; });
    articles.forEach(function (article) {
      var rule = rules.find(function (r) { return String(r.articleId) === String(article.id); });
      if (!rule) throw new Error('L’article "' + article.nom + '" n’est pas pris en charge par ce contrat pour cet employé.');
      var used = consumed(contract.id, employee.id, article.id, rule.period, now);
      var requested = Number(article.quantity) || 0;
      if (used + requested > rule.quota) {
        var label = rule.period === 'WEEK' ? 'cette semaine' : 'aujourd’hui';
        throw new Error('Quota atteint pour "' + article.nom + '": ' + used + '/' + rule.quota + ' utilisé(s) ' + label + '.');
      }
    });
    return true;
  }

  function overview(contractId, employeeId) {
    var now = new Date();
    return list(contractId, employeeId).filter(function (r) { return r.active; }).map(function (r) {
      return Object.assign({}, r, { consumed: consumed(r.contractId, r.employeeId, r.articleId, r.period, now), remaining: Math.max(0, r.quota - consumed(r.contractId, r.employeeId, r.articleId, r.period, now)) });
    });
  }

  return { list: list, save: save, getRule: getRule, consumed: consumed, validate: validate, overview: overview };
})();

function lireReglesQuotaContrat(contractId, employeeId) {
  return ContractQuotaServiceV3.list(contractId, employeeId);
}
function sauvegarderReglesQuotaContrat(contractId, employeeId, rules, vendeurId) {
  return ContractQuotaServiceV3.save(contractId, employeeId, rules, vendeurId);
}
function obtenirQuotasContrat(contractId, employeeId) {
  return ContractQuotaServiceV3.overview(contractId, employeeId);
}
function validerQuotasContrat(contractId, employeeId, articles) {
  var contract = contratsEntreprises().find(function (c) { return String(c.id) === String(contractId); });
  if (!contract) throw new Error('Contrat introuvable.');
  var employee = lireEmployes(contract.companyId).find(function (e) { return String(e.id) === String(employeeId); });
  if (!employee) throw new Error('Employé introuvable.');
  return ContractQuotaServiceV3.validate(contract, employee, articles || [], new Date());
}

function getContractQuotaRuleForTest(rules, contractId, employeeId, articleId) {
  return ContractQuotaServiceV3.getRule(rules, contractId, employeeId, articleId);
}
