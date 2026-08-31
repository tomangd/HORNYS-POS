/**
 * HORNY'S CAISSE - APPS SCRIPT COMPLET (MULTIPAGE)
 * Restaurant Fast-Food POS System
 * Auteur: Tom
 * Version: 2.1 (Fichiers isolés)
 */

// ============================================
// VARIABLES GLOBALES
// ============================================
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET = SpreadsheetApp.getActiveSpreadsheet();
// Fait correspondre chaque clé utilisée par le code à un nom d'onglet réel,
// tous en MAJUSCULES et en français, pour éviter les décalages de noms.
const NOMS_ONGLETS = {
  Articles: "ARTICLES",
  Clients: "CLIENTS",
  Contrats: "CONTRATS",
  Vendeurs: "VENDEURS",
  Ventes: "VENTES",
  Ardoises: "ARDOISES",
  Factures: "FACTURES",
  Devis: "DEVIS",
  Paramètres: "PARAMETRES",
  CAISSE: "CAISSE",
  PERMISSIONS: "PERMISSIONS",
  EMPLOYEES: "EMPLOYES",
  CONTRACT_TRANSACTIONS: "TRANSACTIONS_CONTRATS",
  COMPANY_LEDGER: "REGISTRE_ENTREPRISES",
  CONTRACT_CONSUMPTION: "CONSOMMATION_CONTRATS",
  INVOICES: "FACTURES_CONTRATS",
  RECOMPENSES: "RECOMPENSES",
  JOURNAL_ACTIONS: "JOURNAL_ACTIONS",
};

function obtenirFeuille(nom) {
  return SHEET.getSheetByName(NOMS_ONGLETS[nom] || nom);
}

function migrerNomsOnglets() {
  Object.keys(NOMS_ONGLETS).forEach((ancienNom) => {
    const nouveauNom = NOMS_ONGLETS[ancienNom];
    const ancienneFeuille = SHEET.getSheetByName(ancienNom);
    const nouvelleFeuille = SHEET.getSheetByName(nouveauNom);
    if (ancienneFeuille && !nouvelleFeuille)
      ancienneFeuille.setName(nouveauNom);
  });
}

// ============================================
// INCLUSION DE FICHIERS HTML/CSS/JS
// ============================================
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// 1️⃣ INITIALISATION DU SHEET
// ============================================
function initSheets() {
  initializeSheet();
}

function initializeSheet() {
  Logger.log("🔄 Initialisation de Horny's Caisse...");
  migrerNomsOnglets();

  const sheets = Object.values(NOMS_ONGLETS);

  sheets.forEach((name) => {
    try {
      SHEET.insertSheet(name);
      Logger.log(`✅ Onglet "${name}" créé`);
    } catch (e) {
      Logger.log(`⚠️ Onglet "${name}" existe déjà`);
    }
  });

  initializeArticles();
  initializeClients();
  initializeContrats();
  initializeVendeurs();
  initializeParametres();
  initializeVentes();
  initializeArdoises();
  initializeDevis();
  initializeFactures();
  initialiserDonneesContratsEntreprises();

  createCaisseInterface();

  Logger.log("✅ Horny's Caisse initialisé avec succès !");
}

// ============================================
// 2️⃣ INITIALISATION DES DONNÉES
// ============================================
function initializeArticles() {
  const sheet = obtenirFeuille("Articles");
  const headers = [
    "ID",
    "Nom",
    "Type",
    "Prix",
    "Stock",
    "Seuil Alerte",
    "Description",
    "Actif",
    "Options",
  ];
  assurerEntetesFeuille(sheet, headers);
  if (sheet.getLastRow() > 1) return;
  sheet.clearContents();
  sheet.appendRow(headers);

  const data = [
    [
      1,
      "Menu Complet",
      "Menu",
      12.5,
      100,
      10,
      "Burger + Boisson + Frites",
      true,
      JSON.stringify({
        Burger: ["Boeuf", "Poulet", "Poisson", "Végétarien"],
        Boisson: ["Cola", "Jus de raisin"],
      }),
    ],
    [2, "Burger Végé", "Burger", 8.5, 50, 5, "Burger végétarien", true, ""],
    [3, "Burger Viande", "Burger", 9.5, 75, 5, "Burger viande rouge", true, ""],
    [4, "Burger Poulet", "Burger", 9.0, 60, 5, "Burger poulet", true, ""],
    [5, "Burger Poisson", "Burger", 10.0, 40, 5, "Burger poisson", true, ""],
    [6, "Coca-Cola", "Boisson", 2.5, 150, 20, "Coca-Cola 33cl", true, ""],
    [
      7,
      "Jus de Raisin",
      "Boisson",
      2.5,
      80,
      10,
      "Jus de raisin 25cl",
      true,
      "",
    ],
    [8, "Écola", "Boisson", 2.0, 120, 15, "Écola 33cl", true, ""],
    [9, "Limonade", "Boisson", 2.5, 100, 15, "Limonade 33cl", true, ""],
    [
      10,
      "Eau Minérale",
      "Boisson",
      1.5,
      200,
      30,
      "Eau minérale 50cl",
      true,
      "",
    ],
    [11, "Bière Blonde", "Boisson", 3.5, 80, 10, "Bière blonde 33cl", true, ""],
    [12, "Frites", "Accompagnement", 2.5, 120, 15, "Frites moyennes", true, ""],
  ];
  data.forEach((row) => sheet.appendRow(row));
  sheet.setFrozenRows(1);
}

function initializeClients() {
  const sheet = obtenirFeuille("Clients");
  if (sheet.getLastRow() > 0) return;
  sheet.clearContents();
  const headers = [
    "ID",
    "Nom",
    "Type",
    "Contact",
    "Adresse",
    "Statut",
    "Points Fidélité",
    "Offre Active",
    "Date Création",
  ];
  sheet.appendRow(headers);

  const data = [
    [
      1,
      "LSHD",
      "Entreprise",
      "contact@lshd.fr",
      "Los Santos",
      "Actif",
      150,
      "",
      new Date(),
    ],
    [
      2,
      "Pisswasser",
      "Entreprise",
      "contact@pisswasser.fr",
      "San Fierro",
      "Actif",
      220,
      "",
      new Date(),
    ],
    [
      3,
      "Pêcherie Alamo",
      "Entreprise",
      "contact@pecher-alamo.fr",
      "Alamo Sea",
      "Actif",
      80,
      "",
      new Date(),
    ],
  ];
  data.forEach((row) => sheet.appendRow(row));
  sheet.setFrozenRows(1);
}

function initializeContrats() {
  const sheet = obtenirFeuille("Contrats");
  assurerEntetesFeuille(sheet, [
    "ID",
    "Client ID",
    "Type",
    "Réduction %",
    "Limite €",
    "Limite Commandes/Emp",
    "Durée (jours)",
    "Date Début",
    "Date Fin",
    "Actif",
    "Notes",
    "Contract ID",
    "Status",
    "Company ID",
    "Company Name",
    "Responsible Name",
    "Responsible Phone",
    "Discord Webhook",
    "Start Date",
    "End Date",
    "Company Percent",
    "Employee Percent",
    "Included Quantity",
    "Frequency",
    "Allowed Overage",
    "Overage Pricing",
    "Allowed Products",
    "Forbidden Products",
    "Allowed Employees",
    "Daily Limit Enabled",
    "Daily Limit Amount",
    "Daily Limit Transactions",
    "Created At",
    "Updated At",
    "Created By",
  ]);
  sheet.setFrozenRows(1);
}

function initialiserDonneesContratsEntreprises() {
  migrerNomsOnglets();
  assurerFeuilleAvecEntetes("EMPLOYEES", [
    "employee_id",
    "company_id",
    "name",
    "identifier",
    "status",
    "created_at",
    "updated_at",
  ]);
  assurerFeuilleAvecEntetes("CONTRACT_TRANSACTIONS", [
    "transaction_id",
    "contract_id",
    "company_id",
    "employee_id",
    "employee_name",
    "employee_identifier",
    "order_id",
    "contract_type",
    "total_amount",
    "employee_amount",
    "company_amount",
    "discount_amount",
    "payment_method",
    "cashier",
    "cart_json",
    "created_at",
    "webhook_status",
    "status",
  ]);
  assurerFeuilleAvecEntetes("COMPANY_LEDGER", [
    "ledger_entry_id",
    "company_id",
    "contract_id",
    "transaction_id",
    "employee_id",
    "amount",
    "type",
    "created_at",
    "status",
  ]);
  assurerFeuilleAvecEntetes("CONTRACT_CONSUMPTION", [
    "consumption_id",
    "contract_id",
    "company_id",
    "transaction_id",
    "product_id",
    "product_name",
    "quantity",
    "unit_price",
    "consumed_at",
  ]);
  assurerFeuilleAvecEntetes("INVOICES", [
    "invoice_id",
    "company_id",
    "contract_id",
    "period_start",
    "period_end",
    "subtotal",
    "discount",
    "total",
    "status",
    "created_at",
    "paid_at",
  ]);
  assurerFeuilleAvecEntetes("RECOMPENSES", [
    "reward_id",
    "name",
    "article_id",
    "points_required",
    "status",
    "created_at",
    "updated_at",
  ]);
  assurerFeuilleAvecEntetes("JOURNAL_ACTIONS", [
    "log_id",
    "action",
    "actor",
    "details",
    "status",
    "created_at",
  ]);
  assurerFeuilleAvecEntetes("PERMISSIONS", [
    "role",
    "feature",
    "allowed",
    "updated_at",
  ]);
  initialiserPermissionsParDefaut();
}

const FONCTIONNALITES_POS = [
  ["caisse", "Caisse"],
  ["dashboard", "Dashboard"],
  ["contrats", "Contrats"],
  ["factures", "Factures"],
  ["recompenses", "Récompenses"],
  ["articles", "Articles"],
  ["clients", "Clients"],
  ["permissions", "Permissions"],
];

function permissionsParDefaut(role) {
  const normalizedRole = String(role || "VENDEUR")
    .trim()
    .toUpperCase();
  const permissions = {};
  FONCTIONNALITES_POS.forEach(([feature]) => {
    permissions[feature] =
      normalizedRole === "ADMIN" ||
      (normalizedRole === "MANAGER" && feature !== "permissions") ||
      (normalizedRole === "VENDEUR" && feature === "caisse");
  });
  return permissions;
}

function colonnesPermissions(sheet) {
  const headers = indexEntetes(sheet);
  const roleColumn = headers["role"] ?? 0;
  const featureColumn = headers["feature"] ?? 1;
  const allowedColumn = headers["allowed"] ?? 2;
  const updatedColumn = headers["updated_at"] ?? 3;
  return { roleColumn, featureColumn, allowedColumn, updatedColumn };
}

function initialiserPermissionsParDefaut() {
  const sheet = obtenirFeuille("PERMISSIONS");
  const roles = ["ADMIN", "MANAGER", "VENDEUR"];
  const { roleColumn, featureColumn, allowedColumn, updatedColumn } =
    colonnesPermissions(sheet);
  const largeurColonnes =
    Math.max(roleColumn, featureColumn, allowedColumn, updatedColumn) + 1;
  const existants = new Set();
  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, largeurColonnes)
      .getValues()
      .forEach((row) => {
        existants.add(
          `${String(row[roleColumn] || "")
            .trim()
            .toUpperCase()}|${String(row[featureColumn] || "")
            .trim()
            .toLowerCase()}`,
        );
      });
  }
  roles.forEach((role) => {
    FONCTIONNALITES_POS.forEach(([feature]) => {
      if (existants.has(`${role}|${feature}`)) return;
      const defaults = permissionsParDefaut(role);
      const row = new Array(largeurColonnes).fill("");
      row[roleColumn] = role;
      row[featureColumn] = feature;
      row[allowedColumn] = defaults[feature];
      row[updatedColumn] = new Date();
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, largeurColonnes).setValues([row]);
    });
  });
}

function obtenirPermissionsRole(role) {
  const normalizedRole = String(role || "ADMIN")
    .trim()
    .toUpperCase();
  const permissions = permissionsParDefaut(normalizedRole);
  const sheet = obtenirFeuille("PERMISSIONS");
  if (!sheet || sheet.getLastRow() < 2) return permissions;
  const values = sheet.getDataRange().getValues();
  const { headers } = trouverLigneEnTetes(values, [
    "role",
    "feature",
    "allowed",
  ]);
  const roleIndex = headers.indexOf(normaliserEntete("role"));
  const featureIndex = headers.indexOf(normaliserEntete("feature"));
  const allowedIndex = headers.indexOf(normaliserEntete("allowed"));
  if (roleIndex < 0 || featureIndex < 0 || allowedIndex < 0) return permissions;
  values.slice(1).forEach((row) => {
    if (
      !Array.isArray(row) ||
      row.every((cell) => String(cell || "").trim() === "")
    )
      return;
    const roleValue = String(row[roleIndex] || "")
      .trim()
      .toUpperCase();
    const featureValue = String(row[featureIndex] || "")
      .trim()
      .toLowerCase();
    const allowedValue = row[allowedIndex];
    if (roleValue === normalizedRole && featureValue) {
      permissions[featureValue] =
        allowedValue === true || String(allowedValue).toUpperCase() === "TRUE";
    }
  });
  return permissions;
}

