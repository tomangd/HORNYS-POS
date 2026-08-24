// const CONFIG = {
//   SHEET_ID: "1IM19-cNHjREB8u8M3P9hTcEujVXHPQ9cJkm1Hgxof2U",
//   WEBHOOK_DISCORD:
//     "https://discord.com/api/webhooks/1541284569058254879/PtBb6NLkpvbK96zx6wNQtLxvhKC3U6A5qZakfgjxX3azMFe1v1JMs-eB3xNVXN8qPeSH",
//   LOGO_URL: "https://i.postimg.cc/v8CMGbrR/logo-hornys.png",
// };

// function doGet(e) {
//   return HtmlService.createHtmlOutput(getCaisseHTML())
//     .setTitle("Horny's Caisse")
//     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
// }

// function initializeSheet() {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();

//   const sheets = [
//     "Articles",
//     "Clients",
//     "Contrats",
//     "Vendeurs",
//     "Ventes",
//     "Ardoises",
//     "Devis",
//     "Factures",
//     "Parametres",
//   ];

//   sheets.forEach((name) => {
//     if (!ss.getSheetByName(name)) {
//       ss.insertSheet(name);
//     }
//   });

//   initializeArticles();
//   initializeClients();
//   initializeContrats();
//   initializeVendeurs();
//   initializeVentes();
//   initializeArdoises();
//   initializeDevis();
//   initializeFactures();
//   initializeParametres();

//   SpreadsheetApp.flush();
// }

// function initializeArticles() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Articles");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       "ID",
//       "Nom",
//       "Catégorie",
//       "Prix",
//       "Stock",
//       "Stock Min",
//       "Actif",
//       "Variants",
//     ]);

//     sheet.getRange(2, 1, 3, 8).setValues([
//       [1, "Burger Classic", "Burger", 12.9, 50, 5, true, true],
//       [2, "Burger Poulet", "Burger", 13.9, 50, 5, true, true],
//       [3, "Frites", "Accompagnement", 3.5, 100, 10, true, false],
//     ]);
//   }
// }

// function initializeClients() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Clients");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       "ID",
//       "Nom",
//       "Entreprise",
//       "Email",
//       "Téléphone",
//       "Adresse",
//       "Actif",
//     ]);

//     sheet.getRange(2, 1, 3, 7).setValues([
//       [1, "LSHD", "LSHD", "", "", "", true],
//       [2, "Pisswasser", "Pisswasser", "", "", "", true],
//       [3, "Pêcherie Alamo", "Pêcherie Alamo", "", "", "", true],
//     ]);
//   }
// }

// function initializeContrats() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contrats");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       "ID",
//       "ClientID",
//       "Reduction",
//       "DateDebut",
//       "DateFin",
//       "Actif",
//     ]);

//     sheet.getRange(2, 1, 3, 6).setValues([
//       [1, 1, 10, new Date(), "", true],
//       [2, 2, 15, new Date(), "", true],
//       [3, 3, 5, new Date(), "", true],
//     ]);
//   }
// }

// function initializeVendeurs() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vendeurs");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow(["ID", "Nom", "Prenom", "PIN", "Role", "Actif"]);

//     sheet.getRange(2, 1, 3, 6).setValues([
//       [1, "Dupont", "Jean", "1234", "Serveur", true],
//       [2, "Martin", "Paul", "5678", "Manager", true],
//       [3, "Durand", "Tom", "0000", "Administrateur", true],
//     ]);
//   }
// }

// function initializeVentes() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ventes");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       "ID",
//       "Date",
//       "VendeurID",
//       "ClientID",
//       "Articles",
//       "SousTotal",
//       "Reduction",
//       "Total",
//       "Paiement",
//       "Employe",
//       "Statut",
//     ]);
//   }
// }

// function initializeArdoises() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ardoises");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       "ID",
//       "Date",
//       "ClientID",
//       "Employe",
//       "Montant",
//       "VendeurID",
//       "Statut",
//     ]);
//   }
// }

// function initializeDevis() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Devis");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow(["ID", "Date", "ClientID", "Articles", "Total", "Statut"]);
//   }
// }

// function initializeFactures() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Factures");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       "ID",
//       "Date",
//       "ClientID",
//       "Montant",
//       "Echeance",
//       "Statut",
//     ]);
//   }
// }

// function initializeParametres() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Parametres");

//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow(["Parametre", "Valeur"]);

