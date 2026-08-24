function getVendeurs() {
  const values = getSheetData(CONFIG.SHEETS.VENDEURS);

  return values
    .slice(1)
    .filter(row => String(row[3]).toLowerCase() === "actif")
    .map(row => ({
      id: row[0],
      nom: row[1],
      email: row[2],
      statut: row[3]
    }));
}

function getVendeurById(id) {
  const values = getSheetData(CONFIG.SHEETS.VENDEURS);

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (String(row[0]).trim() === String(id).trim()) {
      return {
        id: row[0],
        nom: row[1],
        email: row[2],
        statut: row[3],
        pin: String(row[4] || "").trim()
      };
    }
  }

  return null;
}

function authentifierUtilisateur(pin) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Vendeurs");

  if (!sheet) {
    return {
      success: false,
      message: "Feuille Vendeurs introuvable."
    };
  }

  const values = sheet.getDataRange().getValues();
  const pinString = String(pin || "").trim();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    const vendeur = {
      id: row[0],
      nom: row[1],
      email: row[2],
      statut: row[3],
      codeAcces: String(row[4] || "").trim()
    };

    if (
      vendeur.codeAcces === pinString &&
      String(vendeur.statut).toLowerCase() === "actif"
    ) {
      discordLogConnexion(vendeur);

      return {
        success: true,
        vendeur: {
          id: vendeur.id,
          nom: vendeur.nom,
          email: vendeur.email,
          statut: vendeur.statut
        },
        message: "Connexion réussie."
      };
    }
  }

  discordLogTentativeConnexionEchouee();

  return {
    success: false,
    message: "Code PIN incorrect."
  };
}

function chargerDonneesConnexion() {
  return {
    vendeurs: getVendeurs()
  };
}