function obtenirVendeurParId(vendeurId) {
  const sheet = obtenirFeuille("Vendeurs");
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getDataRange().getValues();
  const { rowIndex, headers } = trouverLigneEnTetes(values, [
    "id",
    "nom",
    "grade",
    "role",
  ]);
  const indexOfHeader = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const idColumn = indexOfHeader(["id", "vendeur id", "vendeur_id"], 0);
  const nameColumn = indexOfHeader(["nom", "name", "nom vendeur"], 1);
  const roleColumn = indexOfHeader(["grade", "role", "rôle"], 5);
  const row = values
    .slice(rowIndex + 1)
    .find((item) => String(item[idColumn] || "") === String(vendeurId));
  if (!row) return null;
  const role = String(row[roleColumn] || "ADMIN")
    .trim()
    .toUpperCase();
  return {
    id: row[idColumn],
    nom: row[nameColumn],
    role,
    permissions: obtenirPermissionsRole(role),
  };
}

function verifierPermission(vendeurId, feature) {
  const vendeur = obtenirVendeurParId(vendeurId);
  if (!vendeur || !vendeur.permissions[feature])
    throw new Error("Votre grade ne permet pas cette action.");
  return vendeur;
}

function obtenirConfigurationPermissions(vendeurId) {
  verifierPermission(vendeurId, "permissions");
  initialiserDonneesContratsEntreprises();
  const sheet = obtenirFeuille("PERMISSIONS");
  const { roleColumn, featureColumn, allowedColumn } =
    colonnesPermissions(sheet);
  const largeurColonnes =
    Math.max(roleColumn, featureColumn, allowedColumn) + 1;
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet.getRange(2, 1, sheet.getLastRow() - 1, largeurColonnes).getValues();
  const permissions = {};
  rows.forEach((row) => {
    const role = String(row[roleColumn] || "")
      .trim()
      .toUpperCase();
    const feature = String(row[featureColumn] || "")
      .trim()
      .toLowerCase();
    if (role && feature)
      permissions[`${role}|${feature}`] =
        row[allowedColumn] === true ||
        String(row[allowedColumn]).trim().toUpperCase() === "TRUE";
  });
  const normalizedRows = rows.map((row) => [
    row[roleColumn],
    row[featureColumn],
    row[allowedColumn],
  ]);
  return {
    features: FONCTIONNALITES_POS,
    roles: ["ADMIN", "MANAGER", "VENDEUR"],
    rows: normalizedRows,
    permissions,
  };
}

function sauvegarderPermission(vendeurId, role, feature, allowed) {
  verifierPermission(vendeurId, "permissions");
  initialiserDonneesContratsEntreprises();
  const sheet = obtenirFeuille("PERMISSIONS");
  const { roleColumn, featureColumn, allowedColumn, updatedColumn } =
    colonnesPermissions(sheet);
  const largeurColonnes =
    Math.max(roleColumn, featureColumn, allowedColumn, updatedColumn) + 1;
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet.getRange(2, 1, sheet.getLastRow() - 1, largeurColonnes).getValues();
  const normalizedRole = String(role).trim().toUpperCase();
  const normalizedFeature = String(feature).trim().toLowerCase();
  const index = rows.findIndex(
    (row) =>
      String(row[roleColumn] || "").trim().toUpperCase() === normalizedRole &&
      String(row[featureColumn] || "").trim().toLowerCase() === normalizedFeature,
  );
  const output = new Array(largeurColonnes).fill("");
  output[roleColumn] = normalizedRole;
  output[featureColumn] = normalizedFeature;
  output[allowedColumn] = Boolean(allowed);
  output[updatedColumn] = new Date();
  if (index >= 0)
    sheet.getRange(index + 2, 1, 1, largeurColonnes).setValues([output]);
  else sheet.getRange(sheet.getLastRow() + 1, 1, 1, largeurColonnes).setValues([output]);
  journaliserActionDiscord(
    "Permission modifiée",
    { role, feature: normalizedFeature, allowed },
    vendeurId,
  );
  return obtenirConfigurationPermissions(vendeurId);
}

function sauvegarderGradeVendeur(vendeurId, cibleId, role) {
  verifierPermission(vendeurId, "permissions");
  const sheet = obtenirFeuille("Vendeurs");
  const values = sheet.getDataRange().getValues();
  const { rowIndex, headers } = trouverLigneEnTetes(values, [
    "id",
    "nom",
    "grade",
    "role",
  ]);
  const indexOfHeader = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const idColumn = indexOfHeader(["id", "vendeur id", "vendeur_id"], 0);
  const roleColumn = indexOfHeader(["grade", "role", "rôle"], 5);
  if (!["ADMIN", "MANAGER", "VENDEUR"].includes(String(role).toUpperCase()))
    throw new Error("Grade invalide.");
  const rowPosition = values
    .slice(rowIndex + 1)
    .findIndex((row) => String(row[idColumn] || "") === String(cibleId));
  if (rowPosition < 0) throw new Error("Vendeur introuvable.");
  sheet
    .getRange(rowIndex + rowPosition + 2, roleColumn + 1)
    .setValue(String(role).toUpperCase());
  journaliserActionDiscord(
    "Grade vendeur modifié",
    { vendor_id: cibleId, role: String(role).toUpperCase() },
    vendeurId,
  );
  return obtenirConfigurationPermissions(vendeurId);
}

function sauvegarderVendeur(vendeurId, vendeur) {
  verifierPermission(vendeurId, "permissions");
  const sheet = obtenirFeuille("Vendeurs");
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(normaliserEntete);
  const column = (names, fallback) => {
    const index = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((item) => item >= 0);
    return index === undefined ? fallback : index;
  };
  const idColumn = column(["id", "vendeur id", "vendeur_id"], 0);
  const nameColumn = column(["nom", "name", "nom vendeur"], 1);
  const emailColumn = column(["email", "e-mail", "mail"], 2);
  const statusColumn = column(["statut", "actif", "status"], 3);
  const pinColumn = column(["code accès", "code acces", "code pin", "pin"], 4);
  const roleColumn = column(["grade", "role", "rôle"], 5);
  const name = String(vendeur.nom || "").trim();
  const pin = String(vendeur.code || "").trim();
  const role = String(vendeur.role || "VENDEUR")
    .trim()
    .toUpperCase();
  if (!name) throw new Error("Le nom du vendeur est obligatoire.");
  if (!/^\d{4}$/.test(pin))
    throw new Error("Le code PIN doit contenir 4 chiffres.");
  if (!["ADMIN", "MANAGER", "VENDEUR"].includes(role))
    throw new Error("Grade invalide.");
  const existingIndex = values.findIndex(
    (row, index) => index > 0 && String(row[idColumn]) === String(vendeur.id),
  );
  const row = Array(Math.max(sheet.getLastColumn(), 6)).fill("");
  if (existingIndex > 0) Object.assign(row, values[existingIndex]);
  row[idColumn] =
    existingIndex > 0
      ? values[existingIndex][idColumn]
      : Math.max(
          0,
          ...values.slice(1).map((item) => Number(item[idColumn]) || 0),
        ) + 1;
  row[nameColumn] = name;
  row[emailColumn] = String(vendeur.email || "").trim();
  row[statusColumn] = vendeur.actif ? "Actif" : "Inactif";
  row[pinColumn] = pin;
  row[roleColumn] = role;
  if (existingIndex > 0)
    sheet.getRange(existingIndex + 1, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  journaliserActionDiscord(
    existingIndex > 0 ? "Vendeur modifié" : "Vendeur créé",
    { vendor_id: row[idColumn], nom: name, role },
    vendeurId,
  );
  return { ok: true, id: row[idColumn] };
}

function initialiserStructurePOS() {
  migrerNomsOnglets();
  [
    "ARTICLES",
    "CLIENTS",
    "CONTRATS",
    "VENDEURS",
    "VENTES",
    "ARDOISES",
    "FACTURES",
    "INVOICES",
    "RECOMPENSES",
    "PERMISSIONS",
    "DEVIS",
    "PARAMETRES",
    "CAISSE",
  ].forEach((nom) => {
    if (!SHEET.getSheetByName(nom)) SHEET.insertSheet(nom);
  });
  initializeArticles();
  initializeClients();
  initializeContrats();
  initializeVendeurs();
  initializeParametres();
  initializeVentes();
  initializeArdoises();
  initializeDevis();
  initializeFactures();
  initialiserDonneesContratsEntreprises();
}

function assurerFeuilleAvecEntetes(nom, headers) {
  let sheet = obtenirFeuille(nom);
  if (!sheet) sheet = SHEET.insertSheet(NOMS_ONGLETS[nom] || nom);
  assurerEntetesFeuille(sheet, headers);
  return sheet;
}

function assurerEntetesFeuille(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  const existants = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map(String);
  const manquants = headers.filter(
    (header) => existants.indexOf(header) === -1,
  );
  if (manquants.length)
    sheet
      .getRange(1, existants.length + 1, 1, manquants.length)
      .setValues([manquants]);
}

function indexEntetes(sheet) {
  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];
  const index = {};
  headers.forEach((header, position) => {
    if (header) index[String(header)] = position;
  });
  return index;
}

function interpreterStatutActif(rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined)
    return true;
  if (typeof rawValue === "boolean") return rawValue;
  return ["ACTIF", "TRUE", "1"].indexOf(String(rawValue).toUpperCase()) >= 0;
}

function sauvegarderArticle(article, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "articles");
  const sheet = obtenirFeuille("Articles");
  assurerEntetesFeuille(sheet, [
    "ID",
    "Nom",
    "Type",
    "Prix",
    "Stock",
    "Seuil Alerte",
    "Description",
    "Actif",
    "Options",
  ]);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(normaliserEntete);
  const column = (name, fallback) => {
    const found = headers.indexOf(normaliserEntete(name));
    return found >= 0 ? found : fallback;
  };
  const id =
    article.id || prochainIdentifiant(sheet, "ART", new Date().getFullYear());
  const rowIndex = values.findIndex(
    (row, index) => index > 0 && String(row[column("ID", 0)]) === String(id),
  );
  const isNouveau = rowIndex < 1;
  const row = Array(sheet.getLastColumn()).fill("");
  row[column("ID", 0)] = id;
  row[column("Nom", 1)] = String(article.nom || "").trim();
  row[column("Type", 2)] = String(article.type || "Autre").trim();
  row[column("Prix", 3)] =
    Number(String(article.prix || 0).replace(",", ".")) || 0;
  row[column("Stock", 4)] = Number(article.stock) || 0;
  row[column("Seuil Alerte", 5)] = Number(article.seuilAlerte) || 0;
  row[column("Description", 6)] = String(article.description || "").trim();
  row[column("Actif", 7)] = article.actif !== false;
  row[column("Options", 8)] =
    article.options && Object.keys(article.options).length
      ? JSON.stringify(article.options)
      : "";
  if (!row[column("Nom", 1)])
    throw new Error("Le nom de l'article est obligatoire.");
  if (!isNouveau)
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  journaliserActionDiscord(
    isNouveau ? "Article créé" : "Article modifié",
    {
      article_id: id,
      nom: row[column("Nom", 1)],
      prix: row[column("Prix", 3)],
      stock: row[column("Stock", 4)],
      actif: row[column("Actif", 7)],
    },
    vendeurId,
  );
  return { ok: true };
}

function changerStatutArticle(id, actif, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "articles");
  const sheet = obtenirFeuille("Articles");
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(normaliserEntete);
  const idColumn = Math.max(headers.indexOf("id"), 0);
  const activeColumnFound = headers.indexOf("actif");
  const activeColumn = activeColumnFound >= 0 ? activeColumnFound : 7;
  const rowIndex = values.findIndex(
    (row, index) => index > 0 && String(row[idColumn]) === String(id),
  );
  if (rowIndex < 1) throw new Error("Article introuvable.");
  sheet.getRange(rowIndex + 1, activeColumn + 1).setValue(Boolean(actif));
  journaliserActionDiscord(
    actif ? "Article activé" : "Article désactivé",
    { article_id: id, nom: values[rowIndex][1] },
    vendeurId,
  );
  return { ok: true };
}

function supprimerArticle(id, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "articles");
  const sheet = obtenirFeuille("Articles");
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(
    (row, index) => index > 0 && String(row[0]) === String(id),
  );
  if (rowIndex < 1) throw new Error("Article introuvable.");
  const nomArticle = values[rowIndex][1];
  sheet.deleteRow(rowIndex + 1);
  journaliserActionDiscord(
    "Article supprimé",
    { article_id: id, nom: nomArticle },
    vendeurId,
  );
  return { ok: true };
}

