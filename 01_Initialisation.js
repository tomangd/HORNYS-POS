function initializeSheet() {
  const ss = getSpreadsheet();

  const sheets = [
    CONFIG.SHEETS.ARTICLES,
    CONFIG.SHEETS.CLIENTS,
    CONFIG.SHEETS.CONTRATS,
    CONFIG.SHEETS.VENDEURS,
    CONFIG.SHEETS.VENTES,
    CONFIG.SHEETS.ARDOISES,
    CONFIG.SHEETS.DEVIS,
    CONFIG.SHEETS.FACTURES,
    CONFIG.SHEETS.PARAMETRES
  ];

  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });

  initializeArticles();
  initializeClients();
  initializeContrats();
  initializeVendeurs();
  initializeVentes();
  initializeArdoises();
  initializeDevis();
  initializeFactures();
  initializeParametres();

  SpreadsheetApp.flush();
}

function initializeArticles() {
  const sheet = getSheet(CONFIG.SHEETS.ARTICLES);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Nom",
    "Catégorie",
    "Prix",
    "Stock",
    "Stock Min",
    "Actif",
    "Variants"
  ]);

  sheet.getRange(2, 1, 3, 8).setValues([
    [1, "Burger Classic", "Burger", 12.9, 50, 5, true, true],
    [2, "Burger Poulet", "Burger", 13.9, 50, 5, true, true],
    [3, "Frites", "Accompagnement", 3.5, 100, 10, true, false]
  ]);
}

function initializeClients() {
  const sheet = getSheet(CONFIG.SHEETS.CLIENTS);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Nom",
    "Entreprise",
    "Email",
    "Téléphone",
    "Adresse",
    "Actif"
  ]);

  sheet.getRange(2, 1, 3, 7).setValues([
    [1, "LSHD", "LSHD", "", "", "", true],
    [2, "Pisswasser", "Pisswasser", "", "", "", true],
    [3, "Pêcherie Alamo", "Pêcherie Alamo", "", "", "", true]
  ]);
}

function initializeContrats() {
  const sheet = getSheet(CONFIG.SHEETS.CONTRATS);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "ClientID",
    "Reduction",
    "DateDebut",
    "DateFin",
    "Actif"
  ]);

  sheet.getRange(2, 1, 3, 6).setValues([
    [1, 1, 10, new Date(), "", true],
    [2, 2, 15, new Date(), "", true],
    [3, 3, 5, new Date(), "", true]
  ]);
}

function initializeVendeurs() {
  const sheet = getSheet(CONFIG.SHEETS.VENDEURS);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Nom",
    "Email",
    "Statut",
    "Code Accès"
  ]);

  sheet.getRange(2, 1, 5, 5).setValues([
    [1, "Alice", "alice@hornys.fr", "Actif", "1234"],
    [2, "Bob", "bob@hornys.fr", "Actif", "2345"],
    [3, "Charlie", "charlie@hornys.fr", "Actif", "3456"],
    [4, "Diana", "diana@hornys.fr", "Actif", "4567"],
    [5, "Éric", "eric@hornys.fr", "Actif", "5678"]
  ]);
}

function initializeVentes() {
  const sheet = getSheet(CONFIG.SHEETS.VENTES);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Date",
    "VendeurID",
    "ClientID",
    "Articles",
    "SousTotal",
    "Reduction",
    "Total",
    "Paiement",
    "Employe",
    "Statut"
  ]);
}

function initializeArdoises() {
  const sheet = getSheet(CONFIG.SHEETS.ARDOISES);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Date",
    "ClientID",
    "Employe",
    "Montant",
    "VendeurID",
    "Statut"
  ]);
}

function initializeDevis() {
  const sheet = getSheet(CONFIG.SHEETS.DEVIS);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Date",
    "ClientID",
    "Articles",
    "Total",
    "Statut"
  ]);
}

function initializeFactures() {
  const sheet = getSheet(CONFIG.SHEETS.FACTURES);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "ID",
    "Date",
    "ClientID",
    "Montant",
    "Echeance",
    "Statut"
  ]);
}

function initializeParametres() {
  const sheet = getSheet(CONFIG.SHEETS.PARAMETRES);

  if (sheet.getLastRow() !== 0) return;

  sheet.appendRow([
    "Parametre",
    "Valeur"
  ]);

  sheet.getRange(2, 1, 5, 2).setValues([
    ["NOM_ETABLISSEMENT", "Horny's"],
    ["TAUX_TVA", "10"],
    ["DEVISE", "€"],
    ["ALERTE_STOCK", "true"],
    ["VERSION", CONFIG.VERSION]
  ]);
}

function testInitialisation() {
  initializeSheet();

  const ss = getSpreadsheet();

  Logger.log("Classeur : " + ss.getName());

  Object.values(CONFIG.SHEETS).forEach(name => {
    const sheet = ss.getSheetByName(name);

    Logger.log(
      name + " → " + (sheet ? "OK" : "MANQUANTE")
    );
  });
}