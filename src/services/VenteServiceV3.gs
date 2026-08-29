/**
 * HORNYS-POS V3 — sale business service.
 * TransactionService owns the global ScriptLock and idempotency boundary.
 */
var VenteServiceV3 = (function () {
  'use strict';

  function buildArticles_(vente) {
    var sheet = obtenirFeuille('Articles');
    if (!sheet || sheet.getLastRow() < 2) throw new Error('Aucun article configuré.');
    var rows = sheet.getDataRange().getValues();
    var articles = TransactionService.validateCart(vente.articles);
    return articles.map(function (item) {
      var row = rows.slice(1).find(function (r) { return String(r[0]) === String(item.id); });
      if (!row) throw new Error('Article invalide : ' + item.id + '.');
      if (row[7] === false || String(row[7]).toUpperCase() === 'FALSE') throw new Error('Article indisponible : ' + row[1] + '.');
      if (Number(row[4]) < item.quantity) throw new Error('Stock insuffisant pour ' + row[1] + '.');
      return { id: row[0], nom: String(row[1] || ''), quantity: item.quantity, prix: arrondirMontant(row[3]) };
    });
  }

  function findContract_(vente, now) {
    return vente.contractId ? ContractServiceV3.findActive(vente.contractId, now) : null;
  }

  function validateContract_(vente, contract, articles, now) {
    if (!contract) return null;
    var employee = ContractServiceV3.validateEmployee(contract, vente.employeeId);
    ContractServiceV3.validateProducts(contract, articles);
    ContractServiceV3.validateLimits(contract, employee, articles, now);
    return employee;
  }

  function validatePayment_(vente, total) {
    return PaymentServiceV3.validateSale(vente, total);
  }

  function reward_(vente) {
    if (!vente.rewardId) return null;
    if (!vente.clientId || vente.paiement !== 'Fidelite') {
      throw new Error('Un compte fidélité est obligatoire pour cette récompense.');
    }
    return LoyaltyTransactionV3.redeem(vente.orderId, vente.clientId, vente.rewardId);
  }

  function persist_(vente, articles, contract, employee, subtotal, discount, total, now, payment) {
    var transactionId = prochainIdentifiant(obtenirFeuille('CONTRACT_TRANSACTIONS'), 'TX', now.getFullYear());
    var orderId = String(vente.orderId || transactionId);
    var companyAmount = contract ? arrondirMontant(total * Number(contract.companyPercent || 0) / 100) : 0;
    var employeeAmount = arrondirMontant(total - companyAmount);
    var salesSheet = obtenirFeuille('Ventes');
    var stockResult = null;
    var salesRow = salesSheet.getLastRow() + 1;
    var contractRow = null;
    try {
      stockResult = StockServiceV3.consume(articles, vente.vendeur, orderId);
      salesSheet.appendRow([salesRow, Utilities.formatDate(now, 'Europe/Paris', 'dd/MM/yyyy'), Utilities.formatDate(now, 'Europe/Paris', 'HH:mm:ss'), vente.vendeur, JSON.stringify(articles), subtotal, discount, total, payment.method, companyAmount > 0 ? 'Oui' : 'Non', contract ? 'CONTRAT_' + contract.type : 'Complétée', vente.clientId || '']);
      if (contract) {
        var company = trouverClientParId(contract.companyId) || {};
        var txSheet = obtenirFeuille('CONTRACT_TRANSACTIONS');
        contractRow = txSheet.getLastRow() + 1;
        txSheet.appendRow([transactionId, contract.id, contract.companyId, employee.id, employee.name, employee.identifier, orderId, contract.type, total, employeeAmount, companyAmount, discount, payment.method, vente.vendeur, JSON.stringify(articles), now, 'NON_ENVOYE', 'ENREGISTREE']);
        if (contract.type === 'HEBDOMADAIRE_FIXE') articles.forEach(function (item) { ajouterConsommation({ contractId: contract.id, companyId: contract.companyId, transactionId: transactionId, productId: item.id, productName: item.nom, quantity: item.quantity, unitPrice: item.prix, consumedAt: now }); });
        if (companyAmount > 0) ajouterEntreeLedger({ companyId: contract.companyId, contractId: contract.id, transactionId: transactionId, employeeId: employee.id, amount: companyAmount, type: 'DEBIT', createdAt: now, status: 'OUVERT' });
        var webhookStatus = envoyerWebhookContrat(contract, employee, articles, total, employeeAmount, companyAmount, vente.vendeur, transactionId);
        txSheet.getRange(contractRow, 17).setValue(webhookStatus);
        var rewardResult = reward_(vente);
        return { success: true, transactionId: transactionId, total: total, employeeAmount: employeeAmount, companyAmount: companyAmount, companyName: company.companyName || company.nom || contract.companyName, loyalty: rewardResult };
      }
      if (vente.ardoise && vente.ardoise.client) {
        ArdoiseServiceV3.create({ clientId: vente.ardoise.client, employe: vente.ardoise.employe || '-', total: total, paid: 0, startDate: now }, vente.vendeur);
      }
      var loyaltyResult = reward_(vente);
      if (!vente.rewardId && vente.clientId && (trouverClientParId(vente.clientId) || {}).type === 'Particulier') {
        loyaltyResult = LoyaltyTransactionV3.award(orderId, vente.clientId, total);
      }
      return { success: true, transactionId: orderId, total: total, employeeAmount: total, companyAmount: 0, loyalty: loyaltyResult };
    } catch (error) {
      try {
        if (contractRow && contract) {
          var contractSheet = obtenirFeuille('CONTRACT_TRANSACTIONS');
          if (contractSheet.getLastRow() >= contractRow) contractSheet.deleteRow(contractRow);
        }
      } catch (rollbackContractError) { console.error('Rollback contrat échoué', rollbackContractError); }
      try { if (stockResult) StockServiceV3.rollback(stockResult); } catch (rollbackError) { console.error('Rollback stock échoué', rollbackError); }
      try { if (salesSheet.getLastRow() >= salesRow) salesSheet.deleteRow(salesRow); } catch (rollbackSaleError) { console.error('Rollback vente échoué', rollbackSaleError); }
      throw error;
    }
  }

  function execute(vente) {
    Validation.object(vente, 'Vente');
    var articles = buildArticles_(vente);
    var now = new Date();
    var contract = findContract_(vente, now);
    var employee = validateContract_(vente, contract, articles, now);
    var subtotal = arrondirMontant(articles.reduce(function (sum, item) { return sum + item.prix * item.quantity; }, 0));
    var discount = contract && contract.type === 'HEBDOMADAIRE_FIXE' ? arrondirMontant(subtotal * Number(contract.reduction || 0) / 100) : 0;
    var total = arrondirMontant(subtotal - discount);
    var payment = validatePayment_(vente, total);
    return persist_(vente, articles, contract, employee, subtotal, discount, total, now, payment);
  }

  return { execute: execute };
})();