function normaliserEntete(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function trouverLigneEnTetes(values, nomsCibles) {
  const cibles = nomsCibles.map((nom) => normaliserEntete(nom));
  for (let i = 0; i < values.length; i++) {
    const row = Array.isArray(values[i]) ? values[i] : [];
    const headers = row.map(normaliserEntete);
    const match = cibles.some((cible) =>
      headers.some((header) => header === cible || header.includes(cible)),
    );
    if (match) {
      return { rowIndex: i, headers };
    }
  }
  return {
    rowIndex: 0,
    headers: Array.isArray(values[0]) ? values[0].map(normaliserEntete) : [],
  };
}

function colonnesClients(sheet) {
  const values = sheet.getDataRange().getValues();
  const { headers } = trouverLigneEnTetes(values, [
    "id",
    "nom",
    "type",
    "contact",
    "points fidelite",
    "statut",
  ]);
  const colonne = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  return {
    id: colonne(["id", "client id"], 0),
    nom: colonne(["nom", "name", "nom client"], 1),
    type: colonne(["type", "type client", "category"], 2),
    contact: colonne(["contact", "email", "telephone", "téléphone"], 3),
    adresse: colonne(["adresse", "address"], 4),
    statut: colonne(["statut", "status", "actif"], 5),
    points: colonne(
      ["points fidélité", "points fidelite", "points", "loyalty points"],
      6,
    ),
    offre: colonne(["offre active", "offre", "active offer"], 7),
    dateCreation: colonne(["date création", "date creation", "created at"], 8),
  };
}

function ajouterArdoise(ardoise) {
  const sheet = obtenirFeuille("Ardoises");
  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map(normaliserEntete);
  const colonne = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const values = Array(Math.max(sheet.getLastColumn(), 10)).fill("");
  values[colonne(["id", "ardoise id"], 0)] = ardoise.id || sheet.getLastRow();
  values[colonne(["client id", "client"], 1)] = ardoise.clientId || "";
  values[colonne(["nom employé", "nom employe", "employee name"], 2)] =
    ardoise.employeeName || "-";
  values[colonne(["matricule", "identifier"], 3)] = ardoise.identifier || "-";
  values[colonne(["montant total", "total", "amount"], 4)] = ardoise.total || 0;
  values[colonne(["montant payé", "montant paye", "paid"], 5)] =
    ardoise.paid || 0;
  values[colonne(["solde", "balance"], 6)] = ardoise.balance || 0;
  values[colonne(["date début", "date debut", "start date"], 7)] =
    ardoise.startDate || new Date();
  values[colonne(["facture id", "invoice id"], 8)] = ardoise.invoiceId || "";
  values[colonne(["statut", "status"], 9)] = ardoise.status || "En attente";
  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, values.length)
    .setValues([values]);
}

function ajouterEntreeLedger(entree) {
  const sheet = obtenirFeuille("COMPANY_LEDGER");
  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map(normaliserEntete);
  const colonne = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const values = Array(Math.max(sheet.getLastColumn(), 9)).fill("");
  values[colonne(["ledger_entry_id", "ledger entry id", "id"], 0)] =
    entree.id || prochainIdentifiant(sheet, "LED", new Date().getFullYear());
  values[colonne(["company_id", "company id"], 1)] = entree.companyId || "";
  values[colonne(["contract_id", "contract id"], 2)] = entree.contractId || "";
  values[colonne(["transaction_id", "transaction id"], 3)] =
    entree.transactionId || "";
  values[colonne(["employee_id", "employee id"], 4)] = entree.employeeId || "";
  values[colonne(["amount", "montant"], 5)] = entree.amount || 0;
  values[colonne(["type"], 6)] = entree.type || "DEBIT";
  values[colonne(["created_at", "created at"], 7)] =
    entree.createdAt || new Date();
  values[colonne(["status", "statut"], 8)] = entree.status || "OUVERT";
  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, values.length)
    .setValues([values]);
}

function ajouterConsommation(consommation) {
  const sheet = obtenirFeuille("CONTRACT_CONSUMPTION");
  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map(normaliserEntete);
  const colonne = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const values = Array(Math.max(sheet.getLastColumn(), 9)).fill("");
  values[colonne(["consumption_id", "consumption id", "id"], 0)] =
    consommation.id ||
    prochainIdentifiant(sheet, "CON", new Date().getFullYear());
  values[colonne(["contract_id", "contract id"], 1)] =
    consommation.contractId || "";
  values[colonne(["company_id", "company id"], 2)] =
    consommation.companyId || "";
  values[colonne(["transaction_id", "transaction id"], 3)] =
    consommation.transactionId || "";
  values[colonne(["product_id", "product id"], 4)] =
    consommation.productId || "";
  values[colonne(["product_name", "product name", "nom produit"], 5)] =
    consommation.productName || "";
  values[colonne(["quantity", "quantité", "quantite"], 6)] =
    consommation.quantity || 0;
  values[colonne(["unit_price", "unit price", "prix unitaire"], 7)] =
    consommation.unitPrice || 0;
  values[colonne(["consumed_at", "consumed at", "date consommation"], 8)] =
    consommation.consumedAt || new Date();
  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, values.length)
    .setValues([values]);
}

function colonnesEmployes(sheet) {
  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map(normaliserEntete);
  const colonne = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  return {
    id: colonne(["employee_id", "employee id", "id"], 0),
    companyId: colonne(["company_id", "company id", "company"], 1),
    name: colonne(["name", "nom", "nom employe", "nom employé"], 2),
    identifier: colonne(["identifier", "matricule"], 3),
    status: colonne(["status", "statut"], 4),
    createdAt: colonne(["created_at", "created at"], 5),
    updatedAt: colonne(["updated_at", "updated at"], 6),
  };
}

function valeurColonne(row, index, name, fallback) {
  return index[name] === undefined ? fallback : row[index[name]];
}

function texteContrat(type) {
  const value = String(type || "").toUpperCase();
  if (value.indexOf("DEMI") !== -1 || value.indexOf("PARTIEL") !== -1)
    return "DEMI_ARDOISE";
  if (value.indexOf("HEBDO") !== -1 || value.indexOf("FIXE") !== -1)
    return "HEBDOMADAIRE_FIXE";
  if (value.indexOf("ARDOISE") !== -1) return "ARDOISE";
  return "DEMI_ARDOISE";
}

function arrondirMontant(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function prochainIdentifiant(sheet, prefix, year) {
  const values =
    sheet.getLastRow() < 2
      ? []
      : sheet
          .getRange(2, 1, sheet.getLastRow() - 1, 1)
          .getValues()
          .flat();
  let max = 0;
  values.forEach((value) => {
    const match = String(value || "").match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `${prefix}-${year ? year + "-" : ""}${String(max + 1).padStart(4, "0")}`;
}

function lireEmployes(companyId) {
  const sheet = assurerFeuilleAvecEntetes("EMPLOYEES", [
    "employee_id",
    "company_id",
    "name",
    "identifier",
    "status",
    "created_at",
    "updated_at",
  ]);
  if (sheet.getLastRow() < 2) return [];
  const colonnes = colonnesEmployes(sheet);
  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues();
  return rows
    .filter(
      (row) =>
        !companyId || String(row[colonnes.companyId]) === String(companyId),
    )
    .map((row) => ({
      id: row[colonnes.id],
      companyId: row[colonnes.companyId],
      name: row[colonnes.name],
      identifier: row[colonnes.identifier],
      status: row[colonnes.status] || "ACTIF",
      createdAt: row[colonnes.createdAt],
      updatedAt: row[colonnes.updatedAt],
    }));
}

function sauvegarderEmploye(employee, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "contrats");
  if (
    !employee ||
    !employee.companyId ||
    !String(employee.name || "").trim() ||
    !String(employee.identifier || "").trim()
  )
    throw new Error("Entreprise, nom et matricule sont obligatoires.");
  const sheet = assurerFeuilleAvecEntetes("EMPLOYEES", [
    "employee_id",
    "company_id",
    "name",
    "identifier",
    "status",
    "created_at",
    "updated_at",
  ]);
  const colonnes = colonnesEmployes(sheet);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const id =
      employee.id ||
      prochainIdentifiant(sheet, "EMP", new Date().getFullYear());
    const rows =
      sheet.getLastRow() < 2
        ? []
        : sheet
            .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
            .getValues();
    const rowIndex = rows.findIndex(
      (row) => String(row[colonnes.id]) === String(id),
    );
    const output = rowIndex >= 0 ? [...rows[rowIndex]] : Array(7).fill("");
    output[colonnes.id] = id;
    output[colonnes.companyId] = employee.companyId;
    output[colonnes.name] = String(employee.name).trim();
    output[colonnes.identifier] = String(employee.identifier).trim();
    output[colonnes.status] = employee.status || "ACTIF";
    output[colonnes.createdAt] = employee.createdAt || new Date();
    output[colonnes.updatedAt] = new Date();
    if (rowIndex >= 0)
      sheet.getRange(rowIndex + 2, 1, 1, output.length).setValues([output]);
    else
      sheet
        .getRange(sheet.getLastRow() + 1, 1, 1, output.length)
        .setValues([output]);
    journaliserActionDiscord("Employé créé ou modifié", {
      employee_id: id,
      company_id: employee.companyId,
      name: output[colonnes.name],
      identifier: output[colonnes.identifier],
    });
    return {
      id: id,
      companyId: employee.companyId,
      name: output[colonnes.name],
      identifier: output[colonnes.identifier],
      status: output[colonnes.status],
    };
  } finally {
    lock.releaseLock();
  }
}

function sauvegarderContrat(contratObj, relireApresSauvegarde, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "contrats");
  if (!contratObj || !contratObj.companyId)
    throw new Error("Une entreprise est obligatoire.");
  const type = texteContrat(contratObj.type);
  const companyPercent = Math.min(
    100,
    Math.max(0, Number(contratObj.companyPercent) || 0),
  );
  const employeePercent = arrondirMontant(100 - companyPercent);
  if (type === "DEMI_ARDOISE" && (companyPercent < 0 || companyPercent > 100))
    throw new Error(
      "Le pourcentage entreprise doit être compris entre 0 et 100.",
    );
  const sheet = obtenirFeuille("Contrats");
  const headers = [
    "ID",
    "Client ID",
    "Type",
    "Réduction %",
    "Limite €",
    "Limite Commandes/Emp",
    "Durée (jours)",
    "Date Début",
    "Date Fin",
    "Actif",
    "Notes",
    "Contract ID",
    "Status",
    "Company ID",
    "Company Name",
    "Responsible Name",
    "Responsible Phone",
    "Discord Webhook",
    "Start Date",
    "End Date",
    "Company Percent",
    "Employee Percent",
    "Included Quantity",
    "Frequency",
    "Allowed Overage",
    "Overage Pricing",
    "Allowed Products",
    "Forbidden Products",
    "Allowed Employees",
    "Daily Limit Enabled",
    "Daily Limit Amount",
    "Daily Limit Transactions",
    "Created At",
    "Updated At",
    "Created By",
  ];
  assurerEntetesFeuille(sheet, headers);
  const index = indexEntetes(sheet);
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet
          .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
          .getValues();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const now = new Date();
    const id =
      contratObj.id || prochainIdentifiant(sheet, "CTR", now.getFullYear());
    const old = rows.find(
      (row) =>
        String(valeurColonne(row, index, "Contract ID", "")) === String(id) ||
        String(valeurColonne(row, index, "ID", "")) === String(id),
    );
    const company = trouverClientParId(contratObj.companyId);
    const values = {};
    values["ID"] = old ? valeurColonne(old, index, "ID", id) : id;
    values["Client ID"] = contratObj.companyId;
    values["Type"] = type;
    values["Réduction %"] =
      type === "HEBDOMADAIRE_FIXE" ? Number(contratObj.reduction) || 0 : 0;
    values["Limite €"] = Number(contratObj.dailyLimitAmount) || 0;
    values["Limite Commandes/Emp"] =
      Number(contratObj.dailyLimitTransactions) || 0;
    values["Actif"] =
      String(contratObj.status || "ACTIF").toUpperCase() === "ACTIF";
    values["Contract ID"] = id;
    values["Status"] = String(contratObj.status || "ACTIF").toUpperCase();
    values["Company ID"] = contratObj.companyId;
    values["Company Name"] =
      contratObj.companyName || (company && company.nom) || "";
    values["Responsible Name"] = contratObj.responsibleName || "";
    values["Responsible Phone"] = contratObj.responsiblePhone || "";
    values["Discord Webhook"] = contratObj.discordWebhook || "";
    values["Start Date"] = contratObj.startDate || now;
    values["End Date"] = contratObj.endDate || "";
    values["Company Percent"] =
      type === "DEMI_ARDOISE"
        ? companyPercent
        : type === "ARDOISE" || type === "HEBDOMADAIRE_FIXE"
          ? 100
          : 0;
    values["Employee Percent"] =
      type === "DEMI_ARDOISE"
        ? employeePercent
        : type === "ARDOISE" || type === "HEBDOMADAIRE_FIXE"
          ? 0
          : 100;
    values["Included Quantity"] = Number(contratObj.includedQuantity) || 0;
    values["Frequency"] = contratObj.frequency || "WEEKLY";
    values["Allowed Overage"] = contratObj.allowedOverage === true;
    values["Overage Pricing"] = contratObj.overagePricing || "NORMAL";
    values["Allowed Products"] = contratObj.allowedProducts || "";
    values["Forbidden Products"] = contratObj.forbiddenProducts || "";
    values["Allowed Employees"] = contratObj.allowedEmployees || "";
    values["Daily Limit Enabled"] = contratObj.dailyLimitEnabled === true;
    values["Daily Limit Amount"] = Number(contratObj.dailyLimitAmount) || 0;
    values["Daily Limit Transactions"] =
      Number(contratObj.dailyLimitTransactions) || 0;
    values["Created At"] = old
      ? valeurColonne(old, index, "Created At", now)
      : now;
    values["Updated At"] = now;
    values["Created By"] = contratObj.createdBy || "POS";
    const output = headers.map((header) =>
      values[header] !== undefined
        ? values[header]
        : old
          ? valeurColonne(old, index, header, "")
          : "",
    );
    if (old) {
      const rowIndex = rows.indexOf(old) + 2;
      sheet.getRange(rowIndex, 1, 1, output.length).setValues([output]);
    } else
      sheet
        .getRange(sheet.getLastRow() + 1, 1, 1, output.length)
        .setValues([output]);
    journaliserActionDiscord(
      old ? "Contrat modifié" : "Contrat créé",
      {
        contract_id: id,
        company_id: contratObj.companyId,
        type,
        status: values["Status"],
      },
      contratObj.createdBy || "POS",
    );
    if (relireApresSauvegarde === false) return contratObj;
    return contratsEntreprises().find((item) => String(item.id) === String(id));
  } finally {
    lock.releaseLock();
  }
}

