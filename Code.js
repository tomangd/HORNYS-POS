function createCaisseInterface() {
  return getCaisseHTML();
}

function verifierAlerteStock(articleId, nom, stock, stockMin) {
  if (stock <= stockMin) {
    console.warn("Alerte stock : " + nom + " (" + stock + " restant)");
  }
}

function obtenirContratClient(clientId) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contrats");

  if (!sheet) {
    return null;
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const contratClientId = row[1];
    const actif = row[9] ?? row[5] ?? false;
    const type = row[2] || "Contrat";
    const reduction = Number(row[3] ?? row[2] ?? 0) || 0;
    const dateDebut = row[7] || row[3];
    const dateFin = row[8] || row[4];

    if (String(contratClientId) !== String(clientId)) {
      continue;
    }

    const isActif = actif === true || String(actif).toLowerCase() === "true" || String(actif).toLowerCase() === "actif";

    if (!isActif) {
      continue;
    }

    if (dateDebut instanceof Date && new Date() < dateDebut) {
      continue;
    }

    if (dateFin instanceof Date && new Date() > dateFin) {
      continue;
    }

    return {
      id: row[0],
      clientId: contratClientId,
      type: type,
      reduction: reduction,
      reductionPourcentage: reduction,
      dateDebut: dateDebut,
      dateFin: dateFin,
      actif: isActif,
      limiteArdoise: Number(row[4] || 0) || 0,
      limiteCommandes: Number(row[5] || 0) || 0,
      notes: row[10] || ""
    };
  }

  return null;
}