//     sheet.getRange(2, 1, 5, 2).setValues([
//       ["WEBHOOK_DISCORD", ""],
//       ["NOM_ETABLISSEMENT", "Horny's"],
//       ["TAUX_TVA", "10"],
//       ["DEVISE", "€"],
//       ["ALERTE_STOCK", "true"],
//     ]);
//   }
// }

// function createCaisseInterface() {
//   return getCaisseHTML();
// }

// function enregistrerVente(data) {
//   try {
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheetVentes = ss.getSheetByName("Ventes");

//     if (!data) {
//       throw new Error("Données de vente manquantes.");
//     }

//     const vendeurId = data.vendeurId || data.vendeurID || "";
//     const clientId = data.clientId || data.clientID || "";
//     const articles = data.articles || [];
//     const sousTotal = Number(data.sousTotal || 0);
//     const reduction = Number(data.reduction || 0);
//     const total = Number(data.total || 0);
//     const paiement = data.paiement || "Cash";
//     const employe = data.employe || "";

//     if (!vendeurId) {
//       throw new Error("Vendeur non sélectionné.");
//     }

//     if (!articles.length) {
//       throw new Error("La commande est vide.");
//     }

//     const id = new Date().getTime();

//     sheetVentes.appendRow([
//       id,
//       new Date(),
//       vendeurId,
//       clientId,
//       JSON.stringify(articles),
//       sousTotal,
//       reduction,
//       total,
//       paiement,
//       employe,
//       "Payée",
//     ]);

//     articles.forEach((item) => {
//       if (item.article && item.article.id) {
//         decrementStock(item.article.id, Number(item.quantity || 1));
//       }
//     });

//     if (paiement === "Ardoise") {
//       enregistrerArdoise({
//         clientId: clientId,
//         employe: employe,
//         montant: total,
//         vendeurId: vendeurId,
//       });
//     }

//     try {
//       envoyerNotificationDiscord({
//         type: "vente",
//         total: total,
//         paiement: paiement,
//         vendeur: vendeurId,
//       });
//     } catch (discordError) {
//       console.warn("Discord:", discordError);
//     }

//     return {
//       success: true,
//       id: id,
//       message: "Vente enregistrée avec succès.",
//     };
//   } catch (error) {
//     console.error(error);

//     return {
//       success: false,
//       message: error.message || "Erreur lors de l’enregistrement.",
//     };
//   }
// }

// function decrementStock(articleId, quantity) {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Articles");
//   const values = sheet.getDataRange().getValues();

//   for (let i = 1; i < values.length; i++) {
//     if (String(values[i][0]) === String(articleId)) {
//       const stockColumn = 5;
//       const currentStock = Number(values[i][stockColumn - 1]) || 0;
//       const newStock = Math.max(0, currentStock - quantity);

//       sheet.getRange(i + 1, stockColumn).setValue(newStock);

//       verifierAlerteStock(
//         articleId,
//         values[i][1],
//         newStock,
//         Number(values[i][5]) || 0,
//       );

//       return true;
//     }
//   }

//   return false;
// }

// function verifierAlerteStock(articleId, nom, stock, stockMin) {
//   if (stock <= stockMin) {
//     console.warn("Alerte stock : " + nom + " (" + stock + " restant)");
//   }
// }

// function enregistrerArdoise(data) {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ardoises");

//   const id = new Date().getTime();

//   sheet.appendRow([
//     id,
//     new Date(),
//     data.clientId || "",
//     data.employe || "",
//     Number(data.montant || 0),
//     data.vendeurId || "",
//     "À régler",
//   ]);

//   return {
//     success: true,
//     id: id,
//   };
// }

// function obtenerArdoiseParEmploye(employe) {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ardoises");

//   const values = sheet.getDataRange().getValues();

//   return values
//     .slice(1)
//     .filter(
//       (row) => String(row[3]).toLowerCase() === String(employe).toLowerCase(),
//     );
// }

// function obtenirContratClient(clientId) {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contrats");

//   const values = sheet.getDataRange().getValues();

//   for (let i = 1; i < values.length; i++) {
//     if (String(values[i][1]) === String(clientId) && values[i][5] === true) {
//       return {
//         id: values[i][0],
//         clientId: values[i][1],
//         reduction: Number(values[i][2]) || 0,
//         dateDebut: values[i][3],
//         dateFin: values[i][4],
//         actif: values[i][5],
//       };
//     }
//   }

//   return null;
// }

// function envoyerNotificationDiscord(data) {
//   const params = getParametres();
//   const webhook = params.WEBHOOK_DISCORD || CONFIG.WEBHOOK_DISCORD;