function contratsEntreprises() {
  const sheet = obtenirFeuille("Contrats");
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const { headers } = trouverLigneEnTetes(values, [
    "contract id",
    "company id",
    "type",
    "company percent",
    "status",
  ]);
  const colonne = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const columns = {
    id: colonne(["contract id", "id"], 0),
    clientId: colonne(["company id", "client id"], 1),
    type: colonne(["type", "contract type"], 2),
    reduction: colonne(["réduction %", "reduction", "discount"], 3),
    limiteEuro: colonne(["limite €", "daily limit amount"], 4),
    limiteCommandes: colonne(
      ["limite commandes/emp", "daily limit transactions"],
      5,
    ),
    dateDebut: colonne(["date début", "start date"], 7),
    dateFin: colonne(["date fin", "end date"], 8),
    actif: colonne(["actif", "active"], 9),
    notes: colonne(["notes"], 10),
    status: colonne(["status", "statut"], 12),
    companyName: colonne(["company name", "nom entreprise"], 14),
    responsibleName: colonne(["responsible name"], 15),
    responsiblePhone: colonne(["responsible phone"], 16),
    discordWebhook: colonne(["discord webhook"], 17),
    companyPercent: colonne(["company percent"], 20),
    employeePercent: colonne(["employee percent"], 21),
    includedQuantity: colonne(["included quantity"], 22),
    frequency: colonne(["frequency"], 23),
    allowedOverage: colonne(["allowed overage"], 24),
    overagePricing: colonne(["overage pricing"], 25),
    allowedProducts: colonne(["allowed products"], 26),
    forbiddenProducts: colonne(["forbidden products"], 27),
    allowedEmployees: colonne(["allowed employees"], 28),
    dailyLimitEnabled: colonne(["daily limit enabled"], 29),
    dailyLimitAmount: colonne(["daily limit amount"], 30),
    dailyLimitTransactions: colonne(["daily limit transactions"], 31),
    createdAt: colonne(["created at"], 32),
    updatedAt: colonne(["updated at"], 33),
    createdBy: colonne(["created by"], 34),
  };
  const nombre = (value) => Number(String(value ?? "").replace(",", ".")) || 0;
  const booleen = (value) =>
    value === true ||
    ["true", "vrai", "actif", "oui"].includes(
      String(value).trim().toLowerCase(),
    );
  return values.slice(1).flatMap((row) => {
    const id = row[columns.id] || row[0];
    const companyId = row[columns.clientId] || row[1];
    if (!id && !companyId) return [];
    const company = trouverClientParId(companyId);
    const type = String(row[columns.type] || "DEMI_ARDOISE").toUpperCase();
    const status = String(row[columns.status] || "")
      .trim()
      .toUpperCase();
    return [
      {
        id,
        companyId,
        id,
        companyId,
        type,
        reduction: nombre(row[columns.reduction]),
        limiteEuro: nombre(row[columns.limiteEuro]),
        limiteCommandes: nombre(row[columns.limiteCommandes]),
        dateDebut: row[columns.dateDebut] || "",
        dateFin: row[columns.dateFin] || "",
        actif: status ? status === "ACTIF" : booleen(row[columns.actif]),
        status: status || (booleen(row[columns.actif]) ? "ACTIF" : "SUSPENDU"),
        notes: row[columns.notes] || "",
        companyName: row[columns.companyName] || (company && company.nom) || "",
        responsibleName: row[columns.responsibleName] || "",
        responsiblePhone: row[columns.responsiblePhone] || "",
        discordWebhook: row[columns.discordWebhook] || "",
        companyPercent: nombre(row[columns.companyPercent]),
        employeePercent: nombre(row[columns.employeePercent]),
        includedQuantity: nombre(row[columns.includedQuantity]),
        frequency: row[columns.frequency] || "WEEKLY",
        allowedOverage: booleen(row[columns.allowedOverage]),
        overagePricing: row[columns.overagePricing] || "NORMAL",
        allowedProducts: row[columns.allowedProducts] || "",
        forbiddenProducts: row[columns.forbiddenProducts] || "",
        allowedEmployees: row[columns.allowedEmployees] || "",
        dailyLimitEnabled: booleen(row[columns.dailyLimitEnabled]),
        dailyLimitAmount: nombre(row[columns.dailyLimitAmount]),
        dailyLimitTransactions: nombre(row[columns.dailyLimitTransactions]),
        createdAt: row[columns.createdAt] || "",
        updatedAt: row[columns.updatedAt] || "",
        createdBy: row[columns.createdBy] || "",
      },
    ];
  });
}

function changerStatutContrat(contractId, status, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "contrats");
  const contrat = contratsEntreprises().find(
    (item) => String(item.id) === String(contractId),
  );
  if (!contrat) throw new Error("Contrat introuvable.");
  contrat.status = String(status || "SUSPENDU").toUpperCase();
  contrat.actif = contrat.status === "ACTIF";
  return sauvegarderContrat(contrat, false, vendeurId);
}

function initializeVendeurs() {
  const sheet = obtenirFeuille("Vendeurs");
  const headers = ["ID", "Nom", "Email", "Statut", "Code Accès", "Grade"];
  if (sheet.getLastRow() > 0) {
    assurerEntetesFeuille(sheet, headers);
    const values = sheet.getDataRange().getValues();
    const normalizedHeaders = values[0].map(normaliserEntete);
    const idColumn =
      ["id", "vendeur id", "vendeur_id"]
        .map((name) => normalizedHeaders.indexOf(name))
        .find((index) => index >= 0) ?? 0;
    const gradeColumn = ["grade", "role", "rôle"]
      .map((name) => normalizedHeaders.indexOf(name))
      .find((index) => index >= 0);
    if (gradeColumn !== undefined) {
      const gradesParDefaut = {
        1: "ADMIN",
        2: "MANAGER",
      };
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][gradeColumn] || "").trim()) continue;
        const id = String(values[i][idColumn] || "").trim();
        const grade = gradesParDefaut[id] || "VENDEUR";
        sheet.getRange(i + 1, gradeColumn + 1).setValue(grade);
      }
    }
    return;
  }
  sheet.clearContents();
  sheet.appendRow(headers);

  const data = [
    [1, "Alice", "alice@hornys.fr", "Actif", "1234", "ADMIN"],
    [2, "Bob", "bob@hornys.fr", "Actif", "2345", "MANAGER"],
    [3, "Charlie", "charlie@hornys.fr", "Actif", "3456", "VENDEUR"],
    [4, "Diana", "diana@hornys.fr", "Actif", "4567", "VENDEUR"],
    [5, "Éric", "eric@hornys.fr", "Actif", "5678", "VENDEUR"],
  ];
  data.forEach((row) => sheet.appendRow(row));
  sheet.setFrozenRows(1);
}

function initializeVentes() {
  const sheet = obtenirFeuille("Ventes");
  if (sheet.getLastRow() > 0) {
    assurerEntetesFeuille(sheet, [
      "ID",
      "Date",
      "Heure",
      "Vendeur ID",
      "Articles",
      "Montant Brut",
      "Réduction",
      "Montant Final",
      "Type Paiement",
      "Ardoise?",
      "Statut",
      "Client ID",
    ]);
    return;
  }
  sheet.clearContents();
  const headers = [
    "ID",
    "Date",
    "Heure",
    "Vendeur ID",
    "Articles",
    "Montant Brut",
    "Réduction",
    "Montant Final",
    "Type Paiement",
    "Ardoise?",
    "Statut",
    "Client ID",
  ];
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}

function initializeArdoises() {
  const sheet = obtenirFeuille("Ardoises");
  if (sheet.getLastRow() > 0) return;
  sheet.clearContents();
  const headers = [
    "ID",
    "Client ID",
    "Nom Employé",
    "Matricule",
    "Montant Total",
    "Montant Payé",
    "Solde",
    "Date Début",
    "Facture ID",
    "Statut",
  ];
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}

function initializeDevis() {
  const sheet = obtenirFeuille("Devis");
  if (sheet.getLastRow() > 0) return;
  sheet.clearContents();
  const headers = [
    "ID",
    "Date Création",
    "Client",
    "Articles",
    "Montant",
    "Date Validité",
    "Statut",
    "Transformé en Facture",
    "Facture ID",
  ];
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}

function initializeFactures() {
  const sheet = obtenirFeuille("Factures");
  if (sheet.getLastRow() > 0) return;
  sheet.clearContents();
  const headers = [
    "ID",
    "Date",
    "Client ID",
    "Articles",
    "Montant",
    "Statut Paiement",
    "Type Paiement",
    "Date Paiement",
    "Notes",
    "PDF URL",
  ];
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}

const ENTETES_FACTURES = [
  "ID",
  "Date",
  "Client ID",
  "Articles",
  "Montant",
  "Statut Paiement",
  "Type Paiement",
  "Date Paiement",
  "Notes",
  "PDF URL",
];

function feuilleFactures() {
  return assurerFeuilleAvecEntetes("Factures", ENTETES_FACTURES);
}

function formaterDateFacture(value) {
  if (value instanceof Date)
    return Utilities.formatDate(value, "Europe/Paris", "dd/MM/yyyy");
  return value || "";
}

function obtenirFactures(vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "factures");
  const sheet = feuilleFactures();
  if (sheet.getLastRow() < 2) return [];
  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues()
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""));
  return rows
    .map((row) => {
      const client = trouverClientParId(row[2]);
      return {
        id: row[0],
        date: formaterDateFacture(row[1]),
        clientId: row[2],
        clientNom: client ? client.nom : String(row[2] || "-"),
        articles: row[3] || "",
        montant: Number(row[4]) || 0,
        statut: row[5] || "En attente",
        typePaiement: row[6] || "",
        datePaiement: formaterDateFacture(row[7]),
        notes: row[8] || "",
        pdfUrl: row[9] || "",
      };
    })
    .reverse();
}

function sauvegarderFacture(facture, vendeurId) {
  verifierPermission(vendeurId, "factures");
  if (!facture || !String(facture.clientId || "").trim())
    throw new Error("Le client est obligatoire.");
  const montant = Number(facture.montant) || 0;
  if (montant <= 0) throw new Error("Le montant doit être supérieur à 0.");
  const sheet = feuilleFactures();
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const index = facture.id
    ? rows.findIndex((row) => String(row[0]) === String(facture.id))
    : -1;
  const id =
    facture.id || prochainIdentifiant(sheet, "FAC", new Date().getFullYear());
  const statut = facture.statut || "En attente";
  const output = [
    id,
    index >= 0 ? rows[index][1] : new Date(),
    facture.clientId,
    facture.articles || "",
    montant,
    statut,
    facture.typePaiement || "",
    statut === "Payée" ? facture.datePaiement || new Date() : facture.datePaiement || "",
    facture.notes || "",
    facture.pdfUrl || "",
  ];
  if (index >= 0) sheet.getRange(index + 2, 1, 1, output.length).setValues([output]);
  else sheet.getRange(sheet.getLastRow() + 1, 1, 1, output.length).setValues([output]);
  journaliserActionDiscord(
    index >= 0 ? "Facture modifiée" : "Facture émise",
    { invoice_id: id, client_id: facture.clientId, montant, statut },
    vendeurId,
  );
  return obtenirFactures(vendeurId);
}

function changerStatutFacture(id, statut, vendeurId) {
  verifierPermission(vendeurId, "factures");
  if (!id) throw new Error("Facture introuvable.");
  const sheet = feuilleFactures();
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const index = rows.findIndex((row) => String(row[0]) === String(id));
  if (index < 0) throw new Error("Facture introuvable.");
  const row = rows[index];
  row[5] = statut;
  row[7] = statut === "Payée" ? new Date() : row[7] || "";
  sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
  journaliserActionDiscord(
    "Statut facture modifié",
    { invoice_id: id, statut },
    vendeurId,
  );
  return obtenirFactures(vendeurId);
}

function supprimerFacture(id, vendeurId) {
  verifierPermission(vendeurId, "factures");
  const sheet = feuilleFactures();
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const index = rows.findIndex((row) => String(row[0]) === String(id));
  if (index < 0) throw new Error("Facture introuvable.");
  sheet.deleteRow(index + 2);
  journaliserActionDiscord("Facture supprimée", { invoice_id: id }, vendeurId);
  return obtenirFactures(vendeurId);
}

