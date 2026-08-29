/** HORNYS-POS V3 — non-destructive smoke tests for pure checkout rules. */
function executerSmokeTestsV3() {
  var tests = [];
  function test(name, fn) {
    try { fn(); tests.push({ name: name, ok: true }); }
    catch (error) { tests.push({ name: name, ok: false, error: error.message || String(error) }); }
  }
  function expectThrow(name, fn) {
    test(name, function () {
      var thrown = false;
      try { fn(); } catch (error) { thrown = true; }
      if (!thrown) throw new Error('Une erreur était attendue.');
    });
  }

  test('Payment: Cash', function () { if (PaymentServiceV3.normalize('Cash') !== 'Cash') throw new Error('Normalisation incorrecte.'); });
  test('Payment: Espèces alias', function () { if (PaymentServiceV3.normalize('Espèces') !== 'Cash') throw new Error('Alias incorrect.'); });
  test('Payment: Carte alias', function () { if (PaymentServiceV3.normalize('CB') !== 'Carte') throw new Error('Alias incorrect.'); });
  test('Payment: Fidélité alias', function () { if (PaymentServiceV3.normalize('Fidélité') !== 'Fidelite') throw new Error('Alias incorrect.'); });
  expectThrow('Payment: mode inconnu', function () { PaymentServiceV3.normalize('Bitcoin'); });

  test('Cart: fusion des lignes identiques', function () {
    var cart = TransactionService.validateCart([{ id: 1, quantity: 2 }, { id: 1, quantity: 3 }]);
    if (cart.length !== 1 || cart[0].quantity !== 5) throw new Error('Agrégation incorrecte.');
  });
  test('Cart: prix client optionnel', function () {
    var cart = TransactionService.validateCart([{ id: 1, quantity: 1 }]);
    if (cart[0].prix !== null) throw new Error('Le prix devrait être résolu côté serveur.');
  });
  expectThrow('Cart: quantité nulle', function () { TransactionService.validateCart([{ id: 1, quantity: 0 }]); });
  expectThrow('Cart: quantité fractionnaire', function () { TransactionService.validateCart([{ id: 1, quantity: 1.5 }]); });

  test('Rules: Contrat sans contrat refusé', function () {
    var failed = false;
    try { CheckoutRulesV3.validate({ paiement: 'Contrat' }); } catch (error) { failed = true; }
    if (!failed) throw new Error('Contrat sans contrat accepté.');
  });
  test('Rules: Facture indépendante', function () {
    var result = CheckoutRulesV3.validate({ paiement: 'Facture' });
    if (result.payment !== 'Facture' || result.contract !== false) throw new Error('Facture liée à tort au contrat.');
  });
  test('Rules: Ardoise exige un compte', function () {
    var failed = false;
    try { CheckoutRulesV3.validate({ paiement: 'Ardoise' }); } catch (error) { failed = true; }
    if (!failed) throw new Error('Ardoise sans compte acceptée.');
  });

  var failedCount = tests.filter(function (item) { return !item.ok; }).length;
  return { ok: failedCount === 0, total: tests.length, failed: failedCount, tests: tests };
}