//   if (!webhook) {
//     return {
//       success: false,
//       message: "Webhook Discord non configuré.",
//     };
//   }

//   const payload = {
//     username: "Horny's POS",
//     embeds: [
//       {
//         title: "Nouvelle vente",
//         description: "Une nouvelle vente vient d’être enregistrée.",
//         fields: [
//           {
//             name: "Total",
//             value: Number(data.total || 0).toFixed(2) + " €",
//             inline: true,
//           },
//           {
//             name: "Paiement",
//             value: String(data.paiement || "Inconnu"),
//             inline: true,
//           },
//           {
//             name: "Vendeur",
//             value: String(data.vendeur || "Inconnu"),
//             inline: true,
//           },
//         ],
//         timestamp: new Date().toISOString(),
//       },
//     ],
//   };

//   UrlFetchApp.fetch(webhook, {
//     method: "post",
//     contentType: "application/json",
//     payload: JSON.stringify(payload),
//     muteHttpExceptions: true,
//   });

//   return {
//     success: true,
//   };
// }

// function getParametres() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Parametres");

//   const values = sheet.getDataRange().getValues();
//   const params = {};

//   for (let i = 1; i < values.length; i++) {
//     if (values[i][0]) {
//       params[String(values[i][0])] = values[i][1];
//     }
//   }

//   return params;
// }

// function obtenirVendeur(id) {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vendeurs");

//   const values = sheet.getDataRange().getValues();

//   for (let i = 1; i < values.length; i++) {
//     if (String(values[i][0]) === String(id)) {
//       return {
//         id: values[i][0],
//         nom: values[i][1],
//         prenom: values[i][2],
//         pin: String(values[i][3]),
//         role: values[i][4],
//         actif: values[i][5],
//       };
//     }
//   }

//   return null;
// }

// function obtenirArticles() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Articles");

//   const values = sheet.getDataRange().getValues();

//   return values
//     .slice(1)
//     .filter((row) => row[6] !== false)
//     .map((row) => ({
//       id: row[0],
//       nom: row[1],
//       categorie: row[2],
//       prix: Number(row[3]) || 0,
//       stock: Number(row[4]) || 0,
//       stockMin: Number(row[5]) || 0,
//       actif: row[6],
//       variants: row[7],
//     }));
// }

// function testWebhook() {
//   return envoyerNotificationDiscord({
//     type: "test",
//     total: 0,
//     paiement: "Test",
//     vendeur: "Test",
//   });
// }

// function testVente() {
//   return enregistrerVente({
//     vendeurId: 1,
//     articles: [
//       {
//         article: {
//           id: 1,
//           nom: "Burger Classic",
//           prix: 12.9,
//           stock: 50,
//         },
//         nomComplet: "Burger Classic",
//         prix: 12.9,
//         quantity: 1,
//       },
//     ],
//     sousTotal: 12.9,
//     reduction: 0,
//     total: 12.9,
//     paiement: "Cash",
//   });
// }

// function onOpen() {
//   SpreadsheetApp.getUi()
//     .createMenu("Horny's")
//     .addItem("Ouvrir la caisse", "ouvrirCaisse")
//     .addItem("Dashboard", "afficherDashboard")
//     .addItem("Contrats", "getContratsHTML")
//     .addItem("Initialiser", "initialiser")
//     .addToUi();
// }

// function ouvrirCaisse() {
//   const html = HtmlService.createHtmlOutput(getCaisseHTML())
//     .setWidth(1400)
//     .setHeight(800);

//   SpreadsheetApp.getUi().showModelessDialog(html, "Horny's Caisse");
// }

// function lancerRappelsFactures() {
//   const sheet =
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Factures");

//   if (!sheet || sheet.getLastRow() < 2) {
//     return;
//   }

//   const values = sheet.getDataRange().getValues();
//   const now = new Date();

//   values.slice(1).forEach((row) => {
//     const echeance = row[4];
//     const statut = row[5];

//     if (echeance instanceof Date && echeance < now && statut !== "Payée") {
//       console.warn("Facture échue : " + row[0]);
//     }
//   });
// }

// function afficherDashboard() {
//   const html = HtmlService.createHtmlOutput(getDashboardHTML())
//     .setWidth(1400)
//     .setHeight(900);

//   SpreadsheetApp.getUi().showModalDialog(html, "Dashboard");
// }

// function getCaisseHTML() {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>Caisse POS</title>
//   <style>
//     #app {
//       display: none;
//     }