function initializeParametres() {
  const sheet = obtenirFeuille("Paramètres");
  if (sheet.getLastRow() > 0) return;
  sheet.clearContents();
  const data = [
    ["Paramètre", "Valeur"],
    [
      "Discord Webhook URL",
      "https://ptb.discord.com/api/webhooks/1541984766310612992/PyboOCGxN15-8SJoPj-Ev6DmC57hvuc_jXYgC_i_wJ7BjF8BBMPcvxt07WMbZ1CdUfF7",
    ],
    ["Seuil Alerte Stock (quantité)", 5],
    ["Jours avant Rappel Facture", 2],
    ["Devise", "€"],
    ["Nom Restaurant", "Horny's"],
    ["TVA %", 20],
    ["Email Support", "support@hornys.fr"],
  ];
  data.forEach((row) => sheet.appendRow(row));
}

function createCaisseInterface() {
  const sheet = obtenirFeuille("CAISSE");
  sheet.clearContents();
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 300);
  sheet.getRange("A1").setValue("🔥 HORNY'S CAISSE");
  sheet.getRange("A1").setFontSize(20).setFontWeight("bold");
  sheet
    .getRange("A3")
    .setValue(
      "Cliquez sur le menu supérieur pour ouvrir l'application complète.",
    );
}

// ============================================
// 3️⃣ GESTION DES NOTIFICATIONS DISCORD & STOCK
// ============================================
function envoyerNotificationDiscord(message) {
  journaliserActionDiscord("Notification", { message }, "POS");
}

function journaliserActionDiscord(action, details, actor) {
  const now = new Date();
  const detailText = Object.keys(details || {})
    .map((key) => `${key}: ${String(details[key] ?? "-")}`)
    .join("\n");
  try {
    const sheet = assurerFeuilleAvecEntetes("JOURNAL_ACTIONS", [
      "log_id",
      "action",
      "actor",
      "details",
      "status",
      "created_at",
    ]);
    sheet.appendRow([
      prochainIdentifiant(sheet, "LOG", now.getFullYear()),
      action,
      actor || "POS",
      detailText,
      "SUCCES",
      now,
    ]);
  } catch (error) {
    Logger.log("Erreur journal action: " + error);
  }

  let webhookUrl = "";
  try {
    webhookUrl = getParametres()["Discord Webhook URL"] || "";
  } catch (error) {
    Logger.log("Paramètres Discord indisponibles: " + error);
  }
  if (!webhookUrl) return;
  const fields = Object.keys(details || {})
    .slice(0, 25)
    .map((key) => ({
      name: key,
      value: String(details[key] ?? "-").slice(0, 1024),
      inline: false,
    }));
  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      payload: JSON.stringify({
        username: "HORNY'S POS",
        embeds: [
          {
            title: action,
            color: 5793266,
            fields,
            timestamp: now.toISOString(),
            footer: { text: "Journal HORNY'S POS" },
          },
        ],
      }),
    });
  } catch (error) {
    Logger.log("Erreur webhook journal action: " + error);
  }
}

function getParametres() {
  const sheet = obtenirFeuille("Paramètres");
  const data = sheet.getDataRange().getValues();
  if (!data.length) return {};
  const headers = data[0].map(normaliserEntete);
  const parametreColumn =
    ["parametre", "paramètre", "name", "key"]
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0) ?? 0;
  const valeurColumn =
    ["valeur", "value"]
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0) ?? 1;
  const parametres = {};
  for (let i = 1; i < data.length; i++) {
    const nom = String(data[i][parametreColumn] || "").trim();
    if (nom) parametres[nom] = data[i][valeurColumn];
  }
  return parametres;
}

function getClientRewardsCatalog() {
  const sheet = assurerFeuilleAvecEntetes("RECOMPENSES", [
    "reward_id",
    "name",
    "article_id",
    "points_required",
    "status",
    "created_at",
    "updated_at",
  ]);
  if (sheet.getLastRow() < 2) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  return rows
    .filter((row) => row[0] && row[1])
    .map((row) => ({
      id: row[0],
      key: row[0],
      label: row[1],
      articleId: row[2],
      points: Number(row[3]) || 0,
      status: String(row[4] || "ACTIF").toUpperCase(),
      actif: String(row[4] || "ACTIF").toUpperCase() === "ACTIF",
    }))
    .filter((reward) => reward.actif);
}

function sauvegarderRecompense(recompense, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "recompenses");
  if (!recompense || !String(recompense.name || "").trim())
    throw new Error("Le nom de la récompense est obligatoire.");
  const sheet = assurerFeuilleAvecEntetes("RECOMPENSES", [
    "reward_id",
    "name",
    "article_id",
    "points_required",
    "status",
    "created_at",
    "updated_at",
  ]);
  const id =
    recompense.id ||
    prochainIdentifiant(sheet, "REW", new Date().getFullYear());
  const rows =
    sheet.getLastRow() < 2
      ? []
      : sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  const index = rows.findIndex((row) => String(row[0]) === String(id));
  const now = new Date();
  const output = index >= 0 ? [...rows[index]] : Array(7).fill("");
  output[0] = id;
  output[1] = String(recompense.name).trim();
  output[2] = recompense.articleId || "";
  output[3] = Math.max(0, Math.floor(Number(recompense.points) || 0));
  output[4] = String(recompense.status || "ACTIF").toUpperCase();
  output[5] = output[5] || now;
  output[6] = now;
  if (index >= 0) sheet.getRange(index + 2, 1, 1, 7).setValues([output]);
  else sheet.getRange(sheet.getLastRow() + 1, 1, 1, 7).setValues([output]);
  journaliserActionDiscord(
    index >= 0 ? "Récompense modifiée" : "Récompense créée",
    {
      reward_id: id,
      name: output[1],
      article_id: output[2],
      points_required: output[3],
    },
  );
  return (
    getClientRewardsCatalog().find(
      (reward) => String(reward.id) === String(id),
    ) || {
      id,
      key: id,
      label: output[1],
      articleId: output[2],
      points: output[3],
      status: output[4],
      actif: output[4] === "ACTIF",
    }
  );
}

function trouverClientParId(clientId) {
  if (!clientId && clientId !== 0) return null;
  const sheet = obtenirFeuille("Clients");
  const colonnes = colonnesClients(sheet);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colonnes.id]) === String(clientId)) {
      return {
        id: data[i][colonnes.id],
        nom: data[i][colonnes.nom],
        type: data[i][colonnes.type],
        contact: data[i][colonnes.contact],
        adresse: data[i][colonnes.adresse],
        statut: data[i][colonnes.statut],
        points: Number(data[i][colonnes.points]) || 0,
        offreActive: data[i][colonnes.offre] || "",
        dateCreation: data[i][colonnes.dateCreation],
      };
    }
  }
  return null;
}

function creerCompteClient(nom, contact, adresse, typeCompte, matricule) {
  const typeFinal = typeCompte === "Entreprise" ? "Entreprise" : "Particulier";

  if (typeFinal === "Entreprise") {
    const identifiant = (nom || matricule || "").toString().trim();
    if (!identifiant) {
      throw new Error(
        "Le nom ou le matricule de l’entreprise est obligatoire.",
      );
    }
  }

  const sheet = obtenirFeuille("Clients");
  const data = sheet.getDataRange().getValues();
  const ids = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) ids.push(Number(data[i][0]));
  }
  const nextId = ids.length ? Math.max(...ids) + 1 : 1;
  const maintenant = new Date();
  const nomFinal =
    typeFinal === "Entreprise"
      ? nom || matricule || "Entreprise " + nextId
      : nom || "Client " + nextId;

  sheet.appendRow([
    nextId,
    nomFinal,
    typeFinal,
    contact || "",
    adresse || "",
    "Actif",
    0,
    "",
    maintenant,
  ]);
  journaliserActionDiscord("Compte client créé", {
    client_id: nextId,
    name: nomFinal,
    type: typeFinal,
    contact: contact || "",
  });
  return trouverClientParId(nextId);
}

function sauvegarderClient(client, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "clients");
  if (!client || !String(client.nom || "").trim())
    throw new Error("Le nom du client est obligatoire.");
  const sheet = obtenirFeuille("Clients");
  const colonnes = colonnesClients(sheet);
  const data = sheet.getDataRange().getValues();
  const id =
    client.id ||
    Math.max(0, ...data.slice(1).map((row) => Number(row[colonnes.id]) || 0)) +
      1;
  const rowIndex = data.findIndex(
    (row, index) => index > 0 && String(row[colonnes.id]) === String(id),
  );
  const output =
    rowIndex >= 0 ? [...data[rowIndex]] : Array(sheet.getLastColumn()).fill("");
  output[colonnes.id] = id;
  output[colonnes.nom] = String(client.nom).trim();
  output[colonnes.type] =
    client.type === "Entreprise" ? "Entreprise" : "Particulier";
  output[colonnes.contact] = String(client.contact || "").trim();
  output[colonnes.adresse] = String(client.adresse || "").trim();
  output[colonnes.statut] = String(client.statut || "Actif");
  output[colonnes.points] = Math.max(0, Math.floor(Number(client.points) || 0));
  output[colonnes.offre] = client.offreActive || "";
  output[colonnes.dateCreation] = output[colonnes.dateCreation] || new Date();
  if (rowIndex >= 0)
    sheet.getRange(rowIndex + 1, 1, 1, output.length).setValues([output]);
  else
    sheet
      .getRange(sheet.getLastRow() + 1, 1, 1, output.length)
      .setValues([output]);
  journaliserActionDiscord(
    rowIndex >= 0 ? "Compte client modifié" : "Compte client créé",
    { client_id: id, name: output[colonnes.nom] },
    vendeurId || "POS",
  );
  return trouverClientParId(id);
}

function modifierPointsClient(clientId, variation, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "clients");
  const client = trouverClientParId(clientId);
  if (!client) throw new Error("Client introuvable.");
  const result =
    variation >= 0
      ? ajouterPointsClient(clientId, variation)
      : utiliserPointsManuellement(clientId, Math.abs(variation));
  if (!result) throw new Error("Impossible de modifier les points.");
  journaliserActionDiscord(
    "Points client modifiés",
    { client_id: clientId, variation, points_total: result.points },
    vendeurId || "POS",
  );
  return result;
}

function utiliserPointsManuellement(clientId, points) {
  const sheet = obtenirFeuille("Clients");
  const colonnes = colonnesClients(sheet);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colonnes.id]) === String(clientId)) {
      const total = Number(data[i][colonnes.points]) || 0;
      if (total < points) throw new Error("Solde de points insuffisant.");
      const nouveauTotal = total - Math.floor(points);
      sheet.getRange(i + 1, colonnes.points + 1).setValue(nouveauTotal);
      return { ...trouverClientParId(clientId), points: nouveauTotal };
    }
  }
  return null;
}

function archiverClient(clientId, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "clients");
  const client = trouverClientParId(clientId);
  if (!client) throw new Error("Client introuvable.");
  client.statut = "Inactif";
  const result = sauvegarderClient(client);
  journaliserActionDiscord(
    "Compte client archivé",
    { client_id: clientId, name: client.nom },
    vendeurId || "POS",
  );
  return result;
}

function obtenirHistoriqueClient(clientId, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "clients");
  const sheet = obtenirFeuille("Ventes");
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet
    .getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), 12))
    .getValues();
  const { rowIndex, headers } = trouverLigneEnTetes(values, [
    "id",
    "date",
    "heure",
    "articles",
    "montant final",
    "type paiement",
    "client id",
  ]);
  if (!Array.isArray(headers) || headers.length === 0) return [];

  const col = (names, fallback) =>
    names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0) ?? fallback;

  const targetClientId = String(clientId || "")
    .trim()
    .toLowerCase();
  const clientColumn = col(["client id", "client_id", "client"], 11);
  return values
    .slice(rowIndex + 1)
    .filter(
      (row) =>
        Array.isArray(row) &&
        !row.every((cell) => String(cell || "").trim() === "") &&
        String(row[clientColumn] || "")
          .trim()
          .toLowerCase() === targetClientId,
    )
    .map((row) => ({
      id: row[col(["id", "vente id"], 0)],
      date: row[col(["date", "date vente"], 1)],
      heure: row[col(["heure", "time"], 2)],
      paiement: row[col(["type paiement", "paiement", "payment"], 8)],
      total:
        Number(
          String(
            row[col(["montant final", "total", "total final"], 7)] || "",
          ).replace(",", "."),
        ) || 0,
      articles: row[col(["articles", "article"], 4)],
    }));
}

function ajouterPointsClient(clientId, montant) {
  if (!clientId) return null;
  const client = trouverClientParId(clientId);
  if (!client) return null;
  const pointsAjoutes = Math.max(0, Math.floor(Number(montant) || 0));
  const sheet = obtenirFeuille("Clients");
  const colonnes = colonnesClients(sheet);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colonnes.id]) === String(clientId)) {
      const nouveauTotal =
        (Number(data[i][colonnes.points]) || 0) + pointsAjoutes;
      sheet.getRange(i + 1, colonnes.points + 1).setValue(nouveauTotal);
      journaliserActionDiscord("Points fidélité ajoutés", {
        client_id: clientId,
        points_added: pointsAjoutes,
        points_total: nouveauTotal,
      });
      return { ...client, points: nouveauTotal };
    }
  }
  return null;
}

