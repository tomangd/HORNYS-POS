/**
 * HORNYS-POS V3 — sale business service.
 *
 * This is the migrated sale engine. It owns validation and persistence and
 * deliberately does not acquire a ScriptLock: TransactionService owns the
 * transaction boundary and UserLock.
 */
var VenteServiceV3 = (function () {
  'use strict';

  function list_(value) {
    return String(value || '')
      .split(',')
      .map(function (v) { return v.trim(); })
      .filter(Boolean);
  }

  function buildArticles_(vente) {
    var sheet = obtenirFeuille('Articles');
    if (!sheet || sheet.getLastRow() < 2) throw new Error('Aucun article configuré.');
    var rows = sheet.getDataRange().getValues();

    return vente.articles.map(function (item) {
      var source = item && item.article ? item.article : item;
      Validation.object(source, 'Article');
      var id = Validation.required(source.id, 'Article');
      var row = rows.slice(1).find(function (r) { return String(r[0]) === String(id); });
      var quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0 || Math.floor(quantity) !== quantity) {
        throw new Error('Quantité invalide pour ' + (row ? row[1] : id) + '.');
      }
      if (!row) throw new Error('Article invalide : ' + id + '.');
      if (row[7] === false || String(row[7]).toUpperCase() === 'FALSE') {
        throw new Error('Article indisponible : ' + row[1] + '.');
      }
      if (Number(row[4]) < quantity) throw new Error('Stock insuffisant pour ' + row[1] + '.');
      return {
        id: row[0],
        nom: String(row[1] || ''),
        quantity: quantity,
        prix: arrondirMontant(row[3])
      };
    });
  }

  function findContract_(vente, now) {
    if (!vente.contractId) return null;
    var contract = contratsEntreprises().find(function (item) {
      return String(item.id) === String(vente.contractId);
    });
    if (!contract || !contract.actif || (contract.endDate instanceof Date && contract.endDate < now)) {
      throw new Error('Contrat absent, suspendu ou expiré.');
    }
    return contract;
  }

  function validateContract_(vente, contract, articles, now) {
    if (!contract) return null;
    if (!vente.employeeId) throw new Error('Employé obligatoire pour une vente sous contrat.');

    var employee = lireEmployes(contract.companyId).find(function (item) {
      return String(item.id) === String(vente.employeeId);
    });
    if (!employee || String(employee.status).toUpperCase() !== 'ACTIF') {
      throw new Error('Employé obligatoire ou non autorisé.');
    }

    var allowedEmployees = list_(contract.allowedEmployees);
    if (allowedEmployees.length &&
        allowedEmployees.indexOf(String(employee.id)) === -1 &&
        allowedEmployees.indexOf(String(employee.identifier)) === -1) {
      throw new Error("Cet employé n’est pas autorisé par le contrat.");
    }

    var allowedProducts = list_(contract.allowedProducts);
    var forbiddenProducts = list_(contract.forbiddenProducts);
    if (allowedProducts.length && articles.some(function (item) {
      return allowedProducts.indexOf(String(item.id)) === -1;
    })) throw new Error("Un article n’est pas autorisé par le contrat.");
    if (articles.some(function (item) {
      return forbiddenProducts.indexOf(String(item.id)) !== -1;
    })) throw new Error('Un article est interdit par le contrat.');

    var txSheet = obtenirFeuille('CONTRACT_TRANSACTIONS');
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var txRows = txSheet && txSheet.getLastRow() > 1
      ? txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 18).getValues()
      : [];
    var todayRows = txRows.filter(function (row) {
      return String(row[1]) === String(contract.id) &&
        String(row[3]) === String(employee.id) &&
        row[15] instanceof Date && row[15] >= todayStart;
    });

    if (contract.dailyLimitEnabled && contract.dailyLimitTransactions &&
        todayRows.length >= Number(contract.dailyLimitTransactions)) {
      throw new Error('La limite quotidienne de transactions est atteinte.');
    }

    var requestedSubtotal = arrondirMontant(articles.reduce(function (sum, item) {
      return sum + item.prix * item.quantity;
    }, 0));
    if (contract.dailyLimitEnabled && contract.dailyLimitAmount) {
      var todayAmount = todayRows.reduce(function (sum, row) { return sum + Number(row[10] || 0); }, 0);
      if (todayAmount + requestedSubtotal > Number(contract.dailyLimitAmount)) {
        throw new Error('La limite quotidienne du contrat est atteinte.');
      }
    }

    if (contract.type === 'HEBDOMADAIRE_FIXE' && contract.includedQuantity) {
      var weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      var consumptionSheet = obtenirFeuille('CONTRACT_CONSUMPTION');
      var consumptionRows = consumptionSheet && consumptionSheet.getLastRow() > 1
        ? consumptionSheet.getRange(2, 1, consumptionSheet.getLastRow() - 1, 9).getValues()
        : [];
      var consumed = consumptionRows.filter(function (row) {
        return String(row[1]) === String(contract.id) && row[8] instanceof Date && row[8] >= weekStart;
      }).reduce(function (sum, row) { return sum + Number(row[6] || 0); }, 0);
      var requested = articles.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      if (!contract.allowedOverage && consumed + requested > Number(contract.includedQuantity)) {
        throw new Error('Le quota hebdomadaire du contrat est dépassé.');
      }
    }

    return employee;
  }

  function redeemReward_(vente, total) {
    if (!vente.rewardId) return;
    if (!vente.clientId || vente.paiement !== 'Fidelite') {
      throw new Error('Un compte fidélité est obligatoire pour cette récompense.');
    }
    var reward = getClientRewardsCatalog().find(function (item) {
      return String(item.id) === String(vente.rewardId);
    });
    var client = trouverClientParId(vente.clientId);
    if (!reward || !client || Number(client.points || 0) < Number(reward.points)) {
      throw new Error('Solde de points insuffisant pour cette récompense.');
    }
    var redemption = utiliserOffreClient(vente.clientId, reward.id);
    if (!redemption.ok) throw new Error(redemption.message);
  }

  function persist_(vente, articles, contract, employee, subtotal, discount, total, now) {
    var transactionId = prochainIdentifiant(obtenirFeuille('CONTRACT_TRANSACTIONS'), 'TX', now.getFullYear());
    var orderId = vente.orderId || transactionId;
    var companyAmount = contract ? arrondirMontant(total * Number(contract.companyPercent || 0) / 100) : 0;
    var employeeAmount = arrondirMontant(total - companyAmount);

    var salesSheet = obtenirFeuille('Ventes');
    var dateStr = Utilities.formatDate(now, 'Europe/Paris', 'dd/MM/yyyy');
    var timeStr = Utilities.formatDate(now, 'Europe/Paris', 'HH:mm:ss');
    salesSheet.appendRow([
      salesSheet.getLastRow() + 1, dateStr, timeStr, vente.vendeur,
      JSON.stringify(articles), subtotal, discount, total,
      vente.paiement || 'Cash', companyAmount > 0 ? 'Oui' : 'Non',
      contract ? 'CONTRAT_' + contract.type : 'Complétée', vente.clientId || ''
    ]);

    var articleSheet = obtenirFeuille('Articles');
    var rows = articleSheet.getDataRange().getValues();
    var updates = [];
    articles.forEach(function (item) {
      var index = rows.findIndex(function (row, i) { return i > 0 && String(row[0]) === String(item.id); });
      if (index < 1) throw new Error('Article introuvable pendant la mise à jour du stock.');
      var newStock = Number(rows[index][4]) - item.quantity;
      if (newStock < 0) throw new Error('Stock insuffisant pour ' + item.nom + '.');
      updates.push({ row: index + 1, value: newStock });
    });
    updates.forEach(function (u) { articleSheet.getRange(u.row, 5).setValue(u.value); });

    if (contract) {
      var company = trouverClientParId(contract.companyId) || {};
      var txSheet = obtenirFeuille('CONTRACT_TRANSACTIONS');
      txSheet.appendRow([
        transactionId, contract.id, contract.companyId, employee.id,
        employee.name, employee.identifier, orderId, contract.type,
        total, employeeAmount, companyAmount, discount,
        vente.paiement || 'Cash', vente.vendeur, JSON.stringify(articles),
        now, 'NON_ENVOYE', 'ENREGISTREE'
      ]);

      if (contract.type === 'HEBDOMADAIRE_FIXE') {
        articles.forEach(function (item) {
          ajouterConsommation({
            contractId: contract.id, companyId: contract.companyId,
            transactionId: transactionId, productId: item.id,
            productName: item.nom, quantity: item.quantity,
            unitPrice: item.prix, consumedAt: now
          });
        });
      }
      if (companyAmount > 0) {
        ajouterEntreeLedger({
          companyId: contract.companyId, contractId: contract.id,
          transactionId: transactionId, employeeId: employee.id,
          amount: companyAmount, type: 'DEBIT', createdAt: now,
          status: 'OUVERT'
        });
      }
      var webhookStatus = envoyerWebhookContrat(
        contract, employee, articles, total, employeeAmount,
        companyAmount, vente.vendeur, transactionId
      );
      txSheet.getRange(txSheet.getLastRow(), 17).setValue(webhookStatus);

      return {
        success: true, transactionId: transactionId, total: total,
        employeeAmount: employeeAmount, companyAmount: companyAmount,
        companyName: company.companyName || company.nom || contract.companyName
      };
    }

    if (vente.ardoise && vente.ardoise.client) {
      ajouterArdoise({
        clientId: vente.ardoise.client,
        employeeName: vente.ardoise.employe || '-',
        total: total, paid: 0, balance: total,
        startDate: now, status: 'En attente'
      });
    }
    if (!vente.rewardId && vente.clientId &&
        (trouverClientParId(vente.clientId) || {}).type === 'Particulier') {
      ajouterPointsClient(vente.clientId, total);
    }

    return {
      success: true, transactionId: orderId, total: total,
      employeeAmount: total, companyAmount: 0
    };
  }

  function execute(vente) {
    var articles = buildArticles_(vente);
    var now = new Date();
    var contract = findContract_(vente, now);
    var employee = validateContract_(vente, contract, articles, now);
    var subtotal = arrondirMontant(articles.reduce(function (sum, item) {
      return sum + item.prix * item.quantity;
    }, 0));
    var discount = contract && contract.type === 'HEBDOMADAIRE_FIXE'
      ? arrondirMontant(subtotal * Number(contract.reduction || 0) / 100)
      : 0;
    var total = arrondirMontant(subtotal - discount);
    redeemReward_(vente, total);
    return persist_(vente, articles, contract, employee, subtotal, discount, total, now);
  }

  return { execute: execute };
})();