//     * {
//       box-sizing: border-box;
//       margin: 0;
//       padding: 0;
//     }

//     body {
//       font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
//       background: #0f111a;
//       color: #d1d5db;
//       height: 100vh;
//       padding: 15px;
//       overflow: hidden;
//     }

//     .container {
//       display: grid;
//       grid-template-columns: 2fr 1fr;
//       gap: 20px;
//       height: 100%;
//     }

//     .section {
//       background: #1a1d27;
//       border: 1px solid #2d313f;
//       border-radius: 6px;
//       padding: 20px;
//       display: flex;
//       flex-direction: column;
//     }

//     .scrollable {
//       overflow-y: auto;
//       flex-grow: 1;
//       padding-right: 5px;
//     }

//     ::-webkit-scrollbar {
//       width: 6px;
//     }

//     ::-webkit-scrollbar-track {
//       background: #1a1d27;
//     }

//     ::-webkit-scrollbar-thumb {
//       background: #3f4455;
//       border-radius: 3px;
//     }

//     h1 {
//       font-size: 16px;
//       font-weight: 500;
//       color: #ffffff;
//       margin-bottom: 20px;
//       text-transform: uppercase;
//       letter-spacing: 1px;
//       border-bottom: 1px solid #2d313f;
//       padding-bottom: 12px;
//     }

//     h2 {
//       font-size: 12px;
//       font-weight: 600;
//       color: #818cf8;
//       text-transform: uppercase;
//       letter-spacing: 1px;
//       margin: 15px 0 10px;
//     }

//     .grid-2 {
//       display: grid;
//       grid-template-columns: repeat(2, 1fr);
//       gap: 10px;
//     }

//     .grid-3 {
//       display: grid;
//       grid-template-columns: repeat(3, 1fr);
//       gap: 10px;
//     }

//     .btn-select {
//       background: #232736;
//       border: 1px solid #3f4455;
//       color: #d1d5db;
//       padding: 12px;
//       border-radius: 4px;
//       cursor: pointer;
//       text-align: center;
//       font-size: 13px;
//       font-weight: 500;
//       transition: 0.15s;
//     }

//     .btn-select:hover {
//       background: #2d313f;
//       border-color: #5a6072;
//     }

//     .btn-select.active {
//       background: #4f46e5;
//       border-color: #4f46e5;
//       color: white;
//     }

//     .article-card {
//       background: #232736;
//       border: 1px solid #3f4455;
//       border-radius: 4px;
//       padding: 15px;
//       cursor: pointer;
//       display: flex;
//       flex-direction: column;
//       justify-content: space-between;
//       min-height: 85px;
//       transition: 0.15s;
//     }

//     .article-card:hover {
//       border-color: #6366f1;
//       background: #2a2e40;
//     }

//     .article-nom {
//       font-size: 14px;
//       font-weight: 500;
//       color: #f3f4f6;
//       margin-bottom: 8px;
//     }

//     .article-bottom {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-end;
//     }

//     .article-prix {
//       font-size: 14px;
//       color: #818cf8;
//       font-weight: 600;
//     }

//     .article-stock {
//       font-size: 11px;
//       color: #6b7280;
//     }

//     .panier-item {
//       display: grid;
//       grid-template-columns: 1fr auto auto;
//       gap: 15px;
//       align-items: center;
//       padding: 12px 0;
//       border-bottom: 1px solid #2d313f;
//     }

//     .panier-nom {
//       font-size: 13px;
//       color: #f3f4f6;
//     }

//     .panier-prix {
//       font-size: 14px;
//       font-weight: 600;
//       color: #818cf8;
//       text-align: right;
//       min-width: 60px;
//     }

//     .qty-control {
//       display: flex;
//       align-items: center;
//       background: #0f111a;
//       border: 1px solid #3f4455;
//       border-radius: 4px;
//     }

//     .qty-btn {
//       background: transparent;
//       border: none;
//       color: #d1d5db;
//       width: 28px;
//       height: 28px;
//       cursor: pointer;
//       font-size: 16px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }

//     .qty-btn:hover {
//       background: #3f4455;
//       color: white;
//     }

//     .qty-val {
//       width: 30px;
//       text-align: center;
//       font-size: 13px;
//       font-weight: 500;
//       border-left: 1px solid #3f4455;
//       border-right: 1px solid #3f4455;
//     }