function utiliserOffreClient(clientId, keyOffre, vendeurId) {
  if (vendeurId) verifierPermission(vendeurId, "caisse");
  const client = trouverClientParId(clientId);
  if (!client) return { ok: false, message: "Client introuvable" };
  const catalog = getClientRewardsCatalog();
  const offre = catalog.find((item) => item.key === keyOffre);
  if (!offre) return { ok: false, message: "Offre introuvable" };
  if ((client.points || 0) < offre.points) {
    return {
      ok: false,
      message: `Points insuffisants : ${offre.points} requis`,
    };
  }

  const sheet = obtenirFeuille("Clients");
  const colonnes = colonnesClients(sheet);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colonnes.id]) === String(clientId)) {
      const nouveauTotal =
        (Number(data[i][colonnes.points]) || 0) - offre.points;
      sheet.getRange(i + 1, colonnes.points + 1).setValue(nouveauTotal);
      sheet.getRange(i + 1, colonnes.offre + 1).setValue(offre.label);
      journaliserActionDiscord("Récompense utilisée", {
        client_id: clientId,
        reward: offre.label,
        points_used: offre.points,
        points_remaining: nouveauTotal,
      });
      return {
        ok: true,
        message: `${offre.label} activée`,
        pointsRestants: nouveauTotal,
      };
    }
  }
  return { ok: false, message: "Erreur lors de la mise à jour" };
}

