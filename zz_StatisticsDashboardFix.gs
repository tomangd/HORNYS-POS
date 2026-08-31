/**
 * Correctif statistiques hebdomadaires.
 *
 * Ce fichier surcharge volontairement obtenirStatistiquesDashboard() afin de
 * conserver l'ancienne compatibilité tout en rendant la lecture des ventes
 * historiques robuste aux formats de dates et d'en-têtes réellement présents
 * dans Google Sheets.
 *
 * Règles :
 * - semaine = lundi 00:00 -> dimanche 23:59:59
 * - les ventes sont lues depuis VENTES, sans dépendre d'un format unique
 *   pour la date
 * - la période "4-weeks" / "12-weeks" inclut la semaine courante
 * - "all" ne filtre pas les dates
 * - les ventes annulées sont exclues
 */

function _statsFixNormaliserDate_(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  if (value === null || value === undefined || value === "") return null;

  const raw = String(value).trim();
  if (!raw) return null;

  // Formats français : 27/08/2026 ou 27/08/2026 23:48:00
  let match = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (match) {
    const date = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Formats ISO : 2026-08-27 ou 2026-08-27T23:48:00
  match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (match) {
    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function _statsFixDebutSemaine_(date) {
  const d = new Date(date || new Date());
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function _statsFixFinSemaine_(date) {
  const d = _statsFixDebutSemaine_(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function _statsFixPlage_(period) {
  const now = new Date();
  const currentStart = _statsFixDebutSemaine_(now);
  const p = String(period || "week").trim().toLowerCase();

  if (p === "today") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    };
  }

  if (p === "previous-week") {
    const start = new Date(currentStart);
    start.setDate(start.getDate() - 7);
    return { start, end: _statsFixFinSemaine_(start) };
  }

  if (p === "4-weeks") {
    const start = new Date(currentStart);
    start.setDate(start.getDate() - 21);
    return { start, end: _statsFixFinSemaine_(now) };
  }

  if (p === "12-weeks") {
    const start = new Date(currentStart);
    start.setDate(start.getDate() - 77);
    return { start, end: _statsFixFinSemaine_(now) };
  }

  if (p === "all") return { start: null, end: null };

  return { start: currentStart, end: _statsFixFinSemaine_(now) };
}

function _statsFixColonne_(headers, aliases, fallback) {
  const normalized = headers.map(normaliserEntete);
  for (const alias of aliases) {
    const index = normalized.indexOf(normaliserEntete(alias));
    if (index >= 0) return index;
  }
  return fallback;
}

function _statsFixMontant_(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/,/g, ".");
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : 0;
}

function _statsFixVentes_(sheet, range) {
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet
    .getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), 12))
    .getValues();

  const found = trouverLigneEnTetes(values, [
    "id",
    "date",
    "heure",
    "articles",
    "montant final",
    "type paiement",
    "statut",
  ]);

  const headers = Array.isArray(found.headers) ? found.headers : [];
  const rowIndex = Number.isInteger(found.rowIndex) ? found.rowIndex : 0;

  const idCol = _statsFixColonne_(headers, ["id", "vente id"], 0);
  const dateCol = _statsFixColonne_(headers, ["date", "date vente"], 1);
  const timeCol = _statsFixColonne_(headers, ["heure", "time"], 2);
  const vendorCol = _statsFixColonne_(
    headers,
    ["vendeur id", "vendeur", "cashier", "caissier"],
    3,
  );
  const articlesCol = _statsFixColonne_(headers, ["articles", "article"], 4);
  const totalCol = _statsFixColonne_(
    headers,
    ["montant final", "total", "total final"],
    7,
  );
  const paymentCol = _statsFixColonne_(
    headers,
    ["type paiement", "paiement", "payment"],
    8,
  );
  const statusCol = _statsFixColonne_(headers, ["statut", "status"], 10);

  const result = [];

  for (let i = rowIndex + 1; i < values.length; i++) {
    const row = values[i];
    if (!Array.isArray(row) || row.every((cell) => String(cell ?? "").trim() === "")) continue;

    let date = _statsFixNormaliserDate_(row[dateCol]);

    // Certaines anciennes lignes ont une date + une heure séparées.
    // Si la date est lisible mais sans heure, on ajoute l'heure pour éviter
    // toute ambiguïté autour des bornes de période.
    if (date && row[timeCol] instanceof Date) {
      const time = row[timeCol];
      date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    } else if (date && row[timeCol]) {
      const timeRaw = String(row[timeCol]).trim();
      const tm = timeRaw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (tm) date.setHours(Number(tm[1]), Number(tm[2]), Number(tm[3] || 0), 0);
    }

    if (!date) continue;
    if (range.start && (date < range.start || date > range.end)) continue;

    const status = String(row[statusCol] ?? "Complétée").trim();
    if (status.toUpperCase().includes("ANNUL")) continue;

    const total = _statsFixMontant_(row[totalCol]);
    const vendorId = String(row[vendorCol] ?? "-").trim() || "-";
    const payment = String(row[paymentCol] ?? "-").trim() || "-";

    let articles = [];
    try {
      const rawArticles = row[articlesCol];
      const parsed = typeof rawArticles === "string" ? JSON.parse(rawArticles || "[]") : rawArticles;
      if (Array.isArray(parsed)) articles = parsed;
    } catch (error) {
      Logger.log("Statistiques : articles illisibles ligne " + (i + 1) + " : " + error);
    }

    result.push({
      id: row[idCol],
      date: row[dateCol],
      heure: row[timeCol],
      vendeurId,
      paiement: payment,
      montantFinal: total,
      statut: status,
      articles,
    });
  }

  return result;
}