//     .totaux-box {
//       background: #232736;
//       border-radius: 4px;
//       padding: 15px;
//       margin-top: auto;
//       border: 1px solid #2d313f;
//     }

//     .total-line {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 8px;
//       font-size: 13px;
//       color: #9ca3af;
//     }

//     .total-line.final {
//       font-size: 18px;
//       font-weight: 600;
//       color: #ffffff;
//       margin-top: 10px;
//       padding-top: 10px;
//       border-top: 1px dashed #3f4455;
//       margin-bottom: 0;
//     }

//     .form-group {
//       margin-bottom: 12px;
//     }

//     .form-group label {
//       display: block;
//       font-size: 11px;
//       color: #9ca3af;
//       text-transform: uppercase;
//       margin-bottom: 6px;
//     }

//     .form-control {
//       width: 100%;
//       background: #0f111a;
//       border: 1px solid #3f4455;
//       color: #f3f4f6;
//       padding: 10px;
//       border-radius: 4px;
//       font-size: 13px;
//     }

//     .form-control:focus {
//       outline: none;
//       border-color: #6366f1;
//     }

//     .action-grid {
//       display: grid;
//       grid-template-columns: 1fr 2fr;
//       gap: 10px;
//       margin-top: 15px;
//     }

//     .btn-action {
//       padding: 14px;
//       border: none;
//       border-radius: 4px;
//       font-size: 14px;
//       font-weight: 600;
//       cursor: pointer;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//       transition: 0.2s;
//     }

//     .btn-clear {
//       background: #374151;
//       color: #f3f4f6;
//     }

//     .btn-clear:hover {
//       background: #4b5563;
//     }

//     .btn-pay {
//       background: #10b981;
//       color: white;
//     }

//     .btn-pay:hover {
//       background: #059669;
//     }

//     .btn-pay:disabled {
//       background: #1f2937;
//       color: #4b5563;
//       cursor: not-allowed;
//     }

//     .alert {
//       padding: 12px;
//       border-radius: 4px;
//       margin-bottom: 15px;
//       font-size: 13px;
//       font-weight: 500;
//       display: none;
//       text-align: center;
//     }

//     .alert.success {
//       background: rgba(16, 185, 129, 0.1);
//       border: 1px solid #10b981;
//       color: #34d399;
//       display: block;
//     }

//     .alert.error {
//       background: rgba(239, 68, 68, 0.1);
//       border: 1px solid #ef4444;
//       color: #f87171;
//       display: block;
//     }

//     .hidden {
//       display: none !important;
//     }

//     @keyframes shake {
//       0%, 100% { transform: translateX(0); }
//       20%, 60% { transform: translateX(-8px); }
//       40%, 80% { transform: translateX(8px); }
//     }

//     @keyframes successPulse {
//       0% { transform: scale(1); background-color: #1a1d27; border-color: #2d313f; }
//       50% { transform: scale(1.03); background-color: #064e3b; border-color: #10b981; }
//       100% { transform: scale(1); background-color: #1a1d27; border-color: #2d313f; }
//     }

//     .pin-shake {
//       animation: shake 0.4s ease-in-out;
//       border-color: #ef4444 !important;
//     }

//     .pin-success {
//       animation: successPulse 0.4s ease-in-out;
//     }
//   </style>
// </head>

// <body>

// <div id="loadingScreen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0f111a; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.4s ease;">
//   <img src="https://i.postimg.cc/v8CMGbrR/logo-hornys.png" alt="Logo" style="max-width: 180px; margin-bottom: 25px; object-fit: contain;">
//   <div style="width: 40px; height: 40px; border: 3px solid #2d313f; border-top: 3px solid #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
//   <div style="margin-top: 15px; font-size: 13px; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">Chargement du terminal...</div>
// </div>

// <style>
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
// </style>

// <div id="userHeader" style="display: none; align-items: center; gap: 10px; background: #1a1d27; padding: 6px 12px; border-radius: 6px; border: 1px solid #2d313f;">
//   <span id="labelVendeurActif" style="color: #9ca3af; font-size: 13px;"></span>
//   <button onclick="ouvrirEcranPin()" style="background: #374151; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Changer</button>
// </div>

