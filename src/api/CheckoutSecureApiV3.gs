/** HORNYS-POS V3 — secure checkout entry point using the server-issued seller session. */
function enregistrerVenteCheckoutV3Secure(payload) {
  Validation.object(payload, 'Encaissement');
  var token = Validation.required(payload.sessionToken, 'Session vendeur');
  var vendeur = verifierSessionVendeur(token, 'ENCAISSEMENT');
  var secured = Object.assign({}, payload, {
    vendeur: vendeur.id,
    vendeurId: vendeur.id
  });
  delete secured.sessionToken;
  return enregistrerVenteCheckoutV3(secured);
}