// ============================================
// 4️⃣ API DONNÉES COMPLÈTES (POUR LE FRONTEND MULTIPAGE)
// ============================================
function chargerDonneesJSON() {
  initialiserStructurePOS();
  const sheetVendeurs = obtenirFeuille("Vendeurs");
  const sheetArticles = obtenirFeuille("Articles");
  const sheetClients = obtenirFeuille("Clients");
  const sheetVentes = obtenirFeuille("Ventes");

  const vendeurs = [];
  const articles = [];
  const contrats = [];
  const clients = [];
  const ventes = [];

  const parametres = getParametres();
  const deviseActuelle = (
    parametres["Devise"] ||
    parametres["devise"] ||
    "^"
  ).toString();

  const dataVendeurs = sheetVendeurs.getDataRange().getValues();
  const vendeurHeaders = dataVendeurs.length
    ? dataVendeurs[0].map(normaliserEntete)
    : [];
  const vendeurIdColumn =
    ["id", "vendeur id", "vendeur_id"]
      .map((name) => vendeurHeaders.indexOf(name))
      .find((index) => index >= 0) ?? 0;
  const vendeurNameColumn =
    ["nom", "name", "nom vendeur", "vendeur"]
      .map((name) => vendeurHeaders.indexOf(name))
      .find((index) => index >= 0) ?? 1;
  const pinColumn = vendeurHeaders.findIndex(
    (header) =>
      header === "code acces" || header === "code pin" || header === "pin",
  );
  const activeColumn = vendeurHeaders.findIndex(
    (header) =>
      header === "statut" || header === "actif" || header === "status",
  );
  const roleColumn = ["grade", "role", "rôle"]
    .map((name) => vendeurHeaders.indexOf(name))
    .find((index) => index >= 0);
  for (let i = 1; i < dataVendeurs.length; i++) {
    if (!dataVendeurs[i][vendeurIdColumn]) continue;
    vendeurs.push({
      id: dataVendeurs[i][vendeurIdColumn],
      nom: dataVendeurs[i][vendeurNameColumn],
      email: dataVendeurs[i][2] || "",
      role: String(
        roleColumn === undefined
          ? "ADMIN"
          : dataVendeurs[i][roleColumn] || "ADMIN",
      ).toUpperCase(),
      permissions: obtenirPermissionsRole(
        roleColumn === undefined ? "ADMIN" : dataVendeurs[i][roleColumn],
      ),
      code: dataVendeurs[i][pinColumn >= 0 ? pinColumn : 4]
        ? dataVendeurs[i][pinColumn >= 0 ? pinColumn : 4].toString().trim()
        : "",
      actif:
        activeColumn < 0 ||
        dataVendeurs[i][activeColumn] === true ||
        String(dataVendeurs[i][activeColumn]).toUpperCase() === "ACTIF" ||
        String(dataVendeurs[i][activeColumn]).toUpperCase() === "TRUE",
    });
  }

  const dataArticles = sheetArticles.getDataRange().getValues();
  const articleHeaders = dataArticles.length
    ? dataArticles[0].map(normaliserEntete)
    : [];
  const articleColumn = (names, fallback) => {
    const found = names
      .map((name) => articleHeaders.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const articleIdColumn = articleColumn(
    ["id", "article id", "article_id", "id article"],
    0,
  );
  const articleNameColumn = articleColumn(
    ["nom", "name", "article", "nom article", "article name"],
    1,
  );
  const articleTypeColumn = articleColumn(
    ["type", "catégorie", "categorie", "category", "type article"],
    2,
  );
  const articlePriceColumn = articleColumn(
    ["prix", "price", "tarif", "prix article"],
    3,
  );
  const articleStockColumn = articleColumn(
    ["stock", "quantité", "quantite", "quantity", "stock actuel"],
    4,
  );
  const articleAlertColumn = articleColumn(
    ["seuil alerte", "seuil", "stock minimum"],
    5,
  );
  const articleDescriptionColumn = articleColumn(["description", "details"], 6);
  const articleActiveColumn = articleColumn(
    ["actif", "active", "statut", "status"],
    7,
  );
  const articleOptionsColumn = articleColumn(
    ["options", "personnalisation", "variantes"],
    8,
  );
  for (let i = 1; i < dataArticles.length; i++) {
    const row = dataArticles[i];
    if (
      String(row[articleIdColumn] ?? "").trim() === "" ||
      String(row[articleNameColumn] ?? "").trim() === ""
    )
      continue;
    articles.push({
      id: row[articleIdColumn],
      nom: String(row[articleNameColumn]).trim(),
      type: row[articleTypeColumn] ? String(row[articleTypeColumn]) : "Autre",
      prix: Number(String(row[articlePriceColumn]).replace(",", ".")) || 0,
      stock: Number(String(row[articleStockColumn]).replace(",", ".")) || 0,
      seuilAlerte:
        Number(String(row[articleAlertColumn] || 0).replace(",", ".")) || 0,
      description: row[articleDescriptionColumn] || "",
      actif: interpreterStatutActif(row[articleActiveColumn]),
      options: (() => {
        try {
          return row[articleOptionsColumn]
            ? JSON.parse(row[articleOptionsColumn])
            : {};
        } catch (error) {
          return {};
        }
      })(),
    });
  }

  const dataClients = sheetClients.getDataRange().getValues();
  const colonnes = colonnesClients(sheetClients);
  for (let i = 1; i < dataClients.length; i++) {
    if (!dataClients[i][colonnes.id]) continue;
    clients.push({
      id: dataClients[i][colonnes.id],
      nom: dataClients[i][colonnes.nom],
      type: dataClients[i][colonnes.type] || "Particulier",
      contact: dataClients[i][colonnes.contact],
      adresse: dataClients[i][colonnes.adresse],
      statut: dataClients[i][colonnes.statut],
      points: Number(dataClients[i][colonnes.points]) || 0,
      offreActive: dataClients[i][colonnes.offre] || "",
      dateCreation: dataClients[i][colonnes.dateCreation],
    });
  }

  contrats.push(...contratsEntreprises());
  const recompenses = getClientRewardsCatalog();

  let totalCA = 0;
  let nbVentes = 0;
  const dataVentes = sheetVentes.getDataRange().getValues();
  const { rowIndex, headers } = trouverLigneEnTetes(dataVentes, [
    "id",
    "date",
    "heure",
    "articles",
    "montant final",
    "type paiement",
    "statut",
  ]);
  const venteColumn = (names, fallback) => {
    const found = names
      .map((name) => headers.indexOf(normaliserEntete(name)))
      .find((index) => index >= 0);
    return found === undefined ? fallback : found;
  };
  const venteIdColumn = venteColumn(["id", "vente id"], 0);
  const venteDateColumn = venteColumn(["date", "date vente"], 1);
  const venteTimeColumn = venteColumn(["heure", "time"], 2);
  const venteVendeurColumn = venteColumn(
    ["vendeur id", "vendeur", "cashier", "caissier"],
    3,
  );
  const venteArticlesColumn = venteColumn(["articles", "article"], 4);
  const venteBrutColumn = venteColumn(
    ["montant brut", "total brut", "subtotal"],
    5,
  );
  const venteReductionColumn = venteColumn(
    ["réduction", "reduction", "discount"],
    6,
  );
  const venteFinalColumn = venteColumn(
    ["montant final", "total", "total final"],
    7,
  );
  const ventePaiementColumn = venteColumn(
    ["type paiement", "paiement", "payment"],
    8,
  );
  const venteArdoiseColumn = venteColumn(["ardoise?", "ardoise"], 9);
  const venteStatutColumn = venteColumn(["statut", "status"], 10);
  const venteClientColumn = venteColumn(
    ["client id", "client_id", "client"],
    11,
  );
  const nombreVente = (value) =>
    Number(String(value ?? "").replace(",", ".")) || 0;
  for (let i = rowIndex + 1; i < dataVentes.length; i++) {
    const ligne = dataVentes[i];
    if (
      !Array.isArray(ligne) ||
      ligne.every((cell) => String(cell || "").trim() === "")
    )
      continue;
    const montant = nombreVente(ligne[venteFinalColumn]);
    if (ligne[venteIdColumn] || montant) {
      totalCA += montant || 0;
      nbVentes++;
      const vendeur = vendeurs.find(
        (item) => String(item.id) === String(ligne[venteVendeurColumn]),
      );
      ventes.push({
        id: ligne[venteIdColumn],
        date: ligne[venteDateColumn],
        heure: ligne[venteTimeColumn],
        vendeur: vendeur ? vendeur.nom : ligne[venteVendeurColumn],
        articles: ligne[venteArticlesColumn],
        montantBrut: nombreVente(ligne[venteBrutColumn]),
        reduction: nombreVente(ligne[venteReductionColumn]),
        montantFinal: montant || 0,
        paiement: ligne[ventePaiementColumn] || "Cash",
        ardoise: ligne[venteArdoiseColumn] || "Non",
        statut: ligne[venteStatutColumn] || "Complétée",
        clientId: ligne[venteClientColumn] || "",
      });
    }
  }

  return JSON.stringify({
    vendeurs,
    articles,
    clients,
    contrats,
    employes: lireEmployes(),
    recompenses,
    ventes,
    devise: deviseActuelle,
    dashboard: { totalCA, nbVentes },
  });
}

function authentifierVendeurPIN(pin) {
  const sheet = obtenirFeuille("Vendeurs");
  if (!sheet || sheet.getLastRow() < 2)
    throw new Error("Aucun vendeur configuré.");
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(normaliserEntete);
  const vendeurIdColumn =
    ["id", "vendeur id", "vendeur_id"]
      .map((name) => headers.indexOf(name))
      .find((index) => index >= 0) ?? 0;
  const vendeurNameColumn =
    ["nom", "name", "nom vendeur", "vendeur"]
      .map((name) => headers.indexOf(name))
      .find((index) => index >= 0) ?? 1;
  const pinColumn = headers.findIndex(
    (header) =>
      header === "code acces" || header === "code pin" || header === "pin",
  );
  const roleColumn = ["grade", "role", "rôle"]
    .map((name) => headers.indexOf(name))
    .find((index) => index >= 0);
  const activeColumn = headers.findIndex(
    (header) =>
      header === "statut" || header === "actif" || header === "status",
  );
  const requestedPin = String(pin || "").trim();
  if (!requestedPin) return { ok: false, message: "PIN vide." };
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowPin = String(row[pinColumn >= 0 ? pinColumn : 4] || "").trim();
    const active =
      activeColumn < 0 ||
      row[activeColumn] === true ||
      String(row[activeColumn]).trim().toUpperCase() === "ACTIF" ||
      String(row[activeColumn]).trim().toUpperCase() === "TRUE";
    if (active && rowPin === requestedPin) {
      journaliserActionDiscord(
        "Connexion vendeur",
        {
          vendor_id: row[vendeurIdColumn],
          vendor: row[vendeurNameColumn],
          result: "SUCCES",
        },
        row[vendeurNameColumn],
      );
      return {
        ok: true,
        vendeur: {
          id: row[vendeurIdColumn],
          nom: row[vendeurNameColumn],
          role: String(
            roleColumn === undefined ? "ADMIN" : row[roleColumn] || "ADMIN",
          ).toUpperCase(),
          permissions: obtenirPermissionsRole(
            roleColumn === undefined ? "ADMIN" : row[roleColumn],
          ),
        },
      };
    }
  }
  journaliserActionDiscord("Échec connexion vendeur", { result: "REFUSEE" });
  return { ok: false, message: "Code PIN incorrect ou vendeur inactif." };
}

function obtenirContratJSON(clientId) {
  const contrat = contratsEntreprises().find(
    (item) => String(item.companyId) === String(clientId) && item.actif,
  );
  if (contrat) return JSON.stringify(contrat);
  return JSON.stringify({ id: null, reduction: 0, limite: null });
}

function initialiserStructureStatistiquesHebdomadaires() {
  assurerFeuilleAvecEntetes("CHARGES_HEBDOMADAIRES", ["ID","Semaine début","Type","Libellé","Montant","Employé","Statut","Date création"]);
}
function debutSemaineStatistiques_(date) {
  const d = new Date(date || new Date()); d.setHours(0,0,0,0);
  const j = d.getDay(); d.setDate(d.getDate() + (j === 0 ? -6 : 1-j)); return d;
}
function finSemaineStatistiques_(date) {
  const d = debutSemaineStatistiques_(date); d.setDate(d.getDate()+6); d.setHours(23,59,59,999); return d;
}
function parseDateStatistiques_(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value);
  const raw = String(value || "").trim(); if (!raw) return null;
  let m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) return new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0),+(m[6]||0));
  m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0));
  const d = new Date(raw); return Number.isNaN(d.getTime()) ? null : d;
}
function plageStatistiquesHebdomadaires_(period) {
  const now = new Date(), current = debutSemaineStatistiques_(now), p = String(period||"week").toLowerCase();
  let start = new Date(current), end = finSemaineStatistiques_(now);
  if (p === "today") { start = new Date(now.getFullYear(),now.getMonth(),now.getDate()); end = new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999); }
  else if (p === "previous-week") { start.setDate(start.getDate()-7); end = finSemaineStatistiques_(start); }
  else if (p === "4-weeks") start.setDate(start.getDate()-21);
  else if (p === "12-weeks") start.setDate(start.getDate()-77);
  else if (p === "all") start = end = null;
  return {start,end};
}
function lireChargesHebdomadaires_(start,end) {
  initialiserStructureStatistiquesHebdomadaires(); const s=obtenirFeuille("CHARGES_HEBDOMADAIRES"); if(!s||s.getLastRow()<2)return[];
  const v=s.getDataRange().getValues(), h=v[0].map(normaliserEntete), ci=(names,f)=>names.map(n=>h.indexOf(normaliserEntete(n))).find(i=>i>=0)??f;
  return v.slice(1).filter(r=>r.some(c=>String(c||"").trim())).map(r=>({id:r[ci(["id"],0)],semaineDebut:parseDateStatistiques_(r[ci(["semaine début","week start"],1)]),type:String(r[ci(["type"],2)]||"AUTRE").toUpperCase(),libelle:String(r[ci(["libellé","label"],3)]||"").trim(),montant:Math.max(0,Number(String(r[ci(["montant","amount"],4)]||"").replace(",","."))||0),employe:String(r[ci(["employé","employee"],5)]||"").trim(),statut:String(r[ci(["statut","status"],6)]||"ACTIF").toUpperCase()})).filter(c=>c.statut!=="ANNULEE"&&c.statut!=="ANNULÉE"&&(!start||(c.semaineDebut&&c.semaineDebut>=start&&c.semaineDebut<=end)));
}
function obtenirChargesHebdomadaires(vendeurId,period){ if(vendeurId)verifierPermission(vendeurId,"dashboard"); const r=plageStatistiquesHebdomadaires_(period||"week"); return lireChargesHebdomadaires_(r.start,r.end).map(c=>({id:c.id,semaineDebut:c.semaineDebut?Utilities.formatDate(c.semaineDebut,"Europe/Paris","dd/MM/yyyy"):"",type:c.type,libelle:c.libelle,montant:c.montant,employe:c.employe,statut:c.statut})); }
function sauvegarderChargeHebdomadaire(charge,vendeurId){
  if(vendeurId)verifierPermission(vendeurId,"dashboard"); if(!charge)throw new Error("Charge invalide."); const montant=Number(charge.montant); if(!Number.isFinite(montant)||montant<=0)throw new Error("Le montant doit être supérieur à 0.");
  const type=String(charge.type||"AUTRE").trim().toUpperCase(), libelle=String(charge.libelle||"").trim(); if(!libelle)throw new Error("Le libellé est obligatoire.");
  const s=assurerFeuilleAvecEntetes("CHARGES_HEBDOMADAIRES",["ID","Semaine début","Type","Libellé","Montant","Employé","Statut","Date création"]), id=charge.id||prochainIdentifiant(s,"CHG",new Date().getFullYear());
  const rows=s.getLastRow()<2?[]:s.getRange(2,1,s.getLastRow()-1,8).getValues(), i=rows.findIndex(r=>String(r[0])===String(id)), out=i>=0?[...rows[i]]:Array(8).fill("");
  out[0]=id; out[1]=debutSemaineStatistiques_(parseDateStatistiques_(charge.semaineDebut)||new Date()); out[2]=type; out[3]=libelle; out[4]=Math.round(montant*100)/100; out[5]=String(charge.employe||"").trim(); out[6]="ACTIF"; out[7]=out[7]||new Date();
  if(i>=0)s.getRange(i+2,1,1,8).setValues([out]);else s.getRange(s.getLastRow()+1,1,1,8).setValues([out]); return obtenirChargesHebdomadaires(vendeurId,"all");
}
function supprimerChargeHebdomadaire(id,vendeurId){
  if(vendeurId)verifierPermission(vendeurId,"dashboard"); const s=assurerFeuilleAvecEntetes("CHARGES_HEBDOMADAIRES",["ID","Semaine début","Type","Libellé","Montant","Employé","Statut","Date création"]); if(!id||s.getLastRow()<2)throw new Error("Charge introuvable.");
  const rows=s.getRange(2,1,s.getLastRow()-1,8).getValues(),i=rows.findIndex(r=>String(r[0])===String(id)); if(i<0)throw new Error("Charge introuvable."); s.getRange(i+2,7).setValue("ANNULEE"); return obtenirChargesHebdomadaires(vendeurId,"all");
}
function obtenirStatistiquesDashboard(period,vendeurId){
  if(vendeurId)verifierPermission(vendeurId,"dashboard"); initialiserStructureStatistiquesHebdomadaires(); const range=plageStatistiquesHebdomadaires_(period||"week"), sheet=obtenirFeuille("Ventes");
  const result={period:period||"week",periodStart:range.start?Utilities.formatDate(range.start,"Europe/Paris","dd/MM/yyyy"):"",periodEnd:range.end?Utilities.formatDate(range.end,"Europe/Paris","dd/MM/yyyy"):"",totalCA:0,nbVentes:0,panierMoyen:0,meilleurVendeur:"-",meilleurEmploye:"-",articleTop:"-",articleTopQuantite:0,paiements:{},ventes:[],stockCritique:0,salaires:0,factures:0,autresCharges:0,chargesTotal:0,resultatNet:0,margeNette:0,charges:[],weekly:[]}, vendeurs={},articles={};
  if(sheet&&sheet.getLastRow()>1){ const v=sheet.getDataRange().getValues(),{rowIndex,headers}=trouverLigneEnTetes(v,["id","date","heure","articles","montant final","type paiement","statut"]),c=(n,f)=>n.map(x=>headers.indexOf(normaliserEntete(x))).find(i=>i>=0)??f;
    v.slice(rowIndex+1).forEach(r=>{if(!r.some(x=>String(x||"").trim()))return;const d=parseDateStatistiques_(r[c(["date","date vente"],1)]);if(range.start&&(!d||d<range.start||d>range.end))return;const total=Number(String(r[c(["montant final","total","total final"],7)]||"").replace(",","."))||0, vendeur=String(r[c(["vendeur id","vendeur","cashier","caissier"],3)]||"-"),paiement=String(r[c(["type paiement","paiement","payment"],8)]||"-"),statut=String(r[c(["statut","status"],10)]||"Complétée");if(statut.toUpperCase().includes("ANNUL"))return;result.totalCA+=total;result.nbVentes++;vendeurs[vendeur]=(vendeurs[vendeur]||0)+total;result.paiements[paiement]=(result.paiements[paiement]||0)+1;result.ventes.push({id:r[c(["id","vente id"],0)],date:r[c(["date","date vente"],1)],vendeur,paiement,montantFinal:total,statut});try{const raw=r[c(["articles","article"],4)]||"[]",items=typeof raw==="string"?JSON.parse(raw):raw;if(Array.isArray(items))items.forEach(it=>{const n=it&&(it.nom||it.nomComplet)?(it.nom||it.nomComplet):"Article";articles[n]=(articles[n]||0)+(Number(it.quantity)||0);});}catch(e){Logger.log("Articles de vente illisibles: "+e);}});
  }
  const best=o=>Object.keys(o).sort((a,b)=>o[b]-o[a])[0]||"-",bestV=best(vendeurs); result.meilleurVendeur=obtenirVendeurParId(bestV)?.nom||bestV; result.articleTop=best(articles); result.articleTopQuantite=articles[result.articleTop]||0; result.panierMoyen=result.nbVentes?result.totalCA/result.nbVentes:0;
  const tx=obtenirFeuille("CONTRACT_TRANSACTIONS"),employes={}; if(tx&&tx.getLastRow()>1)tx.getRange(2,1,tx.getLastRow()-1,18).getValues().forEach(r=>{const d=parseDateStatistiques_(r[15]);if(range.start&&(!d||d<range.start||d>range.end))return;const e=String(r[4]||"-");employes[e]=(employes[e]||0)+(Number(r[8])||0);}); result.meilleurEmploye=best(employes);
  const charges=lireChargesHebdomadaires_(range.start,range.end); result.charges=charges.map(c=>({id:c.id,semaineDebut:c.semaineDebut?Utilities.formatDate(c.semaineDebut,"Europe/Paris","dd/MM/yyyy"):"",type:c.type,libelle:c.libelle,montant:c.montant,employe:c.employe})); charges.forEach(c=>{if(c.type==="SALAIRE"||c.type==="SALAIRES")result.salaires+=c.montant;else if(c.type==="FACTURE"||c.type==="FACTURES")result.factures+=c.montant;else result.autresCharges+=c.montant;}); result.chargesTotal=result.salaires+result.factures+result.autresCharges;result.resultatNet=result.totalCA-result.chargesTotal;result.margeNette=result.totalCA?(result.resultatNet/result.totalCA)*100:0;
  const as=obtenirFeuille("Articles"); if(as&&as.getLastRow()>1){const v=as.getDataRange().getValues(),h=v[0].map(normaliserEntete),c=(n,f)=>n.map(x=>h.indexOf(normaliserEntete(x))).find(i=>i>=0)??f,stock=c(["stock","quantité","quantity"],4),seuil=c(["seuil alerte","seuil","stock minimum"],5);result.stockCritique=v.slice(1).filter(r=>Number(r[stock])<=Number(r[seuil])&&Number(r[seuil])>0).length;}
  const ws=range.start?debutSemaineStatistiques_(range.start):debutSemaineStatistiques_(new Date(new Date().getFullYear(),0,1)),we=range.end||finSemaineStatistiques_(new Date()); for(let cur=new Date(ws);cur<=we;cur.setDate(cur.getDate()+7)){const end=finSemaineStatistiques_(cur),wc=lireChargesHebdomadaires_(cur,end);let ca=0,n=0;if(sheet&&sheet.getLastRow()>1){const v=sheet.getDataRange().getValues(),{rowIndex,headers}=trouverLigneEnTetes(v,["id","date","montant final","statut"]),c=(x,f)=>x.map(y=>headers.indexOf(normaliserEntete(y))).find(i=>i>=0)??f;v.slice(rowIndex+1).forEach(r=>{const d=parseDateStatistiques_(r[c(["date","date vente"],1)]);if(!d||d<cur||d>end)return;if(String(r[c(["statut","status"],10)]||"").toUpperCase().includes("ANNUL"))return;ca+=Number(String(r[c(["montant final","total","total final"],7)]||"").replace(",","."))||0;n++;});}const ch=wc.reduce((s,c)=>s+c.montant,0);result.weekly.push({semaineDebut:Utilities.formatDate(cur,"Europe/Paris","dd/MM/yyyy"),chiffreAffaires:ca,ventes:n,charges:ch,resultat:ca-ch});}
  return result;
}

function sauvegarderContratUI(contratObj, vendeurId) {
  return sauvegarderContrat(contratObj, undefined, vendeurId);
}