// <div id="pinScreen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0f111a; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 99999;">
//   <div id="loginCard" style="background: #1a1d27; border: 1px solid #2d313f; padding: 30px; border-radius: 8px; width: 280px; text-align: center;">
//     <img src="https://i.postimg.cc/v8CMGbrR/logo-hornys.png" alt="Horny's" style="max-width: 150px; max-height: 70px; object-fit: contain; margin-bottom: 20px;">
//     <h2 style="color: #ffffff; margin-bottom: 6px; font-size: 18px;">Connexion</h2>
//     <div style="color: #9ca3af; font-size: 12px; margin-bottom: 20px;">Entrez votre code PIN</div>
//     <input type="password" id="pinInput" readonly placeholder="••••" style="width: 100%; background: #0f111a; border: 1px solid #3f4455; color: #fff; font-size: 24px; text-align: center; padding: 12px; border-radius: 4px; letter-spacing: 8px; margin-bottom: 20px;">
    
//     <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
//       <button class="btn-select" onclick="ajouterChiffre('1')">1</button>
//       <button class="btn-select" onclick="ajouterChiffre('2')">2</button>
//       <button class="btn-select" onclick="ajouterChiffre('3')">3</button>
//       <button class="btn-select" onclick="ajouterChiffre('4')">4</button>
//       <button class="btn-select" onclick="ajouterChiffre('5')">5</button>
//       <button class="btn-select" onclick="ajouterChiffre('6')">6</button>
//       <button class="btn-select" onclick="ajouterChiffre('7')">7</button>
//       <button class="btn-select" onclick="ajouterChiffre('8')">8</button>
//       <button class="btn-select" onclick="ajouterChiffre('9')">9</button>
//       <button class="btn-select" onclick="effacerPin()" style="background: #374151; color: #f87171;">⌫</button>
//       <button class="btn-select" onclick="ajouterChiffre('0')">0</button>
//       <button class="btn-select" onclick="viderChampsPin()" style="background: #4b5563; color: white; font-size: 10px;">C</button>
//     </div>
    
//     <div id="loginError" style="display: none; color: #f87171; font-size: 12px; margin-top: 15px;"></div>
//   </div>
// </div>

// <div class="container">
//   <div class="section">
//     <h1>Terminal de Vente</h1>
//     <div class="scrollable">
//       <h2>Vendeur Actif</h2>
//       <div class="grid-2" id="vendeurSelection" style="margin-bottom: 20px;"></div>
//       <h2>Catalogue Articles</h2>
//       <div class="grid-3" id="articlesGrid"></div>
//     </div>
//   </div>
  
//   <div class="section" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
//     <h1>Commande en Cours</h1>
//     <div id="statusMessage" class="alert"></div>
//     <div class="scrollable" id="panierList" style="flex-grow: 1; overflow-y: auto; margin-bottom: 10px;">
//       <div style="text-align: center; padding: 30px 0; color: #4b5563; font-size: 13px;">La commande est vide</div>
//     </div>
//     <div style="flex-shrink: 0;">
//       <div class="totaux-box hidden" id="totauxDiv" style="margin-bottom: 15px;">
//         <div class="total-line"><span>Sous-total</span><span id="sousTotal">0.00€</span></div>
//         <div class="total-line hidden" id="ligneReduction" style="color: #34d399;"><span>Réduction appliquée</span><span id="montantReduction">0.00€</span></div>
//         <div class="total-line final"><span>Total à Payer</span><span id="total">0.00€</span></div>
//       </div>
//       <div class="action-grid">
//         <button class="btn-action btn-clear" onclick="viderPanier()">Vider</button>
//         <button class="btn-action btn-pay" id="btnValider" onclick="validerCommande()" disabled>Encaisser</button>
//       </div>
//     </div>
//   </div>
// </div>

// <script>
// let panier = [];
// let articlesData = [];
// let vendeursData = []; // Unique déclaration propre
// let vendeurActif = null;
// let utilisateurActuel = null;

// window.addEventListener('DOMContentLoaded', function() {
//   google.script.run
//     .withSuccessHandler(function(data) {
//       articlesData = data.articles || [];
//       vendeursData = data.vendeurs || [];
      
//       const loading = document.getElementById('loadingScreen');
//       if(loading) loading.style.display = 'none';
      
//       const app = document.getElementById('app');
//       if(app) app.style.display = 'block';

//       afficherArticles();
//     })
//     .withFailureHandler(function(err) {
//       console.error("Erreur chargement:", err);
//     })
//     .chargerDonneesJSON();
// });

// document.addEventListener('keydown', function(e) {
//   let chiffre = null;

//   // Pavé numérique
//   if (e.code.startsWith('Numpad') && e.code.match(/^Numpad[0-9]$/)) {
//     chiffre = e.code.replace('Numpad', '');
//   }