function envoyerNotificationDiscordLegacy(data) {
  const params = getParametres();
  const webhook = params.WEBHOOK_DISCORD || CONFIG.WEBHOOK_DISCORD;

  if (!webhook) {
    return {
      success: false,
      message: "Webhook Discord non configuré.",
    };
  }

  const payload = {
    username: "Horny's POS",
    embeds: [
      {
        title: "Nouvelle vente",
        description: "Une nouvelle vente vient d’être enregistrée.",
        fields: [
          {
            name: "Total",
            value: Number(data.total || 0).toFixed(2) + " €",
            inline: true,
          },
          {
            name: "Paiement",
            value: String(data.paiement || "Inconnu"),
            inline: true,
          },
          {
            name: "Vendeur",
            value: String(data.vendeur || "Inconnu"),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  UrlFetchApp.fetch(webhook, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  return {
    success: true,
  };
}

function envoyerLogVenteDiscord(data) {
  const params = getParametres();

  const webhook =
    params.WEBHOOK_DISCORD ||
    CONFIG.WEBHOOK_DISCORD;

  if (!webhook) {
    return {
      success: false,
      message: "Webhook Discord non configuré."
    };
  }

  const client =
    data.client || {};

  const contrat =
    data.contrat || null;

  const reductionTaux =
    Number(data.reductionTaux || 0);

  const fields = [
    {
      name: "Client / Entreprise",
      value:
        client.entreprise ||
        client.nom ||
        "Client comptant",
      inline: true
    },
    {
      name: "Vendeur",
      value:
        data.vendeurNom ||
        "Inconnu",
      inline: true
    },
    {
      name: "Paiement",
      value:
        data.paiement ||
        "Inconnu",
      inline: true
    },
    {
      name: "Sous-total",
      value:
        Number(data.sousTotal || 0)
          .toFixed(2) + " €",
      inline: true
    },
    {
      name: "Réduction",
      value:
        reductionTaux > 0
          ? `${reductionTaux}% (-${Number(
              data.montantReduction || 0
            ).toFixed(2)} €)`
          : "Aucune",
      inline: true
    },
    {
      name: "Total",
      value:
        Number(data.total || 0)
          .toFixed(2) + " €",
      inline: true
    }
  ];

  if (contrat) {
    fields.push({
      name: "Contrat",
      value:
        String(contrat.type || "Contrat"),
      inline: true
    });
  }

  if (
    data.paiement === "Ardoise" &&
    data.ardoise
  ) {
    fields.push({
      name: "Ardoise",
      value:
        `Avant : ${Number(
          data.ardoise.soldeActuel || 0
        ).toFixed(2)} €\n` +
        `Après : ${Number(
          data.ardoise.nouveauSolde || 0
        ).toFixed(2)} €\n` +
        `Limite : ${Number(
          data.ardoise.limite || 0
        ).toFixed(2)} €`,
      inline: false
    });
  }

  fields.push({
    name: "Articles",
    value:
      formaterArticlesDiscord(
        data.articles
      ).substring(0, 1024),
    inline: false
  });

  const payload = {
    username: "Horny's POS",
    embeds: [
      {
        title: "🛒 Nouvelle vente",
        description:
          `Vente **#${data.id || "N/A"}** enregistrée.`,
        fields: fields,
        timestamp:
          new Date().toISOString()
      }
    ]
  };

  const response =
    UrlFetchApp.fetch(webhook, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

  return {
    success:
      response.getResponseCode() >= 200 &&
      response.getResponseCode() < 300,
    status:
      response.getResponseCode()
  };
}

function getParametres() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Parametres");

  const values = sheet.getDataRange().getValues();
  const params = {};

  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) {
      params[String(values[i][0])] = values[i][1];
    }
  }

  return params;
}

function testWebhook() {
  return envoyerNotificationDiscord({
    type: "test",
    total: 0,
    paiement: "Test",
    vendeur: "Test",
  });
}

function testVente() {
  return enregistrerVente({
    vendeurId: 1,
    articles: [
      {
        article: {
          id: 1,
          nom: "Burger Classic",
          prix: 12.9,
          stock: 50,
        },
        nomComplet: "Burger Classic",
        prix: 12.9,
        quantity: 1,
      },
    ],
    sousTotal: 12.9,
    reduction: 0,
    total: 12.9,
    paiement: "Cash",
  });
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Horny's")
    .addItem("Ouvrir la caisse", "ouvrirCaisse")
    .addItem("Dashboard", "afficherDashboard")
    .addItem("Contrats", "getContratsHTML")
    .addItem("Initialiser", "initialiser")
    .addToUi();
}

function ouvrirCaisse() {
  const html = HtmlService.createHtmlOutput(getCaisseHTML())
    .setWidth(1400)
    .setHeight(800);

  SpreadsheetApp.getUi().showModelessDialog(html, "Horny's Caisse");
}

function lancerRappelsFactures() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Factures");

  if (!sheet || sheet.getLastRow() < 2) {
    return;
  }

  const values = sheet.getDataRange().getValues();
  const now = new Date();

  values.slice(1).forEach((row) => {
    const echeance = row[4];
    const statut = row[5];

    if (echeance instanceof Date && echeance < now && statut !== "Payée") {
      console.warn("Facture échue : " + row[0]);
    }
  });
}

function afficherDashboard() {
  const html = HtmlService.createHtmlOutput(getDashboardHTML())
    .setWidth(1400)
    .setHeight(900);

  SpreadsheetApp.getUi().showModalDialog(html, "Dashboard");
}

function getCaisseHTML() {
  return HtmlService
    .createHtmlOutputFromFile('Caisse')
    .getContent();
}

function chargerDonneesJSON() {
  try {

    const articles = getArticles();

    if (!Array.isArray(articles)) {
      throw new Error("Impossible de charger les articles.");
    }

    const clients = getClients();

    const sheet = getSheet(CONFIG.SHEETS.VENDEURS);

    if (!sheet) {
      throw new Error("Feuille Vendeurs introuvable.");
    }

    const values = sheet.getDataRange().getValues();

    if (!values || values.length < 2) {
      throw new Error("Aucun vendeur trouvé.");
    }

    const vendeurs = values
      .slice(1)
      .filter(function(row) {

        const statut =
          String(row[3] || "")
            .trim()
            .toLowerCase();

        return statut === "actif";
      })
      .map(function(row) {

        return {
          id: row[0],
          nom: String(row[1] || "").trim(),
          email: String(row[2] || "").trim(),
          statut: String(row[3] || "").trim(),
          pin: String(row[4] || "").trim()
        };

      });

    console.log(
      "Chargement POS : " +
      articles.length +
      " articles, " +
      vendeurs.length +
      " vendeurs actifs, " +
      clients.length +
      " clients."
    );

    return {
      success: true,
      articles: articles,
      vendeurs: vendeurs,
      clients: clients
    };

  } catch (error) {

    console.error(
      "Erreur chargerDonneesJSON :",
      error
    );

    throw new Error(
      "Erreur lors du chargement du terminal : " +
      error.message
    );
  }
}

function verifierVendeurPin(pin) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CONFIG.SHEETS.VENDEURS);

  if (!sheet) {
    throw new Error("Feuille Vendeurs introuvable.");
  }

  const values = sheet.getDataRange().getValues();

  const pinSaisi = String(pin || "").trim();

  if (!pinSaisi) {
    return {
      success: false,
      message: "Code PIN manquant."
    };
  }

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    const id = row[0];
    const nom = row[1];
    const email = row[2];
    const statut = row[3];
    const pinFeuille = String(row[4] || "").trim();

    if (
      pinFeuille === pinSaisi &&
      String(statut || "").trim().toLowerCase() === "actif"
    ) {
      return {
        success: true,
        vendeur: {
          id: id,
          nom: nom,
          email: email,
          statut: statut
        }
      };
    }
  }

  return {
    success: false,
    message: "Code PIN incorrect."
  };
}

