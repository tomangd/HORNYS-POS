/**
 * HORNYS-POS V3 — serveur de session pour les caissiers.
 *
 * Le front ne doit idéalement plus transmettre un vendeurId de confiance pour
 * les opérations sensibles : il doit fournir un jeton émis par authentifierVendeurPIN.
 * Cette couche est ajoutée progressivement afin de préserver la compatibilité
 * avec le POS V2 pendant la migration.
 */
var SessionService = (function () {
  'use strict';

  var PREFIX = 'hornys.pos.session.';
  var TTL_SECONDS = 21600; // 6 h maximum.

  function issue(vendeur) {
    if (!vendeur || vendeur.id === undefined || vendeur.id === null) {
      throw new Error('Vendeur invalide.');
    }
    var token = Utilities.getUuid();
    var payload = {
      vendeurId: vendeur.id,
      role: String(vendeur.role || 'VENDEUR').toUpperCase(),
      createdAt: new Date().toISOString()
    };
    CacheService.getScriptCache().put(PREFIX + token, JSON.stringify(payload), TTL_SECONDS);
    return token;
  }

  function read(token) {
    if (!token) return null;
    var raw = CacheService.getScriptCache().get(PREFIX + String(token));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function requireSession(token, feature) {
    var session = read(token);
    if (!session) throw new Error('Session expirée. Veuillez vous reconnecter.');
    var vendeur = obtenirVendeurParId(session.vendeurId);
    if (!vendeur) throw new Error('Vendeur introuvable.');
    if (feature && !vendeur.permissions[feature]) {
      throw new Error('Votre grade ne permet pas cette action.');
    }
    return vendeur;
  }

  function revoke(token) {
    if (token) CacheService.getScriptCache().remove(PREFIX + String(token));
    return true;
  }

  return {
    issue: issue,
    read: read,
    requireSession: requireSession,
    revoke: revoke
  };
})();

function creerSessionVendeur(vendeur) {
  return SessionService.issue(vendeur);
}

function verifierSessionVendeur(token, feature) {
  return SessionService.requireSession(token, feature);
}

function fermerSessionVendeur(token) {
  return SessionService.revoke(token);
}