//   // Rangée numérique au-dessus des lettres
//   if (e.code.startsWith('Digit')) {
//     chiffre = e.code.replace('Digit', '');
//   }

//   if (chiffre !== null) {
//     e.preventDefault();
//     saisirPin(chiffre);
//     return;
//   }

//   // Retour arrière
//   if (e.key === 'Backspace') {
//     e.preventDefault();
//     supprimerPin();
//     return;
//   }

//   // Entrée
//   if (e.key === 'Enter') {
//     e.preventDefault();
//     validerPin();
//   }
// });

// function ajouterChiffre(chiffre) {
//   const input = document.getElementById('pinInput');
//   if (!input) return;
//   if (input.value.length >= 4) return;
  
//   input.value += String(chiffre);
  
//   if (input.value.length === 4) {
//     verifierPinInstantane();
//   }
// }

// function effacerPin() {
//   const input = document.getElementById('pinInput');
//   if (!input) return;
//   input.value = input.value.slice(0, -1);
// }

// function viderChampsPin() {
//   const input = document.getElementById('pinInput');
//   const error = document.getElementById('loginError');
//   if (input) input.value = '';
//   if (error) {
//     error.style.display = 'none';
//     error.textContent = '';
//   }
// }

// function verifierPinInstantane() {
//   const input = document.getElementById('pinInput');
//   if (!input) return;
  
//   const saisiPin = input.value.trim();
//   const vendeurTrouve = vendeursData.find(v => String(v.pin).trim() === saisiPin);

//   if (vendeurTrouve) {
//     utilisateurActuel = vendeurTrouve;
//     vendeurActif = vendeurTrouve;
    
//     const card = document.getElementById('loginCard');
//     if (card) card.classList.add('pin-success');

//     setTimeout(function() {
//       if (card) card.classList.remove('pin-success');
//       document.getElementById('pinScreen').style.display = 'none';
//     }, 300);

//   } else {
//     const error = document.getElementById('loginError');
//     if (error) {
//       error.textContent = 'Code PIN incorrect.';
//       error.style.display = 'block';
//     }
//     input.classList.add('pin-shake');
//     setTimeout(function() {
//       input.classList.remove('pin-shake');
//       input.value = ''; 
//     }, 400);
//   }
// }

// function ouvrirEcranPin() {
//   viderChampsPin();
//   document.getElementById('pinScreen').style.display = 'flex';
// }

// function afficherArticles() {
//   const grid = document.getElementById('articlesGrid');
//   if (!grid) return;
//   grid.innerHTML = articlesData.map(art => \`
//     <div class="article-card" onclick="ajouterAuPanier(\${art.id})">
//       <div class="article-nom">\${art.nom}</div>
//       <div class="article-bottom">
//         <span class="article-prix">\${art.prix.toFixed(2)}€</span>
//         <span class="article-stock">Stock: \${art.stock}</span>
//       </div>
//     </div>
//   \`).join('');
// }
// </script>

// </body>
// </html>
//   `;
// }

// function chargerDonneesJSON() {
//   const articles = obtenirArticles();
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vendeurs");
//   let vendeurs = [];
  
//   if (sheet && sheet.getLastRow() > 1) {
//     const values = sheet.getDataRange().getValues();
//     vendeurs = values.slice(1)
//       .filter(row => row[5] !== false)
//       .map(row => ({
//         id: row[0],
//         nom: row[1],
//         prenom: row[2],
//         role: row[3],          // Colonne D (si le rôle y est)
//         pin: String(row[4] || "").trim(), // Colonne E (Index 4) -> Le PIN est bien ici
//         actif: row[5]
//       }));
//   }

//   return {
//     articles: articles,
//     vendeurs: vendeurs
//   };
// }

// function getVendeursAvecPin() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vendeurs");
//   if (!sheet) return [];
//   const values = sheet.getDataRange().getValues();
//   return values.slice(1)
//     .filter(row => row[5] !== false)
//     .map(row => ({
//       id: row[0],
//       nom: row[1],
//       prenom: row[2],
//       pin: String(row[3] || "").trim(), // On s'assure que c'est une string propre
//       role: row[4],
//       actif: row[5]
//     }));
// }

// function obtenirContratJSON(clientId) {
//   return obtenirContratClient(clientId);
// }

// function enregistrerVenteFormule(data) {
//   return enregistrerVente(data);
// }

// function getVendeursEtCodes() {
//   return getVendeurs();
// }

// function verifierCodePinDirect(pin) {
//   return authentifierUtilisateur(pin);
// }