function obtenirStatistiquesDashboard(period, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "dashboard");

  initialiserStructureStatistiquesHebdomadaires();

  const range = _statsFixPlage_(period || "week");
  const sheetVentes = obtenirFeuille("Ventes");
  const ventes = _statsFixVentes_(sheetVentes, range);

  const result = {
    period: period || "week",
    periodStart: range.start ? Utilities.formatDate(range.start, "Europe/Paris", "dd/MM/yyyy") : "",
    periodEnd: range.end ? Utilities.formatDate(range.end, "Europe/Paris", "dd/MM/yyyy") : "",
    totalCA: 0,
    nbVentes: 0,
    panierMoyen: 0,
    meilleurVendeur: "-",
    meilleurEmploye: "-",
    articleTop: "-",
    articleTopQuantite: 0,
    paiements: {},
    ventes: [],
    stockCritique: 0,
    salaires: 0,
    factures: 0,
    autresCharges: 0,
    chargesTotal: 0,
    resultatNet: 0,
    margeNette: 0,
    charges: [],
    weekly: [],
  };

  const vendeurTotals = {};
  const articleTotals = {};

  ventes.forEach((vente) => {
    result.totalCA += vente.montantFinal;
    result.nbVentes += 1;
    vendeurTotals[vente.vendeurId] = (vendeurTotals[vente.vendeurId] || 0) + vente.montantFinal;
    result.paiements[vente.paiement] = (result.paiements[vente.paiement] || 0) + 1;

    result.ventes.push({
      id: vente.id,
      date: vente.date,
      heure: vente.heure,
      vendeur: obtenirVendeurParId(vente.vendeurId)?.nom || vente.vendeurId,
      paiement: vente.paiement,
      montantFinal: vente.montantFinal,
      statut: vente.statut,
    });

    vente.articles.forEach((item) => {
      if (!item) return;
      const name = String(item.nom || item.nomComplet || "Article").trim() || "Article";
      const quantity = Math.max(0, Math.floor(Number(item.quantity ?? item.quantite ?? 0) || 0));
      articleTotals[name] = (articleTotals[name] || 0) + quantity;
    });
  });

  const meilleurCle = (obj) =>
    Object.keys(obj).sort((a, b) => Number(obj[b]) - Number(obj[a]))[0] || "-";

  const meilleurVendeurId = meilleurCle(vendeurTotals);
  result.meilleurVendeur = obtenirVendeurParId(meilleurVendeurId)?.nom || meilleurVendeurId;

  result.articleTop = meilleurCle(articleTotals);
  result.articleTopQuantite = articleTotals[result.articleTop] || 0;
  result.panierMoyen = result.nbVentes ? result.totalCA / result.nbVentes : 0;

  // Meilleur employé : transactions de contrats réellement enregistrées
  // pendant la même période.
  const tx = obtenirFeuille("CONTRACT_TRANSACTIONS");
  const employeeTotals = {};
  if (tx && tx.getLastRow() > 1) {
    tx.getRange(2, 1, tx.getLastRow() - 1, 18).getValues().forEach((row) => {
      const date = _statsFixNormaliserDate_(row[15]);
      if (range.start && (!date || date < range.start || date > range.end)) return;
      const employee = String(row[4] || "-").trim() || "-";
      employeeTotals[employee] = (employeeTotals[employee] || 0) + _statsFixMontant_(row[8]);
    });
  }
  result.meilleurEmploye = meilleurCle(employeeTotals);

  const charges = lireChargesHebdomadaires_(range.start, range.end);
  result.charges = charges.map((charge) => ({
    id: charge.id,
    semaineDebut: charge.semaineDebut
      ? Utilities.formatDate(charge.semaineDebut, "Europe/Paris", "dd/MM/yyyy")
      : "",
    type: charge.type,
    libelle: charge.libelle,
    montant: charge.montant,
    employe: charge.employe,
  }));

  charges.forEach((charge) => {
    if (charge.type === "SALAIRE" || charge.type === "SALAIRES") result.salaires += charge.montant;
    else if (charge.type === "FACTURE" || charge.type === "FACTURES") result.factures += charge.montant;
    else result.autresCharges += charge.montant;
  });

  result.chargesTotal = result.salaires + result.factures + result.autresCharges;
  result.resultatNet = result.totalCA - result.chargesTotal;
  result.margeNette = result.totalCA ? (result.resultatNet / result.totalCA) * 100 : 0;

  const articlesSheet = obtenirFeuille("Articles");
  if (articlesSheet && articlesSheet.getLastRow() > 1) {
    const values = articlesSheet.getDataRange().getValues();
    const headers = values[0].map(normaliserEntete);
    const stockCol = _statsFixColonne_(headers, ["stock", "quantité", "quantity"], 4);
    const thresholdCol = _statsFixColonne_(headers, ["seuil alerte", "seuil", "stock minimum"], 5);
    result.stockCritique = values
      .slice(1)
      .filter((row) => Number(row[stockCol]) <= Number(row[thresholdCol]) && Number(row[thresholdCol]) > 0)
      .length;
  }

  // Toujours produire l'évolution hebdomadaire pour les périodes bornées.
  // Pour "all", on part du début de l'année afin de ne pas fabriquer une
  // boucle potentiellement gigantesque sur toute l'existence du POS.
  const weeklyStart = range.start || _statsFixDebutSemaine_(new Date(new Date().getFullYear(), 0, 1));
  const weeklyEnd = range.end || _statsFixFinSemaine_(new Date());

  for (
    let current = new Date(weeklyStart);
    current <= weeklyEnd;
    current.setDate(current.getDate() + 7)
  ) {
    const weekStart = new Date(current);
    const weekEnd = _statsFixFinSemaine_(weekStart);
    const weekVentes = _statsFixVentes_(sheetVentes, { start: weekStart, end: weekEnd });
    const weekCharges = lireChargesHebdomadaires_(weekStart, weekEnd);
    const chiffreAffaires = weekVentes.reduce((sum, vente) => sum + vente.montantFinal, 0);
    const chargesAmount = weekCharges.reduce((sum, charge) => sum + charge.montant, 0);

    result.weekly.push({
      semaineDebut: Utilities.formatDate(weekStart, "Europe/Paris", "dd/MM/yyyy"),
      chiffreAffaires,
      ventes: weekVentes.length,
      charges: chargesAmount,
      resultat: chiffreAffaires - chargesAmount,
    });
  }

  return result;
}
