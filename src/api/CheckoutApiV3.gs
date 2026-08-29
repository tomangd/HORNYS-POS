/** HORNYS-POS V3 — public server API for checkout. */
function enregistrerVenteCheckoutV3(payload) {
  var data = CheckoutServiceV3.normalize(payload);
  return TransactionService.execute(data.orderId, data.vendeur, function () {
    return VenteServiceV3.execute(data);
  });
}

function verifierCheckoutV3(payload) {
  var data = CheckoutServiceV3.normalize(payload);
  return {
    ok: true,
    v3: true,
    orderId: data.orderId,
    vendeur: data.vendeur,
    paiement: data.paiement,
    articles: data.articles.length
  };
}