// function getVendeurs() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vendeurs");
//   if (!sheet) {
//     return [];
//   }

//   const values = sheet.getDataRange().getValues();
//   return values
//     .slice(1)
//     .filter(function (row) {
//       return row[5] !== false;
//     })
//     .map(function (row) {
//       return {
//         id: row[0],
//         nom: row[1],
//         prenom: row[2],
//         role: row[4],
//         actif: row[5],
//       };
//     });
// }

// function getDashboardHTML() {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <title>Dashboard</title>
// <style>
// body {
//   font-family: Arial, sans-serif;
//   background: #0f111a;
//   color: #fff;
//   padding: 30px;
// }
// .card {
//   background: #1a1d27;
//   border: 1px solid #2d313f;
//   border-radius: 8px;
//   padding: 20px;
//   margin-bottom: 20px;
// }
// h1 {
//   margin-bottom: 20px;
// }
// </style>
// </head>
// <body>
// <h1>Dashboard Horny's</h1>
// <div class="card">
//   <strong>Ventes</strong>
//   <p>Consultez les ventes directement dans la feuille Ventes.</p>
// </div>
// <div class="card">
//   <strong>Stock</strong>
//   <p>Consultez les stocks directement dans la feuille Articles.</p>
// </div>
// <div class="card">
//   <strong>Ardoises</strong>
//   <p>Consultez les comptes clients dans la feuille Ardoises.</p>
// </div>
// </body>
// </html>
// `;
// }

// function getContratsHTML() {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <title>Contrats</title>
// <style>
// body {
//   font-family: Arial, sans-serif;
//   background: #0f111a;
//   color: #fff;
//   padding: 30px;
// }
// .card {
//   background: #1a1d27;
//   border: 1px solid #2d313f;
//   border-radius: 8px;
//   padding: 20px;
//   margin-bottom: 15px;
// }
// </style>
// </head>
// <body>
// <h1>Contrats clients</h1>
// <div id="contracts"></div>
// <script>
// google.script.run
//   .withSuccessHandler(function(contracts) {
//     const container = document.getElementById('contracts');
//     if (!contracts || !contracts.length) {
//       container.innerHTML = '<div class="card">Aucun contrat.</div>';
//       return;
//     }
//     contracts.forEach(function(contract) {
//       const div = document.createElement('div');
//       div.className = 'card';
//       div.innerHTML =
//         '<strong>Client :</strong> ' + contract.clientId + '<br>' +
//         '<strong>Réduction :</strong> ' + contract.reduction + '%';
//       container.appendChild(div);
//     });
//   })
//   .withFailureHandler(function(error) {
//     document.getElementById('contracts').innerHTML =
//       '<div class="card">Erreur : ' + error.message + '</div>';
//   })
//   .getContratsData();
// </script>
// </body>
// </html>
// `;
// }

// function naviguerVers(page) {
//   const pages = {
//     caisse: "ouvrirCaisse",
//     dashboard: "afficherDashboard",
//     contrats: "getContratsHTML",
//   };

//   if (!pages[page]) {
//     throw new Error("Page inconnue : " + page);
//   }

//   return pages[page];
// }

// function authentifierUtilisateur(pin) {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vendeurs");
//   if (!sheet) {
//     return {
//       success: false,
//       message: "Feuille Vendeurs introuvable.",
//     };
//   }

//   const values = sheet.getDataRange().getValues();
//   const pinString = String(pin || "").trim();

//   for (let i = 1; i < values.length; i++) {
//     const row = values[i];
//     const vendeurPin = String(row[3] || "").trim();
//     const actif = row[5] !== false;

//     if (actif && vendeurPin === pinString) {
//       const vendeur = {
//         id: row[0],
//         nom: row[1],
//         prenom: row[2],
//         role: row[4],
//         actif: row[5],
//       };

//       return {
//         success: true,
//         vendeur: vendeur,
//         user: vendeur,
//         message: "Connexion réussie.",
//       };
//     }
//   }

//   return {
//     success: false,
//     message: "Code PIN incorrect.",
//   };
// }

// function getContratsData() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contrats");
//   if (!sheet) {
//     return [];
//   }

//   const values = sheet.getDataRange().getValues();
//   return values.slice(1).map(function (row) {
//     return {
//       id: row[0],
//       clientId: row[1],
//       reduction: Number(row[2]) || 0,
//       dateDebut: row[3],
//       dateFin: row[4],
//       actif: row[5],
//     };
//   });
// }