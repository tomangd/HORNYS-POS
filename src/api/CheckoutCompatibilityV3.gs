/**
 * Compatibility boundary for the legacy caisse.
 * New UI code should call enregistrerVenteCheckoutV3 directly.
 */
function enregistrerVenteFormuleV3(payload) {
  return enregistrerVenteCheckoutV3(payload);
}
