/**
 * HORNYS-POS — compatibility for article active-status values.
 *
 * Google Sheets installations may contain Actif as TRUE/FALSE, 1/0,
 * Oui/Non, Yes/No, or Actif/Inactif. Keep the legacy helper name so
 * existing callers continue to work without changing the large Code.js file.
 */
function interpreterStatutActif(rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return true;
  }

  if (typeof rawValue === "boolean") {
    return rawValue;
  }

  const value = String(rawValue).trim().toUpperCase();

  if (["ACTIF", "TRUE", "1", "OUI", "YES", "ON", "VRAI"].indexOf(value) >= 0) {
    return true;
  }

  if (["INACTIF", "FALSE", "0", "NON", "NO", "OFF", "FAUX"].indexOf(value) >= 0) {
    return false;
  }

  // Unknown values remain inactive rather than accidentally exposing
  // an article that was explicitly configured with an unsupported status.
  return false;
}