function obtenirContratJSON(clientId) {
  return obtenirContratClient(clientId);
}

function enregistrerVenteFormule(data) {
  return enregistrerVente(data);
}

function getDashboardHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dashboard</title>
<style>
body {
  font-family: Arial, sans-serif;
  background: #0f111a;
  color: #fff;
  padding: 30px;
}
.card {
  background: #1a1d27;
  border: 1px solid #2d313f;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
h1 {
  margin-bottom: 20px;
}
</style>
</head>
<body>
<h1>Dashboard Horny's</h1>
<div class="card">
  <strong>Ventes</strong>
  <p>Consultez les ventes directement dans la feuille Ventes.</p>
</div>
<div class="card">
  <strong>Stock</strong>
  <p>Consultez les stocks directement dans la feuille Articles.</p>
</div>
<div class="card">
  <strong>Ardoises</strong>
  <p>Consultez les comptes clients dans la feuille Ardoises.</p>
</div>
</body>
</html>
`;
}

function getContratsHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Contrats</title>
<style>
body {
  font-family: Arial, sans-serif;
  background: #0f111a;
  color: #fff;
  padding: 30px;
}
.card {
  background: #1a1d27;
  border: 1px solid #2d313f;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}
</style>
</head>
<body>
<h1>Contrats clients</h1>
<div id="contracts"></div>
<script>
google.script.run
  .withSuccessHandler(function(contracts) {
    const container = document.getElementById('contracts');
    if (!contracts || !contracts.length) {
      container.innerHTML = '<div class="card">Aucun contrat.</div>';
      return;
    }
    contracts.forEach(function(contract) {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML =
        '<strong>Client :</strong> ' + contract.clientId + '<br>' +
        '<strong>Réduction :</strong> ' + contract.reduction + '%';
      container.appendChild(div);
    });
  })
  .withFailureHandler(function(error) {
    document.getElementById('contracts').innerHTML =
      '<div class="card">Erreur : ' + error.message + '</div>';
  })
  .getContratsData();
</script>
</body>
</html>
`;
}

function naviguerVers(page) {
  const pages = {
    caisse: "ouvrirCaisse",
    dashboard: "afficherDashboard",
    contrats: "getContratsHTML",
  };

  if (!pages[page]) {
    throw new Error("Page inconnue : " + page);
  }

  return pages[page];
}

function getContratsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contrats");
  if (!sheet) {
    return [];
  }

  const values = sheet.getDataRange().getValues();
  return values.slice(1).map(function (row) {
    return {
      id: row[0],
      clientId: row[1],
      reduction: Number(row[2]) || 0,
      dateDebut: row[3],
      dateFin: row[4],
      actif: row[5],
    };
  });
}