// ============================================
// 5️⃣ ENREGISTREMENT DES VENTES
// ============================================
function enregistrerVenteFormule(venteJSON) {
  const vente =
    typeof venteJSON === "string" ? JSON.parse(venteJSON) : venteJSON;
  if (!vente || !vente.vendeur || !vente.articles || !vente.articles.length)
    throw new Error("Vendeur et commande obligatoires.");
  verifierPermission(vente.vendeur, "caisse");
  initialiserDonneesContratsEntreprises();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheetArticles = obtenirFeuille("Articles");
    const articleRows = sheetArticles.getDataRange().getValues();
    const articles = vente.articles.map((item) => {
      const id = item.article && item.article.id;
      const row = articleRows
        .slice(1)
        .find((value) => String(value[0]) === String(id));
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
      if (!row || quantity < 1) throw new Error("Article invalide.");
      if (Number(row[4]) < quantity)
        throw new Error(`Stock insuffisant pour ${row[1]}.`);
      return {
        id: row[0],
        nom: row[1],
        quantity: quantity,
        prix: arrondirMontant(row[3]),
      };
    });
    const contract = vente.contractId
      ? contratsEntreprises().find(
          (item) => String(item.id) === String(vente.contractId),
        )
      : null;
    const now = new Date();
    if (
      vente.contractId &&
      (!contract ||
        !contract.actif ||
        (contract.endDate instanceof Date && contract.endDate < now))
    )
      throw new Error("Contrat absent, suspendu ou expiré.");
    const employee =
      contract && vente.employeeId
        ? lireEmployes(contract.companyId).find(
            (item) => String(item.id) === String(vente.employeeId),
          )
        : null;
    if (contract && (!employee || employee.status !== "ACTIF"))
      throw new Error("Employé obligatoire ou non autorisé.");
    if (contract) {
      const allowedEmployees = String(contract.allowedEmployees || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (
        allowedEmployees.length &&
        allowedEmployees.indexOf(String(employee.id)) === -1 &&
        allowedEmployees.indexOf(String(employee.identifier)) === -1
      )
        throw new Error("Cet employé n’est pas autorisé par le contrat.");
      const allowedProducts = String(contract.allowedProducts || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const forbiddenProducts = String(contract.forbiddenProducts || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (
        allowedProducts.length &&
        articles.some((item) => allowedProducts.indexOf(String(item.id)) === -1)
      )
        throw new Error("Un article n’est pas autorisé par le contrat.");
      if (
        articles.some(
          (item) => forbiddenProducts.indexOf(String(item.id)) !== -1,
        )
      )
        throw new Error("Un article est interdit par le contrat.");
      const dayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const txRows =
        obtenirFeuille("CONTRACT_TRANSACTIONS").getLastRow() < 2
          ? []
          : obtenirFeuille("CONTRACT_TRANSACTIONS")
              .getRange(
                2,
                1,
                obtenirFeuille("CONTRACT_TRANSACTIONS").getLastRow() - 1,
                18,
              )
              .getValues();
      const todayRows = txRows.filter(
        (row) =>
          String(row[1]) === String(contract.id) &&
          String(row[3]) === String(employee.id) &&
          row[15] instanceof Date &&
          row[15] >= dayStart,
      );
      if (
        contract.dailyLimitEnabled &&
        contract.dailyLimitTransactions &&
        todayRows.length >= contract.dailyLimitTransactions
      )
        throw new Error("La limite quotidienne de transactions est atteinte.");
      if (
        contract.dailyLimitEnabled &&
        contract.dailyLimitAmount &&
        todayRows.reduce((sum, row) => sum + Number(row[10] || 0), 0) +
          arrondirMontant(
            articles.reduce((sum, item) => sum + item.prix * item.quantity, 0),
          ) >
          contract.dailyLimitAmount
      )
        throw new Error("La limite quotidienne du contrat est atteinte.");
      if (contract.type === "HEBDOMADAIRE_FIXE" && contract.includedQuantity) {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const consumptionSheet = obtenirFeuille("CONTRACT_CONSUMPTION");
        const consumptionRows =
          consumptionSheet.getLastRow() < 2
            ? []
            : consumptionSheet
                .getRange(2, 1, consumptionSheet.getLastRow() - 1, 9)
                .getValues();
        const consumed = consumptionRows
          .filter(
            (row) =>
              String(row[1]) === String(contract.id) &&
              row[8] instanceof Date &&
              row[8] >= weekStart,
          )
          .reduce((sum, row) => sum + Number(row[6] || 0), 0);
        const requested = articles.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        if (
          !contract.allowedOverage &&
          consumed + requested > contract.includedQuantity
        )
          throw new Error("Le quota hebdomadaire du contrat est dépassé.");
      }
    }
    const subtotal = arrondirMontant(
      articles.reduce((sum, item) => sum + item.prix * item.quantity, 0),
    );
    const discount =
      contract && contract.type === "HEBDOMADAIRE_FIXE"
        ? arrondirMontant((subtotal * contract.reduction) / 100)
        : 0;
    const total = arrondirMontant(subtotal - discount);
    if (vente.rewardId) {
      if (!vente.clientId || vente.paiement !== "Fidelite")
        throw new Error(
          "Un compte fidélité est obligatoire pour cette récompense.",
        );
      const reward = getClientRewardsCatalog().find(
        (item) => String(item.id) === String(vente.rewardId),
      );
      const client = trouverClientParId(vente.clientId);
      if (!reward || !client || (client.points || 0) < reward.points)
        throw new Error("Solde de points insuffisant pour cette récompense.");
      const redemption = utiliserOffreClient(vente.clientId, reward.id);
      if (!redemption.ok) throw new Error(redemption.message);
    }
    const companyAmount = contract
      ? arrondirMontant((total * contract.companyPercent) / 100)
      : 0;
    const employeeAmount = arrondirMontant(total - companyAmount);
    const transactionId = prochainIdentifiant(
      obtenirFeuille("CONTRACT_TRANSACTIONS"),
      "TX",
      now.getFullYear(),
    );
    const orderId = vente.orderId || transactionId;
    const sheetVentes = obtenirFeuille("Ventes");
    const dateStr = Utilities.formatDate(now, "Europe/Paris", "dd/MM/yyyy");
    const heureStr = Utilities.formatDate(now, "Europe/Paris", "HH:mm:ss");
    sheetVentes.appendRow([
      sheetVentes.getLastRow() + 1,
      dateStr,
      heureStr,
      vente.vendeur,
      JSON.stringify(articles),
      subtotal,
      discount,
      total,
      vente.paiement || "Cash",
      companyAmount > 0 ? "Oui" : "Non",
      contract ? "CONTRAT_" + contract.type : "Complétée",
      vente.clientId || "",
    ]);
    articles.forEach((item) => {
      const rowIndex =
        articleRows.findIndex((row) => String(row[0]) === String(item.id)) + 1;
      sheetArticles
        .getRange(rowIndex, 5)
        .setValue(Number(articleRows[rowIndex - 1][4]) - item.quantity);
    });
    if (contract) {
      const company = trouverClientParId(contract.companyId) || {};
      const txSheet = obtenirFeuille("CONTRACT_TRANSACTIONS");
      txSheet.appendRow([
        transactionId,
        contract.id,
        contract.companyId,
        employee.id,
        employee.name,
        employee.identifier,
        orderId,
        contract.type,
        total,
        employeeAmount,
        companyAmount,
        discount,
        vente.paiement || "Cash",
        vente.vendeur,
        JSON.stringify(articles),
        now,
        "NON_ENVOYE",
        "ENREGISTREE",
      ]);
      if (contract.type === "HEBDOMADAIRE_FIXE") {
        articles.forEach((item) =>
          ajouterConsommation({
            contractId: contract.id,
            companyId: contract.companyId,
            transactionId,
            productId: item.id,
            productName: item.nom,
            quantity: item.quantity,
            unitPrice: item.prix,
            consumedAt: now,
          }),
        );
      }
      if (companyAmount > 0)
        ajouterEntreeLedger({
          companyId: contract.companyId,
          contractId: contract.id,
          transactionId,
          employeeId: employee.id,
          amount: companyAmount,
          type: "DEBIT",
          createdAt: now,
          status: "OUVERT",
        });
      const webhookStatus = envoyerWebhookContrat(
        contract,
        employee,
        articles,
        total,
        employeeAmount,
        companyAmount,
        vente.vendeur,
        transactionId,
      );
      txSheet.getRange(txSheet.getLastRow(), 17).setValue(webhookStatus);
      journaliserActionDiscord(
        "Vente encaissée",
        {
          transaction_id: transactionId,
          payment: vente.paiement || "Cash",
          total,
          contract_id: contract.id,
          company_id: contract.companyId,
          employee: employee.name,
          cashier: vente.vendeur,
        },
        vente.vendeur,
      );
      return {
        success: true,
        transactionId: transactionId,
        total: total,
        employeeAmount: employeeAmount,
        companyAmount: companyAmount,
        companyName: company.companyName || company.nom || contract.companyName,
      };
    }
    if (vente.ardoise && vente.ardoise.client) {
      ajouterArdoise({
        clientId: vente.ardoise.client,
        employeeName: vente.ardoise.employe || "-",
        total,
        paid: 0,
        balance: total,
        startDate: new Date(),
        status: "En attente",
      });
    }
    if (
      !vente.rewardId &&
      vente.clientId &&
      (trouverClientParId(vente.clientId) || {}).type === "Particulier"
    )
      ajouterPointsClient(vente.clientId, total);
    journaliserActionDiscord(
      "Vente encaissée",
      {
        transaction_id: orderId,
        payment: vente.paiement || "Cash",
        total,
        client_id: vente.clientId || "Aucun",
        cashier: vente.vendeur,
      },
      vente.vendeur,
    );
    return {
      success: true,
      transactionId: orderId,
      total: total,
      employeeAmount: total,
      companyAmount: 0,
    };
  } finally {
    lock.releaseLock();
  }
}

function genererFacturesHebdomadaires(periodStart, periodEnd) {
  const start = periodStart
    ? new Date(periodStart)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = periodEnd ? new Date(periodEnd) : new Date();
  const txSheet = obtenirFeuille("CONTRACT_TRANSACTIONS");
  const invoiceSheet = obtenirFeuille("INVOICES");
  if (!txSheet || txSheet.getLastRow() < 2) return [];
  const rows = txSheet
    .getRange(2, 1, txSheet.getLastRow() - 1, 18)
    .getValues()
    .filter(
      (row) => row[15] instanceof Date && row[15] >= start && row[15] <= end,
    );
  const groups = {};
  rows.forEach((row) => {
    const key = `${row[2]}|${row[1]}`;
    if (!groups[key])
      groups[key] = {
        companyId: row[2],
        contractId: row[1],
        subtotal: 0,
        discount: 0,
      };
    groups[key].subtotal += Number(row[10]) || 0;
    groups[key].discount += Number(row[11]) || 0;
  });
  const result = [];
  Object.keys(groups).forEach((key) => {
    const group = groups[key];
    const existing =
      invoiceSheet.getLastRow() > 1 &&
      invoiceSheet
        .getRange(2, 1, invoiceSheet.getLastRow() - 1, 11)
        .getValues()
        .some(
          (row) =>
            String(row[1]) === String(group.companyId) &&
            String(row[2]) === String(group.contractId) &&
            String(row[3]) === String(start),
        );
    if (existing) return;
    const invoice = [
      prochainIdentifiant(invoiceSheet, "INV", new Date().getFullYear()),
      group.companyId,
      group.contractId,
      start,
      end,
      group.subtotal,
      group.discount,
      arrondirMontant(group.subtotal - group.discount),
      "A_FACTURER",
      new Date(),
      "",
    ];
    invoiceSheet.appendRow(invoice);
    journaliserActionDiscord("Facture générée", {
      invoice_id: invoice[0],
      company_id: group.companyId,
      contract_id: group.contractId,
      total: invoice[7],
    });
    result.push(invoice[0]);
  });
  return result;
}

function envoyerWebhookContrat(
  contract,
  employee,
  articles,
  total,
  employeeAmount,
  companyAmount,
  cashier,
  transactionId,
) {
  if (!contract.discordWebhook) return "ABSENT";
  try {
    UrlFetchApp.fetch(contract.discordWebhook, {
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      payload: JSON.stringify({
        username: "HORNY'S POS",
        embeds: [
          {
            title: "Vente contrat entreprise",
            color: 5793266,
            fields: [
              {
                name: "Entreprise",
                value: String(contract.companyName || "-"),
              },
              {
                name: "Employé",
                value: `${employee.name} (${employee.identifier})`,
              },
              { name: "Type", value: String(contract.type || "-") },
              {
                name: "Commande",
                value: articles
                  .map((item) => `${item.nom} x ${item.quantity}`)
                  .join("\n")
                  .slice(0, 1024),
              },
              { name: "Total", value: total.toFixed(2) },
              { name: "Part employé", value: employeeAmount.toFixed(2) },
              { name: "Part entreprise", value: companyAmount.toFixed(2) },
              { name: "Caissier", value: String(cashier || "-") },
              { name: "Transaction", value: String(transactionId) },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "HORNY'S POS" },
          },
        ],
      }),
    });
    return "ENVOYE";
  } catch (error) {
    Logger.log("Webhook contrat: " + error);
    return "ERREUR";
  }
}

// ============================================
// 6️⃣ INTERFACE WEB & MENUS
// ============================================
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  const htmlOutput = template.evaluate();
  htmlOutput.setTitle("HORNY'S • POS");
  htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1");
  htmlOutput.setFaviconUrl(
    "https://drive.google.com/uc?id=1ClAizPe1rDZN0FHBXy9k_f26Kxe0YXjq&export=download&format=png",
  );
  return htmlOutput;
}

function ouvrirCaisse() {
  const template = HtmlService.createTemplateFromFile("Index");
  const htmlOutput = template.evaluate();
  htmlOutput.setWidth(1200).setHeight(700);
  SpreadsheetApp.getUi().showModelessDialog(
    htmlOutput,
    "Horny's POS Multipage",
  );
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🍔 Horny's Caisse")
    .addItem("🚀 Ouvrir Application (Multipage)", "ouvrirCaisse")
    .addSeparator()
    .addItem("🔄 Initialiser Données", "initializeSheet")
    .addToUi();
}
